

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';
import { Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FileService {
  private datasetMetadata :string= '/datasetMetadata/name/';
  private datasetContents :string= '/datasetMetadata/name/';
  private config          :string = '/unixFileContents/u/';
  private handleErrorObservable (error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
}

  constructor(private http: Http){}

    queryDatasets(query:string): Observable<any>  {
        let url:string;
        if (!query.includes('.')){
          url = this.datasetMetadata + query.toUpperCase( ) + '*';
        }
        else{
          url = this.datasetMetadata + query.toUpperCase( ).replace(/\.$/, '') + '.**?listMembers=true';
        }
        return this.http.get(url)
        .map(res=>res.json())
        .catch(this.handleErrorObservable);
    }

    getDataset(path:string) {
        let url:string = this.datasetContents + path.trim().toUpperCase() + ".**";
        return this.http.get(url)
        .map(res=>res.json())
        .catch(this.handleErrorObservable);
    }

    getConfig(user:string) {
        let url:string = this.config + user + '/.mvd/codeeditor.json';
        return this.http.get(url)
        .map(res=>res.json())
        .catch(this.handleErrorObservable);
    }

    //http POSTs

    //TODO:lines type???
    // writeDataset(path:string, lines) : Observable<any>{
    //     let url:string = this.datasetContents + path.trim();
    //     console.log("path", path);
    //     console.log("lines", lines);
    //     return this.http.post(url, {records: lines});
    // }
    saveConfig(user:string, config:string) : Observable<any>{
        let url:string = this.config + user + '/.mvd/codeeditor.json';
        console.warn("DEPRECATED - saving Config : " + url);
        return this.http.post(url, JSON.stringify(config));
    };
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

