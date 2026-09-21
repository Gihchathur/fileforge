export type PreviewIcon =
    | 'files'
    | 'folder'
    | 'file'
    | 'search'
    | 'chevron-down'
    | 'chevron-right'
    | 'copy'
    | 'edit'
    | 'download'
    | 'json'
    | 'new-file';

export function icon(
    name: PreviewIcon,
    size = 14
): string {
    const paths: Record<
        PreviewIcon,
        string
    > = {
        files: `
            <path d="M3 3.5h7.5v9H3z"/>
            <path d="M5.5 1.5H12l2 2v10"/>
        `,

        folder: `
            <path
                d="M1.75 4.25h4.1l1.35 1.5h7.05v7.5H1.75z"
                fill="currentColor"
                stroke="none"
            />
        `,

        file: `
            <path d="M3.25 1.75h6l3.5 3.5v9h-9.5z"/>
            <path d="M9.25 1.75v3.5h3.5"/>
        `,

        search: `
            <circle
                cx="6.75"
                cy="6.75"
                r="4"
            />
            <path
                d="m9.75 9.75 3.5 3.5"
            />
        `,

        'chevron-down': `
            <path d="m4.5 6 3.5 3.5L11.5 6"/>
        `,

        'chevron-right': `
            <path d="m6 4.5 3.5 3.5L6 11.5"/>
        `,

        /*
         * Two clearly separated overlapping
         * rectangles = Copy.
         */
        copy: `
            <rect
                x="5"
                y="5"
                width="8"
                height="8"
                rx="1"
            />

            <path
                d="M3 10V3.5c0-.55.45-1 1-1h6.5"
            />
        `,

        /*
         * Pencil + document = Open/Edit in Editor.
         */
        edit: `
            <path
                d="M3 3.25h6.25"
            />

            <path
                d="M3 6.25h5"
            />

            <path
                d="M3 9.25h3"
            />

            <path
                d="M3 12.75h4.25"
            />

            <path
                d="m9.25 10.75 3.5-3.5 1.5 1.5-3.5 3.5-2 .5z"
            />
        `,

        download: `
            <path d="M8 2.5v7"/>
            <path d="m5 7 3 3 3-3"/>
            <path d="M3 13.5h10"/>
        `,

        json: `
            <path
                d="M3.25 1.75h6l3.5 3.5v9h-9.5z"
            />

            <path
                d="M9.25 1.75v3.5h3.5"
            />

            <path
                d="M6 9c-.8 0-1.1.6-1.1 1.5S5.2 12 6 12"
            />

            <path
                d="M10 9c.8 0 1.1.6 1.1 1.5S10.8 12 10 12"
            />
        `,

        'new-file': `
            <path
                d="M3.25 1.75h6l3.5 3.5v9h-9.5z"
            />

            <path
                d="M9.25 1.75v3.5h3.5"
            />

            <path
                d="M8 8.5v4M6 10.5h4"
            />
        `
    };

    return `
        <svg
            class="ff-icon"
            width="${size}"
            height="${size}"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            focusable="false"
        >
            ${paths[name]}
        </svg>
    `;
}