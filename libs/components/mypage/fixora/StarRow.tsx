import React from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface StarRowProps {
	rating: number;
	max?: number;
	className?: string;
}

const StarRow = ({ rating, max = 5, className = '' }: StarRowProps) => {
	const rounded = Math.round(rating);
	return (
		<div className={`fixora-mypage__stars ${className}`.trim()} aria-hidden>
			{Array.from({ length: max }, (_, index) => {
				const star = index + 1;
				return star <= rounded ? (
					<StarIcon key={star} fontSize="inherit" className="fixora-mypage__star fixora-mypage__star--filled" />
				) : (
					<StarBorderIcon key={star} fontSize="inherit" className="fixora-mypage__star" />
				);
			})}
		</div>
	);
};

export default StarRow;
