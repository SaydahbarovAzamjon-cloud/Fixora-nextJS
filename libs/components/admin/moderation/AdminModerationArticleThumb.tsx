import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { resolveArticleImageUrl } from '../../../utils/articleImage';

interface AdminModerationArticleThumbProps {
	image?: string | null;
	title: string;
}

const AdminModerationArticleThumb: React.FC<AdminModerationArticleThumbProps> = ({ image, title }) => {
	const [failed, setFailed] = useState(false);
	const coverUrl = resolveArticleImageUrl(image);
	const showImage = !!coverUrl && !failed;

	return (
		<div className="fixora-admin-article-cell__thumb" aria-hidden>
			{showImage ? (
				<img
					src={coverUrl}
					alt=""
					loading="lazy"
					decoding="async"
					onError={() => setFailed(true)}
				/>
			) : (
				<span className="fixora-admin-article-cell__thumb-fallback" title={title}>
					<ImageIcon size={22} />
				</span>
			)}
		</div>
	);
};

export default AdminModerationArticleThumb;
