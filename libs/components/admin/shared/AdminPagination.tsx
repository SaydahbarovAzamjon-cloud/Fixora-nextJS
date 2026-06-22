import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'next-i18next';

interface AdminPaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const AdminPagination: React.FC<AdminPaginationProps> = ({ page, totalPages, onPageChange }) => {
	const { t } = useTranslation('admin');
	if (totalPages <= 1) return null;

	return (
		<div className="fixora-admin-pagination">
			<button
				type="button"
				className="fixora-admin-pagination__btn"
				disabled={page <= 1}
				onClick={() => onPageChange(page - 1)}
				aria-label="Previous page"
			>
				<ChevronLeft size={16} />
			</button>
			<span className="fixora-admin-pagination__label">
				{t('common.page')} {page} {t('common.of')} {totalPages}
			</span>
			<button
				type="button"
				className="fixora-admin-pagination__btn"
				disabled={page >= totalPages}
				onClick={() => onPageChange(page + 1)}
				aria-label="Next page"
			>
				<ChevronRight size={16} />
			</button>
		</div>
	);
};

export default AdminPagination;
