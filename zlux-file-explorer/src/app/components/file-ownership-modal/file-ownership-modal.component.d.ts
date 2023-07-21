import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
export declare class FileOwnershipModal {
    private dialogRef;
    private http;
    private snackBar;
    name: string;
    path: string;
    mode: number;
    modeSym: string;
    icon: string;
    owner: string;
    group: string;
    isDirectory: boolean;
    recursive: boolean;
    node: any;
    constructor(data: any, dialogRef: MatDialogRef<FileOwnershipModal>, http: HttpClient, snackBar: MatSnackBar);
    formatPermissions(): void;
    saveOwnerInfo(): void;
    closeDialog(): void;
    private handleErrorObservable;
}
