
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'create-folder-modal',
  templateUrl: './create-folder-modal.component.html',
  styleUrls: ['./create-folder-modal.component.scss']
})
export class CreateFolderModal {

  private folderName = "";
  private folderPath = "";
  private folderPathObtainedFromNode = "";
  private hasFolderBeenExpandedBefore = false;
  // Block unallowed characters and "." and ".." etc
  private folderPattern = /(([^\x00-\x1F!"$'\(\)*,\/:;<>\?\[\\\]\{\|\}\x7F\s]+)$)/; 
  onCreate = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
  ) 
  {
    const node = data.event;
    if (node.path) {
      this.folderPath = node.path;
    } else {
      this.folderPath = "";
    }
    this.folderPathObtainedFromNode = this.folderPath;
    if (node.expanded) {
      this.hasFolderBeenExpandedBefore = true;
    }
  }

  createFolder() {
    if (this.folderPath != this.folderPathObtainedFromNode || this.hasFolderBeenExpandedBefore == false) { 
      //If the user changed the path obtained from the node or the node has never been opened...
      this.onCreate.emit([this.folderPath + "/" + this.folderName, false]); //then we can't update the tree.
    } else { //If the user kept the path obtained from the node...
      this.onCreate.emit([this.folderPath + "/" + this.folderName, true]); //then we can add that new folder into the existing node.
    }
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
