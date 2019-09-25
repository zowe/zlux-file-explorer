

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
import { FileService } from '../../services/file.service';
import { UtilsService } from '../../services/utils.service';
import { ProjectStructure, RecordFormat, DatasetOrganization, DatasetAttributes } from '../../structures/editor-project';
import { childEvent } from '../../structures/child-event';
//import { PersistentDataService } from '../../services/persistentData.service';
import { MvsDataObject } from '../../structures/persistantdata';
import { Angular2InjectionTokens, Angular2PluginWindowActions, ContextMenuItem } from 'pluginlib/inject-resources';
import { TreeNode } from 'primeng/primeng';
import { SearchHistoryService } from '../../services/searchHistoryService';

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
  providers: [FileService, /*PersistentDataService,*/ SearchHistoryService ]
})
export class FileBrowserMVSComponent implements OnInit, OnDestroy {//IFileBrowserMVS,
  //componentClass:ComponentClass;
  //fileSelected: Subject<FileBrowserFileSelectedEvent>;
  //capabilities:Array<Capability>;
  public hideExplorer: boolean;
  path: string;
  lastPath: string;
  rtClickDisplay: boolean;
  errorMessage: String;
  intervalId: any;
  updateInterval: number = 300000;
  //TODO:define interface types for mvs-data/data
  data: any;
  private dataMap: any;
  dsData: Observable<any>;
  isLoading: boolean;
  private rightClickPropertiesMap: any;

  constructor(private fileService: FileService, 
              private elementRef:ElementRef,
              private utils:UtilsService,
              // private persistentDataService: PersistentDataService,
              private mvsSearchHistory:SearchHistoryService,
              @Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger,
              @Optional() @Inject(Angular2InjectionTokens.WINDOW_ACTIONS) private windowActions: Angular2PluginWindowActions
             ) {
    //this.componentClass = ComponentClass.FileBrowser;
    //this.initalizeCapabilities();
    this.mvsSearchHistory.onInit('mvs');
    this.path = "";
    this.lastPath = "";
    this.rtClickDisplay = false;
    this.hideExplorer = false;
    this.isLoading = false;
    this.dataMap = {};
    this.rightClickPropertiesMap = {};
  }
  @Input() style: any;
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit() {
    this.intervalId = setInterval(() => {
      if(this.data){
        this.getTreeForQueryAsync(this.lastPath).then((response: any) => {
          let newData = response[0];
          //Only update if data sets are added/removed
          if(this.data.length != newData.length){
            this.dataMap = response[1];
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
    //TODO: Add Dataset properties
    this.rightClickPropertiesMap = [{text: "Properties", action:()=>{console.log('Properties activated!');}}];
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
    // TODO: Add right click properties menu to Datasets via Editor/Explorer interaction    
    console.log(`Node right click at ${event.clientX},${event.clientY}, off=${event.offsetX},${event.offsetY}, node=`,node);
  }

  onRightClick(event:any):void{
    let result = this.utils.getNameFromHTML(event.target, true);
    this.rtClickDisplay =!this.rtClickDisplay;
    //currently not supported and and *ngIf is currently blocking this pending dataSet api service injection
    setTimeout(function(){this.rtClickDisplay =!this.rtClickDisplay;  }, 5000)
    let isMember = !result.folder;
    let node;
    if (isMember) {
      console.log("resultname: " + result.name);
      let indexOfName = result.name.indexOf('(');
      console.log(indexOfName);
      let node = this.dataMap[result.name.substring(0, result.name.indexOf('('))];
      if (node) {
        node = this.dataMap[result.name];
        let nodeChildren = node.children;
        let memberName = result.name.substring(result.name.indexOf('(')+1, result.name.lastIndexOf(')'));
        for (let i = 0; i < nodeChildren.length; i++) {
          if (nodeChildren[i].label == memberName) {
            node = nodeChildren[i];
            break;
          }
        }
      } else {
        node = this.dataMap[result.name];
      }
    } else {
      node = this.dataMap[result.name];
    }
    let items = this.rightClickPropertiesMap;
    //[{text: result.name, action:()=>{console.log('wut');}}];
    // if (node) {
    //   items.push({text: node.data.datasetAttrs.recfm.recordLength, action:()=> {console.log('wut');}});
    // }
    if (this.windowActions) {
      this.windowActions.spawnContextMenu(event.clientX, event.clientY, items, true);
    }
    event.preventDefault();
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
      this.fileService.queryDatasets(path, true).pipe(take(1)).subscribe((res) => {
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
        //resolve([parents, parentMap]);
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
}




/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

