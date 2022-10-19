/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';

interface templateParams {
  allocationUnit: string,
  primarySpace: string,
  secondarySpace: string,
  directoryBlocks: string,
  recordFormat: string,
  recordLength: string,
}

interface dsntParams {
  organization: string;
}

const TEMPLATE = new Map<string, templateParams> ([
  ['JCL', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '100',
    directoryBlocks: '20',
    recordFormat: 'FB',
    recordLength: '80',
  }],
  ['COBOL', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '150',
    directoryBlocks: '20',
    recordFormat: 'FB',
    recordLength: '133',
  }],
  ['PLX', {
    allocationUnit: 'TRKS',
    primarySpace: '300',
    secondarySpace: '150',
    directoryBlocks: '20',
    recordFormat: 'VBA',
    recordLength: '132',
  }],
  ['XML', {
    allocationUnit: 'TRKS',
    primarySpace: '200',
    secondarySpace: '100',
    directoryBlocks: '20',
    recordFormat: 'VBA',
    recordLength: '16383',
  }],
]);

const DATASETNAMETYPE = new Map<string, dsntParams> ([
  ['PDS', {
    organization: 'PO',
  }],
  ['LIBRARY', {
    organization: 'PO',
  }],
  ['BASIC', {
    organization: 'PS',
  }],
  ['LARGE', {
    organization: 'PS',
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
    template: '',
    name: '',
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
  private templateOptions: string[];
  private allocationUnitOptions: string[];
  private datasetNameTypeOptions: string[];
  private recordFormatOptions: string[];
  private organizationOptions: string[];
  private recordUnitOptions: string[];
  private matcher = new CustomErrorStateMatcher();
  private isError: boolean = false;
  private errorText: string;
  private dirBlockTouched: boolean = false;

  @ViewChild('dirblocks') dirblocks: ElementRef;
  @ViewChild('primeSpace') primeSpace: ElementRef;
  @ViewChild('allocUnit') allocUnit: MatSelect;
  @ViewChild('secondSpace') secondSpace: ElementRef;
  @ViewChild('recordLength') recordLength: ElementRef;
  @ViewChild('recordFormat') recordFormat: MatSelect;
  @ViewChild('dsorg') dsorg: ElementRef;


  constructor(private el: ElementRef,) { }

  ngOnInit() {
    this.numericPattern = "^[0-9]*$";
    this.numericPatternExZero = "^[1-9][0-9]*$";
    this.datasetNamePattern = "^[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,21}$";
    this.alphaNumericPattern = "^[a-zA-Z0-9]*$";
    this.templateOptions = ['JCL','COBOL','PLX', 'XML'];
    this.allocationUnitOptions = ['BLKS','TRKS','CYLS', 'KB', 'MB', 'BYTES', 'RECORDS'];
    this.recordFormatOptions = ['F', 'FB', 'V', 'VB', 'VBA', 'U'];
    this.datasetNameTypeOptions = ['PDS','LIBRARY', 'BASIC', 'LARGE'];
    this.organizationOptions = ['PS', 'PO'];
    this.recordUnitOptions = ['U', 'K', 'M', ];
    this.properties.datasetNameType = 'PDS';
    this.properties.organization = 'PO'
    this.properties.template = '';
    this.properties.averageRecordUnit = '';
  }

  onTemplateChange(value: string): void {
    this.setTemplateProperties(value);
  }

  setDatasetNameTypeProperties(datasetNameType: string): void {
    this.dsorg.nativeElement.setAttribute('style', 'padding-bottom: 4px; margin-bottom: -7px; border-bottom: 2px solid #000099');
    setTimeout(() => {
      this.dsorg.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
    }, 3000)

    if(!datasetNameType) {
      this.properties.organization = 'PS';
    } else {
      this.properties.organization = DATASETNAMETYPE.get(datasetNameType)?.organization;
    }
    if(this.dirBlockTouched) {
      this.checkForValidCombination();
    }
  }

  setTemplateProperties(template: string): void  {
    this.dirblocks.nativeElement.setAttribute('style', 'margin-bottom: -7px; border-bottom: 2px solid #000099');
    this.allocUnit._elementRef.nativeElement.setAttribute('style', 'padding-bottom: 5px; margin-bottom: -7px; border-bottom: 2px solid #000099');
    this.primeSpace.nativeElement.setAttribute('style', 'margin-bottom: -6px; border-bottom: 2px solid #000099');
    this.secondSpace.nativeElement.setAttribute('style', 'margin-bottom: -7px; border-bottom: 2px solid #000099');
    this.recordLength.nativeElement.setAttribute('style', 'margin-bottom: -6px; border-bottom: 2px solid #000099');
    this.recordFormat._elementRef.nativeElement.setAttribute('style', 'padding-bottom: 5px; margin-bottom: -6px; border-bottom: 2px solid #000099');

    setTimeout(() => {
      this.dirblocks.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
      this.allocUnit._elementRef.nativeElement.setAttribute('style', 'padding-bottom: 0px; margin-bottom: 0px; border-bottom: 0px');
      this.primeSpace.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
      this.secondSpace.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
      this.recordLength.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
      this.recordFormat._elementRef.nativeElement.setAttribute('style', 'padding-bottom: 0px; margin-bottom: 0px; border-bottom: 0px');
    }, 3000)

    this.dirBlockTouched = true;

    if(!template) {
      this.properties.allocationUnit = '';
      this.properties.primarySpace = '';
      this.properties.secondarySpace = '';
      this.properties.directoryBlocks = '';
      this.properties.recordFormat = '';
      this.properties.recordLength = '';
    }

    this.properties.allocationUnit = TEMPLATE.get(template).allocationUnit;
    this.properties.primarySpace = TEMPLATE.get(template).primarySpace;
    this.properties.secondarySpace = TEMPLATE.get(template).secondarySpace;
    if(this.properties.organization == 'PS') {
      this.properties.directoryBlocks = '0';
    } else {
      this.properties.directoryBlocks = TEMPLATE.get(template).directoryBlocks;
    }
    this.isError=false;
    this.properties.recordFormat = TEMPLATE.get(template).recordFormat;
    this.properties.recordLength = TEMPLATE.get(template).recordLength;
  }

  onDirBlockChange(value): void {
    this.dirBlockTouched = true;
    this.checkForValidCombination();
  }

  checkForValidCombination():void {
    if(this.properties.organization == 'PS' && this.properties.directoryBlocks > '0') {
      this.isError = true;
      this.errorText = 'Invalid Combination: Directory blocks must be 0 for the sequential dataset';
    }
    if(this.properties.organization == 'PS' && this.properties.directoryBlocks === '0') {
      this.isError = false;
    }
    if(this.properties.organization == 'PO' && this.properties.directoryBlocks < '1') {
      this.isError = true;
      this.errorText = 'Invalid Combination: Directory blocks must be greater than 0 for the partitioned dataset';
    }
    if(this.properties.organization == 'PO' && this.properties.directoryBlocks > '0') {
      this.isError = false;
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