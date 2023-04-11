# ZLUX Angular File Tree

## 1.5.0
* Enhancing the create dataset form to be prefilled with certain dataset attributes.
* Bugfix: Fix typo to create correctly spawning USS and MVS modals
* Added the option to emit spawning Change Owners (USS), Tagging (USS), Change Permissions (USS), Create File (USS)

## 1.4.0
* Bugfix: Make it so an MVS double click ("drill into") event correctly emits a path change
* Bugfix: Clean up all USS/MVS subscriptions
* Remove unnecessary MVS data fetch update feature (currently it's 3000000 ms or 50 minutes)
* Add clarifying comments, renames, TODOs, and organization to variables, services, and a few methods
* Added the option to clear search history

## 1.3.0
* Added a UI for creating datasets
* Bugfix: Getting 400 BAD REQUEST in browser when opening the file or dataset after copying its link

## 1.2.0
* Added the option to receive USS/MVS node data
* Added the option to copy path of USS file or dereoctory
* Bugfix: Set USS path to correct directory, when opening the directory or file in new browser tab respectively

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
