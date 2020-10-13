

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

declare var require: any;

import {
  NgModule, Component,
  Input, Output, ViewChild, ViewEncapsulation,
  ElementRef, ChangeDetectorRef,
  OnChanges, SimpleChanges, AfterViewChecked, EventEmitter, OnInit, OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContextMenuModule, TreeModule, MenuItem, MenuModule, DialogModule } from 'primeng/primeng';
import { TreeComponent } from '../tree/tree.component';
import { UtilsService } from '../../services/utils.service';
import { MvsDataObject, UssDataObject } from '../../structures/persistantdata';
import { ZluxTabbingModule } from '@zlux/widgets';

// import {FileContents} from '../../structures/filecontents';
import { tab } from '../../structures/tab';
//import {ComponentClass} from '../../../../../../zlux-platform/interface/src/registry/classes';
/*import { PersistentDataService } from '../../services/persistentData.service';*/
/*import {FileBrowserFileSelectedEvent,
  IFileBrowser,
  IFileBrowserMultiSelect,
  IFileBrowserFolderSelect,
  IFileBrowserUSS,
  IFileBrowserMVS
} from '../../../../../../zlux-platform/interface/src/registry/component-classes/file-browser';*/
//Commented out to fix compilation errors from zlux-platform changes, does not affect program
//TODO: Implement new capabilities from zlux-platform
import { FileBrowserMVSComponent } from '../filebrowsermvs/filebrowsermvs.component';
import { FileBrowserUSSComponent } from '../filebrowseruss/filebrowseruss.component';
import { FilePropertiesModal } from '../file-properties-modal/file-properties-modal.component';
import { DeleteFileModal } from '../delete-file-modal/delete-file-modal.component';
import { CreateFolderModal } from '../create-folder-modal/create-folder-modal.component';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatTooltipModule,
} from '@angular/material';
import { DatasetPropertiesModal } from '../dataset-properties-modal/dataset-properties-modal.component';
import { FilePermissionsModal } from '../file-permissions-modal/file-permissions-modal.component';
import { FileOwnershipModal } from '../file-ownership-modal/file-ownership-modal.component';
import { FileTaggingModal } from '../file-tagging-modal/file-tagging-modal.component';

@Component({
  selector: 'zlux-file-tree',
  templateUrl: './zlux-file-tree.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./zlux-file-tree.component.css'],
  providers: [UtilsService/*, PersistentDataService*/]
})

export class ZluxFileTreeComponent implements OnInit, OnDestroy {
  //componentClass: ComponentClass;
  currentIndex: number;
  tabs: Array<tab>;
  showUpArrow: boolean;

  @ViewChild(FileBrowserUSSComponent)
  private ussComponent: FileBrowserUSSComponent;

  @ViewChild(FileBrowserMVSComponent)
  private mvsComponent: FileBrowserMVSComponent;

  constructor(/*private persistentDataService: PersistentDataService,*/
    private utils: UtilsService, private elemRef: ElementRef,
    private cd: ChangeDetectorRef)
  {
    //this.componentClass = ComponentClass.FileBrowser;
    this.currentIndex = 0;
    this.tabs = [{ index: 0, name: "USS" }, { index: 1, name: "Datasets (Beta)" }];
    this.showUpArrow = true;
  }

  @Input() set spawnModal(typeAndData:any) {
    let type = typeAndData.type;
    let data = typeAndData.data;
    let isDataset = data.volser ? true : false;

    if (type =='properties') {
      isDataset
        ? this.mvsComponent.showPropertiesDialog(data)
        : this.ussComponent.showPropertiesDialog(data);
    } else if (type == 'delete') {
      isDataset
        ? this.mvsComponent.showDeleteDialog(data)
        : this.ussComponent.showDeleteDialog(data);
    } else if (type == 'createFolder' && !isDataset) {
      this.ussComponent.showCreateFolderDialog(data);
    }
  }

  @Input() selectPath: string;
  @Input() style: ZluxFileTreeStyle = {};
  @Input() headerStyle: ZluxFileTreeStyle = {};
  @Input() inputStyle: ZluxFileTreeStyle = {};
  @Input() searchStyle: ZluxFileTreeStyle = {};
  @Input() treeStyle: ZluxFileTreeStyle = {};
  @Input() theme: string;

  @Output() fileOutput: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeDblClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFolderClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() copyClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() ussRenameEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() datasetSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() ussSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() rightClick: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    // var obj = {
    //   "ussInput": "",
    //   "mvsInput": "",
    //   "ussData": [],
    //   "mvsData": []
    // }
    // this.persistentDataService.setData(obj)
    //   .subscribe((res: any) => { });
    switch(this.theme) { 
      case 'carbon': { 
         this.headerStyle =  {
          'background-color': '#3d70b2',
          'color': 'white',
          'width':'99.7%',
          'text-align':'right'
        };
         this.inputStyle = {
          'background-color': '#eee', 
          'color': 'black', 
          'border':'2px solid #3d70b2',
          'margin-top': '20px'
        };
        this.searchStyle = {
          'min-width': '250px',
          'display': 'inline-block',
          'height': '40px',
          'width':'90%',
        };
  
        this.treeStyle = {
          'color':'#646464'
        };
  
        this.style = {
          'background-color':'#F4F7FB',
          'margin-top': '10px',
          'max-height':'320px',
          'overflow-y': 'scroll',
          'padding':'0px',   
          'margin-left':'0px'       
        };
  
         break; 
      } 
      default: {
        this.treeStyle = {'filter': 'brightness(3)', 'color':'white'};
         break; 
      } 
   } 
  }

  ngOnDestroy() {
    // let dataObject = {mvsData:Array<MvsDataObject>(), ussData:Array<UssDataObject>()};
    // this.persistentDataService.getData()
    //   .subscribe(data => {
    //     dataObject = data.contents;
    //     dataObject.mvsData = [];
    //     dataObject.ussData = [];
    //     //console.log(JSON.stringify(dataObject))
    //     this.persistentDataService.setData(dataObject)
    //       .subscribe((res: any) => { });
    //   })
  }

  deleteFileOrFolder(pathAndName: string) {
    this.ussComponent.deleteFileOrFolder(pathAndName);
  }

  createDirectory(pathAndName?: string) {
    if (pathAndName) {
      this.ussComponent.showCreateFolderDialog(pathAndName);
    } else {
      this.ussComponent.showCreateFolderDialog(this.ussComponent.getSelectedPath());
    }
  }

  getActiveDirectory(): string {
    if (this.currentIndex == 0) {
      return this.ussComponent.getSelectedPath();
    } else { //Datasets do not yet have an active directory context
      return null;
    }
  }

  hideExplorers() {
    if (this.ussComponent) {
      this.ussComponent.hideExplorer = true;
    }
    if (this.mvsComponent) {
      this.mvsComponent.hideExplorer = true;
    }
  }

  displayUpArrow(show: boolean) {
    this.showUpArrow = show;
  }

  onCopyClick($event:any){
    this.copyClick.emit($event);
  }

  onDeleteClick($event:any){
    this.deleteClick.emit($event);
  }

  onUSSRenameEvent($event:any){
    this.ussRenameEvent.emit($event);
  }

  onNewFileClick($event:any){
    this.newFileClick.emit($event);
  }

  onNewFolderClick($event:any){
    this.newFolderClick.emit($event);
  }

  onNodeClick($event:any){
    this.nodeClick.emit($event);
  }

  onNodeDblClick($event: any) {
    this.nodeDblClick.emit($event);
  }

  onPathChanged($event: any) {
    this.pathChanged.emit($event);
  }

  onRightClick($event: any) {
    this.rightClick.emit($event);
  }

  // onUssFileLoad($event:FileContents){
  //   this.fileOutput.emit($event);
  // }

  provideZLUXDispatcherCallbacks(): ZLUX.ApplicationCallbacks {
    return {
      onMessage: (eventContext: any): Promise<any> => {
        return this.zluxOnMessage(eventContext);
      }
    }
  }

  setIndex(inputIndex: number) {
    this.currentIndex = inputIndex;
    if (this.currentIndex == 0)
    {
      this.ussSelect.emit();
    } else {
      this.datasetSelect.emit();
    }
  }

  showDatasets() {
    this.currentIndex = 1;
    if (this.mvsComponent) {
      this.mvsComponent.hideExplorer = false;
    }
  }

  showUss() {
    this.currentIndex = 0;
    if (this.ussComponent) {
      this.ussComponent.hideExplorer = false;
    }
  }

  updateDirectory(dirName: string) {
    this.showUss();
    this.ussComponent.updateUss(dirName);
  }

  updateDSList(query: string) {
    this.showDatasets();
    this.mvsComponent.updateTreeView(query);
  }

  zluxOnMessage(eventContext: any): Promise<any> {
    return new Promise((resolve,reject)=> {

      if (!eventContext || !eventContext.action){
        return reject('Event context missing or malformed');
      }
      if (eventContext.action === 'save-file'){
        // This is no longer needed as Editor takes over any file edit/context functions.
        // this.parentUssEdit = eventContext;
        // console.log("parentUssEdit:" + this.parentUssEdit)
        //TODO:throw this down to FileBrowserUSSComponent
        resolve();
      }
      // else if (eventContext.action === 'open-file'){
      //   if (!eventContext.filePath || !eventContext.fileName || !eventContext.fileContents) {
      //     return reject('Event context missing or malformed');
      //   }
      //   this.initMonaco(eventContext);
      // }
    });
  }
}

@NgModule({
  declarations: [FileBrowserMVSComponent, 
    FileBrowserUSSComponent, 
    ZluxFileTreeComponent, 
    FilePropertiesModal,
    FilePermissionsModal,
    FileOwnershipModal,
    FileTaggingModal,
    DatasetPropertiesModal,
    DeleteFileModal,
    CreateFolderModal,
    TreeComponent],
  imports: [
    CommonModule, 
    FormsModule, 
    TreeModule, 
    MenuModule, 
    MatDialogModule,
    DialogModule, 
    ContextMenuModule,
    MatTableModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatCheckboxModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatAutocompleteModule,
    ZluxTabbingModule,
    MatSlideToggleModule
  ],
  exports: [ZluxFileTreeComponent],
  entryComponents: [
    ZluxFileTreeComponent,
    FilePermissionsModal,
    FilePropertiesModal,
    FileOwnershipModal,
    FileTaggingModal,
    DatasetPropertiesModal,
    DeleteFileModal,
    CreateFolderModal,
  ],
})
export class ZluxFileTreeModule { }

export interface ZluxFileTreeStyle { //TODO: We can specify which UI things can/cannot be changed.
} // For the sake of customizeability, I don't see why there should be restrictions at the moment.


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
