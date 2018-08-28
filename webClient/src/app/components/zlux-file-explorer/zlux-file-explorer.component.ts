

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
import {childEvent} from '../../structures/child-event';
import {MvsDataObject, UssDataObject} from '../../structures/persistantdata';
import {FileContents} from '../../structures/filecontents';
import {tab} from '../../structures/tab';
//import {ComponentClass} from '../../../../../../zlux-platform/interface/src/registry/classes';
import { PersistentDataService } from '../../services/persistentData.service';
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


@Component({
  selector: 'zlux-file-explorer',
  templateUrl: 'zlux-file-explorer.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['zlux-file-explorer.component.css',
    '../../../../node_modules/carbon-components/css/carbon-components.min.css'],
  providers: [FileService, UtilsService, PersistentDataService]
})

export class ZluxFileExplorerComponent implements OnInit, OnDestroy {
  //componentClass: ComponentClass;
  selectedItem: string;
  currentIndex: number;
  tabs: Array<tab>;
  //TODO:make an interface for parentUssEdit, any is not good enough
  parentUssEdit:any;

  constructor(private fileService: FileService,
    private persistentDataService: PersistentDataService,
    private utils: UtilsService, private elemRef: ElementRef,
    private cd: ChangeDetectorRef)
  {
    //this.componentClass = ComponentClass.FileBrowser;
    this.currentIndex = 0;
    this.tabs = [{ index: 0, name: "USS" }, { index: 1, name: "Datasets" }];

  }

  @Input() selectPath: string;
  @Output() fileOutput: EventEmitter<any> = new EventEmitter<any>();

  setIndex(inputIndex:number){
    this.currentIndex = inputIndex;
  }

  onUssFileLoad($event:FileContents){
    this.fileOutput.emit($event);
  }
  zluxOnMessage(eventContext: any): Promise<any> {
    return new Promise((resolve,reject)=> {

      if (!eventContext || !eventContext.action){
        return reject('Event context missing or malformed');
      }
      if (eventContext.action === 'save-file'){
        this.parentUssEdit = eventContext;
        console.log("parentUssEdit:" + this.parentUssEdit)
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
    let dataObject = {mvsData:Array<MvsDataObject>(), ussData:Array<UssDataObject>()};
    this.persistentDataService.getData()
      .subscribe(data => {
        dataObject = data.contents;
        dataObject.mvsData = [];
        dataObject.ussData = [];
        console.log(JSON.stringify(dataObject))
        this.persistentDataService.setData(dataObject)
          .subscribe((res: any) => { });
      })
  }

  provideZLUXDispatcherCallbacks(): ZLUX.ApplicationCallbacks {
   return {
     onMessage: (eventContext: any): Promise<any> => {
       return this.zluxOnMessage(eventContext);
     }
   }
 }
}

@NgModule({
  declarations: [FileBrowserMVSComponent, FileBrowserUSSComponent, ZluxFileExplorerComponent, TreeComponent],
  imports: [CommonModule, FormsModule, TreeModule, MenuModule, DialogModule],
  exports: [ZluxFileExplorerComponent],
  entryComponents: [ZluxFileExplorerComponent]
})
export class ZluxFileExplorerModule { }


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

