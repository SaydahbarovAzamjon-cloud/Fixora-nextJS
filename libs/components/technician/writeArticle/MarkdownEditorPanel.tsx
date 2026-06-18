import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import TitleOutlined from '@mui/icons-material/TitleOutlined';
import FormatBoldOutlined from '@mui/icons-material/FormatBoldOutlined';
import FormatItalicOutlined from '@mui/icons-material/FormatItalicOutlined';
import FormatListBulletedOutlined from '@mui/icons-material/FormatListBulletedOutlined';
import FormatListNumberedOutlined from '@mui/icons-material/FormatListNumberedOutlined';
import FormatQuoteOutlined from '@mui/icons-material/FormatQuoteOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import TableChartOutlined from '@mui/icons-material/TableChartOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import WriteArticleCard from './WriteArticleCard';
import { sweetMixinErrorAlert } from '../../../sweetAlert';

const TOOLBAR_INSERT: Record<string, string> = {
	heading: '\n## ',
	bold: '**text**',
	italic: '*text*',
	bullet: '\n- ',
	ordered: '\n1. ',
	quote: '\n> ',
	code: '\n```\ncode\n```\n',
	link: '[text](url)',
	image: '![alt](url)',
	table: '\n| Col1 | Col2 |\n|------|------|\n| val  | val  |\n',
};

interface MarkdownEditorPanelProps {
	value: string;
	onChange: (value: string) => void;
	readMinutes: number;
	wordCount: number;
	error?: string;
}

const MarkdownEditorPanel: React.FC<MarkdownEditorPanelProps> = ({
	value,
	onChange,
	readMinutes,
	wordCount,
	error,
}) => {
	const { t } = useTranslation('technician');
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [activeCmd, setActiveCmd] = useState<string | null>(null);

	const insertFormat = useCallback(
		(cmd: string) => {
			const snippet = TOOLBAR_INSERT[cmd];
			if (!snippet) return;
			setActiveCmd(cmd);
			setTimeout(() => setActiveCmd(null), 300);

			const el = textareaRef.current;
			if (!el) {
				onChange(value + snippet);
				return;
			}
			const start = el.selectionStart;
			const end = el.selectionEnd;
			const next = value.slice(0, start) + snippet + value.slice(end);
			onChange(next);
			requestAnimationFrame(() => {
				el.focus();
				const pos = start + snippet.length;
				el.setSelectionRange(pos, pos);
			});
		},
		[onChange, value],
	);

	const onAiAssist = () => {
		sweetMixinErrorAlert(t('writeArticle.aiAssistSoon')).then();
	};

	const toolbarGroups = [
		[
			{ cmd: 'heading', icon: <TitleOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.heading') },
			{ cmd: 'bold', icon: <FormatBoldOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.bold') },
			{ cmd: 'italic', icon: <FormatItalicOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.italic') },
		],
		[
			{ cmd: 'bullet', icon: <FormatListBulletedOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.bullet') },
			{ cmd: 'ordered', icon: <FormatListNumberedOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.ordered') },
			{ cmd: 'quote', icon: <FormatQuoteOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.quote') },
		],
		[
			{ cmd: 'link', icon: <LinkOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.link') },
			{ cmd: 'image', icon: <ImageOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.image') },
			{ cmd: 'code', icon: <CodeOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.code') },
			{ cmd: 'table', icon: <TableChartOutlined style={{ fontSize: 14 }} />, label: t('writeArticle.toolbar.table') },
		],
	];

	return (
		<WriteArticleCard padding={false}>
			<div className="ftwa-editor">
				<div className="ftwa-editor__head">
					<label className="ftwa-label ftwa-label--inline">{t('writeArticle.contentLabel')}</label>
					<div className="ftwa-editor__stats">
						<span className="ftwa-editor__stat">
							<AccessTimeOutlined style={{ fontSize: 10 }} />
							{t('writeArticle.readTime', { count: readMinutes })}
						</span>
						<span className="ftwa-editor__dot">·</span>
						<span className="ftwa-editor__stat">{t('writeArticle.wordCount', { count: wordCount })}</span>
					</div>
				</div>

				<div className="ftwa-toolbar">
					{toolbarGroups.map((group, gi) => (
						<div key={gi} className="ftwa-toolbar__group">
							{group.map(({ cmd, icon, label }) => (
								<button
									key={cmd}
									type="button"
									title={label}
									className={`ftwa-toolbar__btn ${activeCmd === cmd ? 'ftwa-toolbar__btn--active' : ''}`}
									onClick={() => insertFormat(cmd)}
								>
									{icon}
								</button>
							))}
							{gi < toolbarGroups.length - 1 && <span className="ftwa-toolbar__sep" />}
						</div>
					))}
					<button type="button" className="ftwa-toolbar__ai" onClick={onAiAssist}>
						<AutoAwesomeOutlined style={{ fontSize: 11 }} />
						{t('writeArticle.aiAssist')}
					</button>
				</div>

				<textarea
					ref={textareaRef}
					className={`ftwa-editor__area ${error ? 'ftwa-editor__area--error' : ''}`}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					spellCheck={false}
				/>
				{error && <div className="ftwa-editor__error">{t(`writeArticle.errors.${error}`)}</div>}

				<div className="ftwa-editor__footer">
					<span>{t('writeArticle.markdownSupported')}</span>
					<a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="ftwa-editor__guide">
						{t('writeArticle.syntaxGuide')}
					</a>
				</div>
			</div>
		</WriteArticleCard>
	);
};

export default MarkdownEditorPanel;
