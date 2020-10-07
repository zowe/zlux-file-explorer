
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';
import { findTagOptionByCodeset, TagOption } from './tag-option';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';

@Component({
  selector: 'file-tagging-modal',
  templateUrl: './file-tagging-modal.component.html',
  styleUrls: [
    './file-tagging-modal.component.scss',
    '../../../../src/app/shared/modal.component.scss'
  ],
})
export class FileTaggingModal {
  node: any;
  isDirectory: boolean;
  icon: string;
  name: string;
  title: string;
  matcher = new CustomErrorStateMatcher();
  codeset: number;
  recursive: boolean = false;
  tagOptions: TagOption[] = [
    { title: 'Untagged', codeset: 0, type: 'delete' },
    { title: 'IBM-1047', codeset: 1047, type: 'text' },
    { title: 'ISO-8859-1', codeset: 819, type: 'text' },
    { title: 'Binary', codeset: 65535, type: 'binary' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    this.node = data.node;
    this.name = this.node.name;
    this.isDirectory = this.node.directory;
    this.icon = this.node.icon ? this.node.icon : this.node.collapsedIcon;
    this.title = this.isDirectory ? 'Tag files' : 'Tag file';
    this.codeset = this.isDirectory ? 0 : this.node.ccsid;
  }

  changeTag(): void {
    const path: string = this.node.path;
    const recursive = this.recursive;
    const codeset = this.codeset;
    const option = findTagOptionByCodeset(this.tagOptions, codeset);
    const type: ZLUX.TagType = option ? option.type : 'text';
    const options: ZLUX.UnixFileUriOptions = {
      recursive,
      type,
      codeset: type === 'text' ? codeset : undefined
    };
    const url = ZoweZLUX.uriBroker.unixFileUri('chtag', path, options);
    const action = (type === 'delete') ? this.http.delete(url) : this.http.post(url, null);
    action.subscribe(
      _res => this.onTaggingSuccess(path, type, codeset),
      err => this.onTaggingFailure(err),
    );
  }

  onTaggingSuccess(path: string, type: ZLUX.TagType, codeset: number): void {
    if (!this.isDirectory) {
      this.node.ccsid = codeset;
    }
    const verb = (type === 'delete') ? 'untagged' : 'tagged';
    const message = this.isDirectory ?
      `Files in ${path} have been successfully ${verb}` :
      `File ${path} has been successfully ${verb}`
    this.snackBar.open(message, 'Dismiss', defaultSnackbarOptions);
  }

  onTaggingFailure(err: HttpErrorResponse): void {
    let message = 'Failed to change tag(s)';
    if (typeof err.error === 'object' && typeof err.error.error === 'string') {
      message = err.error.error;
    }
    this.snackBar.open(`Error: ${message}.`, 'Dismiss', defaultSnackbarOptions);
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
