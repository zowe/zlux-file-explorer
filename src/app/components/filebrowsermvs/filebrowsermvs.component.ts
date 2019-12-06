

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


import { Component, ElementRef, OnInit, ViewEncapsulation, OnDestroy, Input, EventEmitter, Output, Inject, Optional } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operators';
//import {ComponentClass} from '../../../../../../zlux-platform/interface/src/registry/classes';
import { UtilsService } from '../../services/utils.service';
import { ProjectStructure, RecordFormat, DatasetOrganization, DatasetAttributes } from '../../structures/editor-project';
import { childEvent } from '../../structures/child-event';
//import { PersistentDataService } from '../../services/persistentData.service';
import { MvsDataObject } from '../../structures/persistantdata';
import { Angular2InjectionTokens, Angular2PluginWindowActions, ContextMenuItem } from 'pluginlib/inject-resources';
import { TreeNode } from 'primeng/primeng';
import { SearchHistoryService } from '../../services/searchHistoryService';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { DatasetPropertiesModal } from '@zlux/file-explorer/src/app/components/dataset-properties-modal/dataset-properties-modal.component';
import { DeleteFileModal } from '../delete-file-modal/delete-file-modal.component';
import { DatasetCrudService } from '../../services/dataset.crud.service';

/*import {FileBrowserFileSelectedEvent,
  IFileBrowserMVS
} from '../../../../../../zlux-platform/interface/src/registry/component-classes/file-browser';
import {Capability, FileBrowserCapabilities} from '../../../../../../zlux-platform/interface/src/registry/capabilities';
*/
//Commented out to fix compilation errors from zlux-platform changes, does not affect program
//TODO: Implement new capabilities from zlux-platform
@Component({
  selector: 'file-browser-mvs',
  templateUrl: './filebrowsermvs.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./filebrowsermvs.component.css'],
  providers: [DatasetCrudService, /*PersistentDataService,*/ SearchHistoryService ]
})
export class FileBrowserMVSComponent implements OnInit, OnDestroy {//IFileBrowserMVS,
  //componentClass:ComponentClass;
  //fileSelected: Subject<FileBrowserFileSelectedEvent>;
  //capabilities:Array<Capability>;
  public hideExplorer: boolean;
  private path: string;
  private lastPath: string;
  private errorMessage: String;
  private intervalId: any;
  private updateInterval: number = 300000;
  //TODO:define interface types for mvs-data/data
  private data: any;
  public isLoading: boolean;
  private rightClickedFile: any;
  private rightClickPropertiesDataset: ContextMenuItem[];
  private deletionQueue = new Map();

  constructor(private elementRef:ElementRef,
              private utils:UtilsService,
              // private persistentDataService: PersistentDataService,
              private mvsSearchHistory:SearchHistoryService,
              private snackBar: MatSnackBar,
              private datasetService: DatasetCrudService,
              @Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger,
              @Optional() @Inject(Angular2InjectionTokens.WINDOW_ACTIONS) private windowActions: Angular2PluginWindowActions,
              private dialog: MatDialog
             ) {
    //this.componentClass = ComponentClass.FileBrowser;
    //this.initalizeCapabilities();
    this.mvsSearchHistory.onInit('mvs');
    this.path = "";
    this.lastPath = "";
    this.hideExplorer = false;
    this.isLoading = false;
  }
  @Input() style: any;
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() rightClick: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit() {
    this.intervalId = setInterval(() => {
      if(this.data){
        this.getTreeForQueryAsync(this.lastPath).then((response: any) => {
          let newData = response[0];
          //Only update if data sets are added/removed
          if(this.data.length != newData.length){
            let expandedFolders = this.data.filter(dataObj => dataObj.expanded);
            //checks if the query response contains the same PDS' that are currently expanded
            let newDataHasExpanded = newData.filter(dataObj => expandedFolders.some(expanded => expanded.label === dataObj.label));
            //Keep currently expanded datasets expanded after update
            if(newDataHasExpanded.length > 0){
              let expandedNewData = newData.map((obj) => {
                let retObj = {};
                newDataHasExpanded.forEach((expandedObj) => {
                  if(obj.label == expandedObj.label){
                    obj.expanded = true;
                  }
                  retObj = obj;
                })
                return retObj;
              })
              this.data = expandedNewData;
            } else {
              this.data = newData;
            }
          }
        });
      }
    }, this.updateInterval);
    this.initializeRightClickProperties();
  }

  ngOnDestroy(){
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /*initalizeCapabilities(){
    this.capabilities = new Array<Capability>();
    this.capabilities.push(FileBrowserCapabilities.FileBrowser);
    this.capabilities.push(FileBrowserCapabilities.FileBrowserMVS);
  }*/

  initializeRightClickProperties() {
    this.rightClickPropertiesDataset = [
      { text: "Properties", action:() => { 
        this.showPropertiesDialog(this.rightClickedFile) }},
      { text: "Delete", action:() => { 
        this.showDeleteDialog(this.rightClickedFile); }
      }
    ];
  }
  showDeleteDialog(rightClickedFile: any) {
    if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.data.path, "This is already being deleted.") == true) {
      return;
    }

    const fileDeleteConfig = new MatDialogConfig();
    fileDeleteConfig.data = {
      event: rightClickedFile,
      width: '600px'
    }

    let fileDeleteRef = this.dialog.open(DeleteFileModal, fileDeleteConfig);
    const deleteFileOrFolder = fileDeleteRef.componentInstance.onDelete.subscribe(() => {
      let vsamCSITypes = ['R', 'D', 'G', 'I', 'C'];
      if (vsamCSITypes.indexOf(rightClickedFile.data.datasetAttrs.csiEntryType) != -1) {
        this.deleteVsamDataset(rightClickedFile);
      } else {
        this.deleteNonVsamDataset(rightClickedFile);
      }
    });
  }

  deleteNonVsamDataset(rightClickedFile: any): void {
    this.isLoading = true;
    this.deletionQueue.set(rightClickedFile.data.path, rightClickedFile);
    rightClickedFile.styleClass = "filebrowsermvs-node-deleting";
    let deleteSubscription = this.datasetService.deleteNonVsamDatasetOrMember(rightClickedFile)
    .subscribe(
      resp => {
        this.isLoading = false;
        this.snackBar.open(resp.msg,
        'Dismiss', { duration: 5000,   panelClass: 'center' });
        this.removeChild(rightClickedFile);
        this.deletionQueue.delete(rightClickedFile.data.path);
        rightClickedFile.styleClass = "";
      },
      error => {
        if (error.status == '500') { //Internal Server Error
          this.snackBar.open("Failed to delete: '" + rightClickedFile.data.path + "' This is probably due to a server agent problem.",
          'Dismiss', { duration: 5000,   panelClass: 'center' });
        } else if (error.status == '404') { //Not Found
          this.snackBar.open(rightClickedFile.data.path + ' has already been deleted or does not exist.', 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
          this.removeChild(rightClickedFile);
        } else if (error.status == '400') { //Bad Request
          this.snackBar.open("Failed to delete '" + rightClickedFile.data.path + "' This is probably due to a permission problem.",
          'Dismiss', { duration: 5000,   panelClass: 'center' });
        } else { //Unknown
          this.snackBar.open("Uknown error '" + error.status + "' occured for: " + rightClickedFile.data.path, 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
          // Error info gets printed in uss.crud.service.ts
        }
        this.deletionQueue.delete(rightClickedFile.data.path);
        this.isLoading = false;
        rightClickedFile.styleClass = "";
        this.errorMessage = <any>error;
      }
    );

    setTimeout(() => {
      if (deleteSubscription.closed == false) {
        this.snackBar.open('Deleting ' + rightClickedFile.data.path + '... Larger payloads may take longer. Please be patient.', 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
      }
    }, 4000);
  }

  deleteVsamDataset(rightClickedFile: any): void {
    this.isLoading = true;
    this.deletionQueue.set(rightClickedFile.data.path, rightClickedFile);
    rightClickedFile.styleClass = "filebrowsermvs-node-deleting";
    let deleteSubscription = this.datasetService.deleteVsamDataset(rightClickedFile)
    .subscribe(
      resp => {
        this.isLoading = false;
        this.snackBar.open(resp.msg,
        'Dismiss', { duration: 5000,   panelClass: 'center' });
        //Update vs removing node since symbolicly linked data/index of vsam can be named anything
        this.updateTreeView(this.path);
        this.deletionQueue.delete(rightClickedFile.data.path);
        rightClickedFile.styleClass = "";
      },
      error => {
        if (error.status == '500') { //Internal Server Error
          this.snackBar.open("Failed to delete: '" + rightClickedFile.data.path + "' This is probably due to a server agent problem.",
          'Dismiss', { duration: 5000,   panelClass: 'center' });
        } else if (error.status == '404') { //Not Found
          this.snackBar.open(rightClickedFile.data.path + ' has already been deleted or does not exist.', 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
          this.updateTreeView(this.path);
        } else if (error.status == '400') { //Bad Request
          this.snackBar.open("Failed to delete '" + rightClickedFile.data.path + "' This is probably due to a permission problem.",
          'Dismiss', { duration: 5000,   panelClass: 'center' });
        } else { //Unknown
          this.snackBar.open("Uknown error '" + error.status + "' occured for: " + rightClickedFile.data.path, 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
          //Error info gets printed in uss.crud.service.ts
        }
        this.deletionQueue.delete(rightClickedFile.data.path);
        this.isLoading = false;
        rightClickedFile.styleClass = "";
        this.errorMessage = <any>error;
      }
    );

    setTimeout(() => {
      if (deleteSubscription.closed == false) {
        this.snackBar.open('Deleting ' + rightClickedFile.data.path + '... Larger payloads may take longer. Please be patient.', 
          'Dismiss', { duration: 5000,   panelClass: 'center' });
      }
    }, 4000);
  }

  removeChild(node: any) {
    let nodes = this.data;
    if (node.parent) {
      let parent = node.parent;
      let index = parent.children.indexOf(node);
      if (index == -1) {
        return;
      } else {
        parent.children.splice(index, 1);
        nodes[nodes.indexOf(node.parent)] = parent;
        this.data = nodes;
      }
    } else {
      let index = nodes.indexOf(node);
      if (index == -1) {
        return;
      } else {
        nodes.splice(nodes.indexOf(node), 1);
        this.data = nodes;
      }
    }
  }

  showPropertiesDialog(rightClickedFile: any) {
    const filePropConfig = new MatDialogConfig();
    filePropConfig.data = {
      event: rightClickedFile,
      width: 'fit-content',
      maxWidth: '1100px',
      height: '475px'
    }

    this.dialog.open(DatasetPropertiesModal, filePropConfig);
  }

  browsePath(path: string): void{
    this.path = path;
  }

  getDOMElement(): HTMLElement{
    return this.elementRef.nativeElement;
  }

  getSelectedPath(): string{
    //TODO:how do we want to want to handle caching vs message to app to open said path
    return this.path;
  }

  onNodeClick($event: any): void{
    if($event.node.type == 'folder'){
      $event.node.expanded = !$event.node.expanded;
    }
    this.nodeClick.emit($event.node);
  }
    
  onNodeDblClick($event: any): void{
    if($event.node.data.hasChildren && $event.node.children.length > 0){
      this.path = $event.node.data.path;
      this.getTreeForQueryAsync($event.node.data.path).then((res) => {
        this.data = res[0].children;
      });
    }
  }

  onNodeRightClick(event:any) {
    let node = event.node;
    let rightClickProperties = this.rightClickPropertiesDataset;

    if (this.windowActions) {
      let didContextMenuSpawn = this.windowActions.spawnContextMenu(event.originalEvent.clientX, event.originalEvent.clientY, rightClickProperties, true);
      // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
      if (!didContextMenuSpawn) { // If context menu failed to spawn...
        let heightAdjustment = event.originalEvent.clientY - 25; // Bump it up 25px
        didContextMenuSpawn = this.windowActions.spawnContextMenu(event.originalEvent.clientX, heightAdjustment, rightClickProperties, true);
      }
    }

    this.rightClickedFile = node;
    this.rightClick.emit(event.node);
    event.originalEvent.preventDefault(); 
  }

  updateTreeView(path: string): void {
    this.getTreeForQueryAsync(path).then((res) => {
      this.data = res;
    });
    
    this.refreshHistory(path);
  }

  getTreeForQueryAsync(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.datasetService.queryDatasets(path, true).pipe(take(1)).subscribe((res) => {
        let parents: TreeNode[] = [];
        let parentMap = {};
        this.lastPath = path;
        if(res.datasets.length > 0){
          for(let i:number = 0; i < res.datasets.length; i++){
            let currentNode:TreeNode = {};
            currentNode.children = [];
            currentNode.label = res.datasets[i].name.replace(/^\s+|\s+$/, '');
            //data.id attribute is not used by either parent or child, but required as part of the ProjectStructure interface
            let resAttr = res.datasets[i];
            let currentNodeData: ProjectStructure = {
              id: String(i),
              name: currentNode.label,
              fileName: currentNode.label,
              path: currentNode.label,
              hasChildren: false,
              isDataset: true,
              datasetAttrs: ({
                csiEntryType: resAttr.csiEntryType,
                dsorg: resAttr.dsorg,
                recfm: resAttr.recfm,
                volser: resAttr.volser
              } as DatasetAttributes)
            };
            currentNode.data = currentNodeData;
            let migrated: boolean = (currentNode.data.datasetAttrs.volser
              && (currentNode.data.datasetAttrs.volser == 'MIGRAT'
              || currentNode.data.datasetAttrs.volser == 'ARCIVE'));
            if(currentNode.data.datasetAttrs.dsorg
                && currentNode.data.datasetAttrs.dsorg.organization === 'partitioned'){
              currentNode.type = 'folder';
              currentNode.expanded = false;
              if(migrated){
                currentNode.icon = 'fa fa-clock-o';
              } else {
                currentNode.expandedIcon = 'fa fa-folder-open';
                currentNode.collapsedIcon = 'fa fa-folder';
              }
              if(res.datasets[i].members){
                currentNode.data.hasChildren = true;
                this.addChildren(currentNode, res.datasets[i].members);
              }
            } else {
              currentNode.icon = (migrated) ? 'fa fa-clock-o' : 'fa fa-file';
              currentNode.type = 'file';
            }
            parents.push(currentNode);
            parentMap[currentNode.label] = currentNode;
          }
          this.isLoading = false;
        } else {
          //data set probably doesnt exist
          this.isLoading = false;
        }
        resolve(parents);
      }, (err) => {
        this.isLoading = false;
        reject(err);
      })
    })
  }

  addChildren(parentNode: TreeNode, members: Array<any>): void{
    for(let i: number = 0; i < members.length; i++){
      let childNode: TreeNode = {};
      childNode.type = 'file';
      childNode.icon = 'fa fa-file';
      childNode.label = members[i].name.replace(/^\s+|\s+$/, '');
      childNode.parent = parentNode;
      let childNodeData: ProjectStructure = {
        id: parentNode.data.id,
        name: childNode.label,
        hasChildren: false,
        isDataset: true,
        datasetAttrs: parentNode.data.datasetAttrs
      }
      childNodeData.path = childNodeData.fileName = `${parentNode.label}(${childNode.label})`;
      childNode.data = (childNodeData as ProjectStructure);
      parentNode.children.push(childNode);
    }
  }

  refreshHistory(path:string) {
    const sub = this.mvsSearchHistory
                  .saveSearchHistory(path)
                  .subscribe(()=>{
                    if(sub) sub.unsubscribe();
                  });
  }

/**
* [levelUp: function to ascend up a level in the file/folder tree]
* @param index [tree index where the 'folder' parent is accessed]
*/
  levelUp(): void{
    if(!this.path.includes('.')){
      this.path = '';
    }
    let regex = new RegExp(/\.[^\.]+$/);
    if(this.path.substr(this.path.length - 2, 2) == '.*'){
      this.path = this.path.replace(regex, '').replace(regex, '.*');
    } else {
      this.path = this.path.replace(regex, '.*')
    }
    this.updateTreeView(this.path);
  }

  checkIfInDeletionQueueAndMessage(pathAndName: string, message: string): boolean {
    if (this.deletionQueue.has(pathAndName)) {
      this.snackBar.open('Deletion in progress: ' + pathAndName + "' " + message, 
            'Dismiss', { duration: 5000, panelClass: 'center' });
      return true;
    } 
    return false;
  }
}




/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

