import { EventEmitter } from '@angular/core';
export declare class CreateFolderModal {
    private folderName;
    private folderPath;
    private folderPathObtainedFromNode;
    folderPattern: RegExp;
    onCreate: EventEmitter<any>;
    constructor(data: any);
    createFolder(): void;
}
