export interface PreviewStat {
    label: string;
    value: string | number;
    detail?: string;
}

export function renderPreviewStats(
    stats: PreviewStat[]
): string {
    if (stats.length === 0) {
        return '';
    }

    return `
        <section class="ff-stats" aria-label="Statistics">
            ${stats
                .map(stat => `
                    <div class="ff-stat">
                        <div class="ff-stat-label">
                            ${escapeHtml(stat.label)}
                        </div>

                        <div class="ff-stat-value">
                            ${escapeHtml(String(stat.value))}
                        </div>

                        ${
                            stat.detail
                                ? `
                                    <div class="ff-stat-detail">
                                        ${escapeHtml(stat.detail)}
                                    </div>
                                `
                                : ''
                        }
                    </div>
                `)
                .join('')}
        </section>
    `;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}