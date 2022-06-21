import { EventEmitter } from '@angular/core';
export declare class CreateFileModal {
    private fileName;
    private dirPath;
    private filePathObtainedFromNode;
    onFileCreate: EventEmitter<any>;
    constructor(data: any);
    createFile(): void;
}