import { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { GET_TECHNICIAN_REVIEWS, GET_TECHNICIAN_TRENDING } from '../../apollo/user/query';
import { TechnicianReview } from '../types/fixora/fixora';
import { resolveProfileImageUrl } from '../utils/profileImage';

const TECHNICIAN_POOL = 8;
const REVIEWS_PER_TECHNICIAN = 3;
const MAX_TESTIMONIALS = 9;

export interface HomepageTestimonial {
	id: string;
	text: string;
	name: string;
	avatar: string;
	rating: number;
}

const averageReviewScore = (review: TechnicianReview): number => {
	const scores = [review.repairQuality, review.repairSpeed, review.communication].filter(
		(value): value is number => typeof value === 'number' && !Number.isNaN(value),
	);
	if (!scores.length) return 0;
	return scores.reduce((sum, value) => sum + value, 0) / scores.length;
};

const formatCustomerName = (customer?: TechnicianReview['customerData']): string => {
	if (!customer) return 'Customer';
	const nickname = customer.userNickname?.trim();
	if (nickname) return nickname;
	const fullName = customer.userFullName?.trim();
	if (!fullName) return 'Customer';
	const parts = fullName.split(/\s+/).filter(Boolean);
	if (parts.length === 1) return parts[0];
	return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
};

const mapReviewToTestimonial = (review: TechnicianReview): HomepageTestimonial => ({
	id: review._id,
	text: review.reviewContent!.trim(),
	name: formatCustomerName(review.customerData),
	avatar: resolveProfileImageUrl(review.customerData?.userProfileImage),
	rating: averageReviewScore(review),
});

export function useHomepageTestimonials() {
	const client = useApolloClient();
	const [testimonials, setTestimonials] = useState<HomepageTestimonial[]>([]);
	const [loadingReviews, setLoadingReviews] = useState(false);

	const { data, loading: loadingTechnicians } = useQuery(GET_TECHNICIAN_TRENDING, {
		variables: { limit: TECHNICIAN_POOL },
		fetchPolicy: 'cache-and-network',
	});

	useEffect(() => {
		const technicians = (data?.getTechnicianTrending?.list ?? []).filter(
			(tech: { reviewCount?: number }) => (tech.reviewCount ?? 0) > 0,
		);

		if (!technicians.length) {
			setTestimonials([]);
			setLoadingReviews(false);
			return;
		}

		let cancelled = false;
		setLoadingReviews(true);

		void (async () => {
			try {
				const results = await Promise.all(
					technicians.map((tech: { _id: string }) =>
						client.query({
							query: GET_TECHNICIAN_REVIEWS,
							variables: {
								input: {
									page: 1,
									limit: REVIEWS_PER_TECHNICIAN,
									sort: 'createdAt',
									direction: 'DESC',
									search: { technicianId: tech._id },
								},
							},
							fetchPolicy: 'network-only',
						}),
					),
				);

				if (cancelled) return;

				const merged = results
					.flatMap((result) => (result.data?.getTechnicianReviews?.list ?? []) as TechnicianReview[])
					.filter((review) => review.reviewContent?.trim())
					.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
					.slice(0, MAX_TESTIMONIALS)
					.map(mapReviewToTestimonial);

				setTestimonials(merged);
			} catch {
				if (!cancelled) setTestimonials([]);
			} finally {
				if (!cancelled) setLoadingReviews(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [client, data]);

	return {
		testimonials,
		loading: loadingTechnicians || loadingReviews,
	};
}
