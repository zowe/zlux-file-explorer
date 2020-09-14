

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UssCrudService } from './uss.crud.service';

@Injectable({
  providedIn: 'root'
})
export class CopyPasteService {
  private currentFile: string;
  private currentOperation: 'cut' | 'copy';

  constructor(
    private ussCrud: UssCrudService,
  ) { }

  beginCopyFile(file: string): void {
    this.currentFile = file;
    this.currentOperation = 'copy';
  }

  beginCutFile(file: string): void {
    this.currentFile = file;
    this.currentOperation = 'cut';
  }

  paste(path: string): Observable<void> {
    if (this.currentOperation === 'copy') {
      return this.finishCopyFile(path);
    } else if (this.currentOperation === 'cut') {
      return this.finishCutFile(path);
    }
  }

  private finishCopyFile(path: string): Observable<void> {
    return of(null);
  }

  private finishCutFile(path: string): Observable<void> {
    return of(null);
  }

  canPaste(): boolean {
    return typeof this.currentFile === 'string';
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

