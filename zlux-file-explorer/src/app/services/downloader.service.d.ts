export declare enum ConfigVariables {
    ASCII = "819",
    EBCDIC = "1047",
    UTF8 = "1208"
}
export declare class DownloaderService {
    private log;
    abortController: AbortController;
    abortSignal: AbortSignal;
    currentWriter: any;
    totalSize: number;
    startTime: number;
    constructor(log: ZLUX.ComponentLogger);
    fetchFileHandler(fetchPath: string, fileName: string, downloadObject: any): Promise<any>;
    getQueryString(queries: any): string;
    cancelDownload(): void;
}
