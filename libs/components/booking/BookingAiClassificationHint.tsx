import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useBookingAiClassification } from '../../hooks/useBookingAiClassification';
import type { IssueClassificationResult } from '../../types/fixora/fixora';

interface BookingAiClassificationHintProps {
	problemTitle: string;
	problemDescription: string;
	deviceIssue: string;
	isNewDevice: boolean;
}

function buildProblemText(
	problemTitle: string,
	problemDescription: string,
	deviceIssue: string,
	isNewDevice: boolean,
): string {
	return [problemTitle, problemDescription, isNewDevice ? deviceIssue : '']
		.map((part) => part.trim())
		.filter(Boolean)
		.join('. ');
}

function ClassificationChips({
	classification,
	t,
}: {
	classification: IssueClassificationResult;
	t: (key: string) => string;
}) {
	const chips = useMemo(() => {
		const items: { key: string; label: string; muted?: boolean }[] = [
			{
				key: 'device',
				label: t(`booking.device.categories.${classification.deviceType}`),
			},
			{
				key: 'issue',
				label: t(`booking.aiClassification.issueCategory.${classification.issueCategory}`),
			},
			{
				key: 'complexity',
				label: t(`booking.aiClassification.repairComplexity.${classification.repairComplexity}`),
			},
		];

		classification.keywords?.slice(0, 4).forEach((keyword) => {
			items.push({ key: `kw-${keyword}`, label: keyword, muted: true });
		});

		return items;
	}, [classification, t]);

	return (
		<div className="fixora-booking-ai-hint__chips">
			{chips.map((chip) => (
				<span
					key={chip.key}
					className={`fixora-booking-ai-hint__chip${chip.muted ? ' fixora-booking-ai-hint__chip--muted' : ''}`}
				>
					{chip.label}
				</span>
			))}
		</div>
	);
}

const BookingAiClassificationHint: React.FC<BookingAiClassificationHintProps> = ({
	problemTitle,
	problemDescription,
	deviceIssue,
	isNewDevice,
}) => {
	const { t } = useTranslation('common');
	const problemText = useMemo(
		() => buildProblemText(problemTitle, problemDescription, deviceIssue, isNewDevice),
		[problemTitle, problemDescription, deviceIssue, isNewDevice],
	);
	const { classification, loading } = useBookingAiClassification(problemText);

	const showPanel = loading || !!classification;
	if (!showPanel) return null;

	return (
		<div className="fixora-booking-ai-hint" aria-live="polite">
			<div className="fixora-booking-ai-hint__head">
				<AutoAwesomeOutlinedIcon className="fixora-booking-ai-hint__icon" fontSize="small" />
				<div>
					<p className="fixora-booking-ai-hint__title">{t('booking.aiClassification.title')}</p>
					<p className="fixora-booking-ai-hint__subtitle">{t('booking.aiClassification.hint')}</p>
				</div>
			</div>

			{loading && !classification && (
				<p className="fixora-booking-ai-hint__loading">{t('booking.aiClassification.analyzing')}</p>
			)}

			{classification && (
				<>
					<ClassificationChips classification={classification} t={t} />
					<p className="fixora-booking-ai-hint__confidence">
						{t('booking.aiClassification.confidence', {
							score:
								classification.confidenceScore <= 1
									? Math.round(classification.confidenceScore * 100)
									: Math.round(classification.confidenceScore),
						})}
					</p>
				</>
			)}
		</div>
	);
};

export default BookingAiClassificationHint;
