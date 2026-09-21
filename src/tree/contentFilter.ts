import * as vscode from 'vscode';

const DEFAULT_SENSITIVE_FILES = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    '.env.test',
    'credentials.json',
    'secrets.json',
    'service-account.json',
    'id_rsa',
    'id_rsa.pub',
    'id_dsa',
    'id_ecdsa',
    'id_ed25519',
    'private.key',
    'private.pem'
];

export function isSensitiveFile(
    fileName: string
): boolean {
    const configuration =
        vscode.workspace.getConfiguration(
            'fileforge'
        );

    const configuredFiles =
        configuration.get<string[]>(
            'sensitiveFiles'
        );

    const sensitiveFiles =
        configuredFiles ?? DEFAULT_SENSITIVE_FILES;

    return sensitiveFiles.some(
        sensitiveFile =>
            sensitiveFile.toLowerCase() ===
            fileName.toLowerCase()
    );
}