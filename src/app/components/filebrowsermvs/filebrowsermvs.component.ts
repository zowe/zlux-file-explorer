

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
// import { PersistentDataService } from '../../services/persistentData.service';
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
  providers: [FileService/*, PersistentDataService*/]
})
export class FileBrowserMVSComponent implements OnInit, OnDestroy {//IFileBrowserMVS,
  //componentClass:ComponentClass;
  //fileSelected: Subject<FileBrowserFileSelectedEvent>;
  //capabilities:Array<Capability>;
  public hideExplorer: boolean;
  path: string;
  rtClickDisplay: boolean;
  errorMessage: String;
  intervalId: any;
  timeVar: number = 15000;
  //TODO:define interface types for mvs-data/data
  data: any;
  dsData: Observable<any>;

  constructor(private fileService: FileService, 
    private elementRef:ElementRef, 
    // private persistentDataService: PersistentDataService,
    @Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger) {
    //this.componentClass = ComponentClass.FileBrowser;
    //this.initalizeCapabilities();
    this.path = "";
    this.rtClickDisplay = false;
    this.hideExplorer = false;
  }
  @Input() style: any;
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() dblClickEvent = new EventEmitter<MouseEvent>();

  ngOnInit() {

    // this.persistentDataService.getData()
    //   .subscribe(data => {
    //     if(data.contents.mvsInput){
    //       this.path = data.contents.mvsInput;
    //     }
    //     data.contents.mvsData.length == 0 ? this.updateDs() : (this.data = data.contents.mvsData, this.path = data.contents.mvsInput)
    //   }
    // )
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
    if($event.node.data.hasChildren){
      $event.node.expanded = !$event.node.expanded;
      this.nodeClick.emit($event.node);
    } else {
      this.nodeClick.emit($event.node);
    }
  }
    
  onNodeDblClick($event: any): void{
    if($event.node.data.hasChildren && $event.node.children.length > 0){
      this.path = $event.node.data.path;
      this.updateTreeAsync($event.node.data.path).then((res) => {
        this.data = res[0].children;
      });
    } else {
      this.dblClickEvent.emit($event.node);
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
      let dsorg: DatasetOrganization = {
        maxRecordLen: queryRes.dsorg.maxRecordLen,
        organization: queryRes.dsorg.organization,
        totalBlockSize: queryRes.dsorg.totalBlockSize
      };
      datasetAttrs.dsorg = dsorg;
    }
    if(!!queryRes.recfm){
      let recfm: RecordFormat = {
        carriageControl: queryRes.recfm.carriageControl,
        isBlocked: queryRes.recfm.isBlocked,
        recordLength: queryRes.recfm.recordLength
      };
      datasetAttrs.recfm = recfm;
    }
    return datasetAttrs;
  }

  updateTreeAsync(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fileService.queryDatasets(path, true).pipe(take(1)).subscribe((res) => {
        let parents: TreeNode[] = [];
        if(res.datasets.length > 0){
          for(let i:number = 0; i < res.datasets.length; i++){
            let currentNode:TreeNode = {};
            currentNode.children = [];
            currentNode.label = res.datasets[i].name.replace(/^\s+|\s+$/, '');
            let currentNodeData: ProjectStructure = {
              id: String(i),
              name: currentNode.label,
              fileName: currentNode.label,
              path: currentNode.label,
              hasChildren: null,
              isDataset: true,
              datasetAttrs: this.populateDatasetAttrs((res.datasets[i] as DatasetAttributes))
            };
            currentNode.data = currentNodeData;
            if(currentNode.data.datasetAttrs.dsorg
              && currentNode.data.datasetAttrs.dsorg.organization === 'partitioned'
              && res.datasets[i].members){
              currentNode.expanded = false;
              currentNode.expandedIcon = 'fa fa-folder-open';
              currentNode.collapsedIcon = 'fa fa-database';
              currentNode.data.hasChildren = true;
              //data.id attribute is not used by either parent or child, but required as part of the ProjectStructure interface
              this.addChildren(currentNode, res.datasets[i].members);
            } else {
              currentNode.expanded = false;
              currentNode.icon = 'fa fa-cube';
              currentNode.data.hasChildren = false;
            }
            parents.push(currentNode);
          }
          this.data = parents;
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
      childNode.icon = 'fa fa-cube';
      childNode.label = members[i].name.replace(/^\s+|\s+$/, '');
      childNode.parent = parentNode;
      let childNodeData: ProjectStructure = {
        id: parentNode.data.id,
        name: childNode.label,
        hasChildren: false,
        isDataset: true,
      }
      childNodeData.path = childNodeData.fileName = `${parentNode.label}(${childNode.label})`;
      childNode.data = childNodeData;
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
    this.updateTreeAsync(this.path);
  }
}




/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

