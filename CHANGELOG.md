# ZLUX Angular File Tree

## Feature: Renaming
* Add rename functionality to USS browser

## 0.2.0

* Allow users of this component to invoke its modals by using the spawnModal input with a javascript object containing the property 'type' equal to the type of modal to open, and 'data' equal to the FileNode object to be handled

## 0.1.0

* Bugfix: Clicking on a migrated dataset would result in sending PDS contents in the form of the dataset contents, rather than displaying the PDS as a folder of PDS members. Now, clicking on a migrated dataset will either display its contents or show PDS members, depending on whether or not the dataset is or is not a PDS.
* Security: Update dependencies to more recent minor versions to reduce quantity of npm audit warnings.
