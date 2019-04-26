

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {TreeNode} from 'primeng/primeng';

export class childEvent{ 
  public label: string;
  public fileFolderType:'folder' | 'file';
  public children: TreeNode[];
  public parent: TreeNode;
  public path: string;
  public size: number;
  public type: string;
  public id: number;
  public expanded: boolean;
  public expandedIcon: any;
  public collapsedIcon: any;

  toJSON() {
    return {
      label: this.label,
      children: this.children,
      parent: this.parent,
      path: this.path,
      size: this.size,
      type: this.size,
      expanded: this.expanded,
      expandedIcon: this.expandedIcon,
      collapsedIcon: this.collapsedIcon

    }
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

