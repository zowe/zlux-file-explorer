/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, ElementRef } from '@angular/core';
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

const DATASETTYPE = new Map<string, DatasetCreationParams> ([
  ['PS', {
    organization: 'PS',
    datasetNameType: '',
    directoryBlocks: '0',
  }],
  ['PDS', {
    organization: 'PO',
    datasetNameType: 'PDS',
    directoryBlocks: '20',
  }],
  ['PDSE', {
    organization: 'PO',
    datasetNameType: 'LIBRARY',
    directoryBlocks: '20',
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
  private presetOptions: string[];
  private datasetTypeOptions: string[];
  private allocationUnitOptions: string[];
  private datasetNameTypeOptions: string[];
  private recordFormatOptions: string[];
  private organizationOptions: string[];
  private recordUnitOptions: string[];
  private matcher = new CustomErrorStateMatcher();
  private showAdvanceAttributes: boolean = false;

  constructor(private el: ElementRef,) { }

  ngOnInit() {
    this.numericPattern = "^[0-9]*$";
    this.numericPatternExZero = "^[1-9][0-9]*$";
    this.datasetNamePattern = "^[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,21}$";
    this.alphaNumericPattern = "^[a-zA-Z0-9]*$";
    this.presetOptions = ['JCL','COBOL','PLX', 'XML'];
    this.datasetTypeOptions = ['PS', 'PDS', 'PDSE'];
    this.allocationUnitOptions = ['BLKS','TRKS','CYLS', 'KB', 'MB', 'BYTES', 'RECORDS'];
    this.recordFormatOptions = ['F', 'FB', 'V', 'VB', 'U'];
    this.datasetNameTypeOptions = ['PDS','LIBRARY', 'HFS', 'LARGE', 'BASIC', 'EXTREQ', 'EXTPREF', 'DEFAULT'];
    this.organizationOptions = ['PS', 'PO'];
    this.recordUnitOptions = ['U', 'K', 'M', ];
    this.properties.datasetType = 'PS';
    this.properties.preset = '';
    this.properties.averageRecordUnit = '';
    this.properties.datasetNameType = 'PDS';
    this.setDatasetTypeProperties(this.properties.datasetType);
  }

  expandAdvAttributes() {
    console.log('-----Trying to scroll---------------------------------------------');
    this.showAdvanceAttributes = !this.showAdvanceAttributes;
    const lastFieldControl: HTMLElement = this.el.nativeElement.querySelector(
      "form .directory-block"
    );
    window.scroll({
      top: this.getTopOffset(lastFieldControl),
      left: 0,
      behavior: "smooth"
    });
  }

  private getTopOffset(controlEl: HTMLElement): number {
    console.log('---------------------------controlEl: ', controlEl);
    const labelOffset = 50;
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
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
    this.properties.directoryBlocks = DATASETTYPE.get(datasetType)?.directoryBlocks;
  }

  setPresetProperties(preset: string): void  {
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