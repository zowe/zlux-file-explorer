

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
  private clickCount = 0;
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
    private persistentDataService: PersistentDataService,
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

  ngOnInit() {


    /* TODO: Make persistentDataService work again, 
    which should save opened tree node setups upon close 
    to re-open them later, giving the user the ability 
    to pickup progress where they left off
    */

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

  /*getCapabilities(): Capability[]
  {
    return this.capabilities;
  }*/

  onNodeClick($event:any):void{
    //TODO:need to assess the Datasets drill in behavior
    this.clickCount++;
    let dblClickTimeout;
    dblClickTimeout = setTimeout(()=>{
      if(this.clickCount == 1){
        if($event.node.type === 'Folder'){
          $event.node.expanded = !$event.node.expanded;
          this.nodeClick.emit($event.node);
        } else {
          this.nodeClick.emit($event.node);
        }
        this.clickCount = 0;
      } else {
        this.onNodeDblClick($event, dblClickTimeout);
      }
    }, 250)
  }

  onNodeDblClick($event: any, timeout): void{
    this.clickCount = 0;
    clearTimeout(timeout);
    if($event.node.type === 'Folder' && $event.node.children){
      this.path = $event.node.data.path;
      this.updateTreeAsync($event.node.data.path).then((res) => {
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

  updateTreeAsync(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fileService.queryDatasets(path).pipe(take(1)).subscribe((res) => {
        let parents: TreeNode[] = [];
        if(res.datasets.length > 0){
          for(let i:number = 0; i < res.datasets.length; i++){
            let currentNode:TreeNode = {};
            currentNode.data = {};
            currentNode.label = res.datasets[i].name.replace(/^\s+|\s+$/, '');
            currentNode.data.id = i;
            currentNode.data.path = currentNode.label
            currentNode.data.fileName = currentNode.data.name = currentNode.data.path;
            currentNode.data.isDataset = true;
            currentNode.children = [];
            if(res.datasets[i].members){
              currentNode.type = 'Folder';
              currentNode.expanded = false;
              currentNode.expandedIcon = 'fa fa-folder-open';
              currentNode.collapsedIcon = 'fa fa-database';
              currentNode.data.hasChildren = true;
              //data.id attribute is not used by either parent or child, but required as part of the ProjectStructure interface
              this.addChildren(currentNode, res.datasets[i].members);
            } else {
              currentNode.type = 'nonPDS';
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
      childNode.type = 'nonPDS';
      childNode.icon = 'fa fa-cube';
      childNode.label = members[i].name.replace(/^\s+|\s+$/, '');
      childNode.parent = parentNode;
      childNode.data = {
        id: parentNode.data.id,
        fileName: childNode.label,
        name: childNode.label,
        hasChildren: false,
        isDataset: true,
        path: `${parentNode.label}(${childNode.label})`
      }
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

