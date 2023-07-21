import { EventEmitter, ElementRef, AfterContentInit, OnDestroy } from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import { FileTreeNode } from '../../structures/child-event';
import { FileNode } from '../../structures/file-node';
/**
 * [The tree component serves collapse/expansion of file/datasets]
 * @param  selector     [tree-root]
 * @param  templateUrl   [./tree.component.html]
 * @param  styleUrls     [./tree.component.css]
 * @param  providers     [None]
 * @return               [description]
 */
export declare class TreeComponent implements AfterContentInit, OnDestroy {
    treeData: TreeNode;
    style: any;
    treeStyle: any;
    clickEvent: EventEmitter<FileTreeNode>;
    dblClickEvent: EventEmitter<MouseEvent>;
    rightClickEvent: EventEmitter<MouseEvent>;
    panelRightClickEvent: EventEmitter<MouseEvent>;
    selectedNode: FileNode;
    lastClickedNodeName: string;
    lastClickedNodeTimeout: number;
    fileExplorerTree: ElementRef;
    constructor();
    /**
     * [nodeSelect provides the child folder click event to the parent file/folder tree tab]
     * @param  _event [click event]
     * @return        [void]
     */
    nodeSelect(_event?: any): void;
    nodeRightClickSelect(_event?: any): void;
    panelRightClickSelect(_event?: any): void;
    ngAfterContentInit(): void;
    unselectNode(): void;
    ngOnDestroy(): void;
}
