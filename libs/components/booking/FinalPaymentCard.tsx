import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import { FixoraButton, FixoraGlassCard, FixoraInput, FixoraKakaoButton } from '../ui';
import { useBookingPayment, isFinalPaid } from '../../hooks/useBookingPayment';
import { formatKrw } from '../../utils/formatCurrency';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';
import type { BookingStatus, Payment, PaymentMethod } from '../../types/fixora/fixora';

export interface FinalPaymentCardProps {
	bookingId: string;
	problemTitle: string;
	technicianName?: string;
	estimatedPrice?: number;
	finalPrice?: number;
	bookingStatus?: BookingStatus;
	depositPaid?: boolean;
	onPaid?: () => void;
}

type CardPhase = 'idle' | 'processing' | 'success' | 'alreadyPaid' | 'unavailable';
type PaymentTab = 'kakao' | 'card';

const FinalPaymentCard: React.FC<FinalPaymentCardProps> = ({
	bookingId,
	problemTitle,
	technicianName,
	estimatedPrice,
	finalPrice,
	bookingStatus,
	depositPaid = false,
	onPaid,
}) => {
	const { t } = useTranslation('common');
	const { payFinal, loadPayments, loading } = useBookingPayment();
	const [phase, setPhase] = useState<CardPhase>('idle');
	const [confirmedAmount, setConfirmedAmount] = useState<number | undefined>();
	const [paymentTab, setPaymentTab] = useState<PaymentTab>('kakao');
	const [cardNumber, setCardNumber] = useState('');
	const [cardExpiry, setCardExpiry] = useState('');
	const [cardCvc, setCardCvc] = useState('');
	const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

	const totalPrice = finalPrice ?? estimatedPrice;
	const finalAmount = useMemo(() => {
		if (!totalPrice || totalPrice <= 0) return undefined;
		return Math.round(totalPrice / 2);
	}, [totalPrice]);

	const canPay =
		depositPaid &&
		(bookingStatus === 'IN_PROGRESS' || bookingStatus === 'COMPLETED') &&
		finalAmount != null &&
		finalAmount > 0;

	useEffect(() => {
		let cancelled = false;
		loadPayments(bookingId).then((payments) => {
			if (cancelled) return;
			if (isFinalPaid(payments)) {
				const finalPayment = payments.find((p) => p.paymentType === 'FINAL');
				if (finalPayment?.paymentAmount) setConfirmedAmount(finalPayment.paymentAmount);
				setPhase('alreadyPaid');
			} else if (!depositPaid) {
				setPhase('unavailable');
			} else if (bookingStatus !== 'IN_PROGRESS' && bookingStatus !== 'COMPLETED') {
				setPhase('unavailable');
			}
		});
		return () => {
			cancelled = true;
		};
	}, [bookingId, bookingStatus, depositPaid, loadPayments]);

	const validateCard = useCallback(() => {
		const next: Record<string, string> = {};
		const digits = cardNumber.replace(/\s/g, '');
		if (digits.length < 13) next.cardNumber = t('payment.card.validation.number');
		if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) next.cardExpiry = t('payment.card.validation.expiry');
		if (!/^\d{3,4}$/.test(cardCvc.trim())) next.cardCvc = t('payment.card.validation.cvc');
		setCardErrors(next);
		return Object.keys(next).length === 0;
	}, [cardCvc, cardExpiry, cardNumber, t]);

	const completePayment = useCallback(
		async (method: PaymentMethod) => {
			if (!canPay) return;
			setPhase('processing');
			const payment: Payment | null = await payFinal(bookingId, method, bookingStatus, depositPaid);
			if (!payment) {
				setPhase('idle');
				return;
			}
			setConfirmedAmount(payment.paymentAmount);
			setPhase('success');
			await sweetTopSmallSuccessAlert(t('payment.final.successTitle'), 1400);
			onPaid?.();
		},
		[bookingId, bookingStatus, canPay, depositPaid, onPaid, payFinal, t],
	);

	const handleKakaoPay = useCallback(() => {
		completePayment('KAKAOPAY');
	}, [completePayment]);

	const handleCardPay = useCallback(() => {
		if (!validateCard()) return;
		completePayment('CARD');
	}, [completePayment, validateCard]);

	const formatCardNumber = (value: string) => {
		const digits = value.replace(/\D/g, '').slice(0, 16);
		return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
	};

	const formatExpiry = (value: string) => {
		const digits = value.replace(/\D/g, '').slice(0, 4);
		if (digits.length <= 2) return digits;
		return `${digits.slice(0, 2)}/${digits.slice(2)}`;
	};

	if (phase === 'success') {
		return (
			<FixoraGlassCard className="fixora-deposit-payment fixora-deposit-payment--success">
				<CheckCircleOutlineIcon className="fixora-deposit-payment__success-icon" />
				<h2 className="fixora-deposit-payment__title">{t('payment.final.successTitle')}</h2>
				<p className="fixora-deposit-payment__text">{t('payment.final.successMessage')}</p>
			</FixoraGlassCard>
		);
	}

	if (phase === 'alreadyPaid') {
		return (
			<div className="fixora-deposit-payment__badge-wrap">
				<span className="fixora-deposit-payment__badge fixora-deposit-payment__badge--paid">{t('payment.final.alreadyPaid')}</span>
				{(confirmedAmount ?? finalAmount) != null && (
					<span className="fixora-deposit-payment__badge-amount">{formatKrw(confirmedAmount ?? finalAmount ?? 0)}</span>
				)}
			</div>
		);
	}

	if (phase === 'unavailable' || !canPay) {
		return (
			<FixoraGlassCard className="fixora-deposit-payment fixora-deposit-payment--waiting">
				<h2 className="fixora-deposit-payment__title">{t('payment.final.title')}</h2>
				<p className="fixora-deposit-payment__text">
					{!depositPaid ? t('payment.final.depositRequired') : t('payment.final.notReady')}
				</p>
			</FixoraGlassCard>
		);
	}

	return (
		<FixoraGlassCard className="fixora-deposit-payment">
			<h2 className="fixora-deposit-payment__title">{t('payment.final.title')}</h2>
			<p className="fixora-deposit-payment__text">{t('payment.final.subtitle')}</p>

			<div className="fixora-deposit-payment__summary">
				<div className="fixora-deposit-payment__row">
					<span className="fixora-deposit-payment__label">{problemTitle}</span>
					{technicianName && <span className="fixora-deposit-payment__tech">{technicianName}</span>}
				</div>
			</div>

			<div className="fixora-deposit-payment__breakdown">
				<div className="fixora-deposit-payment__line fixora-deposit-payment__line--highlight">
					<span>{t('payment.final.amount')}</span>
					<strong>{finalAmount != null ? formatKrw(finalAmount) : '—'}</strong>
				</div>
			</div>

			<p className="fixora-deposit-payment__hint">{t('payment.final.breakdown')}</p>

			<div className="fixora-deposit-payment__methods" role="tablist" aria-label={t('payment.method.label')}>
				<button
					type="button"
					role="tab"
					aria-selected={paymentTab === 'kakao'}
					className={`fixora-deposit-payment__method${paymentTab === 'kakao' ? ' fixora-deposit-payment__method--active' : ''}`}
					onClick={() => setPaymentTab('kakao')}
				>
					{t('payment.method.kakao')}
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={paymentTab === 'card'}
					className={`fixora-deposit-payment__method${paymentTab === 'card' ? ' fixora-deposit-payment__method--active' : ''}`}
					onClick={() => setPaymentTab('card')}
				>
					<CreditCardOutlinedIcon fontSize="small" />
					{t('payment.method.card')}
				</button>
			</div>

			{paymentTab === 'kakao' ? (
				<FixoraKakaoButton
					className="fixora-deposit-payment__kakao"
					labelKey="payment.final.payWithKakaoPay"
					disabled={loading || phase === 'processing'}
					onClick={handleKakaoPay}
				/>
			) : (
				<div className="fixora-deposit-payment__card-form">
					<FixoraInput
						label={t('payment.card.number')}
						name="cardNumber"
						placeholder={t('payment.card.numberPlaceholder')}
						value={cardNumber}
						onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
						error={!!cardErrors.cardNumber}
						helperText={cardErrors.cardNumber}
						autoComplete="cc-number"
					/>
					<div className="fixora-deposit-payment__card-row">
						<FixoraInput
							label={t('payment.card.expiry')}
							name="cardExpiry"
							placeholder={t('payment.card.expiryPlaceholder')}
							value={cardExpiry}
							onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
							error={!!cardErrors.cardExpiry}
							helperText={cardErrors.cardExpiry}
							autoComplete="cc-exp"
						/>
						<FixoraInput
							label={t('payment.card.cvc')}
							name="cardCvc"
							placeholder={t('payment.card.cvcPlaceholder')}
							value={cardCvc}
							onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
							error={!!cardErrors.cardCvc}
							helperText={cardErrors.cardCvc}
							autoComplete="cc-csc"
						/>
					</div>
					<p className="fixora-deposit-payment__mock-note">{t('payment.card.mockNote')}</p>
					<FixoraButton variant="primary" fullWidth disabled={loading || phase === 'processing'} onClick={handleCardPay}>
						{t('payment.final.payWithCard')}
					</FixoraButton>
				</div>
			)}

			{(loading || phase === 'processing') && (
				<p className="fixora-deposit-payment__processing">{t('payment.processing')}</p>
			)}

			<Link href={`/mypage/bookings/${bookingId}`} className="fixora-booking__link fixora-deposit-payment__hint">
				{t('booking.detail.viewDetail')}
			</Link>
		</FixoraGlassCard>
	);
};

export default FinalPaymentCard;
