

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


import {Component, ElementRef, OnInit, ViewEncapsulation, OnDestroy} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {ComponentClass} from '../../../../../../zlux-platform/interface/src/registry/classes';
import { FileService } from '../../services/file.service';
import {childEvent} from '../../structures/child-event';
import { PersistentDataService } from '../../services/persistentData.service';
import {MvsDataObject} from '../../structures/persistantdata';

import {FileBrowserFileSelectedEvent,
  IFileBrowserMVS
} from '../../../../../../zlux-platform/interface/src/registry/component-classes/file-browser';
import {Capability, FileBrowserCapabilities} from '../../../../../../zlux-platform/interface/src/registry/capabilities';

@Component({
  selector: 'file-browser-mvs',
  templateUrl: 'filebrowsermvs.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['filebrowsermvs.component.css',
              '../../../../node_modules/carbon-components/css/carbon-components.min.css'],
  providers: [FileService, PersistentDataService]
})
export class FileBrowserMVSComponent implements IFileBrowserMVS, OnInit, OnDestroy {
  componentClass:ComponentClass;
  fileSelected: Subject<FileBrowserFileSelectedEvent>;
  capabilities:Array<Capability>;
  path:string;
  input_box:string;
  rtClickDisplay:boolean;
  errorMessage: String;
  intervalId:any;
  timeVar:number= 15000;


  //TODO:define interface types for mvs-data/data
  data:any;
  dsData : Observable<any>;
  constructor(private fileService: FileService, private elementRef:ElementRef, private persistantDataService: PersistentDataService) {
    this.componentClass = ComponentClass.FileBrowser;
    this.initalizeCapabilities();
    this.input_box = "";
    this.rtClickDisplay = false;
  }
  ngOnInit() {

    this.persistantDataService.getData()
      .subscribe(data => {
        if(data.contents.mvsInput){
          this.input_box = data.contents.mvsInput;
        }
        data.contents.mvsData.length == 0 ? this.updateDs() : (this.data = data.contents.mvsData, this.input_box = data.contents.mvsInput)
      }
    )
    this.intervalId = setInterval(() => {
      this.updateDs();
    }, this.timeVar);
  }
  ngOnDestroy(){
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  initalizeCapabilities(){
    this.capabilities = new Array<Capability>();
    this.capabilities.push(FileBrowserCapabilities.FileBrowser);
    this.capabilities.push(FileBrowserCapabilities.FileBrowserMVS);
  }
  getSelectedPath(): string{
    //TODO:how do we want to want to handle caching vs message to app to open said path
    return this.path;
  }

  browsePath(path: string): void{
    this.path = path;
  }

  getDOMElement(): HTMLElement{
    return this.elementRef.nativeElement;
  }

  getCapabilities(): Capability[]
  {
    return this.capabilities;
  }
  clickInEventHandler($event:childEvent):void{
      //TODO:need to assess the Datasets drill in behavior
      this.input_box = this.input_box  + $event.label + ".";
      this.updateDs();
  }
  onRightClick($event:any):void{
      console.log('right click!')
      this.rtClickDisplay =!this.rtClickDisplay;
      //currently not supported and and *ngIf is currently blocking this pending dataSet api service injection
      console.log('right click CRUD menu not supported for Datasets, yet (MVD-1614)!')
      setTimeout(function(){this.rtClickDisplay =!this.rtClickDisplay;  }, 5000)
  }
  updateDs():void{
    this.dsData = this.fileService.queryDatasets(this.input_box);
    this.dsData.subscribe(
      ds =>{
        //TODO: move this to a UtilsService
        let temp:any = [];
        let currentNode:any = {};
        for(let i:number= 0; i< ds.datasets.length; i++){
          currentNode = {};
          //TODO: assuming parent entries come first always??? Need to validate this?
          if (/C|X/.test(ds.datasets[i].csiEntryType)){
            currentNode.children = [];
            //TODO: styling of the 'folder' could likely be better
            currentNode.data = "Documents Folder";
            currentNode.expandedIcon = "fa-folder-open";
            currentNode.collapsedIcon = "fa-folder";
          }
          else {
            currentNode.items = {};
            //TODO: styling of the 'files' could likely be better
            currentNode.icon= "fa-file";
          }
          currentNode.label = ds.datasets[i].name.replace(/^\s+|\s+$/, '');
          temp.push(currentNode);
        }
        this.data = temp;

        let dataObject:MvsDataObject;
        this.persistantDataService.getData()
          .subscribe(data => {
            dataObject = data.contents;
            dataObject.mvsInput = this.input_box;
            dataObject.mvsData = this.data;
            console.log(JSON.stringify(dataObject));
            this.persistantDataService.setData(dataObject)
              .subscribe((res: any) => { });
          })

      },
      error => this.errorMessage = <any>error
    );
  }


/**
* [levelUp: function to ascend up a level in the file/folder tree]
* @param index [tree index where the 'folder' parent is accessed]
*/
  levelUp():void{
      this.input_box = this.input_box.replace(/\.$/, '');
      if (!this.input_box.includes('.')){
        this.input_box = '';
      }
      else{
        this.input_box = this.input_box.replace(/\.[^\.]+$/, '')
      }
      this.updateDs();
    }
    updateTree():void{
        this.updateDs();
    }
  }




/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

