

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/


import { Component, ElementRef, OnInit, ViewEncapsulation, OnDestroy, Input, EventEmitter, Output, Inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
//import {ComponentClass} from '../../../../../../zlux-platform/interface/src/registry/classes';
import { FileService } from '../../services/file.service';
import { childEvent } from '../../structures/child-event';
import { PersistentDataService } from '../../services/persistentData.service';
import { MvsDataObject } from '../../structures/persistantdata';
import { Angular2InjectionTokens } from 'pluginlib/inject-resources';

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
  rtClickDisplay: boolean;
  errorMessage: String;
  intervalId: any;
  timeVar: number = 15000;
  //TODO:define interface types for mvs-data/data
  data: any;
  dsData: Observable<any>;

  constructor(private fileService: FileService, 
    private elementRef:ElementRef, 
    private persistantDataService: PersistentDataService,
    @Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger) {
    //this.componentClass = ComponentClass.FileBrowser;
    //this.initalizeCapabilities();
    this.path = "";
    this.rtClickDisplay = false;
    this.hideExplorer = false;
  }
  @Input() inputStyle: any;
  @Input() searchStyle: any;
  @Input() treeStyle: any;
  @Input() style: any;
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {

    this.persistantDataService.getData()
      .subscribe(data => {
        if(data.contents.mvsInput){
          this.path = data.contents.mvsInput;
        }
        data.contents.mvsData.length == 0 ? this.updateDs() : (this.data = data.contents.mvsData, this.path = data.contents.mvsInput)
      }
    )
    this.intervalId = setInterval(() => {
      this.updateDs();
    }, this.timeVar);
    this.updateDs();
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

  clickInEventHandler($event:any):void{
      //TODO:need to assess the Datasets drill in behavior
      this.path = $event.node.label + ".";
      this.updateDs();
  }

  onRightClick($event:any):void{
      this.log.debug('right click!')
      this.rtClickDisplay =!this.rtClickDisplay;
      //currently not supported and and *ngIf is currently blocking this pending dataSet api service injection
      this.log.debug('right click CRUD menu not supported for Datasets, yet (MVD-1614)!')
      setTimeout(function(){this.rtClickDisplay =!this.rtClickDisplay;  }, 5000)
  }

  updateDs():void{
    this.dsData = this.fileService.queryDatasets(this.path);
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
            currentNode.data = "Documents Folder";
            currentNode.expandedIcon = "fa fa-folder-open";
            currentNode.collapsedIcon = "fa fa-database";
          }
          else {
            currentNode.items = {};
            currentNode.icon= "fa fa-cube";
          }
          currentNode.label = ds.datasets[i].name.replace(/^\s+|\s+$/, '');
          temp.push(currentNode);
        }
        this.data = temp;

        let dataObject:MvsDataObject;
        this.persistantDataService.getData()
          .subscribe(data => {
            dataObject = data.contents;
            dataObject.mvsInput = this.path;
            dataObject.mvsData = this.data;
            //this.log.debug(JSON.stringify(dataObject));
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
  levelUp(): void {
      this.path = this.path.replace(/\.$/, '');
      if (!this.path.includes('.')){
        this.path = '';
      }
      else{
        this.path = this.path.replace(/\.[^\.]+$/, '')
      }
      this.updateDs();
  }
  updateTree(): void {
      this.pathChanged.emit(this.path);
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

