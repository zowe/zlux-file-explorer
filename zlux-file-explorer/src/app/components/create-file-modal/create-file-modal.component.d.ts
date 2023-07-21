import { EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
export declare class CreateFileModal {
    private http;
    private snackBar;
    private fileName;
    private dirPath;
    private folderPathObtainedFromNode;
    filePattern: RegExp;
    onFileCreate: EventEmitter<any>;
    constructor(data: any, http: HttpClient, snackBar: MatSnackBar);
    createFile(): void;
}
