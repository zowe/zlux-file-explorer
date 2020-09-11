
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';

@Component({
  selector: 'file-ownership-modal',
  templateUrl: './file-ownership-modal.component.html',
  styleUrls: ['./file-ownership-modal.component.scss',
    '../../../../src/app/shared/modal.component.scss'],
})
export class FileOwnershipModal {

  public name = '';
  public path = '';
  public mode = 0;
  public modeSym = '';
  public icon = '';
  public ownerName = "";
  public groupName = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
    private http: Http,
    private snackBar: MatSnackBar,
  ) 
  {
    const node = data.event;
    this.name = node.name;
    this.path = node.path;
    this.mode = node.mode;

    if (node.icon) {
      this.icon = node.icon;
    } else if (node.collapsedIcon) {
      this.icon = node.collapsedIcon;
    }

    this.formatPermissions();
  }

  formatPermissions() {
    let modeString = String(this.mode);
    if (modeString.length == 2) { // In case the mode is not properly formatted as "000" instead of "0", "20" etc
      modeString = "0" + modeString;
    } else if (modeString.length == 1) {
      modeString = "00" + modeString;
    }
    let modeStringSym = "";

    for (let i = 0; i < 3; i++) {
      let value =  modeString.charAt(i);
      switch(value) {
        case "0":
          modeStringSym += "---";
          break;
        case "1":
          modeStringSym += "--x";
          break;
        case "2":
          modeStringSym += "-w-";
          break;
        case "3":
          modeStringSym += "-wx";
          break;
        case "4":
          modeStringSym += "r--";
          break;
        case "5":
          modeStringSym += "r-x";
          break;
        case "6":
          modeStringSym += "rw-";
          break;
        case "7":
          modeStringSym += "rwx";
          break;
      }
    }
    this.modeSym = modeStringSym;
  }

  saveOwnerInfo() {
    let url :string = ZoweZLUX.uriBroker.unixFileUri('chown', this.path, undefined, undefined, undefined, false, undefined, undefined, undefined, undefined, undefined, this.ownerName, this.groupName);
    this.http.post(url, null)
    .map(res=>{
      if (res.status == 200) {
        this.snackBar.open(this.path + ' has been successfully changed to Owner: ' + this.ownerName + " Group: " + this.groupName + ".", 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
      } else {
        this.snackBar.open(res.status + " - A problem was encountered: " + res.statusText, 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
      }
    })
    .catch(this.handleErrorObservable).subscribe(
      resp => {
      },
      error => { 
        this.snackBar.open(error.status + " - A problem was encountered: " + error._body, 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
      }
    );
  }

  private handleErrorObservable (error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.message || error);
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
