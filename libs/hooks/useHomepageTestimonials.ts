import { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { GET_TECHNICIAN_REVIEWS, GET_TECHNICIANS } from '../../apollo/user/query';
import { TechnicianReview } from '../types/fixora/fixora';
import { resolveProfileImageUrl } from '../utils/profileImage';

/** Prefer recently active techs so brand-new reviews surface in the carousel. */
const TECHNICIAN_POOL = 40;
const REVIEWS_PER_TECHNICIAN = 3;
const MAX_TESTIMONIALS = 3;

type TechnicianPoolItem = {
	_id: string;
	userNickname?: string;
	userFullName?: string;
	shopName?: string;
	reviewCount?: number;
};

export interface HomepageTestimonial {
	id: string;
	text: string;
	name: string;
	technicianName: string;
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

const formatTechnicianName = (
	technician?: TechnicianReview['technicianData'],
	fallback?: TechnicianPoolItem,
): string => {
	const shop = technician?.shopName?.trim() || fallback?.shopName?.trim();
	if (shop) return shop;
	const nickname = technician?.userNickname?.trim() || fallback?.userNickname?.trim();
	if (nickname) return nickname;
	const fullName = technician?.userFullName?.trim() || fallback?.userFullName?.trim();
	if (fullName) return fullName;
	return 'Technician';
};

const mapReviewToTestimonial = (
	review: TechnicianReview,
	fallbackTech?: TechnicianPoolItem,
): HomepageTestimonial => ({
	id: review._id,
	text: review.reviewContent!.trim(),
	name: formatCustomerName(review.customerData),
	technicianName: formatTechnicianName(review.technicianData, fallbackTech),
	avatar: resolveProfileImageUrl(review.customerData?.userProfileImage),
	rating: averageReviewScore(review),
});

export function useHomepageTestimonials() {
	const client = useApolloClient();
	const [testimonials, setTestimonials] = useState<HomepageTestimonial[]>([]);
	const [loadingReviews, setLoadingReviews] = useState(false);

	const { data, loading: loadingTechnicians } = useQuery(GET_TECHNICIANS, {
		variables: {
			input: {
				page: 1,
				limit: TECHNICIAN_POOL,
				sort: 'updatedAt',
				direction: 'DESC',
				search: {},
			},
		},
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		const technicians = (data?.getTechnicians?.list ?? []) as TechnicianPoolItem[];

		if (!technicians.length) {
			setTestimonials([]);
			setLoadingReviews(false);
			return;
		}

		const techById = new Map(technicians.map((tech) => [tech._id, tech]));
		let cancelled = false;
		setLoadingReviews(true);

		void (async () => {
			try {
				const results = await Promise.all(
					technicians.map((tech) =>
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
					.map((review) =>
						mapReviewToTestimonial(
							review,
							review.technicianId ? techById.get(review.technicianId) : undefined,
						),
					);

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
