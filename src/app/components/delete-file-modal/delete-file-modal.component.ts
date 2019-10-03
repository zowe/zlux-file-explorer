
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'delete-file-modal',
  templateUrl: './delete-file-modal.component.html',
  styleUrls: ['./delete-file-modal.component.scss']
})
export class DeleteFileModal implements OnInit {

  private fileName = '';
  private fileCreatedAt = '';
  private fileType = '';
  private filePath = '';
  private fileMode = 0;
  private fileSize = '';
  private fileIcon = '';
  private DATA: any[] = [];
  private displayedColumns: string[];
  private dataSource;
  private sizeType: string;
  onDelete = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
  ) 
  {
    const node = data.event;
    this.fileName = node.name;
    this.fileCreatedAt = node.createdAt;
    this.fileType = node.data;
    this.filePath = node.path;
    this.fileMode = node.mode;

    if (node.size < 1024) { //Bytes
      this.fileSize = node.size;
      this.sizeType = "bytes";
    } else if (node.size < 1048576) {
      this.fileSize = (node.size / 1024).toFixed(3);
      this.sizeType = "KB";
    } else if (node.size < 1073741824) {
      this.fileSize = (node.size / 1048576).toFixed(3);
      this.sizeType = "MB";
    } else {
      this.fileSize = (node.size / 1073741824).toFixed(3);
      this.sizeType = "GB";
    }

    if (node.icon) {
      this.fileIcon = node.icon;
    } else if (node.collapsedIcon) {
      this.fileIcon = node.collapsedIcon;
    }
    this.fileIcon = "fa fa-ban";
    this.fileCreatedAt = this.fileCreatedAt.replace('T', ' ');

    this.DATA = [
      { fileCreatedAt: this.fileCreatedAt, 
        fileType: this.fileType, 
        filePath: this.filePath,
        fileMode: this.fileMode,
        fileSize: this.fileSize,
      },
    ]
    // TODO: Make ZSS return recursive "Folder" size, as the current size is misleading so we hide it
    if (this.fileType == 'Folder') {
      this.displayedColumns = ['fileCreatedAt', 'fileType', 'filePath', 'fileMode'];
    } else {
      this.displayedColumns = ['fileCreatedAt', 'fileType', 'filePath', 'fileMode', 'fileSize'];
    }
    this.dataSource = new MatTableDataSource(this.DATA);
  }

  ngOnInit() {
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
