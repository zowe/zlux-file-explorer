This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
# File Explorer

This is an angular component that can be included in applications for being able to locate & view the hierarchy of files and datasets on z/OS through the Zowe ZSS server APIs.

**NOTE Because this relies upon ZSS APIs, it must be used in an environment which handles session lifecycles, as you must log in to ZSS prior to using those APIs. One way to utilize this is to use this within a Zowe App, within the Zowe Desktop**

## Embedding

Navigate to your application's package.json file. Under devDepencies, add a
```"@zlux/file-explorer": "git+ssh://git@github.com:zowe/zlux-file-explorer.git",```
listing. Execute ```npm install``` inside your host application to install File Explorer dependencies.

Then, navigate to your application's module file. Import the File Explorer module by adding
```import { FileExplorerModule } from '@zlux/file-explorer/src/plugin';```
and then, add the File Explorer module into your application's module.
```...,
FileExplorerModule,
...,
```

Now, in your application's HTML file, given they are within the scope of your module, you can import the File Explorer widget as
```<zlux-file-explorer (nodeClick)="onNodeClick($event)"></zlux-file-explorer>```
with an optional (style) input to specify the color, size, or other properties of the main tree container.


This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
