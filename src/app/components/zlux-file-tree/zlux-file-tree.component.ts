

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
  EventEmitter, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContextMenuModule, TreeModule, MenuModule, DialogModule } from 'primeng/primeng';
import { TreeComponent } from '../tree/tree.component';
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
import { CreateFileModal } from '../create-file-modal/create-file-modal.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatasetPropertiesModal } from '../dataset-properties-modal/dataset-properties-modal.component';
import { FilePermissionsModal } from '../file-permissions-modal/file-permissions-modal.component';
import { FileOwnershipModal } from '../file-ownership-modal/file-ownership-modal.component';
import { FileTaggingModal } from '../file-tagging-modal/file-tagging-modal.component';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { UploadModal } from '../upload-files-modal/upload-files-modal.component';
import { CreateDatasetModal } from '../create-dataset-modal/create-dataset-modal.component'

/* Services */
import { UploaderService } from '../../services/uploader.service';
import { DownloaderService } from '../../services/downloader.service';
import { UtilsService } from '../../services/utils.service';
import { KeyCode } from '../../services/keybinding.service';
import { KeybindingService } from '../../services/keybinding.service';
import { ɵAnimationGroupPlayer } from '@angular/animations';

@Component({
  selector: 'zlux-file-tree',
  templateUrl: './zlux-file-tree.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./zlux-file-tree.component.css'],
  providers: [UtilsService/*, PersistentDataService*/]
})

export class ZluxFileTreeComponent implements OnInit, OnDestroy {
  //componentClass: ComponentClass;
  private currentIndex: number;
  private tabs: Array<tab>;
  private showUpArrow: boolean;
  private keyBindingSub: Subscription = new Subscription();

  @ViewChild(FileBrowserUSSComponent)
  private ussComponent: FileBrowserUSSComponent;

  @ViewChild(FileBrowserMVSComponent)
  private mvsComponent: FileBrowserMVSComponent;

  @ViewChild('fileExplorerGlobal', { static: true })
  fileExplorerGlobal: ElementRef<any>;

  constructor(/*private persistentDataService: PersistentDataService,*/
    private utils: UtilsService, 
    private elemRef: ElementRef,
    private cd: ChangeDetectorRef,
    private appKeyboard: KeybindingService)
  {
    //this.componentClass = ComponentClass.FileBrowser;
    this.currentIndex = 0;
    this.tabs = [{ index: 0, name: "USS" }, { index: 1, name: "Datasets" }];
    this.showUpArrow = true;
  }

  @Input() set spawnModal(typeAndData:any) {
    if (typeAndData == undefined) {
      return;
    }
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
    } else if (type == 'requestUpload' && !isDataset) {
      this.ussComponent.showUploadDialog(data);
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
  @Output() fileUploaded: EventEmitter<any> = new EventEmitter<any>();
  // @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() copyClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() ussRenameEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() datasetSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() ussSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() dataChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() rightClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() openInNewTab: EventEmitter<any> = new EventEmitter<any>();

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
    const fileExplorerGlobalElement = this.fileExplorerGlobal.nativeElement;
    this.appKeyboard.registerKeyUpEvent(fileExplorerGlobalElement);
    this.appKeyboard.registerKeyDownEvent(fileExplorerGlobalElement); 
    this.keyBindingSub.add(this.appKeyboard.keydownEvent
      .subscribe((event) => {
        if (event.which === KeyCode.KEY_P && !event.ctrlKey) {
          this.toggleSearch();
        }
    }));
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

  toggleSearch() {
    if (this.currentIndex == 0) {
      this.ussComponent.toggleSearch();
    } else {
      this.mvsComponent.toggleSearch();
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

  // onNewFileClick($event:any){
  //   this.newFileClick.emit($event);
  // }

  onNewFolderClick($event:any){
    this.newFolderClick.emit($event);
  }

  onFileUploaded($event:any){
    this.fileUploaded.emit($event);
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

  onDataChanged($event: any): void {
    this.dataChanged.emit($event);
  }

  onRightClick($event: any) {
    this.rightClick.emit($event);
  }

  onOpenInNewTab($event:any){
    this.openInNewTab.emit($event);
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

  spawnUploadModal() {
    if (this.ussComponent) {
      this.ussComponent.showUploadDialog(null);
    } else {
      // ... Disabled for DS mode for now
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

  refreshFileMetadatdaByPath(path: string) {
    return this.ussComponent.refreshFileMetadatdaUsingPath(path);
   }

  zluxOnMessage(eventContext: any): Promise<void> {
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
    CreateFileModal,
    UploadModal,
    TreeComponent,
    CreateDatasetModal],
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
    MatSelectModule,
    MatAutocompleteModule,
    ZluxTabbingModule,
    MatSlideToggleModule,
    InputTextModule,
    ReactiveFormsModule
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
    CreateFileModal,
    UploadModal,
    CreateDatasetModal
  ],
  providers: [
    KeybindingService,
    UploaderService,
    DownloaderService
  ]
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
