export type TreeNodeType = 'file' | 'directory';

export interface TreeNode {
    name: string;
    type: TreeNodeType;
    children?: TreeNode[];
    content?: string;
}