

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';
import { Http} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class FileService {
  private handleErrorObservable (error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
}

  constructor(private http: Http){}

    queryDatasets(query:string, detail?: boolean, includeAdditionalQualifiers?: boolean): Observable<any>  {
      let url:string;
      url = ZoweZLUX.uriBroker.datasetMetadataUri(query.toUpperCase( ).replace(/\.$/, ''), detail.toString(), undefined, true, includeAdditionalQualifiers.toString());
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
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

