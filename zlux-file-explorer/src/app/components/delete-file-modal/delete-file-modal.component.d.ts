import { EventEmitter } from '@angular/core';
export declare class DeleteFileModal {
    private fileName;
    private fileIcon;
    onDelete: EventEmitter<any>;
    private node;
    constructor(data: any);
    deleteFileOrFolder(): void;
    getFileName(): any;
}
