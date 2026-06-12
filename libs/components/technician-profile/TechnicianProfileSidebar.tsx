import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { TechnicianProfile } from '../../types/fixora/fixora';

interface TechnicianProfileSidebarProps {
	technician: TechnicianProfile;
}

const TechnicianProfileSidebar = ({ technician }: TechnicianProfileSidebarProps) => {
	const { t } = useTranslation('common');
	const hours = technician.workingHours;

	return (
		<aside className="fixora-tech-profile__sidebar">
			<div className="fixora-tech-profile__sidebar-card">
				<h3>{t('technicianProfile.sidebar.hours')}</h3>
				{hours?.days?.length ? (
					<div className="fixora-tech-profile__hours">
						<p>{hours.days.join(', ')}</p>
						{hours.startTime && hours.endTime && (
							<p>
								<AccessTimeOutlinedIcon fontSize="inherit" />
								{hours.startTime} – {hours.endTime}
							</p>
						)}
					</div>
				) : (
					<p className="fixora-tech-profile__empty">{t('technicianProfile.sidebar.hoursEmpty')}</p>
				)}
			</div>

			<div className="fixora-tech-profile__sidebar-card fixora-tech-profile__sidebar-card--cta">
				<p>{t('technicianProfile.sidebar.bookHint')}</p>
				<Link href={`/technicians/${technician._id}/book`} className="fixora-tech-profile__book-btn">
					{t('technicianProfile.sidebar.bookCta')}
				</Link>
			</div>
		</aside>
	);
};

export default TechnicianProfileSidebar;
