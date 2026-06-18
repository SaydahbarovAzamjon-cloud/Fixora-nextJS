import React from 'react';
import { useTranslation } from 'next-i18next';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsSaveButton from '../SettingsSaveButton';
import SettingsEmptyBackend from '../SettingsEmptyBackend';
import {
	AvailabilityFormState,
	SETTINGS_DAYS,
	SETTINGS_HOURS,
} from '../../../../hooks/useTechnicianSettings';

interface AvailabilitySectionProps {
	availability: AvailabilityFormState;
	onToggleDay: (day: string) => void;
	onStartTime: (v: string) => void;
	onEndTime: (v: string) => void;
	onSave: () => Promise<boolean>;
	saving: boolean;
}

const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
	availability,
	onToggleDay,
	onStartTime,
	onEndTime,
	onSave,
	saving,
}) => {
	const { t } = useTranslation('technician');

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.availability.title')} desc={t('settings.availability.desc')} />

			<div className="fts-card fts-card--spaced">
				<h3 className="fts-card__title">{t('settings.availability.workingDays')}</h3>
				<div className="fts-day-row">
					{SETTINGS_DAYS.map((day) => (
						<button
							key={day}
							type="button"
							className={`fts-day-pill ${availability.days[day] ? 'fts-day-pill--active' : ''}`}
							onClick={() => onToggleDay(day)}
						>
							{day}
						</button>
					))}
				</div>
			</div>

			<div className="fts-grid fts-grid--2">
				<div className="fts-card">
					<div className="fts-card__label">{t('settings.availability.startTime')}</div>
					<select
						className="fts-select"
						value={availability.startTime}
						onChange={(e) => onStartTime(e.target.value)}
					>
						{SETTINGS_HOURS.map((h) => (
							<option key={h} value={h}>
								{h}
							</option>
						))}
					</select>
				</div>
				<div className="fts-card">
					<div className="fts-card__label">{t('settings.availability.endTime')}</div>
					<select
						className="fts-select"
						value={availability.endTime}
						onChange={(e) => onEndTime(e.target.value)}
					>
						{SETTINGS_HOURS.map((h) => (
							<option key={h} value={h}>
								{h}
							</option>
						))}
					</select>
				</div>
			</div>

			<SettingsSaveButton onClick={onSave} loading={saving} label={t('settings.saveChanges')} />
		</div>
	);
};

export default AvailabilitySection;
