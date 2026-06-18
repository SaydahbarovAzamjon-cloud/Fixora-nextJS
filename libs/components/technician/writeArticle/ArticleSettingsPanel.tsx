import React from 'react';
import { useTranslation } from 'next-i18next';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import WriteArticleCard, { WriteArticleCardHead } from './WriteArticleCard';
import WriteArticleToggle from './WriteArticleToggle';
import { PublicationMode, VisibilityMode } from '../../../hooks/useWriteArticleForm';

interface ArticleSettingsPanelProps {
	pubMode: PublicationMode;
	visibility: VisibilityMode;
	featured: boolean;
	allowComments: boolean;
	onPubMode: (mode: PublicationMode) => void;
	onVisibility: (v: VisibilityMode) => void;
	onFeatured: (v: boolean) => void;
	onAllowComments: (v: boolean) => void;
}

const ArticleSettingsPanel: React.FC<ArticleSettingsPanelProps> = ({
	pubMode,
	visibility,
	featured,
	allowComments,
	onPubMode,
	onVisibility,
	onFeatured,
	onAllowComments,
}) => {
	const { t } = useTranslation('technician');

	const pubOptions: { id: PublicationMode; icon: React.ReactNode; labelKey: string; color: string }[] = [
		{ id: 'draft', icon: <SaveOutlined style={{ fontSize: 13 }} />, labelKey: 'writeArticle.saveDraftMode', color: '#606060' },
		{ id: 'publish', icon: <SendOutlined style={{ fontSize: 13 }} />, labelKey: 'writeArticle.publishNow', color: '#22C55E' },
		{ id: 'schedule', icon: <CalendarTodayOutlined style={{ fontSize: 13 }} />, labelKey: 'writeArticle.schedulePublication', color: '#3B82F6' },
	];

	return (
		<WriteArticleCard padding={false}>
			<WriteArticleCardHead
				title={t('writeArticle.articleSettings')}
				icon={<DescriptionOutlined style={{ fontSize: 14, color: '#A855F7' }} />}
				iconClass="ftwa-card-head__icon--purple"
			/>
			<div className="ftwa-settings">
				<div className="ftwa-settings__section">
					<label className="ftwa-seo__label">{t('writeArticle.publication')}</label>
					<div className="ftwa-settings__pub-list">
						{pubOptions.map(({ id, icon, labelKey, color }) => (
							<button
								key={id}
								type="button"
								className={`ftwa-settings__pub-btn ${pubMode === id ? 'ftwa-settings__pub-btn--active' : ''}`}
								style={
									pubMode === id
										? ({
												'--pub-color': color,
											} as React.CSSProperties)
										: undefined
								}
								onClick={() => onPubMode(id)}
							>
								{icon}
								{t(labelKey)}
								{pubMode === id && <span className="ftwa-settings__pub-dot" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />}
							</button>
						))}
					</div>
				</div>

				<div className="ftwa-settings__section">
					<label className="ftwa-seo__label">{t('writeArticle.visibility')}</label>
					<div className="ftwa-settings__visibility">
						<button
							type="button"
							className={`ftwa-settings__vis-btn ${visibility === 'public' ? 'ftwa-settings__vis-btn--active' : ''}`}
							onClick={() => onVisibility('public')}
						>
							<PublicOutlined style={{ fontSize: 11 }} />
							{t('writeArticle.public')}
						</button>
						<button
							type="button"
							className={`ftwa-settings__vis-btn ${visibility === 'technicians' ? 'ftwa-settings__vis-btn--active' : ''}`}
							onClick={() => onVisibility('technicians')}
						>
							<LockOutlined style={{ fontSize: 11 }} />
							{t('writeArticle.techsOnly')}
						</button>
					</div>
				</div>

				<div className="ftwa-settings__toggle-row">
					<div>
						<div className="ftwa-settings__toggle-label">{t('writeArticle.featuredArticle')}</div>
						<div className="ftwa-settings__toggle-sub">{t('writeArticle.featuredSub')}</div>
					</div>
					<WriteArticleToggle
						on={featured}
						onChange={() => onFeatured(!featured)}
						ariaLabel={t('writeArticle.featuredArticle')}
					/>
				</div>

				<div className="ftwa-settings__toggle-row">
					<div>
						<div className="ftwa-settings__toggle-label">{t('writeArticle.allowComments')}</div>
						<div className="ftwa-settings__toggle-sub">{t('writeArticle.allowCommentsSub')}</div>
					</div>
					<WriteArticleToggle
						on={allowComments}
						onChange={() => onAllowComments(!allowComments)}
						ariaLabel={t('writeArticle.allowComments')}
					/>
				</div>
			</div>
		</WriteArticleCard>
	);
};

export default ArticleSettingsPanel;
