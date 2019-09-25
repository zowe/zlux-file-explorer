

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit,
  Output, ViewEncapsulation, Inject, Optional
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { UtilsService } from '../../services/utils.service';
import { UssCrudService } from '../../services/uss.crud.service';
// import { PersistentDataService } from '../../services/persistentData.service';
/*import { ComponentClass } from '../../../../../../zlux-platform/interface/src/registry/classes';
import { FileBrowserFileSelectedEvent, IFileBrowserUSS }
  from '../../../../../../zlux-platform/interface/src/registry/component-classes/file-browser';
import { Capability, FileBrowserCapabilities }
  from '../../../../../../zlux-platform/interface/src/registry/capabilities';*/
//Commented out to fix compilation errors from zlux-platform changes, does not affect program
//TODO: Implement new capabilities from zlux-platform
import { UssDataObject } from '../../structures/persistantdata';
import { TreeNode } from 'primeng/primeng';
import { Angular2InjectionTokens, Angular2PluginWindowActions, ContextMenuItem } from 'pluginlib/inject-resources';
import 'rxjs/add/operator/toPromise';
import { SearchHistoryService } from '../../services/searchHistoryService';

@Component({
  selector: 'file-browser-uss',
  templateUrl: './filebrowseruss.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./filebrowseruss.component.css'],
  providers: [UssCrudService, /*PersistentDataService,*/ SearchHistoryService]
})

export class FileBrowserUSSComponent implements OnInit, OnDestroy {//IFileBrowserUSS,
  //componentClass: ComponentClass;
  //fileSelected: Subject<FileBrowserFileSelectedEvent>;
  //capabilities: Array<Capability>;
  public hideExplorer: boolean;
  isFile: boolean;
  errorMessage: String;
  rtClickDisplay: boolean;
  addFileDisplay: boolean;
  addFolderDisplay: boolean;
  copyDisplay: boolean;
  renameDisplay: boolean;
  selectedItem: string;
  path: string;
  private _uneditedPath:string;
  root: string;
  newPath: string;
  popUpMenuX: number;
  popUpMenuY: number;
  rightClickedFile: TreeNode;
  isLoading: boolean;
  private rightClickPropertiesMap: any;

  //TODO:define interface types for uss-data/data
  data: TreeNode[];
  dataObject: UssDataObject;
  ussData: Observable<any>;
  intervalId: any;
  updateInterval: number = 10000;//time represents in ms how fast tree updates changes from mainframe

  constructor(private elementRef: ElementRef, 
              private ussSrv: UssCrudService,
              private utils: UtilsService, 
              /*private persistentDataService: PersistentDataService,*/
              @Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger,
              @Optional() @Inject(Angular2InjectionTokens.WINDOW_ACTIONS) private windowActions: Angular2PluginWindowActions) {
    //this.componentClass = ComponentClass.FileBrowser;
    this.initalizeCapabilities();
    this.ussSearchHistory.onInit('uss');
    this.rtClickDisplay = false;
    this.addFileDisplay = false;
    this.addFolderDisplay = false;
    this.copyDisplay = false;
    this.renameDisplay = false;
    this.root = ""; // Dev purposes: Replace with home directory to test Explorer functionalities
    this.path = this.root;
    this._uneditedPath = this.path;
    this.data = []; // Main treeData array (the nodes the Explorer displays)
    this.hideExplorer = false;
    this.isLoading = false;
    this.rightClickPropertiesMap = {};
  }

  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeRightClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFolderClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() copyClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() renameClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() propertiesClick: EventEmitter<any> = new EventEmitter<any>();

  @Input() inputStyle: any;
  @Input() searchStyle: any;
  @Input() treeStyle: any;
  @Input() style: any;
  @Input()
  set fileEdits(input: any) {
    if (input && input.action && input.action === "save-file") {
      //this.ussSrv.saveFile(input.fileName, input.data)
      this.ussSrv.saveFile(input.fileAddress, input.data)
      .subscribe(
        response =>{
          this.log.debug("No errors");
        },
        error => this.errorMessage = <any>error
      );
    }
  }

  ngOnInit() {
    this.loadUserHomeDirectory();
    this.initializeRightClickProperties();
    // this.persistentDataService.getData()
    //   .subscribe(data => {
    //     if (data.contents.ussInput) {
    //       this.path = data.contents.ussInput; }
    //     if (data.contents.ussData !== undefined)
    //     data.contents.ussData.length == 0 ? this.displayTree(this.path, false) : (this.data = data.contents.ussData, this.path = data.contents.ussInput)
    //     else
    //     this.displayTree(this.root, false);
    //   })
      // this.intervalId = setInterval(() => {
        this.updateUss(this.path);
      // }, this.updateInterval);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  browsePath(path: string): void {
    this.path = path;
  }

  getDOMElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  getSelectedPath(): string {
    //TODO:how do we want to want to handle caching vs message to app to open said path
    return this.path;
  }

  loadUserHomeDirectory(): void {
    this.isLoading = true;
    const observable: Observable<any> = this.ussSrv.getUserHomeFolder()
    const subscription: Subscription = observable.subscribe(
        resp => {
          if(resp && resp.home){
            this.path = resp.home.trim();
            this._uneditedPath = this.path;
            this.displayTree(this.path, true);
            this.isLoading = false;
          }
        },
        error => {
          this.isLoading = false;
          this.errorMessage = <any>error;
        }
      );
  }

  getDOMElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  getSelectedPath(): string {
    //TODO:how do we want to want to handle caching vs message to app to open said path
    return this._uneditedPath;
  }

  initalizeCapabilities() {
  //   //this.capabilities = new Array<Capability>();
  //   //this.capabilities.push(FileBrowserCapabilities.FileBrowser);
  //   //this.capabilities.push(FileBrowserCapabilities.FileBrowserUSS);
  }

  initializeRightClickProperties() {
    this.rightClickPropertiesMap = [{text: "Properties", action:()=>{this.showPropertiesDialog(this.rightClickedFile)}}];
  }

  showPropertiesDialog(rightClickedFile: TreeNode) {
    this.propertiesClick.emit(rightClickedFile);
  }

  onClick($event: any): void {
    this.rtClickDisplay = false;
  }

  onCopyClick($event: any): void {
    this.copyClick.emit($event);
  }

  onDeleteClick($event: any): void {
    this.deleteClick.emit($event);
  }

  onNewFileClick($event: any): void {
    this.newFileClick.emit($event);
  }

  onNewFolderClick($event: any): void {
    this.newFolderClick.emit($event);
  }
  
  onNodeClick($event: any): void {
    console.log(`node which?`,$event);
    this.rtClickDisplay = false;
    this.path = this.path.replace(/\/$/, '');
    this._uneditedPath = this.path;

    if ($event.node.data === 'Folder') {
      this.addChild($event.node.path, $event);
      this.nodeClick.emit($event.node);
    }
    else {
      this.nodeClick.emit($event.node);
    }
  }

  onNodeDblClick($event: any): void {
    let updateTree = false; // A double click drills into a folder, so we fetch fresh contents
    this.displayTree($event.node.path, updateTree);
  }

  onNodeRightClick(event:any) {
    let node = event.node;
    console.log(`Node right click at ${event.originalEvent.clientX},${event.originalEvent.clientY}, off=${event.originalEvent.offsetX},${event.originalEvent.offsetY}, node=`,node);
  
    if (this.windowActions) {
      this.windowActions.spawnContextMenu(event.originalEvent.clientX, event.originalEvent.clientY, this.rightClickPropertiesMap, true);
    }

    this.rtClickDisplay =!this.rtClickDisplay;
    //currently not supported and and *ngIf is currently blocking this pending dataSet api service injection
    setTimeout(function(){this.rtClickDisplay =!this.rtClickDisplay;  }, 5000)
    this.selectedItem = node.path;
    this.rightClickedFile = node;
    this.isFile = !node.directory;
    event.originalEvent.preventDefault(); 
  }

  onRenameClick($event: any): void {
    this.renameClick.emit($event);
  }

  sortFn(a: any, b: any) {
    if (a.directory !== b.directory) {
      if (a.directory === true) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  //Displays the starting file structure of 'path'. When update == true, tree will be updated
  //instead of reset to 'path' (meaning currently opened children don't get wiped/closed)
  private displayTree(path: string, update: boolean): void {
    this.pathChanged.emit(path);
    if (path === undefined || path == '') {
      path = this.root; 
    }
    this.isLoading = true;
    this.ussData = this.ussSrv.getFile(path); 
    this.ussData.subscribe(
    files => {
      files.entries.sort(this.sortFn);
      const tempChildren: TreeNode[] = [];
      for (let i: number = 0; i < files.entries.length; i++) {
        if (files.entries[i].directory) {
          files.entries[i].children = [];
          files.entries[i].data = "Folder";
          files.entries[i].collapsedIcon = "fa fa-folder";
          files.entries[i].expandedIcon = "fa fa-folder-open";
        }
        else {
          files.entries[i].items = {};
          files.entries[i].icon = "fa fa-file";
          files.entries[i].data = "File";
        }
        files.entries[i].label = files.entries[i].name;
        files.entries[i].id = i;
        tempChildren.push(files.entries[i]);
      }
      this.isLoading = false;
      if (update == true) {//Tree is displayed to update existing opened nodes, while maintaining currently opened trees 

        let indexArray: number[];
        let dataArray: TreeNode[];//represents the working TreeNode[] that will eventually be added to tempChildren and make up the tree
        let networkArray: TreeNode[];//represents the TreeNode[] obtained from the uss server, will iteratively replace dataArray as need be
        let parentNode: TreeNode;
        indexArray = [0];
        dataArray = this.data;
        networkArray = tempChildren;
        while (indexArray[indexArray.length-1] <= dataArray.length) 
        {
          //Go back up a layer
          if (indexArray[indexArray.length-1] == dataArray.length)
          {
            indexArray.pop();

            if (parentNode !== undefined && parentNode.parent !== undefined)
              {
                parentNode = parentNode.parent;
                dataArray = parentNode.children;
                networkArray = dataArray;
              }
              else{
                if (parentNode !== undefined)
                {
                  for (let i: number = 0; i < tempChildren.length; i++) {
                    if (parentNode.label == tempChildren[i].label || parentNode.children == tempChildren[i].children) {
                      tempChildren[i] = parentNode; break;
                    }
                  }
                }

                dataArray = this.data;
                networkArray = tempChildren;
              }
          }
          else if (dataArray[indexArray[indexArray.length-1]] !== undefined && dataArray[indexArray[indexArray.length-1]].data == 'Folder' && dataArray[indexArray[indexArray.length-1]].children !== undefined && dataArray[indexArray[indexArray.length-1]].children.length !== 0)
          {
            //... if the children of dataArray with index in last element of indexArray are not empty, drill into them!
            parentNode = dataArray[indexArray[indexArray.length-1]];
            dataArray = parentNode.children;
            networkArray = dataArray;
            indexArray[indexArray.length-1]++;
            indexArray.push(0);
          }
          else 
          {
              dataArray[indexArray[indexArray.length-1]] = networkArray[indexArray[indexArray.length-1]];
              indexArray[indexArray.length-1]++;//go up index to check new element in data array
          }
        }
      }

      this.log.debug("Tree has been updated.");
      this.log.debug(tempChildren);
      this.data = tempChildren;
      this.path = path;
      this._uneditedPath = path;

      // this.persistentDataService.getData()
      //       .subscribe(data => {
      //         this.dataObject = data.contents;
      //         this.dataObject.ussInput = this.path;
      //         this.dataObject.ussData = this.data;
      //         this.persistentDataService.setData(this.dataObject)
      //           .subscribe((res: any) => { });
      //       })
        },
        error => {
          this.isLoading = false;
          this.errorMessage = <any>error;
        }
      );

      this.refreshHistory(this.path);
    }

  private refreshHistory(path:string) {
    const sub = this.ussSearchHistory
                  .saveSearchHistory(path)
                  .subscribe(()=>{
                    if(sub) sub.unsubscribe();
                  });
}

  public sleep(milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
          break;
        }
      }
    }

  //Adds children to the existing this.data TreeNode array to update tree
  addChild(path: string, $event: any): void {
    if ($event.node.children && $event.node.children.length > 0) 
    {
      //If an opened node has children, and the user clicked on it...
      if ($event.node.expanded) {
        $event.node.expanded = false;
      }
      //If a closed node has children, and the user clicked on it...
      else {
        $event.node.expanded = true;
      }
    } 
    else //When the selected node has no children
    { 
      $event.node.expanded = true;
      this.ussData = this.ussSrv.getFile(path);
      let tempChildren: TreeNode[] = [];
      this.ussData.subscribe(
        files => {
          files.entries.sort(this.sortFn);
          //TODO: Could be turned into a util service...
          for (let i: number = 0; i < files.entries.length; i++) {
            if (files.entries[i].directory) {
              files.entries[i].children = [];
              files.entries[i].data = "Folder";
              files.entries[i].collapsedIcon = "fa fa-folder";
              files.entries[i].expandedIcon = "fa fa-folder-open";
            }
            else {
              files.entries[i].items = {};
              files.entries[i].icon = "fa fa-file";
              files.entries[i].data = "File";
            }
            files.entries[i].label = files.entries[i].name;
            files.entries[i].id = i;
            tempChildren.push(files.entries[i]);

          }
          $event.node.children = tempChildren;
          $event.node.expandedIcon = "fa fa-folder-open"; $event.node.collapsedIcon = "fa fa-folder";
          this.log.debug(path + " was populated with " + tempChildren.length + " children.");

          while ($event.node.parent !== undefined) {
            let newChild = $event.node.parent;
            newChild.children[$event.node.id] = $event.node;
            newChild.expanded = true;
            newChild.expandedIcon = "fa fa-folder-open"; newChild.collapsedIcon = "fa fa-folder";
            $event.node = newChild;
          }

          let index = -1;
          for (let i: number = 0; i < this.data.length; i++) {
            if (this.data[i].label == $event.node.label) {
              index = i; break;
            }
          }
          if (index != -1) {
            this.data[index] = $event.node;
            // this.persistentDataService.getData()
            //   .subscribe(data => {
            //     this.dataObject = data.contents;
            //     this.dataObject.ussInput = this.path;
            //     this.dataObject.ussData = this.data;
            //     this.persistentDataService.setData(this.dataObject)
            //       .subscribe((res: any) => { });
            //   })
            
          }
          else
            this.log.debug("failed to find index");
        }); 
    }
  }

  updateUss(path: string): void {
    this.displayTree(path, true);
  }

  addFile(): void {
    this.log.debug('add:' + this.selectedItem);
    this.ussSrv.saveFile(this.checkPath(this.newPath), '')
      .subscribe(
        resp => {
          this.updateUss(this.path);
          this.newPath = '';
        },
        error => this.errorMessage = <any>error
      );
  }

  addFolder(): void {
    this.log.debug('add:' + this.selectedItem);
    this.ussSrv.addFolder(this.checkPath(this.newPath))
      .subscribe(
        resp => {
          this.updateUss(this.path);
          this.newPath = '';
        },
        error => this.errorMessage = <any>error
      );
  }

  copy(): void {
    this.log.debug('copy:' + this.selectedItem);
    this.ussSrv.copyFile(this.selectedItem, this.checkPath(this.newPath))
      .subscribe(
        resp => {
          this.updateUss(this.path);
        },
        error => this.errorMessage = <any>error
      );
  }

  rename(): void {
    this.log.debug('rename:' + this.selectedItem);
    this.ussSrv.renameFile(this.selectedItem, this.checkPath(this.newPath))
      .subscribe(
        resp => {
          this.updateUss(this.path);
        },
        error => this.errorMessage = <any>error
      );
  }

  delete(e: EventTarget): void {
    this.log.debug('delete:' + this.selectedItem);
    this.ussSrv.deleteFile(this.selectedItem)
      .subscribe(
        resp => {
          this.updateUss(this.path);
        },
        error => this.errorMessage = <any>error
      );
  }

  deleteFile(pathAndName: string): void {
    this.ussSrv.deleteFile(pathAndName)
    .subscribe(
      resp => {
        this.updateUss(this.path);
      },
      error => this.errorMessage = <any>error
    );
  }
  levelUp(): void {
    //TODO: may want to change this to 'root' depending on mainframe file access security
    //to prevent people from accessing files/folders outside their root dir
    if (this.path !== "/" && this.path !== '') 
    {
      this.path = this.path.replace(/\/$/, '').replace(/\/[^\/]+$/, '');
      if (this.path === '' || this.path == '/') {
        this.path = '/';
      }
      this._uneditedPath = this.path;

      let parentindex = this.path.length - 1;
      while (this.path.charAt(parentindex) != '/') { parentindex--; }
      let parent = this.path.slice(parentindex + 1, this.path.length);
      this.log.debug("Going up to: " + parent);

      this.displayTree(this.path, false);
    } else
      this.updateUss(this.path);
  }
  addFileDialog() {
    this.addFileDisplay = true;
  }
  addFolderDialog() {
    this.addFolderDisplay = true;
  }
  copyDialog() {
    this.copyDisplay = true;
  }
  renameDialog() {
    this.renameDisplay = true;
  }
  private checkPath(input: string): string {
    return this.utils.filePathEndCheck(this.path) + input;
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

