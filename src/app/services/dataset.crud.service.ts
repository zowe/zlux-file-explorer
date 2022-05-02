

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
import { DatasetAttributes } from '../structures/editor-project';
import { catchError, switchMap, map } from 'rxjs/operators';
import { UtilsService } from './utils.service';
import { of, throwError } from 'rxjs';

@Injectable()
export class DatasetCrudService {
  constructor(
    private http: Http,
    private utils: UtilsService
  ){}

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
    let url = ZoweZLUX.uriBroker.datasetContentsUri(rightClickedFile.data.path);
    return this.http.delete(url)
    .map(res=>res.json())
    .catch(this.handleErrorObservable);
  }

  deleteVsamDataset(rightClickedFile: any): Observable<any> {
    let url = ZoweZLUX.uriBroker.VSAMdatasetContentsUri(rightClickedFile.data.path);
    return this.http.delete(url)
    .map(res => res.json())
    .catch(this.handleErrorObservable);
  }

  submitJCL(rightClickedFile: any): Observable<any> {
    let url = ZoweZLUX.uriBroker.agentRootUri('jes');
    return this.http.put(url, { file: rightClickedFile })
    .map(res => res.json())
    .catch(this.handleErrorObservable);
  }

  queryDatasets(query:string, detail?: boolean, includeAdditionalQualifiers?: boolean): Observable<any>  {
    let url:string;
    url = ZoweZLUX.uriBroker.datasetMetadataUri(encodeURIComponent(query.toUpperCase( ).replace(/\.$/, '')), detail.toString(), undefined, true, undefined, undefined, undefined, undefined, undefined, includeAdditionalQualifiers.toString());
    return this.http.get(url)
    .map(res=>res.json())
    .catch(this.handleErrorObservable);
  }

  getDataset(path:string) {
    let url:string = ZoweZLUX.uriBroker.datasetContentsUri(path.trim().toUpperCase());
    return this.http.get(url)
    .map(res=>res.json())
    .catch(this.handleErrorObservable);
  }

  recallDataset(path: string): Observable<DatasetAttributes> {
    const datasetName = path.trim().toUpperCase();
    const contentsURI = ZoweZLUX.uriBroker.datasetContentsUri(datasetName);
    const detail = String(true);
    const types = undefined;
    const listMembers = true;
    const workAreaSize = undefined;
    const includeMigrated = true;
    const metadataURI = ZoweZLUX.uriBroker.datasetMetadataUri(datasetName, detail, types, listMembers, workAreaSize, includeMigrated);
    return this.http.get(contentsURI)
      .pipe(
        // dataset contents service may return an error, e.g. if dataset has RECFM=U
        // recall should happen inspite of the error
        catchError(_err => of('')),
        // get metadata to ensure that the dataset has successfully recalled
        switchMap(() => this.http.get(metadataURI)),
        map(res => res.json()),
        map(data => data.datasets[0] as DatasetAttributes),
        switchMap(
          // ensure that dataset is recalled, otherwise throw an error
          datasetAttrs =>
            this.utils.isDatasetMigrated(datasetAttrs) ?
              throwError(new Error('Unable to recall dataset')) : of(datasetAttrs)
        )
      );
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
