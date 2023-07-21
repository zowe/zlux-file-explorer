import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';
import { FileTag } from '../../shared/file-tag';
export declare class FileTaggingModal {
    private dialogRef;
    private http;
    private snackBar;
    node: any;
    isDirectory: boolean;
    icon: string;
    name: string;
    title: string;
    matcher: CustomErrorStateMatcher;
    recursive: boolean;
    tagOptions: FileTag[];
    filteredOptions: FileTag[];
    selectedOption: FileTag | string;
    constructor(data: any, dialogRef: MatDialogRef<FileTaggingModal>, http: HttpClient, snackBar: MatSnackBar);
    changeTag(): void;
    closeDialog(): void;
    onTaggingSuccess(path: string, type: ZLUX.TagType, option: FileTag): void;
    onTaggingFailure(err: HttpErrorResponse): void;
    displayFn(option?: FileTag): string | undefined;
    onValueChange(value?: string | FileTag): void;
    get isOptionSelected(): boolean;
    private filter;
}
