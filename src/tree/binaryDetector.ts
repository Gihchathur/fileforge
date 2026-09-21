export function isBinaryContent(
    data: Uint8Array
): boolean {
    const sampleSize =
        Math.min(data.length, 8192);

    let suspiciousBytes = 0;

    for (let i = 0; i < sampleSize; i++) {
        const byte = data[i];

        if (byte === 0) {
            return true;
        }

        if (
            byte < 7 ||
            (byte > 14 && byte < 32)
        ) {
            suspiciousBytes++;
        }
    }

    if (sampleSize === 0) {
        return false;
    }

    return (
        suspiciousBytes / sampleSize > 0.1
    );
}