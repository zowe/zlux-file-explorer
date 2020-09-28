This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
# File Tree

This is an angular component that can be included in applications to be able to locate & browse the hierarchy of files and datasets on z/OS through the Zowe ZSS server APIs. Using the Zowe context menu, there is also a growing support of CRUD & other actions.

**NOTE: Because this relies upon ZSS APIs, it must be used in an environment which handles session lifecycles, as you must log in to ZSS prior to using those APIs. One way to utilize this is to use this within a Zowe App, within the Zowe Desktop**

## Installing
You must set the @zowe registry scope to get this library, as it is not yet on npmjs.org

```
npm config set @zowe:registry https://zowe.jfrog.io/zowe/api/npm/npm-release/
npm install --save-prod @zowe/zlux-angular-file-tree
```

## Embedding

Then, navigate to your application's module file. Import the File Tree module by adding
```import { FileTreeModule } from '@zowe/zlux-angular-file-tree/src/plugin';```
and then, add the File Tree module into your application's module.
```...,
FileTreeModule,
...,
```

Now, in your application's HTML template, given they are within the scope of your module, you can import the File Explorer widget as
```<zlux-file-tree (nodeClick)="onNodeClick($event)"></zlux-file-tree>```
with an optional (style) input to specify the color, size, or other properties of the main tree container.


## Linking locally for development
If you want to develop the File Tree and your own app simultaneously, you can do the following:

### Part I- How to link

#### Add npm symlink 
Note: @zowe/zlux-angular-file-tree is package name in package.json
```
cd zlux-file-explorer
npm link 
```
#### Replace dependency in your app
```
cd my-app/webClient
npm link @zowe/zlux-angular-file-tree
```

### Part II - Back to normal, how to delink

#### Remove Dependency link
```
cd my-app/webClient
npm unlink
```

#### Delete npm symlink

```
cd zlux-file-explorer
npm uninstall
```

### node-sass vendor folder not found
if experience this issue
```
node node_modules/node-sass/scripts/install.js
npm rebuild node-sass
```

## How to build a File Tree release

1. Set the version number you want https://github.com/zowe/zlux-file-explorer/blob/staging/package.json#L3
2. Set the build number you want (RC1, 2, 3 etc see https://github.com/zowe/zlux-file-explorer/tags)
3. Enter the build number you want into the jenkins job (see a previous run https://wash.zowe.org:8443/job/zlux-angular-file-tree/job/staging/22/parameters/)

This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
