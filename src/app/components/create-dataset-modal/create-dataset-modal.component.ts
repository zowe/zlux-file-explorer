
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';

@Component({
  selector: 'create-dataset-modal',
  templateUrl: './create-dataset-modal.component.html',
  styleUrls: ['./create-dataset-modal.component.scss',
  '../../../../src/app/shared/modal.component.scss']
})
export class CreateDatasetModal {
  private properties = {
    name: '',
    managementClass: '',
    storageClass: '',
    volumeSerial: '',
    deviceType: '',
    dataClass: '',
    allocationUnit: '',
    averageRecordUnit: '',
    primarySpace: '',
    secondarySpace: '',
    directoryBlocks: '',
    recordFormat: '',
    recordLength: '',
    blockSize: '',
    datasetNameType: '',
    averageBlockLength: '',
    organization: ''
  };
  private numericPattern = "^[0-9]*$";
  private datasetNamePattern = "^[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,4}$";
  private alphaNumericPattern = "^[a-zA-Z0-9]*$";
  private allocationUnitOptions: string[];
  private datasetNameTypeOptions: string[];
  private recordFormatOptions: string[];
  private organizationOptions: string[];
  private recordUnitOptions: string[];
  private matcher = new CustomErrorStateMatcher();

  constructor(
    @Inject(MAT_DIALOG_DATA) data
  ) 
  {
    const datasetProperties = data.datasetProperties;
    this.allocationUnitOptions = ['BLKS','TRKS','CYLS', 'KB', 'MB', 'BYTES', 'RECORDS'];
    this.recordFormatOptions = ['F', 'FB', 'V', 'VB', 'U'];
    this.datasetNameTypeOptions = ['PDS','LIBRARY', 'HFS', 'LARGE', 'BASIC', 'EXTREQ', 'EXTPREF', 'DEFAULT'];
    this.organizationOptions = ['PS', 'PO'];
    this.recordUnitOptions = ['U', 'K', 'M', ];
    if (datasetProperties.name) {
      this.properties.name = datasetProperties.name;
    }
    if (datasetProperties.allocationUnit) {
      this.properties.allocationUnit = datasetProperties.allocationUnit;
    }
    if (datasetProperties.averageRecordUnit) {
      this.properties.averageRecordUnit = datasetProperties.averageRecordUnit;
    }
    if (datasetProperties.primarySpace) {
      this.properties.primarySpace = datasetProperties.primarySpace;
    }
    if (datasetProperties.directoryBlocks) {
      this.properties.directoryBlocks = datasetProperties.directoryBlocks;
    }
    if (datasetProperties.recordFormat) {
      this.properties.recordFormat = datasetProperties.recordFormat;
    }
    if (datasetProperties.recordLength) {
      this.properties.recordLength = datasetProperties.recordLength;
    }
    if (datasetProperties.blockSize) {
      this.properties.blockSize = datasetProperties.blockSize;
    }
    if (datasetProperties.datasetNameType) {
      this.properties.datasetNameType = datasetProperties.datasetNameType;
    }
    if (datasetProperties.organization) {
      this.properties.organization = datasetProperties.organization;
    }
  }
  
  ngOnInit() {
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
