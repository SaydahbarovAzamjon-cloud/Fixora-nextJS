import React, { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';

interface SettingsFormProps {
	onSave?: (data: any) => void;
}

const TechnicianSettingsForm: React.FC<SettingsFormProps> = ({ onSave }) => {
	const [activeTab, setActiveTab] = useState('profile');
	const [isSaving, setIsSaving] = useState(false);
	const [settings, setSettings] = useState({
		language: 'en',
		currency: 'KRW',
		workingDays: 'Mon-Sat',
		startTime: '09:00',
		endTime: '20:00',
		timezone: 'Asia/Seoul',
		theme: 'dark',
		emailNotifications: true,
		smsNotifications: true,
		pushNotifications: true,
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		setSettings((prev) => ({
			...prev,
			[name]:
				type === 'checkbox'
					? (e.target as HTMLInputElement).checked
					: value,
		}));
	};

	const handleSave = async () => {
		setIsSaving(true);
		setTimeout(() => {
			onSave?.(settings);
			setIsSaving(false);
		}, 1000);
	};

	return (
		<div className="fixora-settings-form">
			{/* Header */}
			<div className="fixora-settings-form__header">
				<h2 className="fixora-settings-form__title">Settings</h2>
			</div>

			{/* Tabs */}
			<div className="fixora-settings-form__tabs">
				<button
					className={`fixora-settings-form__tab ${
						activeTab === 'profile' ? 'fixora-settings-form__tab--active' : ''
					}`}
					onClick={() => setActiveTab('profile')}
				>
					Profile Settings
				</button>
				<button
					className={`fixora-settings-form__tab ${
						activeTab === 'account' ? 'fixora-settings-form__tab--active' : ''
					}`}
					onClick={() => setActiveTab('account')}
				>
					Account Settings
				</button>
				<button
					className={`fixora-settings-form__tab ${
						activeTab === 'notifications'
							? 'fixora-settings-form__tab--active'
							: ''
					}`}
					onClick={() => setActiveTab('notifications')}
				>
					Notifications
				</button>
			</div>

			{/* Tab Content */}
			<div className="fixora-settings-form__content">
				{/* Profile Settings Tab */}
				{activeTab === 'profile' && (
					<div className="fixora-settings-section">
						<h3 className="fixora-settings-section__title">
							Profile Information
						</h3>

						<div className="fixora-settings-section__group">
							<label className="fixora-settings-label">Language</label>
							<select
								name="language"
								value={settings.language}
								onChange={handleChange}
								className="fixora-settings-input"
							>
								<option value="en">English</option>
								<option value="ko">Korean</option>
								<option value="ru">Russian</option>
							</select>
						</div>

						<div className="fixora-settings-section__group">
							<label className="fixora-settings-label">Currency</label>
							<select
								name="currency"
								value={settings.currency}
								onChange={handleChange}
								className="fixora-settings-input"
							>
								<option value="KRW">KRW (₩)</option>
								<option value="USD">USD ($)</option>
								<option value="EUR">EUR (€)</option>
							</select>
						</div>
					</div>
				)}

				{/* Account Settings Tab */}
				{activeTab === 'account' && (
					<div className="fixora-settings-section">
						<h3 className="fixora-settings-section__title">
							Working Hours
						</h3>

						<div className="fixora-settings-section__group">
							<label className="fixora-settings-label">Working Days</label>
							<select
								name="workingDays"
								value={settings.workingDays}
								onChange={handleChange}
								className="fixora-settings-input"
							>
								<option value="Mon-Fri">Monday - Friday</option>
								<option value="Mon-Sat">Monday - Saturday</option>
								<option value="Mon-Sun">Monday - Sunday</option>
							</select>
						</div>

						<div className="fixora-settings-section__group">
							<label className="fixora-settings-label">Start Time</label>
							<input
								type="time"
								name="startTime"
								value={settings.startTime}
								onChange={handleChange}
								className="fixora-settings-input"
							/>
						</div>

						<div className="fixora-settings-section__group">
							<label className="fixora-settings-label">End Time</label>
							<input
								type="time"
								name="endTime"
								value={settings.endTime}
								onChange={handleChange}
								className="fixora-settings-input"
							/>
						</div>

						<div className="fixora-settings-section__group">
							<label className="fixora-settings-label">Timezone</label>
							<select
								name="timezone"
								value={settings.timezone}
								onChange={handleChange}
								className="fixora-settings-input"
							>
								<option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
								<option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
								<option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
							</select>
						</div>

						<div className="fixora-settings-section__group">
							<label className="fixora-settings-label">Theme</label>
							<select
								name="theme"
								value={settings.theme}
								onChange={handleChange}
								className="fixora-settings-input"
							>
								<option value="dark">Dark Mode</option>
								<option value="light">Light Mode</option>
								<option value="auto">Auto (System)</option>
							</select>
						</div>
					</div>
				)}

				{/* Notifications Tab */}
				{activeTab === 'notifications' && (
					<div className="fixora-settings-section">
						<h3 className="fixora-settings-section__title">
							Notification Preferences
						</h3>

						<div className="fixora-settings-section__checkbox">
							<label className="fixora-checkbox">
								<input
									type="checkbox"
									name="emailNotifications"
									checked={settings.emailNotifications}
									onChange={handleChange}
								/>
								<span className="fixora-checkbox__label">
									Email Notifications
								</span>
							</label>
							<p className="fixora-settings-section__help">
								Receive email notifications for new requests and messages
							</p>
						</div>

						<div className="fixora-settings-section__checkbox">
							<label className="fixora-checkbox">
								<input
									type="checkbox"
									name="smsNotifications"
									checked={settings.smsNotifications}
									onChange={handleChange}
								/>
								<span className="fixora-checkbox__label">
									SMS Notifications
								</span>
							</label>
							<p className="fixora-settings-section__help">
								Receive SMS alerts for urgent requests
							</p>
						</div>

						<div className="fixora-settings-section__checkbox">
							<label className="fixora-checkbox">
								<input
									type="checkbox"
									name="pushNotifications"
									checked={settings.pushNotifications}
									onChange={handleChange}
								/>
								<span className="fixora-checkbox__label">
									Push Notifications
								</span>
							</label>
							<p className="fixora-settings-section__help">
								Receive push notifications on your devices
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="fixora-settings-form__footer">
				<button
					className="fixora-settings-form__save-btn"
					onClick={handleSave}
					disabled={isSaving}
				>
					<SaveIcon />
					{isSaving ? 'Saving...' : 'Save Settings'}
				</button>
			</div>
		</div>
	);
};

export default TechnicianSettingsForm;
