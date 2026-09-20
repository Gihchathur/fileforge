export type TreeFormat =
    | 'ascii'
    | 'markdown'
    | 'json'
    | 'unknown';

export function detectTreeFormat(
    input: string
): TreeFormat {
    const trimmed = input.trim();

    if (!trimmed) {
        return 'unknown';
    }

    if (isJson(input)) {
        return 'json';
    }

    const lines = input
        .split(/\r?\n/)
        .map(line => line.trimEnd())
        .filter(line => line.trim().length > 0);

    if (lines.length === 0) {
        return 'unknown';
    }

    const asciiTreePattern =
        /^(?:[│ ]*)(?:├── |└── )/;

    if (
        lines.some(line =>
            asciiTreePattern.test(line)
        )
    ) {
        return 'ascii';
    }

    const markdownTreePattern =
        /^\s*[-*+]\s+/;

    if (
        lines.some(line =>
            markdownTreePattern.test(line)
        )
    ) {
        return 'markdown';
    }

    return 'unknown';
}

function isJson(input: string): boolean {
    try {
        const parsed: unknown = JSON.parse(input);

        return (
            typeof parsed === 'object' &&
            parsed !== null
        );
    } catch {
        return false;
    }
}