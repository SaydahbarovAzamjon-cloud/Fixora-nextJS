import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Booking, BookingStatus } from '../../../types/fixora/fixora';
import RequestCard from './RequestCard';

const ACTIVE_STATUSES: BookingStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS'];

export interface RequestsTabProps {
	bookings: Booking[];
}

const RequestsTab = ({ bookings }: RequestsTabProps) => {
	const { t } = useTranslation('common');

	const { active, completed } = useMemo(() => {
		const activeList: Booking[] = [];
		const completedList: Booking[] = [];
		bookings.forEach((b) => {
			if (ACTIVE_STATUSES.includes(b.bookingStatus)) activeList.push(b);
			else completedList.push(b);
		});
		return { active: activeList, completed: completedList };
	}, [bookings]);

	if (!bookings.length) {
		return <p className="fixora-mypage__empty">{t('mypage.noRequests')}</p>;
	}

	return (
		<div className="fixora-mypage__requests">
			{active.length > 0 && (
				<section className="fixora-mypage__section">
					<h3 className="fixora-mypage__section-title">{t('mypage.activeRequests')}</h3>
					<div className="fixora-mypage__request-list">
						{active.map((booking) => (
							<RequestCard key={booking._id} booking={booking} />
						))}
					</div>
				</section>
			)}

			{completed.length > 0 && (
				<section className="fixora-mypage__section">
					<h3 className="fixora-mypage__section-title">{t('mypage.completedRequests')}</h3>
					<div className="fixora-mypage__request-list">
						{completed.map((booking) => (
							<RequestCard key={booking._id} booking={booking} />
						))}
					</div>
				</section>
			)}
		</div>
	);
};

export default RequestsTab;
