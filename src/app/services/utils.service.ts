

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {
  constructor(){}
  filePathCheck(path:string):string{
    if (path.charAt(0) === '/') {
        return path.substring(1);
    }
    return path;
  }
  filePathEndCheck(path:string):string{
    if (path.slice(-1) !== '/') {
        return path + "/";
    }
    return path;
  }

  isfile(selectedItem:string, treeData:any):boolean{
    for (let index:number = 0; index < treeData.length; index++){
      if (treeData[index].path === selectedItem && treeData[index].data === "Documents Folder"){
        return false;
      }
    }
    return true;
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

