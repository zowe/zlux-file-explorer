

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit,
  Output, ViewEncapsulation, Inject, Optional, ViewChild
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
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
import { MatDialog, MatDialogConfig, MatSnackBar, MatDialogRef } from '@angular/material';
import { FilePropertiesModal } from '../file-properties-modal/file-properties-modal.component';
import { DeleteFileModal } from '../delete-file-modal/delete-file-modal.component';
import { CreateFolderModal } from '../create-folder-modal/create-folder-modal.component';
import { MessageDuration } from '../../shared/message-duration';
import { FilePermissionsModal } from '../file-permissions-modal/file-permissions-modal.component';
import { FileOwnershipModal } from '../file-ownership-modal/file-ownership-modal.component';
import { FileTaggingModal } from '../file-tagging-modal/file-tagging-modal.component';
import { defaultSnackbarOptions, longSnackbarOptions } from '../../shared/snackbar-options';

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

  private errorMessage: String;
  private selectedItem: string;
  private path: string;
  private root: string;
  private newPath: string;
  private rightClickedFile: any;
  private lastRightClickEvent: any;
  public isLoading: boolean;
  private rightClickPropertiesFile: ContextMenuItem[];
  private rightClickPropertiesFolder: ContextMenuItem[];
  private rightClickPropertiesPanel: ContextMenuItem[];
  private deletionQueue = new Map();
  private fileToCopyOrCut: any;

  //TODO:define interface types for uss-data/data
  private data: TreeNode[];
  private dataObject: UssDataObject;
  private ussData: Observable<any>;
  private intervalId: any;
  private updateInterval: number = 10000;//time represents in ms how fast tree updates changes from mainframe
  @ViewChild('fileExplorerUSSInput') fileExplorerUSSInput: ElementRef;

  constructor(private elementRef: ElementRef, 
    private ussSrv: UssCrudService,
    private utils: UtilsService, 
    /*private persistentDataService: PersistentDataService,*/
    private ussSearchHistory:SearchHistoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger,
    @Inject(Angular2InjectionTokens.PLUGIN_DEFINITION) private pluginDefinition: ZLUX.ContainerPluginDefinition,
    @Optional() @Inject(Angular2InjectionTokens.WINDOW_ACTIONS) private windowActions: Angular2PluginWindowActions) {
      //this.componentClass = ComponentClass.FileBrowser;
      this.initalizeCapabilities();
      this.ussSearchHistory.onInit('uss');
      this.root = "/"; // Dev purposes: Replace with home directory to test Explorer functionalities
      this.path = this.root;
      this.data = []; // Main treeData array (the nodes the Explorer displays)
      this.hideExplorer = false;
      this.isLoading = false;
  }

  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeDblClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeRightClick: EventEmitter<any> = new EventEmitter<any>();
  // @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFolderClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() copyClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() ussRenameEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() rightClick: EventEmitter<any> = new EventEmitter<any>();

  @Input() inputStyle: any;
  @Input() searchStyle: any;
  @Input() treeStyle: any;
  @Input() showUpArrow: boolean;
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
          }else{
            this.path = '/';
          }
          this.displayTree(this.path, true);
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.errorMessage = <any>error;
        }
      );
    setTimeout(() => {
      this.isLoading = false;
      subscription.unsubscribe();
    }, 2000);
  }

  initalizeCapabilities() {
  //   //this.capabilities = new Array<Capability>();
  //   //this.capabilities.push(FileBrowserCapabilities.FileBrowser);
  //   //this.capabilities.push(FileBrowserCapabilities.FileBrowserUSS);
  }

  initializeRightClickProperties() {
    this.rightClickPropertiesFile = [
      { text: "Change Mode/Permissions...", action:() => {
        this.showPermissionsDialog(this.rightClickedFile) }},
      { text: "Change Owners...", action:() => { 
        this.showOwnerDialog(this.rightClickedFile) }},
      { text: "Tag...", action:() => { 
        this.showTaggingDialog(this.rightClickedFile) }},
      { text: "Cut", action:() => { 
        this.cutFile(this.rightClickedFile)
      }},
      { text: "Copy", action:() => { 
        this.copyFile(this.rightClickedFile)
      }},
      { text: "Delete", action:() => { 
        this.showDeleteDialog(this.rightClickedFile);
      }},
      { text: "Rename", action:() => {
        this.showRenameField(this.rightClickedFile) }},
      { text: "Properties", action:() => { 
        this.showPropertiesDialog(this.rightClickedFile) }},
    ];

    this.rightClickPropertiesFolder = [
      { text: "Change Mode/Permissions...", action:() => {
        this.showPermissionsDialog(this.rightClickedFile) }},
      { text: "Change Owners...", action:() => {
        this.showOwnerDialog(this.rightClickedFile) }},
      { text: "Tag Directory...", action:() => { 
        this.showTaggingDialog(this.rightClickedFile) }},
      { text: "Create a Directory...", action:() => { 
        this.showCreateFolderDialog(this.rightClickedFile);
      }},
      { text: "Delete", action:() => { 
        this.showDeleteDialog(this.rightClickedFile); }},
      { text: "Rename", action:() => {
        this.showRenameField(this.rightClickedFile) }},
      { text: "Properties", action:() => { 
        this.showPropertiesDialog(this.rightClickedFile) }}
    ];

    this.rightClickPropertiesPanel = [
      { text: "Create a Directory...", action:() => { 
        let nodeToUse = {
          path: this.path,
        }
        this.showCreateFolderDialog(nodeToUse);
        
      }}
    ];
  }

  copyFile(rightClickedFile: any) {
    this.log.debug(`copyfile for  ${this.fileToCopyOrCut}, ${this.rightClickedFile.path}, ${this.path}`);
    if (this.fileToCopyOrCut == null) {
      this.rightClickPropertiesFolder.push( // Create a paste option for the folder
        { text: "Paste", action:() => { 
          this.pasteFile(this.fileToCopyOrCut, this.rightClickedFile.path, false)
        }}
      );
      this.rightClickPropertiesPanel.push( // Create a paste option for the active directory
        { text: "Paste", action:() => { 
          this.pasteFile(this.fileToCopyOrCut, this.path, false)
        }}
      );
    }
    this.fileToCopyOrCut = rightClickedFile;
    this.copyClick.emit(rightClickedFile);
  }

  cutFile(rightClickedFile: any) {
    if (this.fileToCopyOrCut) {
      this.rightClickPropertiesFolder.splice(this.rightClickPropertiesFolder.map(item => item.text).indexOf("Paste"),1);
      this.rightClickPropertiesPanel.splice(this.rightClickPropertiesPanel.map(item => item.text).indexOf("Paste"),1);
    }
    this.log.debug(`cutfile for  ${this.fileToCopyOrCut}, ${this.rightClickedFile.path}, ${this.path}`);
    this.rightClickPropertiesFolder.push( // Create a paste option for the folder
      { text: "Paste", action:() => { 
        this.pasteFile(this.fileToCopyOrCut, this.rightClickedFile.path, true)
      }}
    );
    this.rightClickPropertiesPanel.push( // Create a paste option for the active directory
      { text: "Paste", action:() => { 
        this.pasteFile(this.fileToCopyOrCut, this.path, true)
      }}
    );
    this.fileToCopyOrCut = rightClickedFile;
    this.copyClick.emit(rightClickedFile);
  }

  pasteFile(fileNode: any, destinationPath: any, isCut: boolean) {
    let pathAndName = fileNode.path;
    let name = this.getNameFromPathAndName(pathAndName);
    this.log.debug(`paste for ${name}, ${destinationPath}, and cut=${isCut}`);
    if(this.getPathFromPathAndName(pathAndName) == destinationPath){
      this.snackBar.open("Paste failed: '" + pathAndName + "' Cannot paste file to same destination.",
        'Dismiss', defaultSnackbarOptions);
      return;
    }
    if(pathAndName.indexOf(' ') >= 0){
      this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for filenames with spaces.",
        'Dismiss', defaultSnackbarOptions);
      return;
    }
    let metaData = this.ussSrv.getFileMetadata(pathAndName);
    metaData.subscribe(result => {
      if(result.ccsid == -1){
        this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for this encoding.", 
          'Dismiss', defaultSnackbarOptions);
        return;
      }else{
        this.isLoading = true;
        let copySubscription = this.ussSrv.copyFile(pathAndName,destinationPath + "/" + name)
        .subscribe(
          resp => {
            if (this.rightClickedFile) {
              if (this.rightClickedFile.children && this.rightClickedFile.children.length > 0) {
                let expanded = this.rightClickedFile.expanded;
                /* We recycle the same method used for opening (clicking on) a node. But instead of expanding it, 
                we keep the same expanded state, and just use it to add a node */
                this.addChild(this.rightClickedFile, true);
                this.rightClickedFile.expanded = expanded;
              } else if (this.path == destinationPath) {
                /* In the case that we right click to paste on the active directory instead of a node, we update our tree
                (active directory) instead of adding onto a specific node */
                this.displayTree(this.path, true);
              }
            }
            if(isCut){
              /* Clear the paste option, because even if delete fails after, we have already done the copy */
              this.isLoading = true;
              this.fileToCopyOrCut = null;
              this.rightClickPropertiesFolder.splice(this.rightClickPropertiesFolder.map(item => item.text).indexOf("Paste"),1);
              this.rightClickPropertiesPanel.splice(this.rightClickPropertiesPanel.map(item => item.text).indexOf("Paste"),1);
          
              /* Delete (cut) portion */ 
              this.ussSrv.deleteFileOrFolder(pathAndName)
              .subscribe(
                resp => {
                  this.isLoading = false;
                  this.removeChild(fileNode);
                  this.snackBar.open('Paste successful: ' + name,'Dismiss', defaultSnackbarOptions);
                },
                error => {
                  if (error.status == '500') { //Internal Server Error
                    this.snackBar.open("Copied successfully, but failed to cut '" + pathAndName + "' Server returned with: " + error._body, 
                      'Dismiss', longSnackbarOptions);
                  } else if (error.status == '404') { //Not Found
                    this.snackBar.open("Copied successfully, but '" + pathAndName + "' has already been deleted or does not exist.", 
                      'Dismiss', defaultSnackbarOptions);
                    this.removeChild(fileNode);
                  } else if (error.status == '400') { //Bad Request
                    this.snackBar.open("Copied successfully but failed to cut '" + pathAndName + "' This is probably due to a permission problem.", 
                      'Dismiss', defaultSnackbarOptions);
                  } else { //Unknown
                    this.snackBar.open("Copied successfully, but unknown error cutting '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 
                      'Dismiss', longSnackbarOptions);
                  }
                  this.isLoading = false;
                  this.errorMessage = <any>error;
                }
              );
            }else{
              this.isLoading = false;
              this.snackBar.open('Paste successful: ' + name,'Dismiss', defaultSnackbarOptions);
            }
          },
          error => {
              if (error.status == '500') { //Internal Server Error
                this.snackBar.open("Paste failed: HTTP 500 from app-server or agent occurred for '" + pathAndName + "'. Server returned with: " + error._body, 
                'Dismiss', longSnackbarOptions);
              } else if (error.status == '404') { //Not Found
                this.snackBar.open("Paste failed: '" + pathAndName + "' does not exist.", 
                'Dismiss', defaultSnackbarOptions);
              } else if (error.status == '400') { //Bad Request
                this.snackBar.open("Paste failed: HTTP 400 occurred for '" + pathAndName + "'. Check that you have correct permissions for this action.", 
                'Dismiss', defaultSnackbarOptions);
              } else { //Unknown
                this.snackBar.open("Paste failed: '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 
                'Dismiss', longSnackbarOptions);
              }
              this.isLoading = false;
              this.errorMessage = <any>error;
          }
        );

        setTimeout(() => {
          if (copySubscription.closed == false) {
            this.snackBar.open('Pasting ' + pathAndName + '... Larger payloads may take longer. Please be patient.', 
              'Dismiss', defaultSnackbarOptions);
          }
        }, 4000);
      }
    },
    error => {
        if (error.status == '404') { // This happens when user attempts to paste a file that's been deleted after copying
          this.snackBar.open("Paste failed: '" + pathAndName + "' does not exist.", 
            'Dismiss', defaultSnackbarOptions);
        }
        this.isLoading = false;
        this.errorMessage = <any>error;
    });
  }

  showPropertiesDialog(rightClickedFile: any) {
    const filePropConfig = new MatDialogConfig();
    filePropConfig.data = {
      event: rightClickedFile
    }
    filePropConfig.maxWidth = '350px';

    this.dialog.open(FilePropertiesModal, filePropConfig);
  }

  showRenameField(file: any) {
    const selectedNode = this.lastRightClickEvent.originalEvent.srcElement;
    let oldName = file.name;
    let oldPath = file.path;
    file.selectable = false;
    let renameFn = (node: HTMLElement) => {
      renameField.parentNode.replaceChild(node, renameField);
      file.selectable = true;
      let nameFromNode = renameField.value;
      let pathForRename:any;
      pathForRename = (oldPath as String).split("/");
      pathForRename.pop();
      pathForRename = pathForRename.join('/');
      if(oldName != nameFromNode){
        let newPath = `${pathForRename}/${nameFromNode}`;
        this.ussSrv.renameFile(oldPath, newPath).subscribe(
          res => {
            this.snackBar.open(`Renamed: ${oldName} to ${nameFromNode}`,
              'Dismiss', defaultSnackbarOptions);
            this.updateUss(this.path);
            this.ussRenameEvent.emit(this.lastRightClickEvent.node); 
            file.label = nameFromNode;
            file.path = newPath;
            file.name = nameFromNode;
            //this.updateUss(this.path);
            return;
          },
          error => {
            if (error.status == '500') { //Internal Server Error
              this.snackBar.open('Failed to rename ' + file.path + "'. Error: " + error._body, 
              'Dismiss', longSnackbarOptions);
            } else if (error.status == '404') { //Not Found
              this.snackBar.open(file.path + ' could not be opened or does not exist.', 
              'Dismiss', defaultSnackbarOptions);
            } else { //Unknown
              this.snackBar.open("Unknown error for '" + file.path + "'. " + error.status + " - " + error._body, 
              'Dismiss', longSnackbarOptions);
            }
            this.errorMessage = <any>error;
            return;
          }
        );
      }
    }
    var renameField = document.createElement("input");
    renameField.setAttribute('id', 'renameHighlightedField');
    renameField.value = oldName;
    renameField.style.width = (selectedNode as HTMLElement).style.width;
    renameField.style.height = (selectedNode as HTMLElement).style.height;
    let rnNode = (e) => {
      if(e.which == 13 || e.key == "Enter" || e.keyCode == 13){
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;
        renameField.blur();
        return;
      }
    }
    renameField.addEventListener('keydown', rnNode);
    renameField.onblur = function(e) {
      renameFn(selectedNode)
    };
    selectedNode.parentNode.replaceChild(renameField, selectedNode);
    renameField.focus();
    renameField.select();
  }

  showPermissionsDialog(rightClickedFile: any) {
    const filePropConfig = new MatDialogConfig();
    filePropConfig.data = {
      event: rightClickedFile
    }
    filePropConfig.maxWidth = '400px';

    this.dialog.open(FilePermissionsModal, filePropConfig);
  }

  showOwnerDialog(rightClickedFile: any) {
    const filePropConfig = new MatDialogConfig();
    filePropConfig.data = {
      event: rightClickedFile
    }
    filePropConfig.maxWidth = '400px';

    this.dialog.open(FileOwnershipModal, filePropConfig);
  }

  showDeleteDialog(rightClickedFile: any) {
    if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "This is already being deleted.") == true) {
      return;
    }

    const fileDeleteConfig = new MatDialogConfig();
    fileDeleteConfig.data = {
      event: rightClickedFile,
      width: '600px'
    }

    let fileDeleteRef:MatDialogRef<DeleteFileModal> = this.dialog.open(DeleteFileModal, fileDeleteConfig);
    const deleteFileOrFolder = fileDeleteRef.componentInstance.onDelete.subscribe(() => {
      this.deleteFileOrFolder(rightClickedFile);
      this.deleteClick.emit(this.lastRightClickEvent.node);
    });
  }

  showCreateFolderDialog(rightClickedFile: any) {
    if (rightClickedFile.path) { // If this came from a node object
      if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "Cannot create a directory inside a directory queued for deletion.") == true) {
        return;
      }  
    } else { // Or if this is just a path
      if (this.checkIfInDeletionQueueAndMessage(rightClickedFile, "Cannot create a directory inside a directory queued for deletion.") == true) {
        return;
      }
    }

    const folderCreateConfig = new MatDialogConfig();
    folderCreateConfig.data = {
      event: rightClickedFile,
      width: '600px'
    }

    let fileDeleteRef:MatDialogRef<CreateFolderModal>  = this.dialog.open(CreateFolderModal, folderCreateConfig);
    const createFolder = fileDeleteRef.componentInstance.onCreate.subscribe(onCreateResponse => {
      /* pathAndName - Path and name obtained from create folder prompt
      updateExistingTree - Should the existing tree update or fetch a new one */
      this.createFolder(onCreateResponse.get("pathAndName"), rightClickedFile, onCreateResponse.get("updateExistingTree"));
      this.newFolderClick.emit(this.lastRightClickEvent.node);
    });
  }
  
  showTaggingDialog(rightClickedFile: any) {
    const config = new MatDialogConfig();
    config.data = {
      node: rightClickedFile
    }
    config.maxWidth = '450px';
    const dialogRef = this.dialog.open(FileTaggingModal, config);
    dialogRef.afterClosed().subscribe((res?: boolean) => {
      if (res) {
        this.addChild(rightClickedFile, true);
      }
    });
  }

  // onNewFileClick($event: any): void {
  //   this.newFileClick.emit($event);
  // }
  
  onNodeClick($event: any): void {
    this.path = this.path.replace(/\/$/, '');

    if ($event.node.data === 'Folder') {
      if (this.checkIfInDeletionQueueAndMessage($event.node.path, "Cannot open a directory queued for deletion.") == true) {
        return;
      } 
      this.addChild($event.node);
      this.nodeClick.emit($event.node);
    }
    else {
      if (this.checkIfInDeletionQueueAndMessage($event.node.path, "Cannot open a file queued for deletion.") == true) {
        return;
      } 
      this.nodeClick.emit($event.node);
    }
  }

  onNodeDblClick($event: any): void {
    let updateTree = false; // A double click drills into a folder, so we make a fresh query instead of update
    this.displayTree($event.node.path, updateTree);
    this.nodeDblClick.emit($event.node);
  }

  onNodeRightClick($event: any) {
    let node = $event.node;
    let rightClickProperties;

    if (node.directory) {
      rightClickProperties = this.rightClickPropertiesFolder;
    } else {
      rightClickProperties = this.rightClickPropertiesFile;
    }
     
    if (this.windowActions) {
      let didContextMenuSpawn = this.windowActions.spawnContextMenu($event.originalEvent.clientX, $event.originalEvent.clientY, rightClickProperties, true);
      // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
      if (!didContextMenuSpawn) { // If context menu failed to spawn...
        let heightAdjustment = $event.originalEvent.clientY - 25; // Bump it up 25px
        didContextMenuSpawn = this.windowActions.spawnContextMenu($event.originalEvent.clientX, heightAdjustment, rightClickProperties, true);
      }
    }

    this.rightClickedFile = node;
    this.lastRightClickEvent = $event;
    this.rightClick.emit($event.node);
    $event.originalEvent.preventDefault(); 
  }

  onPanelRightClick($event: any) {
    if (this.windowActions) {
      let didContextMenuSpawn = this.windowActions.spawnContextMenu($event.clientX, $event.clientY, this.rightClickPropertiesPanel, true);
      // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
      if (!didContextMenuSpawn) { // If context menu failed to spawn...
        let heightAdjustment = $event.clientY - 25; // Bump it up 25px
        didContextMenuSpawn = this.windowActions.spawnContextMenu($event.clientX, heightAdjustment, this.rightClickPropertiesPanel, true);
      }
    }
  }

  onPathChanged($event: any): void {
    this.pathChanged.emit($event);
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
    if (path === undefined || path === '') {
      path = this.root; 
    }
    if (path === '') {
      this.log.warn("Please enter a valid path. For example: '/'");
      this.data = [];
      return;
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
          else if (dataArray[indexArray[indexArray.length-1]] !== undefined && dataArray[indexArray[indexArray.length-1]].data == 'Folder' 
          && dataArray[indexArray[indexArray.length-1]].children !== undefined && dataArray[indexArray[indexArray.length-1]].children.length !== 0)
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
      this.onPathChanged(this.path);

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
        if (error.status == '403') { //Permission denied
          this.snackBar.open('Failed to open: Permission denied.', 
          'Dismiss', { duration: MessageDuration.Medium, panelClass: 'center' });
        }
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


  //Adds children to the existing this.data TreeNode array to update tree
  addChild(node: any, force?: boolean): void {
    let path = node.path;
    if (node.children && node.children.length > 0 && !force) 
    {
      //If an opened node has children, and the user clicked on it...
      if (node.expanded) {
        node.expanded = false;
      }
      //If a closed node has children, and the user clicked on it...
      else {
        node.expanded = true;
      }
    } 
    else //When the selected node has no children
    { 
      node.expanded = true;
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
          node.children = tempChildren;
          node.expandedIcon = "fa fa-folder-open"; node.collapsedIcon = "fa fa-folder";
          this.log.debug(path + " was populated with " + tempChildren.length + " children.");

          while (node.parent !== undefined) {
            let newChild = node.parent;
            newChild.children[node.id] = node;
            newChild.expanded = true;
            newChild.expandedIcon = "fa fa-folder-open"; newChild.collapsedIcon = "fa fa-folder";
            node = newChild;
          }

          let index = -1;
          for (let i: number = 0; i < this.data.length; i++) {
            if (this.data[i].label == node.label) {
              index = i; break;
            }
          }
          if (index != -1) {
            this.data[index] = node;
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

  createFolder(pathAndName: string, node: any, update: boolean): void {
    this.ussSrv.makeDirectory(pathAndName)
      .subscribe(
        resp => {
          this.log.debug('Created: ' + pathAndName);
          let path = this.getPathFromPathAndName(pathAndName);
          let someData = this.ussSrv.getFileMetadata(pathAndName);
          someData.subscribe(
            result => {
              // If the right-clicked 'node' is the correct, valid node
              if ((node.expanded && node.children) && (node.path == path)) {
                let nodeToAdd = {
                  id: node.children.length,
                  children: [],
                  label: this.getNameFromPathAndName(pathAndName),
                  mode: result.mode,
                  owner: result.owner,
                  group: result.group,
                  createdAt: result.createdAt,
                  data: "Folder",
                  directory: true,
                  expandedIcon: "fa fa-folder-open",
                  collapsedIcon: "fa fa-folder",
                  name: this.getNameFromPathAndName(pathAndName),
                  parent: node,
                  path: pathAndName,
                  size: result.size
                }
                node.children.push(nodeToAdd); //Add node to right clicked node
              }
              // ..otherwise treat folder creation without any context.
              else {
                if (path == this.path) { // If we are creating a folder at the parent level
                  this.displayTree(path, true);
                } else if (update) { // If we want to update the tree
                  this.addChild(node);
                } else { // If we want a fresh fetch of the tree
                  this.displayTree(pathAndName, false); // ...plop the Explorer into the newly created location.
                }
                this.newPath = pathAndName;
              }
            }
          ); 
        },
        error => { 
          if (error.status == '500') { //Internal Server Error
            this.snackBar.open('Failed to create directory: ' + pathAndName + "' This is probably due to a server agent problem.", 
            'Dismiss', defaultSnackbarOptions);
          }
          this.errorMessage = <any>error; 
        }
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

  delete(e: EventTarget): void {
    this.ussSrv.deleteFileOrFolder(this.selectedItem)
      .subscribe(
        resp => {
          this.log.debug('Deleted: ' + this.selectedItem);
          this.updateUss(this.path);
        },
        error => this.errorMessage = <any>error
      );
  }

  deleteFileOrFolder(rightClickedFile: any): void {
    let pathAndName = rightClickedFile.path;
    let name = this.getNameFromPathAndName(pathAndName);
    this.isLoading = true;
    this.deletionQueue.set(rightClickedFile.path, rightClickedFile);
    rightClickedFile.styleClass = "filebrowseruss-node-deleting";
    let deleteSubscription = this.ussSrv.deleteFileOrFolder(pathAndName)
    .subscribe(
      resp => {
        this.isLoading = false;
        this.snackBar.open('Deleted: ' + name,
          'Dismiss', defaultSnackbarOptions);
        this.removeChild(rightClickedFile);
        this.deletionQueue.delete(rightClickedFile.path);
        rightClickedFile.styleClass = "";
      },
      error => {
        if (error.status == '500') { //Internal Server Error
          this.snackBar.open("Failed to delete '" + pathAndName + "' Server returned with: " + error._body, 
          'Dismiss', longSnackbarOptions);
        } else if (error.status == '404') { //Not Found
          this.snackBar.open("Failed to delete '" + pathAndName + ' has already been deleted or does not exist.', 
          'Dismiss', defaultSnackbarOptions);
          this.removeChild(rightClickedFile);
        } else if (error.status == '400') { //Bad Request
          this.snackBar.open("Failed to delete '" + pathAndName + "' This is probably due to a permission problem.", 
          'Dismiss', defaultSnackbarOptions);
        } else { //Unknown
          this.snackBar.open("Unknown error '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 
          'Dismiss', longSnackbarOptions);
          //Error info gets printed in uss.crud.service.ts
        }
        this.deletionQueue.delete(rightClickedFile.path);
        this.isLoading = false;
        rightClickedFile.styleClass = "";
        this.errorMessage = <any>error;
      }
    );

    setTimeout(() => {
      if (deleteSubscription.closed == false) {
        this.snackBar.open('Deleting ' + pathAndName + '... Larger payloads may take longer. Please be patient.', 
          'Dismiss', defaultSnackbarOptions);
      }
    }, 4000);
  }

  removeChild(node: any) {
    let parent;
    let children;
    if (node.parent) { // If the selected node has a parent,
      parent = node.parent;
      children = parent.children; // ...just use the top-most children
    } else { // The selected node *is* the top-most node,
      children = this.data; // ...just use the UI nodes as our children
    }

    let length = children.length;
    let i = 0;
    while (i < length) {
      if (children[i] && (children[i].path == node.path) && (children[i].name == node.name)) { // If we catch the node we wanted to remove,
        children.splice(i, 1); // ...remove it
        if (node.parent && node.parent.children) { // Update the children to no longer include removed node
          node.parent.children = children;
        } else {
          this.data = children;
        }
      }
      i++;
    }
  }

  sendNotification(title: string, message: string): number {
    let pluginId = this.pluginDefinition.getBasePlugin().getIdentifier();
    // We can specify a different styleClass to theme the notification UI i.e. [...] message, 1, pluginId, "org_zowe_zlux_editor_snackbar"
    let notification = ZoweZLUX.notificationManager.createNotification(title, message, 1, pluginId);
    return ZoweZLUX.notificationManager.notify(notification);
  }

  levelUp(): void {
    //TODO: may want to change this to 'root' depending on mainframe file access security
    //to prevent people from accessing files/folders outside their root dir
    if (this.path !== "/" && this.path !== '') 
    {
      this.path = this.getPathFromPathAndName(this.path);
      if (this.path === '' || this.path == '/') {
        this.path = '/';
      }

      let parentindex = this.path.length - 1;
      while (this.path.charAt(parentindex) != '/') { parentindex--; }
      let parent = this.path.slice(parentindex + 1, this.path.length);
      this.log.debug("Going up to: " + parent);

      this.displayTree(this.path, false);
    } else
      this.updateUss(this.path);
  }

  getPathFromPathAndName(pathAndName: string): string {
    let path = pathAndName.replace(/\/$/, '').replace(/\/[^\/]+$/, '');
    return path;
  }

  getNameFromPathAndName(pathAndName: string): string {
    let name = pathAndName.replace(/(^.*)(\/.*\/)/, '');
    return name;
  }

  private checkPath(input: string): string {
    return this.utils.filePathEndCheck(this.path) + input;
  }

  checkPathSlash(event: any) {
    if (this.path == "") {
      this.path = "/";
      this.fileExplorerUSSInput.nativeElement.value="/";
    }
  }

  checkIfInDeletionQueueAndMessage(pathAndName: string, message: string): boolean {
    if (this.deletionQueue.has(pathAndName)) {
      this.snackBar.open('Deletion in progress: ' + pathAndName + "' " + message, 
            'Dismiss', defaultSnackbarOptions);
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
