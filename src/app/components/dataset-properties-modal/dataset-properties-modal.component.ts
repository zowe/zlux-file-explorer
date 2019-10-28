
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'dataset-properties-modal',
  templateUrl: './dataset-properties-modal.component.html',
  styleUrls: ['./dataset-properties-modal.component.scss']
})
export class DatasetPropertiesModal implements OnInit {

  public datasetName = '';
  public datasetCSIEntryType = '';
  public datasetIsPDS = '';
  public datasetMaxRecordLen = 0;
  public datasetOrganization = '';
  public datasetBlockSize = 0;
  public datasetCarriageControl = '';
  public datasetIsBlocked = '';
  public datasetRecordLength = '';
  public datasetVolser = '';
  public datasetIcon = '';
  public DATA: any[] = [];
  public displayedColumns: string[];
  public dataSource;
  public sizeType: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
  ) 
  {
    const node = data.event;
    if (node.data) {
      const data = node.data;
      this.datasetName = data.fileName;
      this.datasetCSIEntryType = data.datasetAttrs.csiEntryType;
      if (data.datasetAttrs.dsorg) {
        if (data.datasetAttrs.dsorg.isPDSDir) {
          if (data.datasetAttrs.dsorg.isPDSE) {
            this.datasetIsPDS = "✓ (PDS/E)";
          } else {
            this.datasetIsPDS = "✓";
          }
        }
        this.datasetOrganization = data.datasetAttrs.dsorg.organization;
        this.datasetBlockSize = data.datasetAttrs.dsorg.totalBlockSize;
        this.datasetCarriageControl = data.datasetAttrs.recfm.carriageControl;
        if (data.datasetAttrs.recfm.isBlocked) {
          this.datasetIsBlocked = "✓";
        }
        this.datasetRecordLength = data.datasetAttrs.recfm.recordLength;
        this.datasetVolser = data.datasetAttrs.volser;
      }
    }
    if (node.icon) {
      this.datasetIcon = node.icon;
    } else if (node.collapsedIcon) {
      this.datasetIcon = node.collapsedIcon;
    }

    this.DATA = [
      { datasetCSIEntryType: this.datasetCSIEntryType, 
        datasetIsPDS: this.datasetIsPDS, 
        datasetOrganization: this.datasetOrganization,
        datasetBlockSize: this.datasetBlockSize,
        datasetCarriageControl: this.datasetCarriageControl,
        datasetIsBlocked: this.datasetIsBlocked,
        datasetRecordLength: this.datasetRecordLength,
        datasetVolser: this.datasetVolser
      },
    ]
    this.displayedColumns = ['datasetCSIEntryType', 'datasetIsPDS', 'datasetOrganization', 'datasetBlockSize',
    'datasetCarriageControl', 'datasetIsBlocked', 'datasetRecordLength', 'datasetVolser'];
    this.dataSource = new MatTableDataSource(this.DATA);
  }

  ngOnInit() {
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
