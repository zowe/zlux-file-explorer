// /*
//   This program and the accompanying materials are
//   made available under the terms of the Eclipse Public License v2.0 which accompanies
//   this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
//   SPDX-License-Identifier: EPL-2.0
//   Copyright Contributors to the Zowe Project.
// */

import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as streamSaver from 'streamsaver'
import { Angular2InjectionTokens } from 'pluginlib/inject-resources';
import { WritableStream, TransformStream, ReadableStream, CountQueuingStrategy } from 'web-streams-polyfill'
import * as uuid from 'uuid';
import { ReplaySubject } from 'rxjs';

export enum ConfigVariables {
  limitofActivityHistory = 10,
  downloadQueueLength = 5,
  uploadAction = "Upload",
  transferAction = "Transfer", 
  downloadAction = "Download",
  statusInprogress = "In progress",
  statusComplete = "Complete", 
  statusCancel = "Cancel", 
  statusQueued = "Queued",
  upload = "<<--",
  download = "-->>",
  transfer = "<-->",
  HighPriority = "High",
  LowPriority = "Normal",
  TableHeader1 = "Server Local file",
  TableHeader2 = "Direction",
  TableHeader3 = "Remote file",
  TableHeader4 = "Size",
  TableHeader5 = "Priority",
  TableHeader6 = "Status",
  TableHeader7 = "Actions",
  InProgressTab = "InProgress",
  CancelTab = "Cancel",
  CompletedTab = "Completed",
  DownloadQueueHelperText = "Donwload Queue size to maintain", 
  DownloadHistoryHelperText = "History of the download objects to keep in memory",
  ASCII = "819", 
  EBCDIC = "1047",
  UTF8 = "1208"
}

@Injectable({
  providedIn: "root",
})
export class DownloaderService {
    abortController: AbortController;
    abortSignal: AbortSignal;
    currentWriter ;
    downObj = null;
    finalObj = null;
    totalSize = 1;
    startTime = 0;
    completeStatus = ConfigVariables.statusComplete;

    constructor(private http: HttpClient) {
    }

    //main function to handle the large downloads.
    async fetchFileHandler(fetchPath: string, fileName: string, remoteFile:string, downloadObject:any): Promise<any> {
      this.abortController =  new AbortController();
      this.abortSignal = this.abortController.signal;
      this.totalSize = downloadObject.size;

      //define the endcoding type.
      if(downloadObject.sourceEncoding != undefined && downloadObject.targetEncoding != undefined){
        let queriesObject =
          {
           "source": downloadObject.sourceEncoding,
           "target": downloadObject.targetEncoding
          };
        
        fetchPath = fetchPath+"?"+await this.getQueryString(queriesObject);
      }

      const response = await fetch(fetchPath, {signal: this.abortSignal})

      //mock size for now
      // this.totalSize =  Number(response.headers.get('X-zowe-filesize'));

      this.startTime = new Date().getTime();

      //get the stream from the resposnse body.
      const readbleStream = response.body != null ? response.body : Promise.reject("Cannot receive data from the host machine");
      //queieng stratergy.
      const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 5 });
      //for browsers not supporting writablestram make sure to assign the polyfil writablestream.
      streamSaver.WritableStream = WritableStream;
      //create the write stream.
      const fileStream = streamSaver.createWriteStream(fileName, {
        writableStrategy:queuingStrategy,
        readableStrategy: queuingStrategy
      });
      const writer = fileStream.getWriter();
      this.currentWriter = writer;

      await new Promise(async resolve => {
        new ReadableStream({
          start(controller) {
            const reader = response.body.getReader();
            read();
            function read() {
              reader.read().then(({done, value}) => {
                //end of download.
                if (done) {
                  writer.close();
                  controller.close();
                  console.log("finished writing the content to the target file in host machine "+ fileName);
                  resolve();
                }
                if(value != undefined){
                  writer.write(value);
                  read();
                }
              }).catch(error => {
                console.log("error in download "+ error);
                console.error(error);
                controller.error(error);   
                resolve(error);               
              })
            }
          }
        },queuingStrategy);
      });
    }

    //create query strings to append in the request.
    getQueryString(queries){
      return Object.keys(queries).reduce((result, key) => {
          console.log(key);
          console.log(ConfigVariables[queries[key]]);
          return [...result, `${encodeURIComponent(key)}=${encodeURIComponent(ConfigVariables[queries[key]])}`]
      }, []).join('&');
    };

    //cancel current download.
    cancelDownload(): void {
      if(this.currentWriter){
        this.currentWriter.abort();
        this.currentWriter.releaseLock();
        this.abortController.abort();
        this.totalSize = 1;
      }
    }
}