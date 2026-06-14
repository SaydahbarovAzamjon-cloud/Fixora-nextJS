import React, { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface TechnicianProfileFormProps {
	initialData?: {
		fullName?: string;
		nickname?: string;
		bio?: string;
		location?: string;
		profileImage?: string;
		rating?: number;
		jobsCompleted?: number;
		experience?: string;
	};
	onSave?: (data: any) => void;
}

const TechnicianProfileForm: React.FC<TechnicianProfileFormProps> = ({
	initialData = {
		fullName: 'Alex K.',
		nickname: 'alex-iphone-specialist',
		bio: 'I am a professional technician with 6+ years of experience in mobile and laptop repairs. Specialized in Apple device repairs with expertise in screen replacements, battery issues, and water damage repairs.',
		location: 'Busan, KR',
		rating: 4.9,
		jobsCompleted: 210,
		experience: '6+ years',
	},
	onSave,
}) => {
	const [formData, setFormData] = useState(initialData);
	const [isSaving, setIsSaving] = useState(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSave = async () => {
		setIsSaving(true);
		setTimeout(() => {
			onSave?.(formData);
			setIsSaving(false);
		}, 1000);
	};

	return (
		<div className="fixora-technician-profile-form">
			{/* Header */}
			<div className="fixora-profile-form__header">
				<h2 className="fixora-profile-form__title">Public Profile</h2>
				<p className="fixora-profile-form__subtitle">
					This is how customers see your profile
				</p>
			</div>

			{/* Profile Image Section */}
			<div className="fixora-profile-form__section">
				<h3 className="fixora-profile-form__section-title">Profile Photo</h3>
				<div className="fixora-profile-form__image-upload">
					<div className="fixora-profile-avatar">
						{initialData.profileImage ? (
							<img
								src={initialData.profileImage}
								alt="Profile"
							/>
						) : (
							initialData.fullName
								?.split(' ')
								.map((n) => n[0])
								.join('')
								.substring(0, 2)
								.toUpperCase()
						)}
					</div>
					<button className="fixora-profile-form__upload-btn">
						<PhotoCameraIcon />
						Change Photo
					</button>
				</div>
			</div>

			{/* Basic Info */}
			<div className="fixora-profile-form__section">
				<h3 className="fixora-profile-form__section-title">Basic Info</h3>
				<div className="fixora-profile-form__grid">
					<div className="fixora-form-group">
						<label className="fixora-form-group__label">Full Name</label>
						<input
							type="text"
							name="fullName"
							className="fixora-form-group__input"
							value={formData.fullName}
							onChange={handleChange}
						/>
					</div>
					<div className="fixora-form-group">
						<label className="fixora-form-group__label">Nickname</label>
						<input
							type="text"
							name="nickname"
							className="fixora-form-group__input"
							value={formData.nickname}
							onChange={handleChange}
						/>
					</div>
				</div>
			</div>

			{/* Location & Experience */}
			<div className="fixora-profile-form__section">
				<h3 className="fixora-profile-form__section-title">
					Location & Experience
				</h3>
				<div className="fixora-profile-form__grid">
					<div className="fixora-form-group">
						<label className="fixora-form-group__label">Location</label>
						<input
							type="text"
							name="location"
							className="fixora-form-group__input"
							placeholder="City, Country"
							value={formData.location}
							onChange={handleChange}
						/>
					</div>
					<div className="fixora-form-group">
						<label className="fixora-form-group__label">Experience</label>
						<input
							type="text"
							name="experience"
							className="fixora-form-group__input"
							placeholder="e.g., 6+ years"
							value={formData.experience}
							onChange={handleChange}
						/>
					</div>
				</div>
			</div>

			{/* Bio */}
			<div className="fixora-profile-form__section">
				<h3 className="fixora-profile-form__section-title">Bio</h3>
				<textarea
					name="bio"
					className="fixora-profile-form__textarea"
					placeholder="Tell customers about your expertise..."
					value={formData.bio}
					onChange={handleChange}
					rows={5}
				/>
				<p className="fixora-profile-form__char-count">
					{formData.bio?.length || 0} / 500 characters
				</p>
			</div>

			{/* Stats (Read-only) */}
			<div className="fixora-profile-form__section">
				<h3 className="fixora-profile-form__section-title">Stats</h3>
				<div className="fixora-profile-form__stats-grid">
					<div className="fixora-stat-card">
						<span className="fixora-stat-card__label">Rating</span>
						<span className="fixora-stat-card__value">
							⭐ {formData.rating}
						</span>
					</div>
					<div className="fixora-stat-card">
						<span className="fixora-stat-card__label">Jobs Completed</span>
						<span className="fixora-stat-card__value">
							{formData.jobsCompleted}
						</span>
					</div>
					<div className="fixora-stat-card">
						<span className="fixora-stat-card__label">Experience</span>
						<span className="fixora-stat-card__value">
							{formData.experience}
						</span>
					</div>
				</div>
			</div>

			{/* Save Button */}
			<div className="fixora-profile-form__footer">
				<button
					className="fixora-profile-form__save-btn"
					onClick={handleSave}
					disabled={isSaving}
				>
					<SaveIcon />
					{isSaving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>
	);
};

export default TechnicianProfileForm;
