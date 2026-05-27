
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
  onCreate = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    if (data && data.datasetName) {
      this.datasetName = data.datasetName;
    }
  }

  createMember() {
    if (!this.memberName || !this.memberPattern.test(this.memberName)) {
      return;
    }

    let onCreateResponse = new Map();
    onCreateResponse.set("memberName", this.memberName.toUpperCase());
    onCreateResponse.set("datasetName", this.datasetName);
    this.onCreate.emit(onCreateResponse);
  }

  get isValid(): boolean {
    return !!this.memberName && this.memberPattern.test(this.memberName);
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
