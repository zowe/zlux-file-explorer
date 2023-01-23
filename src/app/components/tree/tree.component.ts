
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

declare var require:any;
import { Component, Input, Output, EventEmitter, ViewEncapsulation, ElementRef, ViewChild, AfterContentInit, OnDestroy} from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { TreeDragDropService } from 'primeng/api';
import { FileTreeNode } from '../../structures/child-event';
import { FileNode } from '../../structures/file-node';
import { UssCrudService } from '../../services/uss.crud.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { quickSnackbarOptions, defaultSnackbarOptions, longSnackbarOptions } from '../../shared/snackbar-options';

/**
 * [The tree component serves collapse/expansion of file/datasets]
 * @param  selector     [tree-root]
 * @param  templateUrl   [./tree.component.html]
 * @param  styleUrls     [./tree.component.css]
 * @param  providers     [None]
 * @return               [description]
 */
@Component({
  selector: 'tree-root',
  templateUrl: './tree.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./tree.component.css'],
  providers: [TreeDragDropService, UssCrudService]
})
/**
 * [Input treeData supplies the tree structure]
 * [Input treeId supplies which tree is currently clicked]
  [Output  clickEvent supplies the folder click events]
 *
 * @return [description]
 */
export class TreeComponent implements AfterContentInit, OnDestroy {
  @Input() treeData: TreeNode;
  @Input() style: any;
  @Input() treeStyle: any;
  @Output() clickEvent = new EventEmitter<FileTreeNode>();
  @Output() dblClickEvent = new EventEmitter<MouseEvent>();
  @Output() rightClickEvent = new EventEmitter<MouseEvent>();
  @Output() panelRightClickEvent = new EventEmitter<MouseEvent>();
  selectedNode: FileNode;
  lastClickedNodeName: string; // PrimeNG as of 6.0 has no native double click support for its tree
  lastClickedNodeTimeout: number = 500; // < 500 ms becomes a double click
  @ViewChild('fileExplorerPTree', { static: true }) fileExplorerTree: ElementRef;
  constructor(private ussSrv: UssCrudService, private snackBar: MatSnackBar) {
    this.lastClickedNodeName = null;
    
  }

/**
 * [nodeSelect provides the child folder click event to the parent file/folder tree tab]
 * @param  _event [click event]
 * @return        [void]
 */
  nodeSelect(_event?: any) {
    if (_event){
      if (this.lastClickedNodeName == null || this.lastClickedNodeName != (_event.node.name || _event.node.data.name)) {
        this.lastClickedNodeName = _event.node.name || _event.node.data.name;
        this.clickEvent.emit(_event); 
        setTimeout( () => (this.lastClickedNodeName = null), this.lastClickedNodeTimeout);
      } else {
        this.dblClickEvent.emit(_event);
      }
    }
  }

  nodeRightClickSelect(_event?: any) {
    if (_event){
      this.rightClickEvent.emit(_event);
      _event.originalEvent.stopPropagation();
    }
  }

  panelRightClickSelect(_event?: any) {
    if (_event){
      _event.preventDefault();
      this.panelRightClickEvent.emit(_event);
    }
  }

  ngAfterContentInit() { // PrimeNG as of 6.0 has no native right click support for its tree
    this.fileExplorerTree.nativeElement.addEventListener('contextmenu', this.panelRightClickSelect.bind(this));
  }

  unselectNode(){
    this.selectedNode = null;
  }

  ngOnDestroy() { // PrimeNG as of 6.0 has no native right click support for its tree
    this.fileExplorerTree.nativeElement.removeEventListener('contextmenu', this.panelRightClickSelect.bind(this));
  }

  drag(event: any) {
    console.log("im in the drag function")
    // event.dataTransfer.setData('data', this.draggedNode);
  }

  nodeDrop(_event?: any) {
    console.log("im in the drop function")
    console.log("drag node is: ", _event.dragNode)
    console.log("drag node is: ",  _event.dropNode)
    if(_event.dropNode.directory === false || _event.dragNode.data.isDataset) {
      console.debug("Invalid Drag and Drop")
    } else if (_event.dragNode.directory === true) {
      this.snackBar.open("Drag and Drop of Directory is not supported", 
      'Dismiss', defaultSnackbarOptions);    } else {
      this.moveFile(_event.dragNode, _event.dropNode);
    }

  }

  moveFile(fileNode: any, destinationNode: any) {
    let destinationPath = destinationNode.path;
    let pathAndName = fileNode.path;
    let name = fileNode.name;
    if(pathAndName.indexOf(' ') >= 0){
      this.snackBar.open("Cannot move: '" + pathAndName + "' Operation not yet supported for filenames with spaces.",
        'Dismiss', defaultSnackbarOptions);
      return;
    }
    let metaData = this.ussSrv.getFileMetadata(pathAndName);
    metaData.subscribe(result => {
      if(result.ccsid == -1){
        this.snackBar.open("Cannot move: '" + pathAndName + "' Operation not yet supported for this encoding.", 
          'Dismiss', defaultSnackbarOptions);
        return;
      }else{
        let destinationMetadata = this.ussSrv.getFile(destinationPath);
        destinationMetadata.subscribe(result => {
          // Check if file with same name already exists in destination
          for (let i: number = 0; i < result.entries.length; i++) {
            if (!result.entries[i].directory && result.entries[i].name == name) {
                this.snackBar.open("Unable to move '" + pathAndName + "' because target '" + destinationPath + '\/' + name + "'already exists at destination.", 
                        'Dismiss', longSnackbarOptions);
                return;        
            }
          }
          let copySubscription = this.ussSrv.copyFile(pathAndName,destinationPath + "/" + name)
          .subscribe(
            resp => {
                this.ussSrv.deleteFileOrFolder(pathAndName)
                .subscribe(
                  resp => {
                    this.snackBar.open('Successfully moved: ' + name,'Dismiss', quickSnackbarOptions);
                  },
                  error => {
                    if (error.status == '500') { //Internal Server Error
                      this.snackBar.open("Copied successfully, but failed to cut '" + pathAndName + "' Server returned with: " + error._body, 
                        'Dismiss', longSnackbarOptions);
                    } else if (error.status == '404') { //Not Found
                      this.snackBar.open("Copied successfully, but '" + pathAndName + "' has already been deleted or does not exist.", 
                        'Dismiss', defaultSnackbarOptions);
                      // this.removeChild(fileNode);
                    } else if (error.status == '400' || error.status == '403') { //Bad Request
                      this.snackBar.open("Copied successfully but failed to cut '" + pathAndName + "' This is probably due to a permission problem.", 
                        'Dismiss', defaultSnackbarOptions);
                    } else { //Unknown
                      this.snackBar.open("Copied successfully, but unknown error cutting '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 
                        'Dismiss', longSnackbarOptions);
                    }
                  }
                );
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
            }
          );

          setTimeout(() => {
            if (copySubscription.closed == false) {
              this.snackBar.open('Pasting ' + pathAndName + '... Larger payloads may take longer. Please be patient.', 
                'Dismiss', quickSnackbarOptions);
            }
          }, 4000);
        },
        error => {
          if (error.status == '403') { //Permission denied
            this.snackBar.open('Failed to access destination folder: Permission denied.', 
            'Dismiss', defaultSnackbarOptions);
          } else if (error.status == '0') {
            this.snackBar.open("Failed to communicate with the App server: " + error.status, 
                'Dismiss', defaultSnackbarOptions);
          } else if (error.status == '404') {
            this.snackBar.open("Destination folder not found. " + error.status, 
                'Dismiss', quickSnackbarOptions);
          } else {
            this.snackBar.open("An unknown error occurred: " + error.status, 
                'Dismiss', defaultSnackbarOptions);
          }
          console.error(error);
        }); 
      }
    },
    error => {
        if (error.status == '404') { // This happens when user attempts to paste a file that's been deleted after copying
          this.snackBar.open("Paste failed: Original '" + pathAndName + "' no longer exists.", 
            'Dismiss', defaultSnackbarOptions);
        }
        // this.isLoading = false;
        // this.log.warn(error);
    });
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/