import { OnInit } from '@angular/core';
import { FileTag } from '../../shared/file-tag';
export declare class FilePropertiesModal implements OnInit {
    fileName: string;
    fileCreatedAt: string;
    fileType: string;
    filePath: string;
    fileMode: number;
    fileSize: string;
    fileIcon: string;
    fileOwner: string;
    fileGroup: string;
    sizeType: string;
    tag?: FileTag;
    constructor(data: any);
    ngOnInit(): void;
    applyFilter(filterValue: string): void;
}
