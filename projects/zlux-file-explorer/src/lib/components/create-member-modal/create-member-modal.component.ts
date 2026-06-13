
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'create-member-modal',
  templateUrl: './create-member-modal.component.html',
  styleUrls: ['./create-member-modal.component.scss',
    '../../shared/modal.component.scss'],
})
export class CreateMemberModal {
  public memberName: string = "";
  public datasetName: string = "";
  // Member name pattern: must start with A-Z, #, $, @; alphanumeric + #$@ allowed; max 8 chars total
  public memberPattern = /^[a-zA-Z#$@][a-zA-Z0-9#$@]{0,7}$/;
  public creating = false;
  onCreate = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data && data.datasetName) {
      this.datasetName = data.datasetName;
    }
  }

  createMember() {
    const trimmed = (this.memberName || '').trim();
    if (!trimmed || !this.memberPattern.test(trimmed)) {
      return;
    }

    this.creating = true;
    let onCreateResponse = new Map();
    onCreateResponse.set("memberName", trimmed.toUpperCase());
    onCreateResponse.set("datasetName", this.datasetName);
    this.onCreate.emit(onCreateResponse);
  }

  get isValid(): boolean {
    const trimmed = (this.memberName || '').trim();
    return !!trimmed && this.memberPattern.test(trimmed);
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
