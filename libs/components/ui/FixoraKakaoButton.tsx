import React, { ButtonHTMLAttributes } from 'react';
import { useTranslation } from 'next-i18next';

export interface FixoraKakaoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	labelKey?: string;
}

const FixoraKakaoButton = ({
	labelKey = 'ui.continueWithKakao',
	className = '',
	...rest
}: FixoraKakaoButtonProps) => {
	const { t } = useTranslation('common');

	return (
		<button type="button" className={`fixora-kakao-btn ${className}`.trim()} {...rest}>
			<span className="fixora-kakao-btn__icon" aria-hidden="true">
				K
			</span>
			<span>{t(labelKey)}</span>
		</button>
	);
};

export default FixoraKakaoButton;
