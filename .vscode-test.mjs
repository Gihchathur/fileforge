import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
    files: 'out/test/**/*.test.js',
    version: 'stable',
    desktopPlatform: 'win32-x64-archive',
    workspaceFolder: '.'
});