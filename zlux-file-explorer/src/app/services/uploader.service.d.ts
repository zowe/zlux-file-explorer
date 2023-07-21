import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
export declare class UploaderService {
    private http;
    private log;
    private snackBar;
    constructor(http: HttpClient, log: ZLUX.ComponentLogger, snackBar: MatSnackBar);
    chunkAndSendFile(file: File, uploadDirPath: string, targetEncoding: string): Observable<number>;
}
