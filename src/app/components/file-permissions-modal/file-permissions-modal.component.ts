
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
  selector: 'file-permissions-modal',
  templateUrl: './file-permissions-modal.component.html',
  styleUrls: ['./file-permissions-modal.component.scss',
  '../../../../src/app/shared/modal.component.scss'],
})
export class FilePermissionsModal {

  public name = '';
  public path = '';
  public mode = 0;
  public modeSym = '';
  public icon = '';
  public userRead = false;
  public groupRead = false;
  public publicRead = false;
  public userWrite = false;
  public groupWrite = false;
  public publicWrite = false;
  public userExecute = false;
  public groupExecute = false;
  public publicExecute = false;
  public isDirectory = false;
  public recursive = false;

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

    if (node.directory) {
      this.isDirectory = true;
    }

    this.formatPermissions();
  }

  applyFilter(filterValue: string) {
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
    let modeStringChar;

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.userRead = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.userWrite = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.userExecute = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.groupRead = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.groupWrite = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.groupExecute = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.publicRead = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.publicWrite = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.publicExecute = this.calcBooleanFromMode(modeStringChar);
  }

  calcBooleanFromMode(char: string): boolean {
    if (char == '-') {
      return false;
    } else {
      return true;
    }
  }

  updateUI() {

    let modeStringSym = "";

    if (this.userExecute) { //1, 3, 5, or 7
      if (this.userWrite) { //3 or 7
        if (this.userRead) {
          modeStringSym += "7";
        } else {
          modeStringSym += "3";
        }
      } else { // 1 or 5
        if (this.userRead) {
          modeStringSym += "5";
        } else {
          modeStringSym += "1";
        }
      }
    } else { // 0, 2, 4, or 6
      if (this.userWrite) { // 2 or 6
        if (this.userRead) {
          modeStringSym += "6";
        } else {
          modeStringSym += "2";
        }
      } else { //0 or 4
        if (this.userRead) {
          modeStringSym += "4";
        } else {
          modeStringSym += "0";
        }
      }
    }

    if (this.groupExecute) { //1, 3, 5, or 7
      if (this.groupWrite) { //3 or 7
        if (this.groupRead) {
          modeStringSym += "7";
        } else {
          modeStringSym += "3";
        }
      } else { // 1 or 5
        if (this.groupRead) {
          modeStringSym += "5";
        } else {
          modeStringSym += "1";
        }
      }
    } else { // 0, 2, 4, or 6
      if (this.groupWrite) { // 2 or 6
        if (this.groupRead) {
          modeStringSym += "6";
        } else {
          modeStringSym += "2";
        }
      } else { //0 or 4
        if (this.groupRead) {
          modeStringSym += "4";
        } else {
          modeStringSym += "0";
        }
      }
    }

    if (this.publicExecute) { //1, 3, 5, or 7
      if (this.publicWrite) { //3 or 7
        if (this.publicRead) {
          modeStringSym += "7";
        } else {
          modeStringSym += "3";
        }
      } else { // 1 or 5
        if (this.publicRead) {
          modeStringSym += "5";
        } else {
          modeStringSym += "1";
        }
      }
    } else { // 0, 2, 4, or 6
      if (this.publicWrite) { // 2 or 6
        if (this.publicRead) {
          modeStringSym += "6";
        } else {
          modeStringSym += "2";
        }
      } else { //0 or 4
        if (this.publicRead) {
          modeStringSym += "4";
        } else {
          modeStringSym += "0";
        }
      }
    }

    this.mode = parseInt(modeStringSym);
    this.formatPermissions();
  }

  savePermissions() {
    let url :string = ZoweZLUX.uriBroker.unixFileUri('chmod', this.path, undefined, undefined, undefined, false, undefined, undefined, undefined, this.mode.toString(), this.recursive);
    this.http.post(url, null)
    .map(res=>{
      if (res.status == 200) {
        this.snackBar.open(this.path + ' has been successfully changed to ' + this.mode + ".", 
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
