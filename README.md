This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
# File Tree

This is an angular component that can be included in applications for being able to locate & view the hierarchy of files and datasets on z/OS through the Zowe ZSS server APIs.

**NOTE Because this relies upon ZSS APIs, it must be used in an environment which handles session lifecycles, as you must log in to ZSS prior to using those APIs. One way to utilize this is to use this within a Zowe App, within the Zowe Desktop**

## Embedding

Navigate to your application's package.json file. Under devDepencies, add a
```"zlux-angular-file-tree": "git+ssh://git@github.com:zowe/zlux-angular-file-tree.git",```
listing. Execute ```npm install``` inside your host application to install File Tree dependencies.

Then, navigate to your application's module file. Import the File Tree module by adding
```import { FileTreeModule } from 'zlux-angular-file-tree/src/plugin';```
and then, add the File Tree module into your application's module.
```...,
FileTreeModule,
...,
```

Now, in your application's HTML file, given they are within the scope of your module, you can import the File Explorer widget as
```<zlux-file-tree (nodeClick)="onNodeClick($event)"></zlux-file-tree>```
with an optional (style) input to specify the color, size, or other properties of the main tree container.


This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
