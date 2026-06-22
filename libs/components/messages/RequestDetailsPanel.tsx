import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { Booking, ConversationPeer, Device } from '../../types/fixora/fixora';
import { bookingRefId } from '../../utils/messageHelpers';
import { formatKrw } from '../../utils/formatCurrency';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import { getPrimaryDeviceImageUrl } from '../../utils/deviceImage';
import UserProfileLink from '../common/UserProfileLink';
import { FixoraButton } from '../ui';

interface RequestDetailsPanelProps {
	booking?: Booking | null;
	device?: Device | null;
	technician?: ConversationPeer | null;
	loading?: boolean;
}

const RequestDetailsPanel = ({ booking, device, technician, loading }: RequestDetailsPanelProps) => {
	const { t } = useTranslation('common');

	if (loading) {
		return (
			<div className="fixora-messages__details">
				<h2 className="fixora-messages__details-title">{t('messages.requestDetails.title')}</h2>
				<p className="fixora-messages__empty">{t('messages.loading')}</p>
			</div>
		);
	}

	if (!booking) {
		return (
			<div className="fixora-messages__details">
				<h2 className="fixora-messages__details-title">{t('messages.requestDetails.title')}</h2>
				<p className="fixora-messages__empty">{t('messages.requestDetails.empty')}</p>
			</div>
		);
	}

	const price = booking.finalPrice ?? booking.estimatedPrice;
	const techName = technician?.shopName || technician?.userFullName || technician?.userNickname || '';
	const deviceImageUrl = getPrimaryDeviceImageUrl(device?.deviceImage);

	return (
		<div className="fixora-messages__details">
			<h2 className="fixora-messages__details-title">{t('messages.requestDetails.title')}</h2>

			{technician && (
				<div className="fixora-messages__details-tech">
					<UserProfileLink userId={technician._id} userType={technician.userType} className="fixora-messages__profile-link">
						<img
							className="fixora-messages__details-tech-avatar"
							src={resolveProfileImageUrl(technician.userProfileImage)}
							alt=""
						/>
					</UserProfileLink>
					<div className="fixora-messages__details-tech-info">
						<div className="fixora-messages__details-tech-name">
							<UserProfileLink userId={technician._id} userType={technician.userType} className="fixora-messages__profile-link fixora-messages__profile-link--name">
								<strong>{techName}</strong>
							</UserProfileLink>
							{technician.isVerified && <VerifiedOutlinedIcon className="fixora-messages__verified-icon" fontSize="inherit" />}
						</div>
						{technician.specialty && <span className="fixora-messages__details-tech-specialty">{technician.specialty}</span>}
						{technician.averageRating != null && (
							<span className="fixora-messages__details-tech-rating">
								<StarRoundedIcon fontSize="inherit" />
								{technician.averageRating.toFixed(1)}
								{technician.reviewCount != null && ` (${technician.reviewCount})`}
							</span>
						)}
						{technician.userLocation && (
							<span className="fixora-messages__details-tech-location">
								<LocationOnOutlinedIcon fontSize="inherit" />
								{technician.userLocation}
							</span>
						)}
					</div>
				</div>
			)}

			<div className="fixora-messages__details-ref">
				<dt>{t('messages.requestDetails.reference')}</dt>
				<dd>{bookingRefId(booking._id)}</dd>
			</div>

			<div className="fixora-messages__details-device">
				{deviceImageUrl && <img src={deviceImageUrl} alt="" />}
				<div>
					<strong>
						{device ? `${t(`booking.device.categories.${device.deviceCategory}`)} ${device.deviceModel}` : booking.problemTitle}
					</strong>
					<span>{booking.problemTitle}</span>
				</div>
			</div>

			{booking.problemDescription && (
				<div className="fixora-messages__details-problem">
					<dt>{t('messages.requestDetails.problem')}</dt>
					<dd>{booking.problemDescription}</dd>
				</div>
			)}

			<dl className="fixora-messages__details-list">
				<div>
					<dt>{t('messages.requestDetails.status')}</dt>
					<dd>
						<span className={`fixora-messages__status fixora-messages__status--${booking.bookingStatus.toLowerCase()}`}>
							{t(`booking.status.${booking.bookingStatus}`)}
						</span>
					</dd>
				</div>

				{booking.bookingDate && (
					<>
						<div>
							<dt>{t('messages.requestDetails.date')}</dt>
							<dd>
								<Moment format="MMMM D, YYYY">{booking.bookingDate}</Moment>
							</dd>
						</div>
						<div>
							<dt>{t('messages.requestDetails.time')}</dt>
							<dd>
								<Moment format="h:mm A">{booking.bookingDate}</Moment>
							</dd>
						</div>
					</>
				)}

				{price != null && (
					<div>
						<dt>{t('messages.requestDetails.price')}</dt>
						<dd>{formatKrw(price)}</dd>
					</div>
				)}
			</dl>

			<Link href={`/mypage/bookings/${booking._id}`} className="fixora-messages__details-cta">
				<FixoraButton fullWidth>{t('messages.requestDetails.viewRequest')}</FixoraButton>
			</Link>
		</div>
	);
};

export default RequestDetailsPanel;
