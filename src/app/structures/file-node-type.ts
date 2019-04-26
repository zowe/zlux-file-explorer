

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { FileNode, FileNodeAgent, FileNodeAgentTopLevel, FileNodesSupported } from './file-node';

export class FileNodeType {
  static readonly enterprise = 'enterprise';
  static readonly hostOSType = 'hostOSType';
  static readonly host = 'host';
  static readonly plex = 'plex';
  static readonly product = 'product';
  static readonly agent = 'agent';
  static readonly agentTopLevel = 'agentTopLevel';

  /**
   * @param nodeType
   * @returns {boolean} true if a node type has a workspace
   */
  static hasWorkspace(nodeType: string): boolean {
    return nodeType === FileNodeType.agentTopLevel;
  }

  static FileNode(nodeType: string, nodeData: FileNodesSupported): FileNode {
    let result: FileNode;

    switch (nodeType) {
    case FileNodeType.agent:
      const nodeAgent = nodeData as FileNodeAgent;

      result = {
        icon: 'fa fa-desktop',
        label: nodeAgent.name,
        navigatorId: nodeAgent.originNode,
        nodeData: nodeAgent,
      };
      break;

      case FileNodeType.agentTopLevel:
        const nodeAgentTopLevel = nodeData as FileNodeAgentTopLevel;

        result = {
          icon: 'fa fa-crosshairs',
          label: nodeAgentTopLevel.name,
          navigatorId: nodeAgentTopLevel.id,
          nodeData: nodeAgentTopLevel,
        };
        break;

      default:
        throw new Error(`Not implemented nodeType=${nodeType}`);
    }

    // result.nodeData.nodeType = nodeType ? nodeType : throw new Error(`Not implemented nodeType=${nodeType}`); // play it safe and set it

    return result;
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

