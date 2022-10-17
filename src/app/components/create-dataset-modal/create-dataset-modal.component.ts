/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';

interface DatasetCreationParams {
  organization? :string,
  allocationUnit? :string,
  primarySpace? :string,
  secondarySpace? :string,
  directoryBlocks? :string,
  recordFormat? :string,
  blockSize? :string,
  recordLength? :string,
  datasetNameType? :string
}

const PRESETS = new Map<string, DatasetCreationParams> ([
  ['JCL', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '100',
    directoryBlocks: '20',
    recordFormat: 'FB',
    recordLength: '80',
    organization: 'PO'
  }],
  ['COBOL', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '150',
    directoryBlocks: '20',
    recordFormat: 'FB',
    recordLength: '133',
    organization: 'PO'
  }],
  ['PLX', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '150',
    directoryBlocks: '20',
    recordFormat: 'VB',
    recordLength: '132',
    organization: 'PO'
  }],
  ['XML', {
    allocationUnit: 'TRKS',
    primarySpace: '200',
    secondarySpace: '100',
    directoryBlocks: '20',
    recordFormat: 'VB',
    recordLength: '16383',
    organization: 'PO'
  }],
]);

const DATASETTYPE = new Map<string, DatasetCreationParams> ([
  ['PS', {
    organization: 'PS',
    datasetNameType: ''
  }],
  ['PDS', {
    organization: 'PO',
    datasetNameType: 'PDS'
  }],
  ['PDSE', {
    organization: 'PO',
    datasetNameType: 'LIBRARY'
  }]
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
    datasetType: '',
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
  private numericPatternExZero: string;
  private datasetNamePattern: string;
  private alphaNumericPattern: string;
  // private blocksizePattern: string;
  private presetOptions: string[];
  private datasetTypeOptions: string[];
  private allocationUnitOptions: string[];
  private datasetNameTypeOptions: string[];
  private recordFormatOptions: string[];
  private organizationOptions: string[];
  private recordUnitOptions: string[];
  private matcher = new CustomErrorStateMatcher();

  constructor(private el: ElementRef,) { }

  ngOnInit() {
    this.numericPattern = "^[0-9]*$";
    this.numericPatternExZero = "^[1-9][0-9]*$";
    this.datasetNamePattern = "^[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,21}$";
    this.alphaNumericPattern = "^[a-zA-Z0-9]*$";
    // this.blocksizePattern = "^.{1, 100}$";
    this.presetOptions = ['JCL','COBOL','PLX', 'XML'];
    this.datasetTypeOptions = ['PS', 'PDS', 'PDSE'];
    this.allocationUnitOptions = ['BLKS','TRKS','CYLS', 'KB', 'MB', 'BYTES', 'RECORDS'];
    this.recordFormatOptions = ['F', 'FB', 'V', 'VB', 'U'];
    this.datasetNameTypeOptions = ['PDS','LIBRARY'];
    this.organizationOptions = ['PS', 'PO'];
    this.recordUnitOptions = ['U', 'K', 'M', ];
    this.properties.datasetType = 'PS';
    // this.properties.recordLength = '256';
    // this.properties.recordFormat = 'FB';
    // this.properties.blockSize = '5120'
    this.properties.preset = 'JCL';
    this.properties.averageRecordUnit = '';
    this.setDatasetTypeProperties(this.properties.datasetType);
    this.setPresetProperties(this.properties.preset);
  }

  onDatasetTypeChange(value:string): void {
    this.setDatasetTypeProperties(value);
  }

  onPresetChange(value: string): void {
    this.setPresetProperties(value);
  }

  setDatasetTypeProperties(datasetType: string): void {
    this.properties.organization = DATASETTYPE.get(datasetType)?.organization;
    this.properties.datasetNameType = DATASETTYPE.get(datasetType)?.datasetNameType;
  }

  setPresetProperties(preset: string): void  {
    this.properties.allocationUnit = PRESETS.get(preset).allocationUnit;
    this.properties.primarySpace = PRESETS.get(preset).primarySpace;
    this.properties.secondarySpace = PRESETS.get(preset).secondarySpace;
    this.properties.directoryBlocks = PRESETS.get(preset).directoryBlocks;
    this.properties.recordFormat = PRESETS.get(preset).recordFormat;
    this.properties.recordLength = PRESETS.get(preset).recordLength;
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