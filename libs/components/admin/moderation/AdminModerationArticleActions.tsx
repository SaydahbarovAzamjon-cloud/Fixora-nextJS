import React from 'react';
import { useTranslation } from 'next-i18next';
import { Eye, Pencil, Trash2, Shield } from 'lucide-react';

interface AdminModerationArticleActionsProps {
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onModerate?: () => void;
	disabled?: boolean;
}

const AdminModerationArticleActions: React.FC<AdminModerationArticleActionsProps> = ({
	onView,
	onEdit,
	onDelete,
	onModerate,
	disabled,
}) => {
	const { t } = useTranslation('admin');

	return (
		<div className="fixora-admin-table-actions">
			<button
				type="button"
				className="fixora-admin-table-actions__btn"
				onClick={onView}
				disabled={disabled}
				aria-label={t('moderation.articles.actions.view')}
				title={t('moderation.articles.actions.view')}
			>
				<Eye size={15} />
			</button>
			<button
				type="button"
				className="fixora-admin-table-actions__btn"
				onClick={onEdit}
				disabled={disabled}
				aria-label={t('moderation.articles.actions.edit')}
				title={t('moderation.articles.actions.edit')}
			>
				<Pencil size={15} />
			</button>
			{onModerate && (
				<button
					type="button"
					className="fixora-admin-table-actions__btn"
					onClick={onModerate}
					disabled={disabled}
					aria-label={t('moderation.articles.actions.moderate')}
					title={t('moderation.articles.actions.moderate')}
				>
					<Shield size={15} />
				</button>
			)}
			<button
				type="button"
				className="fixora-admin-table-actions__btn fixora-admin-table-actions__btn--danger"
				onClick={onDelete}
				disabled={disabled}
				aria-label={t('moderation.articles.actions.delete')}
				title={t('moderation.articles.actions.delete')}
			>
				<Trash2 size={15} />
			</button>
		</div>
	);
};

export default AdminModerationArticleActions;
