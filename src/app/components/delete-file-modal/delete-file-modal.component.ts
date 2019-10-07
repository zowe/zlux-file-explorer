
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
  selector: 'delete-file-modal',
  templateUrl: './delete-file-modal.component.html',
  styleUrls: ['./delete-file-modal.component.scss']
})
export class DeleteFileModal {

  private fileName = '';
  private fileIcon = '';
  onDelete = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
  ) 
  {
    const node = data.event;
    this.fileName = node.name;
    this.fileIcon = "fa fa-ban";
  }

  deleteFile() {
    this.onDelete.emit();
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
