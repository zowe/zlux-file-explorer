# ZLUX Angular File Tree

## 1.1.0
* Added the option to download the dataset file.
* Added create folder, delete and collapse icons in tree explorer.
* Rename the file when doing copy/paste, when same named file exists in destination.
* Create an empty file by selecting the folder.
* Bugfix: Fixing the bug to download the dataset file.

## 1.0.0
* File Tree upgraded to conform to Zowe V2: Angular 6->12, Typescript 2->4 etc.

## 0.12.0
* Added the option to open a file in new browser tab
* Make Properties title text selectable

## 0.11.0
* Added a function to refresh file/directory metadata using the USS path 

## 0.10.0

* Added a right click Download file feature

## 0.9.0

* Added a right click Upload file feature, NOTE: BINARY is still unsupported

## 0.8.0

* Added a quick search that filters opened files, folders, and datasets (Alt + P)

## 0.7.0

* Added refresh button to right click folder menu & file menu

## 0.6.0

* Added refresh buttons for USS/Dataset views

## 0.5.0

* Added cut, copy, and paste functionality to USS files.
* onPathChanged emitter now fires from MVS as well
* Removed unused & dead code.

## 0.4.0

* Add rename functionality to USS browser
* Add right click menu to tag files and folders with a  popup modal to choose the encoding to tag (autofills to current tag)

## 0.3.0

* Added modals, available via right click, to change ownership & permission information of files & folders.
* Some CSS has been refactored.
* Node-sass has been updated to support Node 12.

## 0.2.0

* Allow users of this component to invoke its modals by using the spawnModal input with a javascript object containing the property 'type' equal to the type of modal to open, and 'data' equal to the FileNode object to be handled

## 0.1.0

* Bugfix: Clicking on a migrated dataset would result in sending PDS contents in the form of the dataset contents, rather than displaying the PDS as a folder of PDS members. Now, clicking on a migrated dataset will either display its contents or show PDS members, depending on whether or not the dataset is or is not a PDS.
* Security: Update dependencies to more recent minor versions to reduce quantity of npm audit warnings.
