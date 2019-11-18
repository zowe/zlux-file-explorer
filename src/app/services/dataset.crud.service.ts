

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DatasetCrudService {
  constructor(private http: Http){}

  private handleErrorObservable (error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
  }
  
  //addfolder
  addfolder():void{

  }
  //removefolder
  removefolder():void{

  }
  //copyfolder
  copyfolder():void{

  }
  //deletefolder
  deletefolder():void{

  }
  //renamefolder
  renamefolder():void{

  }

  //addfile
  addfile():void{

  }
  //removefile
  removefile():void{

  }
  //copyfile
  copyfile():void{

  }
  //deletefile
  deletefile():void{

  }
  //renamefile
  renamefile():void{

  }

  deleteNonVsamDatasetOrMember(rightClickedFile: any): Observable<any>{
    console.log("NONVSAM");
    console.log(ZoweZLUX.uriBroker.datasetContentsUri(rightClickedFile.data.path))
    let url = ZoweZLUX.uriBroker.datasetContentsUri(rightClickedFile.data.path);
    return this.http.delete(url)
    .map(res=>res.json())
    .catch(this.handleErrorObservable);
  }

  deleteVsamDataset(rightClickedFile: any): Observable<any> {
    console.log("VSAM");
    console.log(ZoweZLUX.uriBroker.VSAMdatasetContentsUri(rightClickedFile.data.path))
    let url = ZoweZLUX.uriBroker.VSAMdatasetContentsUri(rightClickedFile.data.path);
    return this.http.delete(url)
    .map(res => res.json())
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

