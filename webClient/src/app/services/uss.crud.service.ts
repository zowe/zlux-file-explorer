

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable   } from '@angular/core';
import { Http, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable   } from 'rxjs/Observable';
import { UtilsService } from './utils.service'

@Injectable()
export class UssCrudService {
  private unixFileContents:string= '/unixFileContents/';

  private handleErrorObservable (error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
  }
  constructor(private http: Http, private utils:UtilsService){}
  addFolder(path:string): Observable<any>{
      let data:any = {
        'newName': path
      };
      let url:string = this.unixFileContents + "folder";
      return this.http.post(url,data)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
  }

  getFile(path:string): Observable<any> {
      let filePath:string = this.utils.filePathCheck(path);
      let url:string = this.unixFileContents + filePath;
      return this.http.get(url)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
    }
    getFileContents(path:string): Observable<any> {
        let filePath:string = this.utils.filePathCheck(path);
        let url:string = this.unixFileContents + filePath;
        return this.http.get(url)
        .catch(this.handleErrorObservable);
      }

  copyFile(oldPath:string, newPath:string): Observable<any>{
      let data:any = {
        'oldName': oldPath,
        'newName': newPath,
      };
      let url :string = this.unixFileContents + "copy";
      return this.http.put(url,data)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
  }

  deleteFile(path:string): Observable<any>{
    let filePath:string = this.utils.filePathCheck(path);
    let url :string = this.unixFileContents + filePath;
    return this.http.delete(url)
    .map(res=>res.json())
    .catch(this.handleErrorObservable);
  }

  renameFile(oldPath:string, newPath:string): Observable<any>{
      let data:any = {
        'oldName': oldPath,
        'newName': newPath,
      };
      let url :string = this.unixFileContents + "rename";
      return this.http.put(url,data)
      .map(res=>res.json())
      .catch(this.handleErrorObservable);
  }
  saveFile(path:string, fileContents:string): Observable<any>{
      let params: URLSearchParams = new URLSearchParams();
      params.set('newName', path);
      let requestOptions = new RequestOptions();
      requestOptions.search = params;
      let url :string = this.unixFileContents + "file";
      return this.http.post(url,fileContents, requestOptions)
      .map(res=>{
        res.json()
      })
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

