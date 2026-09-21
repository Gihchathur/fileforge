export type TreeNodeType =
    | 'file'
    | 'directory';

export type ContentStatus =
    | 'available'
    | 'redacted'
    | 'binary'
    | 'too-large';

export interface TreeNode {
    name: string;
    type: TreeNodeType;
    children?: TreeNode[];
    content?: string;
    contentStatus?: ContentStatus;
}