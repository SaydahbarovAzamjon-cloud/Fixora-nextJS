export type MarkdownToolbarCmd =
	| 'heading'
	| 'bold'
	| 'italic'
	| 'bullet'
	| 'ordered'
	| 'quote'
	| 'link'
	| 'image'
	| 'code'
	| 'table';

export interface FormatResult {
	next: string;
	selectionStart: number;
	selectionEnd: number;
}

/** Apply toolbar formatting at cursor / selection. */
export function applyMarkdownFormat(
	value: string,
	start: number,
	end: number,
	cmd: MarkdownToolbarCmd,
): FormatResult {
	const selected = value.slice(start, end);

	switch (cmd) {
		case 'bold': {
			const inner = selected || 'text';
			const snippet = `**${inner}**`;
			const next = value.slice(0, start) + snippet + value.slice(end);
			if (selected) {
				return { next, selectionStart: start, selectionEnd: start + snippet.length };
			}
			return { next, selectionStart: start + 2, selectionEnd: start + 2 + inner.length };
		}
		case 'italic': {
			const inner = selected || 'text';
			const snippet = `*${inner}*`;
			const next = value.slice(0, start) + snippet + value.slice(end);
			if (selected) {
				return { next, selectionStart: start, selectionEnd: start + snippet.length };
			}
			return { next, selectionStart: start + 1, selectionEnd: start + 1 + inner.length };
		}
		case 'link': {
			const label = selected || 'text';
			const snippet = `[${label}](url)`;
			const next = value.slice(0, start) + snippet + value.slice(end);
			const urlStart = start + label.length + 3;
			return { next, selectionStart: urlStart, selectionEnd: urlStart + 3 };
		}
		case 'image': {
			const alt = selected || 'alt';
			const snippet = `![${alt}](url)`;
			const next = value.slice(0, start) + snippet + value.slice(end);
			const urlStart = start + alt.length + 4;
			return { next, selectionStart: urlStart, selectionEnd: urlStart + 3 };
		}
		case 'code': {
			if (selected.includes('\n') || selected.length > 40) {
				const snippet = `\n\`\`\`\n${selected || 'code'}\n\`\`\`\n`;
				const next = value.slice(0, start) + snippet + value.slice(end);
				return { next, selectionStart: start + snippet.length, selectionEnd: start + snippet.length };
			}
			const inner = selected || 'code';
			const snippet = `\`${inner}\``;
			const next = value.slice(0, start) + snippet + value.slice(end);
			if (selected) {
				return { next, selectionStart: start, selectionEnd: start + snippet.length };
			}
			return { next, selectionStart: start + 1, selectionEnd: start + 1 + inner.length };
		}
		case 'heading': {
			const lineStart = value.lastIndexOf('\n', start - 1) + 1;
			const lineEnd = value.indexOf('\n', start);
			const endLine = lineEnd === -1 ? value.length : lineEnd;
			const line = value.slice(lineStart, endLine);
			const stripped = line.replace(/^#{1,6}\s*/, '');
			const headingLine = `## ${stripped || 'Heading'}`;
			const next = value.slice(0, lineStart) + headingLine + value.slice(endLine);
			const selStart = lineStart + 3;
			return {
				next,
				selectionStart: selStart,
				selectionEnd: selStart + (stripped || 'Heading').length,
			};
		}
		case 'bullet': {
			const snippet = selected ? selected.split('\n').map((l) => `- ${l}`).join('\n') : '\n- ';
			const next = value.slice(0, start) + snippet + value.slice(end);
			return { next, selectionStart: start + snippet.length, selectionEnd: start + snippet.length };
		}
		case 'ordered': {
			const snippet = selected
				? selected.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n')
				: '\n1. ';
			const next = value.slice(0, start) + snippet + value.slice(end);
			return { next, selectionStart: start + snippet.length, selectionEnd: start + snippet.length };
		}
		case 'quote': {
			const snippet = selected
				? selected.split('\n').map((l) => `> ${l}`).join('\n')
				: '\n> ';
			const next = value.slice(0, start) + snippet + value.slice(end);
			return { next, selectionStart: start + snippet.length, selectionEnd: start + snippet.length };
		}
		case 'table': {
			const snippet = '\n| Col1 | Col2 |\n|------|------|\n| val  | val  |\n';
			const next = value.slice(0, start) + snippet + value.slice(end);
			return { next, selectionStart: start + snippet.length, selectionEnd: start + snippet.length };
		}
		default:
			return { next: value, selectionStart: start, selectionEnd: end };
	}
}
