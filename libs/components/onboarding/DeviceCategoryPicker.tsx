import React from 'react';
import { useTranslation } from 'next-i18next';
import type { DeviceCategory } from '../../types/fixora/fixora';
import {
	DEVICE_CATEGORY_OPTIONS,
	toggleDeviceCategory,
} from '../../utils/technicianDeviceCategory';

export interface DeviceCategoryPickerProps {
	value: DeviceCategory[];
	onChange: (next: DeviceCategory[]) => void;
	label?: string;
	hint?: string;
	emptyHint?: string;
	variant?: 'auth' | 'settings';
}

const DeviceCategoryPicker = ({
	value,
	onChange,
	label,
	hint,
	emptyHint,
	variant = 'auth',
}: DeviceCategoryPickerProps) => {
	const { t: tCommon } = useTranslation('common');

	const toggle = (category: DeviceCategory) => {
		onChange(toggleDeviceCategory(value, category));
	};

	if (variant === 'settings') {
		return (
			<div className="fts-field fts-specializations">
				{label && <label className="fts-field__label">{label}</label>}
				{hint && <p className="fts-hint">{hint}</p>}
				<div className="fts-day-row">
					{DEVICE_CATEGORY_OPTIONS.map((category) => (
						<button
							key={category}
							type="button"
							className={`fts-day-pill fts-day-pill--spec${value.includes(category) ? ' fts-day-pill--active' : ''}`}
							onClick={() => toggle(category)}
						>
							{tCommon(`booking.device.categories.${category}`)}
						</button>
					))}
				</div>
				{emptyHint && value.length === 0 && (
					<p className="fts-hint fts-hint--muted">{emptyHint}</p>
				)}
			</div>
		);
	}

	return (
		<div className="auth-onboarding-specializations">
			{label && <p className="fixora-input__label">{label}</p>}
			{hint && <p className="auth-form__hint auth-form__hint--static">{hint}</p>}
			<div className="auth-onboarding-days">
				{DEVICE_CATEGORY_OPTIONS.map((category) => (
					<button
						key={category}
						type="button"
						className={`auth-onboarding-days__pill${value.includes(category) ? ' auth-onboarding-days__pill--active' : ''}`}
						onClick={() => toggle(category)}
					>
						{tCommon(`booking.device.categories.${category}`)}
					</button>
				))}
			</div>
			{emptyHint && value.length === 0 && (
				<span className="fixora-input__helper">{emptyHint}</span>
			)}
		</div>
	);
};

export default DeviceCategoryPicker;
