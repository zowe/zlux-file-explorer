import { DatasetAttributes } from '../structures/editor-project';
export declare class UtilsService {
    constructor();
    filePathCheck(path: string): string;
    filePathEndCheck(path: string): string;
    isDatasetMigrated(attrs: DatasetAttributes): boolean;
}
