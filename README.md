This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
# File Explorer

This application is used to display files & folder from USS, along with increasing support for datasets.

# Standalone version

## Install

Download NodeJS & npm. Go inside the ```webClient``` folder. Execute ```npm install``` to install dependencies.

## Build

Execute ```npm run build``` inside the ```webClient``` folder to compile, or execute ```npm start``` to begin real-time compilation & building.

# Widget version (```src-for-widgets``` branch)

You cannot install or build the widget version of the File Explorer. Instead, it can be embedded as an Angular component for
use in your own application. 

## Embedding

Navigate to your application's package.json file. Under devDepencies, add a
```"@zlux/file-explorer": "git+ssh://git@github.com:zowe/zlux-file-explorer.git#src-for-widgets",```
listing. Execute ```npm install``` inside your host application to install File Explorer dependencies.

Then, navigate to your application's module file. Import the File Explorer module by adding
```import { FileExplorerModule } from '@zlux/file-explorer/src/plugin';```
and then, add the File Explorer module into your application's module.
```...,
FileExplorerModule,
...,
```


This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.