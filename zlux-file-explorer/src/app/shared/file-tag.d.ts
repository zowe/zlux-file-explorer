export interface FileTag {
    name: string;
    codeset: number;
    type: ZLUX.TagType;
}
export declare function findFileTagByCodeset(codeset: number): FileTag | undefined;
export declare const fileTagList: FileTag[];
