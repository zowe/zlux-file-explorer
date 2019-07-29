

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


import { Component, ElementRef, OnInit, ViewEncapsulation, OnDestroy, Input, EventEmitter, Output, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operators';
//import {ComponentClass} from '../../../../../../zlux-platform/interface/src/registry/classes';
import { FileService } from '../../services/file.service';
import { ProjectStructure, RecordFormat, DatasetOrganization, DatasetAttributes } from '../../structures/editor-project';
import { childEvent } from '../../structures/child-event';
import { PersistentDataService } from '../../services/persistentData.service';
import { MvsDataObject } from '../../structures/persistantdata';
import { Angular2InjectionTokens } from 'pluginlib/inject-resources';
import { TreeNode } from 'primeng/primeng';

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
  providers: [FileService, PersistentDataService]
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
  timeVar: number = 15000;
  updateInterval: number = 300000;
  //TODO:define interface types for mvs-data/data
  data: any;
  dsData: Observable<any>;

  constructor(private fileService: FileService, 
    private elementRef:ElementRef, 
    private persistentDataService: PersistentDataService,
    @Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger) {
    //this.componentClass = ComponentClass.FileBrowser;
    //this.initalizeCapabilities();
    this.path = "";
    this.lastPath = "";
    this.rtClickDisplay = false;
    this.hideExplorer = false;
  }
  @Input() inputStyle: any;
  @Input() searchStyle: any;
  @Input() treeStyle: any;
  @Input() style: any;
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit() {
    this.intervalId = setInterval(() => {
      if(this.data){
        this.getTreeForQueryAsync(this.lastPath).then((res: TreeNode[]) => {
          let newData = res;
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

  onRightClick($event:any):void{
      this.log.debug('right click!')
      this.rtClickDisplay =!this.rtClickDisplay;
      //currently not supported and and *ngIf is currently blocking this pending dataSet api service injection
      this.log.debug('right click CRUD menu not supported for Datasets, yet (MVD-1614)!')
      setTimeout(function(){this.rtClickDisplay =!this.rtClickDisplay;  }, 5000)
  }

  populateDatasetAttrs(queryRes: DatasetAttributes): DatasetAttributes{
    let datasetAttrs: DatasetAttributes = {
      csiEntryType: queryRes.csiEntryType,
      name: queryRes.name,
    };
    if(!!queryRes.members){
      datasetAttrs.members = queryRes.members;
    }
    if(!!queryRes.volser){
      datasetAttrs.volser = queryRes.volser;
    }
    if(!!queryRes.dsorg){
      datasetAttrs.dsorg = (queryRes.dsorg as DatasetOrganization);
    }
    if(!!queryRes.recfm){
      datasetAttrs.recfm = (queryRes.recfm as RecordFormat);
    }
    return datasetAttrs;
  }

  updateTreeView(path: string): void {
    this.getTreeForQueryAsync(path).then((res) => {
      this.data = res;
    });
  }

  getTreeForQueryAsync(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fileService.queryDatasets(path, true).pipe(take(1)).subscribe((res) => {
        let parents: TreeNode[] = [];
        this.lastPath = path;
        if(res.datasets.length > 0){
          for(let i:number = 0; i < res.datasets.length; i++){
            let currentNode:TreeNode = {};
            currentNode.children = [];
            currentNode.label = res.datasets[i].name.replace(/^\s+|\s+$/, '');
            //data.id attribute is not used by either parent or child, but required as part of the ProjectStructure interface
            let currentNodeData: ProjectStructure = {
              id: String(i),
              name: currentNode.label,
              fileName: currentNode.label,
              path: currentNode.label,
              hasChildren: false,
              isDataset: true,
              datasetAttrs: this.populateDatasetAttrs((res.datasets[i] as DatasetAttributes))
            };
            currentNode.data = currentNodeData;
            let migrated: boolean = (currentNode.data.datasetAttrs.volser
              && (currentNode.data.datasetAttrs.volser == 'MIGRAT'
              || currentNode.data.datasetAttrs.volser == 'ARCIVE'));
            if(currentNode.data.datasetAttrs.dsorg
                && currentNode.data.datasetAttrs.dsorg.organization === 'partitioned'){
              if(migrated) currentNode.styleClass = 'ui-treenode-label-italic';
              currentNode.type = 'folder';
              currentNode.expanded = false;
              currentNode.expandedIcon = 'fa fa-folder-open';
              currentNode.collapsedIcon = 'fa fa-folder';
              if(res.datasets[i].members){
                currentNode.data.hasChildren = true;
                this.addChildren(currentNode, res.datasets[i].members);
              }
            } else {
              if(migrated) currentNode.styleClass = 'ui-treenode-label-italic';
              currentNode.type = 'file';
              currentNode.icon = 'fa fa-file';
            }
            parents.push(currentNode);
          }
        } else {
          //data set probably doesnt exist
        }
        resolve(parents);
      }, (err) => {
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
      }
      childNodeData.path = childNodeData.fileName = `${parentNode.label}(${childNode.label})`;
      childNode.data = (childNodeData as ProjectStructure);
      parentNode.children.push(childNode);
    }
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

