

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {
  constructor(){}


  _findNameFromDiv(element) {
    let divChildren = element.children;
    for (let j = 0; j < divChildren.length; j++) {
      if (divChildren[j].classList.contains('ui-treenode-label')) {
        return divChildren[j].textContent;
      }
    }
  }

  _formatName(dataset: boolean, nameBuilder: string[]) {
    if (!dataset) {
      let name = '';
      for (let i = nameBuilder.length-1; i > -1; i--) {
        name+='/'+nameBuilder[i];
      }
      return name.substring(1);
    } else if (nameBuilder.length > 1) {
      return `${nameBuilder[1]}(${nameBuilder[0]})`;
    } else {
      return nameBuilder[0];
    }
  }


  _findNodeFromSpanOrDiv(element:any, dataset:boolean, nameBuilder:string[]) {
    if (nameBuilder.length == 1 && element.tagName === 'SPAN') {//initial
      while (element.nodeName != 'UL') {
        element = element.parentNode;
      }
      if (element.classList.contains('ui-treenode-content')) {
        let peers = element.parentNode.children;
        for (let i = 0; i < peers.length; i++) {
          if (peers[i].nodeName == 'DIV') {//folder name
            nameBuilder.push(this._findNameFromDiv(peers[i]));
            return this._findNodeFromSpanOrDiv(peers[i], dataset, nameBuilder);
          }
        }
      } else {
        //finished
        return this._formatName(dataset, nameBuilder);
      }
    } else if (element.tagName === 'DIV') {//at folder
      while (element.nodeName != 'UL') {
        element = element.parentNode;
      }
      if (element.classList.contains('ui-treenode-content')) {
        let peers = element.parentNode.children;
        for (let i = 0; i < peers.length; i++) {
          if (peers[i].nodeName == 'DIV') {//folder name
            nameBuilder.push(this._findNameFromDiv(peers[i]));
            return this._findNodeFromSpanOrDiv(peers[i], dataset, nameBuilder);
          }
        }        
      } else {
        //finished
        return this._formatName(dataset, nameBuilder);
      }
    } else {
      console.log(`panic at element=`,element);
    }
    //if in span, check for self or neighbor span w/ class=ui-treenode-label. that span has your name
    //from there, walk up until
    //1: you are in a folder due to ul class=ui-treenode ??? you are certainly a file if li class=ui-treenode-leaf is seen before ul
    //1.1: div neighbor of ul (ui-treenode-content) -> span ui-treenode-label-> span -> content = folder name
    //2: ul class=ui-tree-container. end of the line.
    //element.textContent
    //element.tagName == uppercase SPAN
    //element.classList = array, element.className = string
    //element.childrenNodes to decend, element.nextSibling, element.parentNode to go up.
  }

  _typeIsFolder(elements) {
    for (let i = 0; i < elements.length; i++) {
      let target = elements[i];
      let classList = target.classList;
      for (let j = 0; j < classList.length; j++) {
        if (classList[j].startsWith('fa-folder')) {
          return true;
        } else if (classList[j] == 'fa-file') {
          return false;
        }
      }
    }
    return false;
  }

  _getName(elements) {
    for (let i = 0; i < elements.length; i++) {
      let target = elements[i];
      let classList = target.classList;
      for (let j = 0; j < classList.length; j++) {
        if (classList[j] == 'ui-treenode-label') {
          return target.textContent;
        }
      }
    }
  }

  
  getNameFromHTML(target, isDataset) {
    let isFolder;
    let nameBuilder;
    if (target.tagName === 'SPAN') {
      if (target.classList.length == 0) {
        target = target.parentNode;
      }
      let classList = target.classList;
      for (let i = 0; i < classList.length; i++) {
        if (classList[i].startsWith('fa-folder')) {
          isFolder = true;
          break;
        } else if (classList[i] == 'fa-file') {
          isFolder = false;
          break;
        } else if (classList[i] == 'ui-treenode-label') {
          nameBuilder = [target.innerText];
          break;
        }
      }
      if (!nameBuilder) {
        nameBuilder = [this._getName(target.parentNode.children)];
      } else {
        isFolder = this._typeIsFolder(target.parentNode.children);
      }
    }   
    return {name:this._findNodeFromSpanOrDiv(target, isDataset, nameBuilder), folder:isFolder};
  }

  filePathCheck(path:string):string{
    if (path.charAt(0) === '/') {
        return path.substring(1);
    }
    return path;
  }
  filePathEndCheck(path:string):string{
    if (path.slice(-1) !== '/') {
        return path + "/";
    }
    return path;
  }

  isfile(selectedItem:string, treeData:any):boolean{
    for (let index:number = 0; index < treeData.length; index++){
      if (treeData[index].path === selectedItem && treeData[index].data === "Documents Folder"){
        return false;
      }
    }
    return true;
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

