

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
import { TreeModule, MenuItem, MenuModule, DialogModule } from 'primeng/primeng';
import { TreeComponent } from '../../components/tree/tree.component';
import { UtilsService } from '../../services/utils.service';
import { FileService } from '../../services/file.service';
import { MvsDataObject, UssDataObject } from '../../structures/persistantdata';
import { TreeNode } from 'primeng/primeng';
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

const DEFAULT_TREE_INNER_WIDTH = 315;
const SLIDER_WIDTH = 10;
const FILE_INDEX = 0;
const DATASET_INDEX = 1;

@Component({
  selector: 'zlux-file-explorer',
  templateUrl: './zlux-file-explorer.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./zlux-file-explorer.component.css'],
  providers: [FileService, UtilsService/*, PersistentDataService*/]
})

export class ZluxFileExplorerComponent implements OnInit, OnDestroy {
  //componentClass: ComponentClass;
  selectedItem: string;
  currentIndex: number;
  tabs: Array<tab>;

  @ViewChild(FileBrowserUSSComponent)
  private ussComponent: FileBrowserUSSComponent;

  @ViewChild(FileBrowserMVSComponent)
  private mvsComponent: FileBrowserMVSComponent;

  @ViewChild('slider')
  private sliderRef: ElementRef;
  
  private resizeTimer: any;

  constructor(private fileService: FileService,
    /*private persistentDataService: PersistentDataService,*/
    private utils: UtilsService, private elemRef: ElementRef,
    private cd: ChangeDetectorRef)
  {
    //this.componentClass = ComponentClass.FileBrowser;
    this.currentIndex = 0;
    this.tabs = [{ index: 0, name: "USS" }, { index: 1, name: "Datasets (Beta)" }];

  }

  @Input() selectPath: string;
  @Input() style: ZluxFileExplorerStyle = {};
  @Input() showSlider: boolean = true;
  @Output() fileOutput: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFolderClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() copyClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() datasetSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() ussSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() resized: EventEmitter<number> = new EventEmitter<number>();

  public menuHidden: boolean = false;
  public treeWidth: any = {"width": DEFAULT_TREE_INNER_WIDTH+'px'};
  public dragging: boolean = false;
  private lastX: number = 0;
  private currentTreeWidth: number = DEFAULT_TREE_INNER_WIDTH;
  private lastTreeWidth: number = DEFAULT_TREE_INNER_WIDTH;
  
  ngOnInit() {
    // var obj = {
    //   "ussInput": "",
    //   "mvsInput": "",
    //   "ussData": [],
    //   "mvsData": []
    // }
    // this.persistentDataService.setData(obj)
    //   .subscribe((res: any) => { });
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

  deleteFile(pathAndName: string) {
    this.ussComponent.deleteFile(pathAndName);
  }

  hideExplorers() {
    if (this.ussComponent) {
      this.ussComponent.hideExplorer = true;
    }
    if (this.mvsComponent) {
      this.mvsComponent.hideExplorer = true;
    }
  }

  onCopyClick($event:any){
    this.copyClick.emit($event);
  }

  onDeleteClick($event:any){
    this.deleteClick.emit($event);
  }

  onNewFileClick($event:any){
    this.newFileClick.emit($event);
  }

  onNewFolderClick($event:any){
    this.newFolderClick.emit($event);
  }

  onNodeClick($event:any){
    //console.log($event);
    this.nodeClick.emit($event);
  }

  onPathChanged($event: any) {
    this.pathChanged.emit($event);
  }

  // onUssFileLoad($event:FileContents){
  //   this.fileOutput.emit($event);
  // }

  startDrag(event: any) {
    this.lastX = event.clientX;
    this.sliderRef.nativeElement.onpointermove = (event)=> {this.drag(event)};
    if (this.sliderRef.nativeElement.setPointerCapture) {//safari??
      try {
        this.sliderRef.nativeElement.setPointerCapture(event.pointerId);
      } catch (e) {
        //ignore
      }
    }
    this.dragging = true;
  }
  
  stopDrag(event: any) {
    this.sliderRef.nativeElement.onpointermove = null;
    if (this.sliderRef.nativeElement.releasePointerCapture) {//safari??
      try {
        this.sliderRef.nativeElement.releasePointerCapture(event.pointerId);
      } catch (e) {
        //ignore
      }
    }
    this.dragging = false;
  }
  
  drag(event: any) {
    if (this.dragging) {
      let diff = this.lastX-event.clientX;
      this.currentTreeWidth = this.currentTreeWidth - diff;
      this.lastX = event.clientX;
      this.treeWidth.width = this.currentTreeWidth+'px';
      this.scheduleResizeEvent();
    }
  }

  toggleHide() {
    this.menuHidden = !this.menuHidden;
    if (this.menuHidden) {
      this.lastTreeWidth = this.currentTreeWidth;
      this.currentTreeWidth = 0;
      this.treeWidth.width='0px';
    } else {
      this.currentTreeWidth = this.lastTreeWidth;
      this.treeWidth.width = this.lastTreeWidth+'px';
    }
    this.scheduleResizeEvent();
  }

  private scheduleResizeEvent() {
    if (!this.resizeTimer) {
      this.resizeTimer = setTimeout(()=> {
        this.resized.emit(this.currentTreeWidth+SLIDER_WIDTH);
        this.resizeTimer = undefined;
      },10);
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

  getNodesInFocus(): TreeNode[] {
    if (this.currentIndex == FILE_INDEX) {
      return this.ussComponent.getAllInDirectory().map(x => x.data);
    } else {
      return this.mvsComponent.getAllInDirectory().map(x => x.data);
    }
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
  declarations: [FileBrowserMVSComponent, FileBrowserUSSComponent, ZluxFileExplorerComponent, TreeComponent],
  imports: [CommonModule, FormsModule, TreeModule, MenuModule, DialogModule],
  exports: [ZluxFileExplorerComponent],
  entryComponents: [ZluxFileExplorerComponent]
})
export class ZluxFileExplorerModule { }

export interface ZluxFileExplorerStyle { //TODO: We can specify which UI things can/cannot be changed.
} // For the sake of customizeability, I don't see why there should be restrictions at the moment.


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

