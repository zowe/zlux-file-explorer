

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable   } from '@angular/core';
import { Http } from '@angular/http';
import { Observable   } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { UtilsService } from './utils.service'

@Injectable()
export class UssCrudService {

  private handleErrorObservable (error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
  }
  constructor(private http: Http, private utils:UtilsService){}
  makeDirectory(path:string, forceOverwrite?: boolean): Observable<any>{
    let url:string = ZoweZLUX.uriBroker.unixFileUri('mkdir', path, undefined, undefined, undefined, forceOverwrite);
    return this.http.post(url, null)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
  }

  getFile(path:string): Observable<any> {
    let filePath:string = this.utils.filePathCheck(path);
    let url:string = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
    return this.http.get(url)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
  }

  getFileContents(path:string): Observable<any> {
    let filePath:string = this.utils.filePathCheck(path);
    let url:string = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
    return this.http.get(url)
      .catch(this.handleErrorObservable);
  }

  getFileMetadata(path:string): Observable<any> {
    let filePath:string = this.utils.filePathCheck(path);
    let url:string = ZoweZLUX.uriBroker.unixFileUri('metadata', filePath);

    //TODO: Fix ZSS bug where "%2F" is not properly processed as a "/" character
    url = url.split("%2F").join("/");

    return this.http.get(url)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
  }

  copyFile(oldPath:string, newPath:string, forceOverwrite?: boolean): Observable<any>{
      let url :string = ZoweZLUX.uriBroker.unixFileUri('copy', oldPath, undefined, undefined, newPath, forceOverwrite, undefined, true);
      return this.http.post(url, null)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
  }

  deleteFileOrFolder(path:string): Observable<any>{
    let filePath:string = this.utils.filePathCheck(path);
    let url :string = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
    return this.http.delete(url)
    .map(res=>res.json())
    .catch(this.handleErrorObservable);
  }

  renameFile(oldPath:string, newPath:string, forceOverwrite?: boolean): Observable<any>{
    // route: string, absPath: string,
    //           sourceEncodingOrOptions?: string|ZLUX.UnixFileUriOptions, targetEncoding?: string,
    //           newName?: string, forceOverwrite?: boolean, sessionID?: number,
    //           lastChunk?: boolean, responseType?: string, mode?: string, recursive?: boolean,
    //           user?: string, group?: string
      let url :string = ZoweZLUX.uriBroker.unixFileUri('rename', oldPath, undefined, undefined, newPath, forceOverwrite);
      return this.http.post(url, null)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
  }

  saveFile(path:string, fileContents:string, targetEncoding?: string, forceOverwrite?: boolean): Observable<any>{
      let url :string = ZoweZLUX.uriBroker.unixFileUri('contents', path, "UTF-8", targetEncoding, undefined, forceOverwrite, undefined, true);
      return this.http.put(url,fileContents)
      .map(res=>{
        res.json()
      })
      .catch(this.handleErrorObservable);
  }
  
  getUserHomeFolder(): Observable<any>{
    let url :string = ZoweZLUX.uriBroker.omvsSegmentUri();
    return this.http.get(url)
    .map(res=>res.json())
    .catch(this.handleErrorObservable);
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

