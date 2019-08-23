
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

declare var require:any;
import { Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { childEvent } from '../../structures/child-event';
import { FileNode } from '../../structures/file-node';
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
  providers: []
})
/**
 * [Input treeData supplies the tree structure]
 * [Input treeId supplies which tree is currently clicked]
  [Output  clickEvent supplies the folder click events]
 *
 * @return [description]
 */
export class TreeComponent {
  @Input() treeData: TreeNode;
  @Input() style: any;
  @Output() clickEvent = new EventEmitter<childEvent>();
  @Output() dblClickEvent = new EventEmitter<MouseEvent>();
  selectedNode: FileNode;
  lastClickedNodeName: string; // PrimeNG as of 6.0 has no native double click support for its tree
  lastClickedNodeTimeout: number = 500; // < 500 ms becomes a double click
  constructor() {
    this.lastClickedNodeName = null;
  }

/**
 * [nodeSelect provides the child folder click event to the parent file/folder tree tab]
 * @param  _event [click event]
 * @return        [void]
 */
  nodeSelect(_event?: any) {
    if (_event){
      if (this.lastClickedNodeName == null || this.lastClickedNodeName != _event.node.name) {
      this.lastClickedNodeName = _event.node.name;
      this.clickEvent.emit(_event); 
      setTimeout( () => (this.lastClickedNodeName = null), this.lastClickedNodeTimeout);
    } else {
      this.dblClickEvent.emit(_event);
    }
  }
  }

  /**
   * Lazy loading
   * @param event
   */
  //TODO:need to understand behavior model for double click and/or single click much like a desktop environment
  //nodeExpand(event?: any) {
    // if (event && event.node) {
    //   const node: FileNode = event.node as FileNode;
    //   const {nodeData, children} = node;
    //
    //   if (node.nodeType === FileNodeType.agent) {
    //     const tepAgent: FileNodeAgent = nodeData as FileNodeAgent;
    //
    //     if (!children || children.length === 0 || (children.length === 1 && !children[0].label)) {
    //       const child: FileNode = {
    //         label: '',
    //         icon: 'fa fa-spinner'
    //       };
    //
    //       node.children = [child]; // fake-ish
    //
    //       this.FileNodeAgentTopLevelsService.getPost(tepAgent).subscribe(
    //         (agentTopLevelChildren: FileNodeAgentTopLevel[]) => {
    //           this.FileNodeAgentTopLevelReady(node, agentTopLevelChildren);
    //           this.FileNodeAgentTopLevelsServiceError.emit({
    //             exceptionMessage: null
    //           })
    //         },
    //         (e: any) => {
    //           XhrBase.errorConsole(e, 'FileNodeAgentTopLevelsService');
    //           const errorMessage = JSON.parse(e._body);
    //           this.FileNodeAgentTopLevelsServiceError.emit({
    //             exceptionMessage: errorMessage.exceptionMessage
    //           });
    //           this.needCheckConnection.emit();
    //         }
    //       );
    //     }
    //   }
    //   this.nodeExpanded.emit(true);
    // }
  }

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

