import { EventEmitter, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploaderService } from '../../services/uploader.service';
export declare class UploadModal {
    private uploader;
    private snackBar;
    private folderPath;
    onUpload: EventEmitter<any>;
    fileUpload: ElementRef;
    private files;
    private fileEncodings;
    private encodings;
    private filteredOptions;
    private selectedOption;
    private selectedOptionValid;
    constructor(data: any, uploader: UploaderService, snackBar: MatSnackBar);
    addFile(): void;
    onFileUploaded(event: any): void;
    onValueChange(value?: string): void;
    uploadHandlerSetup(): void;
}
