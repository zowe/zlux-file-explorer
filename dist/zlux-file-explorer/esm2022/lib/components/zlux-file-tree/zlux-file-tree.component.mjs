import { Component, Input, Output, ViewChild, ViewEncapsulation, EventEmitter, Inject } from '@angular/core';
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
import { Subscription } from 'rxjs';
/* Services */
import { UtilsService } from '../../services/utils.service';
import { KeyCode } from '../../services/keybinding.service';
import { Angular2InjectionTokens } from '../../../pluginlib/inject-resources';
import * as i0 from "@angular/core";
import * as i1 from "../../services/utils.service";
import * as i2 from "../../services/keybinding.service";
import * as i3 from "@angular/common";
import * as i4 from "../filebrowsermvs/filebrowsermvs.component";
import * as i5 from "../filebrowseruss/filebrowseruss.component";
export class ZluxFileTreeComponent {
    constructor(/*private persistentDataService: PersistentDataService,*/ utils, elemRef, cd, appKeyboard, log) {
        this.utils = utils;
        this.elemRef = elemRef;
        this.cd = cd;
        this.appKeyboard = appKeyboard;
        this.log = log;
        this.keyBindingSub = new Subscription();
        this.style = {};
        this.headerStyle = {};
        this.inputStyle = {};
        this.searchStyle = {};
        this.treeStyle = {};
        this.fileOutput = new EventEmitter();
        this.nodeClick = new EventEmitter();
        this.nodeDblClick = new EventEmitter();
        this.newFolderClick = new EventEmitter();
        this.fileUploaded = new EventEmitter();
        // @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
        this.copyClick = new EventEmitter();
        this.deleteClick = new EventEmitter();
        this.ussRenameEvent = new EventEmitter();
        this.datasetSelect = new EventEmitter();
        this.ussSelect = new EventEmitter();
        this.pathChanged = new EventEmitter();
        this.dataChanged = new EventEmitter();
        this.rightClick = new EventEmitter();
        this.openInNewTab = new EventEmitter();
        this.createDataset = new EventEmitter();
        //this.componentClass = ComponentClass.FileBrowser;
        this.currentIndex = 0;
        this.tabs = [{ index: 0, name: "USS" }, { index: 1, name: "Datasets" }];
        this.showUpArrow = true;
    }
    set spawnModal(typeAndData) {
        if (typeAndData == undefined) {
            return;
        }
        let type = typeAndData.type;
        let data = typeAndData.data;
        let isDataset = (data.data && data.data.datasetAttrs) ? true : false;
        switch (type) {
            case 'properties':
                isDataset ? this.mvsComponent.showPropertiesDialog(data) : this.ussComponent.showPropertiesDialog(data);
                break;
            case 'delete':
                isDataset ? this.mvsComponent.showDeleteDialog(data) : this.ussComponent.showDeleteDialog(data);
                break;
            case 'createFolder':
                !isDataset && this.ussComponent.showCreateFolderDialog(data);
                break;
            case 'requestUpload':
                !isDataset && this.ussComponent.showUploadDialog(data);
                break;
            case 'createDataset':
                this.mvsComponent.createDatasetDialog(data);
                break;
            case 'changeOwners':
                this.ussComponent.showOwnerDialog(data);
                break;
            case 'tagFile':
                this.ussComponent.showTaggingDialog(data);
                break;
            case 'changePermissions':
                this.ussComponent.showPermissionsDialog(data);
                break;
            case 'createFile':
                this.ussComponent.showCreateFileDialog(data);
                break;
            default:
                //invalid type
                this.log.warn(`Unsuccessful in spawning modal for type: `, type);
                break;
        }
    }
    set toggleSearchInput(value) {
        if (value) {
            if (value.path.startsWith("/")) {
                if (this.ussComponent) {
                    this.ussComponent.toggleSearch();
                }
            }
            else {
                if (this.mvsComponent) {
                    this.mvsComponent.toggleSearch();
                }
            }
        }
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
        switch (this.theme) {
            case 'carbon': {
                this.headerStyle = {
                    'background-color': '#3d70b2',
                    'color': 'white',
                    'width': '99.7%',
                    'text-align': 'right'
                };
                this.inputStyle = {
                    'background-color': '#eee',
                    'color': 'black',
                    'border': '2px solid #3d70b2',
                    'margin-top': '20px'
                };
                this.searchStyle = {
                    'min-width': '250px',
                    'display': 'inline-block',
                    'height': '40px',
                    'width': '90%',
                };
                this.treeStyle = {
                    'color': '#646464'
                };
                this.style = {
                    'background-color': '#F4F7FB',
                    'margin-top': '10px',
                    'max-height': '320px',
                    'overflow-y': 'scroll',
                    'padding': '0px',
                    'margin-left': '0px'
                };
                break;
            }
            default: {
                this.treeStyle = { 'filter': 'brightness(3)', 'color': 'white' };
                break;
            }
        }
        const fileExplorerGlobalElement = this.fileExplorerGlobal.nativeElement;
        this.appKeyboard.registerKeyUpEvent(fileExplorerGlobalElement);
        this.appKeyboard.registerKeyDownEvent(fileExplorerGlobalElement);
        this.keyBindingSub.add(this.appKeyboard.keydownEvent
            .subscribe((event) => {
            if (event.which === KeyCode.KEY_P && !event.ctrlKey) {
                this.toggleSearch();
            }
        }));
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
    onCreateDataset($event) {
        // Event to tell if the dataset creation is successful or not
        this.createDataset.emit($event);
    }
    deleteFileOrFolder(pathAndName) {
        this.ussComponent.deleteFileOrFolder(pathAndName);
    }
    createDirectory(pathAndName) {
        if (pathAndName) {
            this.ussComponent.showCreateFolderDialog(pathAndName);
        }
        else {
            this.ussComponent.showCreateFolderDialog(this.ussComponent.getSelectedPath());
        }
    }
    getActiveDirectory() {
        if (this.currentIndex == 0) {
            return this.ussComponent.getSelectedPath();
        }
        else { //Datasets do not yet have an active directory context
            return null;
        }
    }
    hideExplorers() {
        if (this.ussComponent) {
            this.ussComponent.hideExplorer = true;
        }
        if (this.mvsComponent) {
            this.mvsComponent.hideExplorer = true;
        }
    }
    toggleSearch() {
        if (this.currentIndex == 0) {
            this.ussComponent.toggleSearch();
        }
        else {
            this.mvsComponent.toggleSearch();
        }
    }
    displayUpArrow(show) {
        this.showUpArrow = show;
    }
    onCopyClick($event) {
        this.copyClick.emit($event);
    }
    onDeleteClick($event) {
        this.deleteClick.emit($event);
    }
    onUSSRenameEvent($event) {
        this.ussRenameEvent.emit($event);
    }
    // onNewFileClick($event:any){
    //   this.newFileClick.emit($event);
    // }
    onNewFolderClick($event) {
        this.newFolderClick.emit($event);
    }
    onFileUploaded($event) {
        this.fileUploaded.emit($event);
    }
    onNodeClick($event) {
        this.nodeClick.emit($event);
    }
    onNodeDblClick($event) {
        this.nodeDblClick.emit($event);
    }
    onPathChanged($event) {
        this.pathChanged.emit($event);
    }
    onDataChanged($event) {
        this.dataChanged.emit($event);
    }
    onRightClick($event) {
        this.rightClick.emit($event);
    }
    onOpenInNewTab($event) {
        this.openInNewTab.emit($event);
    }
    // onUssFileLoad($event:FileContents){
    //   this.fileOutput.emit($event);
    // }
    provideZLUXDispatcherCallbacks() {
        return {
            onMessage: (eventContext) => {
                return this.zluxOnMessage(eventContext);
            }
        };
    }
    setIndex(inputIndex) {
        this.currentIndex = inputIndex;
        if (this.currentIndex == 0) {
            this.ussSelect.emit();
        }
        else {
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
    spawnUploadModal() {
        if (this.ussComponent) {
            this.ussComponent.showUploadDialog(null);
        }
        else {
            // ... Disabled for DS mode for now
        }
    }
    updateDirectory(dirName) {
        this.showUss();
        this.ussComponent.updateUss(dirName);
    }
    updateDSList(query) {
        this.showDatasets();
        this.mvsComponent.setPath(query);
        this.mvsComponent.updateTreeView(query);
    }
    refreshFileMetadatdaByPath(path) {
        return this.ussComponent.refreshFileMetadatdaUsingPath(path);
    }
    zluxOnMessage(eventContext) {
        return new Promise((resolve, reject) => {
            if (!eventContext || !eventContext.action) {
                return reject('Event context missing or malformed');
            }
            if (eventContext.action === 'save-file') {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeComponent, deps: [{ token: i1.UtilsService }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i2.KeybindingService }, { token: Angular2InjectionTokens.LOGGER }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: ZluxFileTreeComponent, selector: "zlux-file-tree", inputs: { spawnModal: "spawnModal", toggleSearchInput: "toggleSearchInput", selectPath: "selectPath", style: "style", headerStyle: "headerStyle", inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", theme: "theme" }, outputs: { fileOutput: "fileOutput", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", newFolderClick: "newFolderClick", fileUploaded: "fileUploaded", copyClick: "copyClick", deleteClick: "deleteClick", ussRenameEvent: "ussRenameEvent", datasetSelect: "datasetSelect", ussSelect: "ussSelect", pathChanged: "pathChanged", dataChanged: "dataChanged", rightClick: "rightClick", openInNewTab: "openInNewTab", createDataset: "createDataset" }, providers: [UtilsService /*, PersistentDataService*/], viewQueries: [{ propertyName: "ussComponent", first: true, predicate: FileBrowserUSSComponent, descendants: true }, { propertyName: "mvsComponent", first: true, predicate: FileBrowserMVSComponent, descendants: true }, { propertyName: "fileExplorerGlobal", first: true, predicate: ["fileExplorerGlobal"], descendants: true, static: true }], ngImport: i0, template: "<!--\r\nThis program and the accompanying materials are\r\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\r\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n\r\nSPDX-License-Identifier: EPL-2.0\r\n\r\nCopyright Contributors to the Zowe Project.\r\n-->\r\n\r\n<div class=\"fileexplorer-global\" #fileExplorerGlobal>\r\n  <nav data-tabs class=\"fileexplorer-tabs\" role=\"navigation\">\r\n    <div class=\"fileexplorer-tabs-trigger\" tabindex=\"-1\">\r\n      <a href=\"javascript:void(0)\" class=\"bx--tabs-trigger-text\" tabindex=\"-1\"></a>\r\n\r\n    </div>\r\n    <ul class=\"fileexplorer-tabs-list\" role=\"tablist\" [ngStyle]=\"headerStyle\">\r\n      @for (tab of tabs; track tab) {\r\n      <li [ngClass]=\"tab.index == currentIndex ? 'fileexplorer-tab-selected' : 'fileexplorer-tab'\"\r\n        (click)=\"setIndex(tab.index)\" id=\"tab-{{tab.index}}\" role=\"presentation\" [ngStyle]=\"headerStyle\"\r\n        class=\"bx--tabs__nav-item\">\r\n        <a class=\"fileexplorer-tabs-text\" href=\"javascript:void(0)\" role=\"tab\" aria-selected=\"false\"\r\n          [ngStyle]=\"headerStyle\">{{tab.name}}</a>\r\n      </li>\r\n      }\r\n    </ul>\r\n  </nav>\r\n  <div class=\"fileexplorer-browser-module\" [ngStyle]=\"style\">\r\n    <file-browser-uss #ussComponent [hidden]=\"currentIndex != 0\" (nodeClick)=\"onNodeClick($event)\"\r\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\r\n      (newFolderClick)=\"onNewFolderClick($event)\" (fileUploaded)=\"onFileUploaded($event)\"\r\n      (deleteClick)=\"onDeleteClick($event)\" (ussRenameEvent)=\"onUSSRenameEvent($event)\"\r\n      (copyClick)=\"onCopyClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\r\n      (dataChanged)=\"onDataChanged($event)\" [style]=\"style\" [inputStyle]=\"inputStyle\" [treeStyle]=\"treeStyle\"\r\n      [searchStyle]=\"searchStyle\" [showUpArrow]=\"showUpArrow\"></file-browser-uss>\r\n    <file-browser-mvs #mvsComponent [hidden]=\"currentIndex != 1\" (nodeClick)=\"onNodeClick($event)\"\r\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\r\n      (deleteClick)=\"onDeleteClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\r\n      (dataChanged)=\"onDataChanged($event)\" (createDataset)=\"onCreateDataset($event)\" [inputStyle]=\"inputStyle\"\r\n      [treeStyle]=\"treeStyle\" [searchStyle]=\"searchStyle\" [style]=\"style\"\r\n      [showUpArrow]=\"showUpArrow\"></file-browser-mvs>\r\n  </div>\r\n</div>\r\n\r\n<!--\r\nThis program and the accompanying materials are\r\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\r\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n\r\nSPDX-License-Identifier: EPL-2.0\r\n\r\n<!--\r\nThis program and the accompanying materials are\r\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\r\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n\r\nSPDX-License-Identifier: EPL-2.0\r\n\r\nCopyright Contributors to the Zowe Project.\r\n-->", styles: [".fileexplorer-browser-module{margin-left:10px;margin-top:10px;height:100%}.fileexplorer-global{height:100%}.fileexplorer-tabs{height:25px;text-align:center;padding-bottom:30px}.fileexplorer-tab{font-size:15px;color:#007bff;height:35px;width:170px;padding-top:6px;margin-left:-10px}.fileexplorer-tab-selected{font-size:15px;height:35px;width:165px;font-weight:700;padding-top:6px;margin-left:-7px;color:#005abb;background-color:#d4d4d4}.fileexplorer-tabs-list{-webkit-column-count:2;-moz-column-count:2;column-count:2;width:100%;height:35px;background-color:#464646;cursor:pointer}.fileexplorer-tabs-text{color:inherit;text-decoration:none;background-color:transparent}ul{padding-left:0!important}\n"], dependencies: [{ kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: i4.FileBrowserMVSComponent, selector: "file-browser-mvs", inputs: ["inputStyle", "searchStyle", "treeStyle", "style", "showUpArrow"], outputs: ["pathChanged", "dataChanged", "nodeClick", "nodeDblClick", "rightClick", "deleteClick", "openInNewTab", "createDataset"] }, { kind: "component", type: i5.FileBrowserUSSComponent, selector: "file-browser-uss", inputs: ["inputStyle", "searchStyle", "treeStyle", "showUpArrow"], outputs: ["pathChanged", "dataChanged", "nodeClick", "nodeDblClick", "nodeRightClick", "newFolderClick", "newFileClick", "fileUploaded", "copyClick", "deleteClick", "ussRenameEvent", "rightClick", "openInNewTab"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'zlux-file-tree', encapsulation: ViewEncapsulation.None, providers: [UtilsService /*, PersistentDataService*/], template: "<!--\r\nThis program and the accompanying materials are\r\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\r\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n\r\nSPDX-License-Identifier: EPL-2.0\r\n\r\nCopyright Contributors to the Zowe Project.\r\n-->\r\n\r\n<div class=\"fileexplorer-global\" #fileExplorerGlobal>\r\n  <nav data-tabs class=\"fileexplorer-tabs\" role=\"navigation\">\r\n    <div class=\"fileexplorer-tabs-trigger\" tabindex=\"-1\">\r\n      <a href=\"javascript:void(0)\" class=\"bx--tabs-trigger-text\" tabindex=\"-1\"></a>\r\n\r\n    </div>\r\n    <ul class=\"fileexplorer-tabs-list\" role=\"tablist\" [ngStyle]=\"headerStyle\">\r\n      @for (tab of tabs; track tab) {\r\n      <li [ngClass]=\"tab.index == currentIndex ? 'fileexplorer-tab-selected' : 'fileexplorer-tab'\"\r\n        (click)=\"setIndex(tab.index)\" id=\"tab-{{tab.index}}\" role=\"presentation\" [ngStyle]=\"headerStyle\"\r\n        class=\"bx--tabs__nav-item\">\r\n        <a class=\"fileexplorer-tabs-text\" href=\"javascript:void(0)\" role=\"tab\" aria-selected=\"false\"\r\n          [ngStyle]=\"headerStyle\">{{tab.name}}</a>\r\n      </li>\r\n      }\r\n    </ul>\r\n  </nav>\r\n  <div class=\"fileexplorer-browser-module\" [ngStyle]=\"style\">\r\n    <file-browser-uss #ussComponent [hidden]=\"currentIndex != 0\" (nodeClick)=\"onNodeClick($event)\"\r\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\r\n      (newFolderClick)=\"onNewFolderClick($event)\" (fileUploaded)=\"onFileUploaded($event)\"\r\n      (deleteClick)=\"onDeleteClick($event)\" (ussRenameEvent)=\"onUSSRenameEvent($event)\"\r\n      (copyClick)=\"onCopyClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\r\n      (dataChanged)=\"onDataChanged($event)\" [style]=\"style\" [inputStyle]=\"inputStyle\" [treeStyle]=\"treeStyle\"\r\n      [searchStyle]=\"searchStyle\" [showUpArrow]=\"showUpArrow\"></file-browser-uss>\r\n    <file-browser-mvs #mvsComponent [hidden]=\"currentIndex != 1\" (nodeClick)=\"onNodeClick($event)\"\r\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\r\n      (deleteClick)=\"onDeleteClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\r\n      (dataChanged)=\"onDataChanged($event)\" (createDataset)=\"onCreateDataset($event)\" [inputStyle]=\"inputStyle\"\r\n      [treeStyle]=\"treeStyle\" [searchStyle]=\"searchStyle\" [style]=\"style\"\r\n      [showUpArrow]=\"showUpArrow\"></file-browser-mvs>\r\n  </div>\r\n</div>\r\n\r\n<!--\r\nThis program and the accompanying materials are\r\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\r\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n\r\nSPDX-License-Identifier: EPL-2.0\r\n\r\n<!--\r\nThis program and the accompanying materials are\r\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\r\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n\r\nSPDX-License-Identifier: EPL-2.0\r\n\r\nCopyright Contributors to the Zowe Project.\r\n-->", styles: [".fileexplorer-browser-module{margin-left:10px;margin-top:10px;height:100%}.fileexplorer-global{height:100%}.fileexplorer-tabs{height:25px;text-align:center;padding-bottom:30px}.fileexplorer-tab{font-size:15px;color:#007bff;height:35px;width:170px;padding-top:6px;margin-left:-10px}.fileexplorer-tab-selected{font-size:15px;height:35px;width:165px;font-weight:700;padding-top:6px;margin-left:-7px;color:#005abb;background-color:#d4d4d4}.fileexplorer-tabs-list{-webkit-column-count:2;-moz-column-count:2;column-count:2;width:100%;height:35px;background-color:#464646;cursor:pointer}.fileexplorer-tabs-text{color:inherit;text-decoration:none;background-color:transparent}ul{padding-left:0!important}\n"] }]
        }], ctorParameters: () => [{ type: i1.UtilsService }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i2.KeybindingService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }], propDecorators: { ussComponent: [{
                type: ViewChild,
                args: [FileBrowserUSSComponent]
            }], mvsComponent: [{
                type: ViewChild,
                args: [FileBrowserMVSComponent]
            }], fileExplorerGlobal: [{
                type: ViewChild,
                args: ['fileExplorerGlobal', { static: true }]
            }], spawnModal: [{
                type: Input
            }], toggleSearchInput: [{
                type: Input
            }], selectPath: [{
                type: Input
            }], style: [{
                type: Input
            }], headerStyle: [{
                type: Input
            }], inputStyle: [{
                type: Input
            }], searchStyle: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], theme: [{
                type: Input
            }], fileOutput: [{
                type: Output
            }], nodeClick: [{
                type: Output
            }], nodeDblClick: [{
                type: Output
            }], newFolderClick: [{
                type: Output
            }], fileUploaded: [{
                type: Output
            }], copyClick: [{
                type: Output
            }], deleteClick: [{
                type: Output
            }], ussRenameEvent: [{
                type: Output
            }], datasetSelect: [{
                type: Output
            }], ussSelect: [{
                type: Output
            }], pathChanged: [{
                type: Output
            }], dataChanged: [{
                type: Output
            }], rightClick: [{
                type: Output
            }], openInNewTab: [{
                type: Output
            }], createDataset: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemx1eC1maWxlLXRyZWUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy96bHV4LWZpbGUtdHJlZS96bHV4LWZpbGUtdHJlZS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL3psdXgtZmlsZS10cmVlL3psdXgtZmlsZS10cmVlLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWNBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBRTNDLFlBQVksRUFBcUIsTUFBTSxFQUN4QyxNQUFNLGVBQWUsQ0FBQztBQUd2QixnR0FBZ0c7QUFDaEcsa0ZBQWtGO0FBQ2xGOzs7Ozs7aUdBTWlHO0FBQ2pHLDZGQUE2RjtBQUM3RixxREFBcUQ7QUFDckQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDckYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDckYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVwQyxjQUFjO0FBQ2QsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzVELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUU1RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQzs7Ozs7OztBQVU5RSxNQUFNLE9BQU8scUJBQXFCO0lBZ0JoQyxZQUFZLHlEQUF5RCxDQUMzRCxLQUFtQixFQUNuQixPQUFtQixFQUNuQixFQUFxQixFQUNyQixXQUE4QixFQUNVLEdBQXlCO1FBSmpFLFVBQUssR0FBTCxLQUFLLENB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QUFBLDJCQUEyQixDQUFDOzswQkF3QmpELE1BQU07MkJBQUMsdUJBQXVCLENBQUMsTUFBTTt5Q0FiakMsWUFBWTtzQkFEbEIsU0FBUzt1QkFBQyx1QkFBdUI7Z0JBSTNCLFlBQVk7c0JBRGxCLFNBQVM7dUJBQUMsdUJBQXVCO2dCQUlsQyxrQkFBa0I7c0JBRGpCLFNBQVM7dUJBQUMsb0JBQW9CLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQWVwQyxVQUFVO3NCQUF0QixLQUFLO2dCQTJDTyxpQkFBaUI7c0JBQTdCLEtBQUs7Z0JBY0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBRUksVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxTQUFTO3NCQUFsQixNQUFNO2dCQUNHLFlBQVk7c0JBQXJCLE1BQU07Z0JBQ0csY0FBYztzQkFBdkIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUVHLFNBQVM7c0JBQWxCLE1BQU07Z0JBQ0csV0FBVztzQkFBcEIsTUFBTTtnQkFDRyxjQUFjO3NCQUF2QixNQUFNO2dCQUNHLGFBQWE7c0JBQXRCLE1BQU07Z0JBQ0csU0FBUztzQkFBbEIsTUFBTTtnQkFDRyxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFdBQVc7c0JBQXBCLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUNHLGFBQWE7c0JBQXRCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJcclxuXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG5cclxuZGVjbGFyZSB2YXIgcmVxdWlyZTogYW55O1xyXG5cclxuaW1wb3J0IHtcclxuICBDb21wb25lbnQsXHJcbiAgSW5wdXQsIE91dHB1dCwgVmlld0NoaWxkLCBWaWV3RW5jYXBzdWxhdGlvbixcclxuICBFbGVtZW50UmVmLCBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBFdmVudEVtaXR0ZXIsIE9uSW5pdCwgT25EZXN0cm95LCBJbmplY3RcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuLy8gaW1wb3J0IHtGaWxlQ29udGVudHN9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvZmlsZWNvbnRlbnRzJztcclxuaW1wb3J0IHsgdGFiIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy90YWInO1xyXG4vL2ltcG9ydCB7Q29tcG9uZW50Q2xhc3N9IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3psdXgtcGxhdGZvcm0vaW50ZXJmYWNlL3NyYy9yZWdpc3RyeS9jbGFzc2VzJztcclxuLyppbXBvcnQgeyBQZXJzaXN0ZW50RGF0YVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wZXJzaXN0ZW50RGF0YS5zZXJ2aWNlJzsqL1xyXG4vKmltcG9ydCB7RmlsZUJyb3dzZXJGaWxlU2VsZWN0ZWRFdmVudCxcclxuICBJRmlsZUJyb3dzZXIsXHJcbiAgSUZpbGVCcm93c2VyTXVsdGlTZWxlY3QsXHJcbiAgSUZpbGVCcm93c2VyRm9sZGVyU2VsZWN0LFxyXG4gIElGaWxlQnJvd3NlclVTUyxcclxuICBJRmlsZUJyb3dzZXJNVlNcclxufSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi96bHV4LXBsYXRmb3JtL2ludGVyZmFjZS9zcmMvcmVnaXN0cnkvY29tcG9uZW50LWNsYXNzZXMvZmlsZS1icm93c2VyJzsqL1xyXG4vL0NvbW1lbnRlZCBvdXQgdG8gZml4IGNvbXBpbGF0aW9uIGVycm9ycyBmcm9tIHpsdXgtcGxhdGZvcm0gY2hhbmdlcywgZG9lcyBub3QgYWZmZWN0IHByb2dyYW1cclxuLy9UT0RPOiBJbXBsZW1lbnQgbmV3IGNhcGFiaWxpdGllcyBmcm9tIHpsdXgtcGxhdGZvcm1cclxuaW1wb3J0IHsgRmlsZUJyb3dzZXJNVlNDb21wb25lbnQgfSBmcm9tICcuLi9maWxlYnJvd3Nlcm12cy9maWxlYnJvd3Nlcm12cy5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBGaWxlQnJvd3NlclVTU0NvbXBvbmVudCB9IGZyb20gJy4uL2ZpbGVicm93c2VydXNzL2ZpbGVicm93c2VydXNzLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuLyogU2VydmljZXMgKi9cclxuaW1wb3J0IHsgVXRpbHNTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvdXRpbHMuc2VydmljZSc7XHJcbmltcG9ydCB7IEtleUNvZGUgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9rZXliaW5kaW5nLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBLZXliaW5kaW5nU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2tleWJpbmRpbmcuc2VydmljZSc7XHJcbmltcG9ydCB7IEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zIH0gZnJvbSAnLi4vLi4vLi4vcGx1Z2lubGliL2luamVjdC1yZXNvdXJjZXMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICd6bHV4LWZpbGUtdHJlZScsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL3psdXgtZmlsZS10cmVlLmNvbXBvbmVudC5odG1sJyxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gIHN0eWxlVXJsczogWycuL3psdXgtZmlsZS10cmVlLmNvbXBvbmVudC5jc3MnXSxcclxuICBwcm92aWRlcnM6IFtVdGlsc1NlcnZpY2UvKiwgUGVyc2lzdGVudERhdGFTZXJ2aWNlKi9dXHJcbn0pXHJcblxyXG5leHBvcnQgY2xhc3MgWmx1eEZpbGVUcmVlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gIC8vY29tcG9uZW50Q2xhc3M6IENvbXBvbmVudENsYXNzO1xyXG4gIHB1YmxpYyBjdXJyZW50SW5kZXg6IG51bWJlcjtcclxuICBwdWJsaWMgdGFiczogQXJyYXk8dGFiPjtcclxuICBwdWJsaWMgc2hvd1VwQXJyb3c6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBrZXlCaW5kaW5nU3ViOiBTdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XHJcblxyXG4gIEBWaWV3Q2hpbGQoRmlsZUJyb3dzZXJVU1NDb21wb25lbnQpXHJcbiAgcHVibGljIHVzc0NvbXBvbmVudDogRmlsZUJyb3dzZXJVU1NDb21wb25lbnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoRmlsZUJyb3dzZXJNVlNDb21wb25lbnQpXHJcbiAgcHVibGljIG12c0NvbXBvbmVudDogRmlsZUJyb3dzZXJNVlNDb21wb25lbnQ7XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ2ZpbGVFeHBsb3Jlckdsb2JhbCcsIHsgc3RhdGljOiB0cnVlIH0pXHJcbiAgZmlsZUV4cGxvcmVyR2xvYmFsOiBFbGVtZW50UmVmPGFueT47XHJcblxyXG4gIGNvbnN0cnVjdG9yKC8qcHJpdmF0ZSBwZXJzaXN0ZW50RGF0YVNlcnZpY2U6IFBlcnNpc3RlbnREYXRhU2VydmljZSwqL1xyXG4gICAgcHJpdmF0ZSB1dGlsczogVXRpbHNTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBlbGVtUmVmOiBFbGVtZW50UmVmLFxyXG4gICAgcHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgICBwcml2YXRlIGFwcEtleWJvYXJkOiBLZXliaW5kaW5nU2VydmljZSxcclxuICAgIEBJbmplY3QoQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMuTE9HR0VSKSBwcml2YXRlIGxvZzogWkxVWC5Db21wb25lbnRMb2dnZXIsKSB7XHJcbiAgICAvL3RoaXMuY29tcG9uZW50Q2xhc3MgPSBDb21wb25lbnRDbGFzcy5GaWxlQnJvd3NlcjtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIHRoaXMudGFicyA9IFt7IGluZGV4OiAwLCBuYW1lOiBcIlVTU1wiIH0sIHsgaW5kZXg6IDEsIG5hbWU6IFwiRGF0YXNldHNcIiB9XTtcclxuICAgIHRoaXMuc2hvd1VwQXJyb3cgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgQElucHV0KCkgc2V0IHNwYXduTW9kYWwodHlwZUFuZERhdGE6IGFueSkge1xyXG4gICAgaWYgKHR5cGVBbmREYXRhID09IHVuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgdHlwZSA9IHR5cGVBbmREYXRhLnR5cGU7XHJcbiAgICBsZXQgZGF0YSA9IHR5cGVBbmREYXRhLmRhdGE7XHJcbiAgICBsZXQgaXNEYXRhc2V0ID0gKGRhdGEuZGF0YSAmJiBkYXRhLmRhdGEuZGF0YXNldEF0dHJzKSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgY2FzZSAncHJvcGVydGllcyc6XHJcbiAgICAgICAgaXNEYXRhc2V0ID8gdGhpcy5tdnNDb21wb25lbnQuc2hvd1Byb3BlcnRpZXNEaWFsb2coZGF0YSkgOiB0aGlzLnVzc0NvbXBvbmVudC5zaG93UHJvcGVydGllc0RpYWxvZyhkYXRhKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZGVsZXRlJzpcclxuICAgICAgICBpc0RhdGFzZXQgPyB0aGlzLm12c0NvbXBvbmVudC5zaG93RGVsZXRlRGlhbG9nKGRhdGEpIDogdGhpcy51c3NDb21wb25lbnQuc2hvd0RlbGV0ZURpYWxvZyhkYXRhKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY3JlYXRlRm9sZGVyJzpcclxuICAgICAgICAhaXNEYXRhc2V0ICYmIHRoaXMudXNzQ29tcG9uZW50LnNob3dDcmVhdGVGb2xkZXJEaWFsb2coZGF0YSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JlcXVlc3RVcGxvYWQnOlxyXG4gICAgICAgICFpc0RhdGFzZXQgJiYgdGhpcy51c3NDb21wb25lbnQuc2hvd1VwbG9hZERpYWxvZyhkYXRhKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY3JlYXRlRGF0YXNldCc6XHJcbiAgICAgICAgdGhpcy5tdnNDb21wb25lbnQuY3JlYXRlRGF0YXNldERpYWxvZyhkYXRhKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY2hhbmdlT3duZXJzJzpcclxuICAgICAgICB0aGlzLnVzc0NvbXBvbmVudC5zaG93T3duZXJEaWFsb2coZGF0YSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3RhZ0ZpbGUnOlxyXG4gICAgICAgIHRoaXMudXNzQ29tcG9uZW50LnNob3dUYWdnaW5nRGlhbG9nKGRhdGEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjaGFuZ2VQZXJtaXNzaW9ucyc6XHJcbiAgICAgICAgdGhpcy51c3NDb21wb25lbnQuc2hvd1Blcm1pc3Npb25zRGlhbG9nKGRhdGEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjcmVhdGVGaWxlJzpcclxuICAgICAgICB0aGlzLnVzc0NvbXBvbmVudC5zaG93Q3JlYXRlRmlsZURpYWxvZyhkYXRhKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICAvL2ludmFsaWQgdHlwZVxyXG4gICAgICAgIHRoaXMubG9nLndhcm4oYFVuc3VjY2Vzc2Z1bCBpbiBzcGF3bmluZyBtb2RhbCBmb3IgdHlwZTogYCwgdHlwZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKSBzZXQgdG9nZ2xlU2VhcmNoSW5wdXQodmFsdWU6IGFueSkge1xyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgIGlmICh2YWx1ZS5wYXRoLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudXNzQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICB0aGlzLnVzc0NvbXBvbmVudC50b2dnbGVTZWFyY2goKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKHRoaXMubXZzQ29tcG9uZW50KSB7XHJcbiAgICAgICAgICB0aGlzLm12c0NvbXBvbmVudC50b2dnbGVTZWFyY2goKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBJbnB1dCgpIHNlbGVjdFBhdGg6IHN0cmluZztcclxuICBASW5wdXQoKSBzdHlsZTogWmx1eEZpbGVUcmVlU3R5bGUgPSB7fTtcclxuICBASW5wdXQoKSBoZWFkZXJTdHlsZTogWmx1eEZpbGVUcmVlU3R5bGUgPSB7fTtcclxuICBASW5wdXQoKSBpbnB1dFN0eWxlOiBabHV4RmlsZVRyZWVTdHlsZSA9IHt9O1xyXG4gIEBJbnB1dCgpIHNlYXJjaFN0eWxlOiBabHV4RmlsZVRyZWVTdHlsZSA9IHt9O1xyXG4gIEBJbnB1dCgpIHRyZWVTdHlsZTogWmx1eEZpbGVUcmVlU3R5bGUgPSB7fTtcclxuICBASW5wdXQoKSB0aGVtZTogc3RyaW5nO1xyXG5cclxuICBAT3V0cHV0KCkgZmlsZU91dHB1dDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgbm9kZUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBub2RlRGJsQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG5ld0ZvbGRlckNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBmaWxlVXBsb2FkZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgLy8gQE91dHB1dCgpIG5ld0ZpbGVDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgY29weUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBkZWxldGVDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgdXNzUmVuYW1lRXZlbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGRhdGFzZXRTZWxlY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIHVzc1NlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgcGF0aENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGRhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSByaWdodENsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBvcGVuSW5OZXdUYWI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGNyZWF0ZURhdGFzZXQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgLy8gdmFyIG9iaiA9IHtcclxuICAgIC8vICAgXCJ1c3NJbnB1dFwiOiBcIlwiLFxyXG4gICAgLy8gICBcIm12c0lucHV0XCI6IFwiXCIsXHJcbiAgICAvLyAgIFwidXNzRGF0YVwiOiBbXSxcclxuICAgIC8vICAgXCJtdnNEYXRhXCI6IFtdXHJcbiAgICAvLyB9XHJcbiAgICAvLyB0aGlzLnBlcnNpc3RlbnREYXRhU2VydmljZS5zZXREYXRhKG9iailcclxuICAgIC8vICAgLnN1YnNjcmliZSgocmVzOiBhbnkpID0+IHsgfSk7XHJcbiAgICBzd2l0Y2ggKHRoaXMudGhlbWUpIHtcclxuICAgICAgY2FzZSAnY2FyYm9uJzoge1xyXG4gICAgICAgIHRoaXMuaGVhZGVyU3R5bGUgPSB7XHJcbiAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjM2Q3MGIyJyxcclxuICAgICAgICAgICdjb2xvcic6ICd3aGl0ZScsXHJcbiAgICAgICAgICAnd2lkdGgnOiAnOTkuNyUnLFxyXG4gICAgICAgICAgJ3RleHQtYWxpZ24nOiAncmlnaHQnXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmlucHV0U3R5bGUgPSB7XHJcbiAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjZWVlJyxcclxuICAgICAgICAgICdjb2xvcic6ICdibGFjaycsXHJcbiAgICAgICAgICAnYm9yZGVyJzogJzJweCBzb2xpZCAjM2Q3MGIyJyxcclxuICAgICAgICAgICdtYXJnaW4tdG9wJzogJzIwcHgnXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlYXJjaFN0eWxlID0ge1xyXG4gICAgICAgICAgJ21pbi13aWR0aCc6ICcyNTBweCcsXHJcbiAgICAgICAgICAnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgJ2hlaWdodCc6ICc0MHB4JyxcclxuICAgICAgICAgICd3aWR0aCc6ICc5MCUnLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMudHJlZVN0eWxlID0ge1xyXG4gICAgICAgICAgJ2NvbG9yJzogJyM2NDY0NjQnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zdHlsZSA9IHtcclxuICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGNEY3RkInLFxyXG4gICAgICAgICAgJ21hcmdpbi10b3AnOiAnMTBweCcsXHJcbiAgICAgICAgICAnbWF4LWhlaWdodCc6ICczMjBweCcsXHJcbiAgICAgICAgICAnb3ZlcmZsb3cteSc6ICdzY3JvbGwnLFxyXG4gICAgICAgICAgJ3BhZGRpbmcnOiAnMHB4JyxcclxuICAgICAgICAgICdtYXJnaW4tbGVmdCc6ICcwcHgnXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgIHRoaXMudHJlZVN0eWxlID0geyAnZmlsdGVyJzogJ2JyaWdodG5lc3MoMyknLCAnY29sb3InOiAnd2hpdGUnIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnN0IGZpbGVFeHBsb3Jlckdsb2JhbEVsZW1lbnQgPSB0aGlzLmZpbGVFeHBsb3Jlckdsb2JhbC5uYXRpdmVFbGVtZW50O1xyXG4gICAgdGhpcy5hcHBLZXlib2FyZC5yZWdpc3RlcktleVVwRXZlbnQoZmlsZUV4cGxvcmVyR2xvYmFsRWxlbWVudCk7XHJcbiAgICB0aGlzLmFwcEtleWJvYXJkLnJlZ2lzdGVyS2V5RG93bkV2ZW50KGZpbGVFeHBsb3Jlckdsb2JhbEVsZW1lbnQpO1xyXG4gICAgdGhpcy5rZXlCaW5kaW5nU3ViLmFkZCh0aGlzLmFwcEtleWJvYXJkLmtleWRvd25FdmVudFxyXG4gICAgICAuc3Vic2NyaWJlKChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gS2V5Q29kZS5LRVlfUCAmJiAhZXZlbnQuY3RybEtleSkge1xyXG4gICAgICAgICAgdGhpcy50b2dnbGVTZWFyY2goKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgLy8gbGV0IGRhdGFPYmplY3QgPSB7bXZzRGF0YTpBcnJheTxNdnNEYXRhT2JqZWN0PigpLCB1c3NEYXRhOkFycmF5PFVzc0RhdGFPYmplY3Q+KCl9O1xyXG4gICAgLy8gdGhpcy5wZXJzaXN0ZW50RGF0YVNlcnZpY2UuZ2V0RGF0YSgpXHJcbiAgICAvLyAgIC5zdWJzY3JpYmUoZGF0YSA9PiB7XHJcbiAgICAvLyAgICAgZGF0YU9iamVjdCA9IGRhdGEuY29udGVudHM7XHJcbiAgICAvLyAgICAgZGF0YU9iamVjdC5tdnNEYXRhID0gW107XHJcbiAgICAvLyAgICAgZGF0YU9iamVjdC51c3NEYXRhID0gW107XHJcbiAgICAvLyAgICAgLy9jb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShkYXRhT2JqZWN0KSlcclxuICAgIC8vICAgICB0aGlzLnBlcnNpc3RlbnREYXRhU2VydmljZS5zZXREYXRhKGRhdGFPYmplY3QpXHJcbiAgICAvLyAgICAgICAuc3Vic2NyaWJlKChyZXM6IGFueSkgPT4geyB9KTtcclxuICAgIC8vICAgfSlcclxuICB9XHJcblxyXG4gIG9uQ3JlYXRlRGF0YXNldCgkZXZlbnQpOiBhbnkge1xyXG4gICAgLy8gRXZlbnQgdG8gdGVsbCBpZiB0aGUgZGF0YXNldCBjcmVhdGlvbiBpcyBzdWNjZXNzZnVsIG9yIG5vdFxyXG4gICAgdGhpcy5jcmVhdGVEYXRhc2V0LmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIGRlbGV0ZUZpbGVPckZvbGRlcihwYXRoQW5kTmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnVzc0NvbXBvbmVudC5kZWxldGVGaWxlT3JGb2xkZXIocGF0aEFuZE5hbWUpO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlRGlyZWN0b3J5KHBhdGhBbmROYW1lPzogc3RyaW5nKSB7XHJcbiAgICBpZiAocGF0aEFuZE5hbWUpIHtcclxuICAgICAgdGhpcy51c3NDb21wb25lbnQuc2hvd0NyZWF0ZUZvbGRlckRpYWxvZyhwYXRoQW5kTmFtZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnVzc0NvbXBvbmVudC5zaG93Q3JlYXRlRm9sZGVyRGlhbG9nKHRoaXMudXNzQ29tcG9uZW50LmdldFNlbGVjdGVkUGF0aCgpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldEFjdGl2ZURpcmVjdG9yeSgpOiBzdHJpbmcge1xyXG4gICAgaWYgKHRoaXMuY3VycmVudEluZGV4ID09IDApIHtcclxuICAgICAgcmV0dXJuIHRoaXMudXNzQ29tcG9uZW50LmdldFNlbGVjdGVkUGF0aCgpO1xyXG4gICAgfSBlbHNlIHsgLy9EYXRhc2V0cyBkbyBub3QgeWV0IGhhdmUgYW4gYWN0aXZlIGRpcmVjdG9yeSBjb250ZXh0XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaGlkZUV4cGxvcmVycygpIHtcclxuICAgIGlmICh0aGlzLnVzc0NvbXBvbmVudCkge1xyXG4gICAgICB0aGlzLnVzc0NvbXBvbmVudC5oaWRlRXhwbG9yZXIgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMubXZzQ29tcG9uZW50KSB7XHJcbiAgICAgIHRoaXMubXZzQ29tcG9uZW50LmhpZGVFeHBsb3JlciA9IHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB0b2dnbGVTZWFyY2goKSB7XHJcbiAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPT0gMCkge1xyXG4gICAgICB0aGlzLnVzc0NvbXBvbmVudC50b2dnbGVTZWFyY2goKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMubXZzQ29tcG9uZW50LnRvZ2dsZVNlYXJjaCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZGlzcGxheVVwQXJyb3coc2hvdzogYm9vbGVhbikge1xyXG4gICAgdGhpcy5zaG93VXBBcnJvdyA9IHNob3c7XHJcbiAgfVxyXG5cclxuICBvbkNvcHlDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgdGhpcy5jb3B5Q2xpY2suZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25EZWxldGVDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgdGhpcy5kZWxldGVDbGljay5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvblVTU1JlbmFtZUV2ZW50KCRldmVudDogYW55KSB7XHJcbiAgICB0aGlzLnVzc1JlbmFtZUV2ZW50LmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIC8vIG9uTmV3RmlsZUNsaWNrKCRldmVudDphbnkpe1xyXG4gIC8vICAgdGhpcy5uZXdGaWxlQ2xpY2suZW1pdCgkZXZlbnQpO1xyXG4gIC8vIH1cclxuXHJcbiAgb25OZXdGb2xkZXJDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgdGhpcy5uZXdGb2xkZXJDbGljay5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvbkZpbGVVcGxvYWRlZCgkZXZlbnQ6IGFueSkge1xyXG4gICAgdGhpcy5maWxlVXBsb2FkZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25Ob2RlQ2xpY2soJGV2ZW50OiBhbnkpIHtcclxuICAgIHRoaXMubm9kZUNsaWNrLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIG9uTm9kZURibENsaWNrKCRldmVudDogYW55KSB7XHJcbiAgICB0aGlzLm5vZGVEYmxDbGljay5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvblBhdGhDaGFuZ2VkKCRldmVudDogYW55KSB7XHJcbiAgICB0aGlzLnBhdGhDaGFuZ2VkLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIG9uRGF0YUNoYW5nZWQoJGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuZGF0YUNoYW5nZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25SaWdodENsaWNrKCRldmVudDogYW55KSB7XHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2suZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25PcGVuSW5OZXdUYWIoJGV2ZW50OiBhbnkpIHtcclxuICAgIHRoaXMub3BlbkluTmV3VGFiLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIC8vIG9uVXNzRmlsZUxvYWQoJGV2ZW50OkZpbGVDb250ZW50cyl7XHJcbiAgLy8gICB0aGlzLmZpbGVPdXRwdXQuZW1pdCgkZXZlbnQpO1xyXG4gIC8vIH1cclxuXHJcbiAgcHJvdmlkZVpMVVhEaXNwYXRjaGVyQ2FsbGJhY2tzKCk6IFpMVVguQXBwbGljYXRpb25DYWxsYmFja3Mge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgb25NZXNzYWdlOiAoZXZlbnRDb250ZXh0OiBhbnkpOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnpsdXhPbk1lc3NhZ2UoZXZlbnRDb250ZXh0KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0SW5kZXgoaW5wdXRJbmRleDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9IGlucHV0SW5kZXg7XHJcbiAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPT0gMCkge1xyXG4gICAgICB0aGlzLnVzc1NlbGVjdC5lbWl0KCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmRhdGFzZXRTZWxlY3QuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2hvd0RhdGFzZXRzKCkge1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAxO1xyXG4gICAgaWYgKHRoaXMubXZzQ29tcG9uZW50KSB7XHJcbiAgICAgIHRoaXMubXZzQ29tcG9uZW50LmhpZGVFeHBsb3JlciA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2hvd1VzcygpIHtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcclxuICAgIGlmICh0aGlzLnVzc0NvbXBvbmVudCkge1xyXG4gICAgICB0aGlzLnVzc0NvbXBvbmVudC5oaWRlRXhwbG9yZXIgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNwYXduVXBsb2FkTW9kYWwoKSB7XHJcbiAgICBpZiAodGhpcy51c3NDb21wb25lbnQpIHtcclxuICAgICAgdGhpcy51c3NDb21wb25lbnQuc2hvd1VwbG9hZERpYWxvZyhudWxsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIC4uLiBEaXNhYmxlZCBmb3IgRFMgbW9kZSBmb3Igbm93XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVEaXJlY3RvcnkoZGlyTmFtZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnNob3dVc3MoKTtcclxuICAgIHRoaXMudXNzQ29tcG9uZW50LnVwZGF0ZVVzcyhkaXJOYW1lKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZURTTGlzdChxdWVyeTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnNob3dEYXRhc2V0cygpO1xyXG4gICAgdGhpcy5tdnNDb21wb25lbnQuc2V0UGF0aChxdWVyeSk7XHJcbiAgICB0aGlzLm12c0NvbXBvbmVudC51cGRhdGVUcmVlVmlldyhxdWVyeSk7XHJcbiAgfVxyXG5cclxuICByZWZyZXNoRmlsZU1ldGFkYXRkYUJ5UGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiB0aGlzLnVzc0NvbXBvbmVudC5yZWZyZXNoRmlsZU1ldGFkYXRkYVVzaW5nUGF0aChwYXRoKTtcclxuICB9XHJcblxyXG4gIHpsdXhPbk1lc3NhZ2UoZXZlbnRDb250ZXh0OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcblxyXG4gICAgICBpZiAoIWV2ZW50Q29udGV4dCB8fCAhZXZlbnRDb250ZXh0LmFjdGlvbikge1xyXG4gICAgICAgIHJldHVybiByZWplY3QoJ0V2ZW50IGNvbnRleHQgbWlzc2luZyBvciBtYWxmb3JtZWQnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZXZlbnRDb250ZXh0LmFjdGlvbiA9PT0gJ3NhdmUtZmlsZScpIHtcclxuICAgICAgICAvLyBUaGlzIGlzIG5vIGxvbmdlciBuZWVkZWQgYXMgRWRpdG9yIHRha2VzIG92ZXIgYW55IGZpbGUgZWRpdC9jb250ZXh0IGZ1bmN0aW9ucy5cclxuICAgICAgICAvLyB0aGlzLnBhcmVudFVzc0VkaXQgPSBldmVudENvbnRleHQ7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJwYXJlbnRVc3NFZGl0OlwiICsgdGhpcy5wYXJlbnRVc3NFZGl0KVxyXG4gICAgICAgIC8vVE9ETzp0aHJvdyB0aGlzIGRvd24gdG8gRmlsZUJyb3dzZXJVU1NDb21wb25lbnRcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gZWxzZSBpZiAoZXZlbnRDb250ZXh0LmFjdGlvbiA9PT0gJ29wZW4tZmlsZScpe1xyXG4gICAgICAvLyAgIGlmICghZXZlbnRDb250ZXh0LmZpbGVQYXRoIHx8ICFldmVudENvbnRleHQuZmlsZU5hbWUgfHwgIWV2ZW50Q29udGV4dC5maWxlQ29udGVudHMpIHtcclxuICAgICAgLy8gICAgIHJldHVybiByZWplY3QoJ0V2ZW50IGNvbnRleHQgbWlzc2luZyBvciBtYWxmb3JtZWQnKTtcclxuICAgICAgLy8gICB9XHJcbiAgICAgIC8vICAgdGhpcy5pbml0TW9uYWNvKGV2ZW50Q29udGV4dCk7XHJcbiAgICAgIC8vIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBabHV4RmlsZVRyZWVTdHlsZSB7IC8vVE9ETzogV2UgY2FuIHNwZWNpZnkgd2hpY2ggVUkgdGhpbmdzIGNhbi9jYW5ub3QgYmUgY2hhbmdlZC5cclxufSAvLyBGb3IgdGhlIHNha2Ugb2YgY3VzdG9taXplYWJpbGl0eSwgSSBkb24ndCBzZWUgd2h5IHRoZXJlIHNob3VsZCBiZSByZXN0cmljdGlvbnMgYXQgdGhlIG1vbWVudC5cclxuXHJcblxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuIiwiPCEtLVxyXG5UaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG5tYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG50aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuXHJcblNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcblxyXG5Db3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbi0tPlxyXG5cclxuPGRpdiBjbGFzcz1cImZpbGVleHBsb3Jlci1nbG9iYWxcIiAjZmlsZUV4cGxvcmVyR2xvYmFsPlxyXG4gIDxuYXYgZGF0YS10YWJzIGNsYXNzPVwiZmlsZWV4cGxvcmVyLXRhYnNcIiByb2xlPVwibmF2aWdhdGlvblwiPlxyXG4gICAgPGRpdiBjbGFzcz1cImZpbGVleHBsb3Jlci10YWJzLXRyaWdnZXJcIiB0YWJpbmRleD1cIi0xXCI+XHJcbiAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImJ4LS10YWJzLXRyaWdnZXItdGV4dFwiIHRhYmluZGV4PVwiLTFcIj48L2E+XHJcblxyXG4gICAgPC9kaXY+XHJcbiAgICA8dWwgY2xhc3M9XCJmaWxlZXhwbG9yZXItdGFicy1saXN0XCIgcm9sZT1cInRhYmxpc3RcIiBbbmdTdHlsZV09XCJoZWFkZXJTdHlsZVwiPlxyXG4gICAgICBAZm9yICh0YWIgb2YgdGFiczsgdHJhY2sgdGFiKSB7XHJcbiAgICAgIDxsaSBbbmdDbGFzc109XCJ0YWIuaW5kZXggPT0gY3VycmVudEluZGV4ID8gJ2ZpbGVleHBsb3Jlci10YWItc2VsZWN0ZWQnIDogJ2ZpbGVleHBsb3Jlci10YWInXCJcclxuICAgICAgICAoY2xpY2spPVwic2V0SW5kZXgodGFiLmluZGV4KVwiIGlkPVwidGFiLXt7dGFiLmluZGV4fX1cIiByb2xlPVwicHJlc2VudGF0aW9uXCIgW25nU3R5bGVdPVwiaGVhZGVyU3R5bGVcIlxyXG4gICAgICAgIGNsYXNzPVwiYngtLXRhYnNfX25hdi1pdGVtXCI+XHJcbiAgICAgICAgPGEgY2xhc3M9XCJmaWxlZXhwbG9yZXItdGFicy10ZXh0XCIgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIHJvbGU9XCJ0YWJcIiBhcmlhLXNlbGVjdGVkPVwiZmFsc2VcIlxyXG4gICAgICAgICAgW25nU3R5bGVdPVwiaGVhZGVyU3R5bGVcIj57e3RhYi5uYW1lfX08L2E+XHJcbiAgICAgIDwvbGk+XHJcbiAgICAgIH1cclxuICAgIDwvdWw+XHJcbiAgPC9uYXY+XHJcbiAgPGRpdiBjbGFzcz1cImZpbGVleHBsb3Jlci1icm93c2VyLW1vZHVsZVwiIFtuZ1N0eWxlXT1cInN0eWxlXCI+XHJcbiAgICA8ZmlsZS1icm93c2VyLXVzcyAjdXNzQ29tcG9uZW50IFtoaWRkZW5dPVwiY3VycmVudEluZGV4ICE9IDBcIiAobm9kZUNsaWNrKT1cIm9uTm9kZUNsaWNrKCRldmVudClcIlxyXG4gICAgICAobm9kZURibENsaWNrKT1cIm9uTm9kZURibENsaWNrKCRldmVudClcIiAob3BlbkluTmV3VGFiKT1cIm9uT3BlbkluTmV3VGFiKCRldmVudClcIlxyXG4gICAgICAobmV3Rm9sZGVyQ2xpY2spPVwib25OZXdGb2xkZXJDbGljaygkZXZlbnQpXCIgKGZpbGVVcGxvYWRlZCk9XCJvbkZpbGVVcGxvYWRlZCgkZXZlbnQpXCJcclxuICAgICAgKGRlbGV0ZUNsaWNrKT1cIm9uRGVsZXRlQ2xpY2soJGV2ZW50KVwiICh1c3NSZW5hbWVFdmVudCk9XCJvblVTU1JlbmFtZUV2ZW50KCRldmVudClcIlxyXG4gICAgICAoY29weUNsaWNrKT1cIm9uQ29weUNsaWNrKCRldmVudClcIiAocmlnaHRDbGljayk9XCJvblJpZ2h0Q2xpY2soJGV2ZW50KVwiIChwYXRoQ2hhbmdlZCk9XCJvblBhdGhDaGFuZ2VkKCRldmVudClcIlxyXG4gICAgICAoZGF0YUNoYW5nZWQpPVwib25EYXRhQ2hhbmdlZCgkZXZlbnQpXCIgW3N0eWxlXT1cInN0eWxlXCIgW2lucHV0U3R5bGVdPVwiaW5wdXRTdHlsZVwiIFt0cmVlU3R5bGVdPVwidHJlZVN0eWxlXCJcclxuICAgICAgW3NlYXJjaFN0eWxlXT1cInNlYXJjaFN0eWxlXCIgW3Nob3dVcEFycm93XT1cInNob3dVcEFycm93XCI+PC9maWxlLWJyb3dzZXItdXNzPlxyXG4gICAgPGZpbGUtYnJvd3Nlci1tdnMgI212c0NvbXBvbmVudCBbaGlkZGVuXT1cImN1cnJlbnRJbmRleCAhPSAxXCIgKG5vZGVDbGljayk9XCJvbk5vZGVDbGljaygkZXZlbnQpXCJcclxuICAgICAgKG5vZGVEYmxDbGljayk9XCJvbk5vZGVEYmxDbGljaygkZXZlbnQpXCIgKG9wZW5Jbk5ld1RhYik9XCJvbk9wZW5Jbk5ld1RhYigkZXZlbnQpXCJcclxuICAgICAgKGRlbGV0ZUNsaWNrKT1cIm9uRGVsZXRlQ2xpY2soJGV2ZW50KVwiIChyaWdodENsaWNrKT1cIm9uUmlnaHRDbGljaygkZXZlbnQpXCIgKHBhdGhDaGFuZ2VkKT1cIm9uUGF0aENoYW5nZWQoJGV2ZW50KVwiXHJcbiAgICAgIChkYXRhQ2hhbmdlZCk9XCJvbkRhdGFDaGFuZ2VkKCRldmVudClcIiAoY3JlYXRlRGF0YXNldCk9XCJvbkNyZWF0ZURhdGFzZXQoJGV2ZW50KVwiIFtpbnB1dFN0eWxlXT1cImlucHV0U3R5bGVcIlxyXG4gICAgICBbdHJlZVN0eWxlXT1cInRyZWVTdHlsZVwiIFtzZWFyY2hTdHlsZV09XCJzZWFyY2hTdHlsZVwiIFtzdHlsZV09XCJzdHlsZVwiXHJcbiAgICAgIFtzaG93VXBBcnJvd109XCJzaG93VXBBcnJvd1wiPjwvZmlsZS1icm93c2VyLW12cz5cclxuICA8L2Rpdj5cclxuPC9kaXY+XHJcblxyXG48IS0tXHJcblRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbm1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbnRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG5cclxuU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuXHJcbjwhLS1cclxuVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxubWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxudGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcblxyXG5TUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG5cclxuQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4tLT4iXX0=