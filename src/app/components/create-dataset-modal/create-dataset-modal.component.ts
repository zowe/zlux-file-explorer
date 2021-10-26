
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';

interface DatasetCreationParams {
  organization :string,
  allocationUnit :string,
  primarySpace :string,
  secondarySpace :string,
  directoryBlocks :string,
  recordFormat :string,
  blockSize :string,
  recordLength :string,
}

const PRESETS = new Map<string, DatasetCreationParams> ([
  ['JCL', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '100',
    directoryBlocks: '20',
    recordFormat: 'FB',
    recordLength: '80',
    blockSize: '0',
    organization: 'PO'
  }],
  ['COBOL', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '150',
    directoryBlocks: '20',
    recordFormat: 'FB',
    recordLength: '133',
    blockSize: '0',
    organization: 'PO'
  }],
  ['PLX', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '150',
    directoryBlocks: '20',
    recordFormat: 'VBA',
    recordLength: '132',
    blockSize: '0',
    organization: 'PO'
  }],
  ['XML', {
    allocationUnit: 'TRKS',
    primarySpace: '200',
    secondarySpace: '100',
    directoryBlocks: '20',
    recordFormat: 'VBA',
    recordLength: '16383',
    blockSize: '0',
    organization: 'PO'
  }],
]);

@Component({
  selector: 'create-dataset-modal',
  templateUrl: './create-dataset-modal.component.html',
  styleUrls: ['./create-dataset-modal.component.scss',
  '../../../../src/app/shared/modal.component.scss']
})
export class CreateDatasetModal {
  private properties = {
    preset: '',
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
    organization: ''
  };
  private numericPattern: string;
  private datasetNamePattern: string;
  private alphaNumericPattern: string;
  private presetOptions: string[];
  private allocationUnitOptions: string[];
  private datasetNameTypeOptions: string[];
  private recordFormatOptions: string[];
  private organizationOptions: string[];
  private recordUnitOptions: string[];
  private matcher = new CustomErrorStateMatcher();

  constructor() { }
  
  ngOnInit() {
    this.numericPattern = "^[0-9]*$";
    this.datasetNamePattern = "^[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,4}$";
    this.alphaNumericPattern = "^[a-zA-Z0-9]*$";
    this.presetOptions = ['JCL','COBOL','PLX', 'XML'];
    this.allocationUnitOptions = ['BLKS','TRKS','CYLS', 'KB', 'MB', 'BYTES', 'RECORDS'];
    this.recordFormatOptions = ['F', 'FB', 'V', 'VB', 'U', 'VBA'];
    this.datasetNameTypeOptions = ['PDS','LIBRARY', 'HFS', 'LARGE', 'BASIC', 'EXTREQ', 'EXTPREF', 'DEFAULT'];
    this.organizationOptions = ['PS', 'PO'];
    this.recordUnitOptions = ['U', 'K', 'M', ];
    this.properties.preset = 'JCL';
    this.properties.name = 'PUBLIC.DATASET.NEW';
    this.properties.averageRecordUnit = 'U';
    this.properties.datasetNameType = 'PDS';
    this.setProperties(this.properties.preset);
  }
  
  onPresetChange(value: string): void {
    this.setProperties(value);
  }

  setProperties(preset: string): void  {
    this.properties.allocationUnit = PRESETS.get(preset).allocationUnit;
    this.properties.primarySpace = PRESETS.get(preset).primarySpace;
    this.properties.secondarySpace = PRESETS.get(preset).secondarySpace;
    this.properties.directoryBlocks = PRESETS.get(preset).directoryBlocks;
    this.properties.recordFormat = PRESETS.get(preset).recordFormat;
    this.properties.recordLength = PRESETS.get(preset).recordLength;
    this.properties.blockSize = PRESETS.get(preset).blockSize;
    this.properties.organization = PRESETS.get(preset).organization;
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
