import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { resolveArticleImageUrl } from '../../../utils/articleImage';

interface AdminModerationArticleThumbProps {
	image?: string | null;
	title: string;
	size?: 80 | 96;
}

const AdminModerationArticleThumb: React.FC<AdminModerationArticleThumbProps> = ({
	image,
	title,
	size = 80,
}) => {
	const [failed, setFailed] = useState(false);
	const coverUrl = resolveArticleImageUrl(image);
	const showImage = !!coverUrl && !failed;

	return (
		<div
			className="fixora-admin-article-cell__thumb"
			style={{ width: size, height: size }}
			aria-hidden
		>
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
					<ImageIcon size={size === 96 ? 28 : 24} />
				</span>
			)}
		</div>
	);
};

export default AdminModerationArticleThumb;
