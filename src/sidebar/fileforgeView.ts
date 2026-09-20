import * as vscode from 'vscode';

export class FileForgeViewProvider
    implements vscode.TreeDataProvider<FileForgeItem> {

    private readonly _onDidChangeTreeData =
        new vscode.EventEmitter<
            FileForgeItem | undefined | null | void
        >();

    readonly onDidChangeTreeData =
        this._onDidChangeTreeData.event;

    getTreeItem(
        element: FileForgeItem
    ): vscode.TreeItem {
        return element;
    }

    getChildren(): FileForgeItem[] {
        return [
            new FileForgeItem(
                'Export File Structure',
                'fileforge.copyStructure',
                'export'
            ),
            new FileForgeItem(
                'Import File Structure',
                'fileforge.importStructure',
                'import'
            ),
            new FileForgeItem(
                'Scan Workspace',
                'fileforge.scanWorkspace',
                'scan'
            )
        ];
    }
}

class FileForgeItem extends vscode.TreeItem {

    constructor(
        label: string,
        commandId: string,
        icon: string
    ) {
        super(
            label,
            vscode.TreeItemCollapsibleState.None
        );

        this.command = {
            command: commandId,
            title: label
        };

        this.iconPath =
            new vscode.ThemeIcon(
                getIcon(icon)
            );
    }
}

function getIcon(
    icon: string
): string {
    switch (icon) {
        case 'export':
            return 'copy';

        case 'import':
            return 'cloud-download';

        case 'scan':
            return 'search';

        default:
            return 'file';
    }
}