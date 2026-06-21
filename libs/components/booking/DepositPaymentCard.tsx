import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import { FixoraButton, FixoraGlassCard, FixoraInput, FixoraKakaoButton } from '../ui';
import { useDepositPayment, isDepositPaid } from '../../hooks/useDepositPayment';
import { formatKrw } from '../../utils/formatCurrency';
import { sweetTopSmallSuccessAlert } from '../../sweetAlert';
import type { BookingStatus, Payment, PaymentMethod } from '../../types/fixora/fixora';
import { ownerMyPageHref } from '../../utils/clientMyPageRoute';

export interface DepositPaymentCardProps {
	bookingId: string;
	problemTitle: string;
	technicianName?: string;
	estimatedPrice?: number;
	bookingStatus?: BookingStatus;
	initialPaid?: boolean;
	compact?: boolean;
	onPaid?: () => void;
	showSuccessLinks?: boolean;
	technicianId?: string;
}

type CardPhase = 'idle' | 'processing' | 'success' | 'alreadyPaid';
type PaymentTab = 'kakao' | 'card';

const DepositPaymentCard: React.FC<DepositPaymentCardProps> = ({
	bookingId,
	problemTitle,
	technicianName,
	estimatedPrice,
	bookingStatus,
	initialPaid = false,
	compact = false,
	onPaid,
	showSuccessLinks = false,
	technicianId,
}) => {
	const { t } = useTranslation('common');
	const { payDeposit, loadPayments, loading } = useDepositPayment();
	const [phase, setPhase] = useState<CardPhase>(initialPaid ? 'alreadyPaid' : 'idle');
	const [confirmedAmount, setConfirmedAmount] = useState<number | undefined>();
	const [paymentTab, setPaymentTab] = useState<PaymentTab>('kakao');
	const [cardNumber, setCardNumber] = useState('');
	const [cardExpiry, setCardExpiry] = useState('');
	const [cardCvc, setCardCvc] = useState('');
	const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

	const depositPreview = useMemo(() => {
		if (!estimatedPrice || estimatedPrice <= 0) return undefined;
		return Math.round(estimatedPrice / 2);
	}, [estimatedPrice]);

	const finalPreview = useMemo(() => {
		if (!estimatedPrice || estimatedPrice <= 0) return undefined;
		return estimatedPrice - (depositPreview ?? 0);
	}, [estimatedPrice, depositPreview]);

	const awaitingApproval = bookingStatus === 'PENDING';
	const canPay = !awaitingApproval && bookingStatus === 'ACCEPTED' && depositPreview != null && depositPreview > 0;

	useEffect(() => {
		if (initialPaid) {
			setPhase('alreadyPaid');
			return;
		}
		let cancelled = false;
		loadPayments(bookingId).then((payments) => {
			if (cancelled) return;
			if (isDepositPaid(payments, initialPaid)) {
				const deposit = payments.find((p) => p.paymentType === 'DEPOSIT');
				if (deposit?.paymentAmount) setConfirmedAmount(deposit.paymentAmount);
				setPhase('alreadyPaid');
			}
		});
		return () => {
			cancelled = true;
		};
	}, [bookingId, initialPaid, loadPayments]);

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
			const payment: Payment | null = await payDeposit(bookingId, method, bookingStatus);
			if (!payment) {
				setPhase('idle');
				return;
			}
			setConfirmedAmount(payment.paymentAmount);
			setPhase('success');
			await sweetTopSmallSuccessAlert(t('payment.success.title'), 1400);
			onPaid?.();
		},
		[bookingId, bookingStatus, canPay, onPaid, payDeposit, t],
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
			<FixoraGlassCard className={`fixora-deposit-payment fixora-deposit-payment--success${compact ? ' fixora-deposit-payment--compact' : ''}`}>
				<CheckCircleOutlineIcon className="fixora-deposit-payment__success-icon" />
				<h2 className="fixora-deposit-payment__title">{t('payment.success.title')}</h2>
				<p className="fixora-deposit-payment__text">{t('payment.success.message')}</p>
				{showSuccessLinks && (
					<div className="fixora-deposit-payment__actions">
						<Link href={`/mypage/bookings/${bookingId}`} className="fixora-tech-profile__book-btn">
							{t('booking.detail.viewDetail')}
						</Link>
						<Link href={ownerMyPageHref('activeRequests')} className="fixora-booking__link">
							{t('payment.viewRequests')}
						</Link>
						{technicianId && (
							<Link href={`/technicians/${technicianId}`} className="fixora-booking__link">
								{t('booking.success.backToProfile')}
							</Link>
						)}
					</div>
				)}
			</FixoraGlassCard>
		);
	}

	if (phase === 'alreadyPaid') {
		return (
			<div className={`fixora-deposit-payment__badge-wrap${compact ? ' fixora-deposit-payment__badge-wrap--compact' : ''}`}>
				<span className="fixora-deposit-payment__badge fixora-deposit-payment__badge--paid">{t('payment.alreadyPaid')}</span>
				{(confirmedAmount ?? depositPreview) != null && (
					<span className="fixora-deposit-payment__badge-amount">{formatKrw(confirmedAmount ?? depositPreview ?? 0)}</span>
				)}
			</div>
		);
	}

	if (awaitingApproval) {
		return (
			<FixoraGlassCard className={`fixora-deposit-payment fixora-deposit-payment--waiting${compact ? ' fixora-deposit-payment--compact' : ''}`}>
				<HourglassTopOutlinedIcon className="fixora-deposit-payment__waiting-icon" />
				<h2 className="fixora-deposit-payment__title">{t('payment.awaitingApproval.title')}</h2>
				<p className="fixora-deposit-payment__text">{t('payment.awaitingApproval.message')}</p>
				{technicianName && (
					<p className="fixora-deposit-payment__hint">{t('payment.awaitingApproval.technician', { name: technicianName })}</p>
				)}
			</FixoraGlassCard>
		);
	}

	if (bookingStatus && bookingStatus !== 'ACCEPTED') {
		return (
			<p className="fixora-deposit-payment__error">{t('payment.errors.notPayableStatus')}</p>
		);
	}

	return (
		<FixoraGlassCard className={`fixora-deposit-payment${compact ? ' fixora-deposit-payment--compact' : ''}`}>
			<h2 className="fixora-deposit-payment__title">{t('payment.deposit.title')}</h2>
			<p className="fixora-deposit-payment__text">{t('payment.deposit.subtitle')}</p>

			<div className="fixora-deposit-payment__summary">
				<div className="fixora-deposit-payment__row">
					<span className="fixora-deposit-payment__label">{problemTitle}</span>
					{technicianName && <span className="fixora-deposit-payment__tech">{technicianName}</span>}
				</div>
			</div>

			<div className="fixora-deposit-payment__breakdown">
				<div className="fixora-deposit-payment__line">
					<span>{t('payment.deposit.total')}</span>
					<strong>{estimatedPrice ? formatKrw(estimatedPrice) : '—'}</strong>
				</div>
				<div className="fixora-deposit-payment__line fixora-deposit-payment__line--highlight">
					<span>{t('payment.deposit.depositAmount')}</span>
					<strong>{depositPreview != null ? formatKrw(depositPreview) : '—'}</strong>
				</div>
				<div className="fixora-deposit-payment__line">
					<span>{t('payment.deposit.finalAmount')}</span>
					<strong>{finalPreview != null ? formatKrw(finalPreview) : '—'}</strong>
				</div>
			</div>

			<p className="fixora-deposit-payment__hint">{t('payment.deposit.breakdown')}</p>

			{!canPay && <p className="fixora-deposit-payment__error">{t('payment.errors.missingPrice')}</p>}

			{canPay && (
				<>
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
							labelKey="payment.payWithKakaoPay"
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
							<FixoraButton
								variant="primary"
								fullWidth
								disabled={loading || phase === 'processing'}
								onClick={handleCardPay}
							>
								{t('payment.payWithCard')}
							</FixoraButton>
						</div>
					)}
				</>
			)}

			{(loading || phase === 'processing') && (
				<p className="fixora-deposit-payment__processing">{t('payment.processing')}</p>
			)}
		</FixoraGlassCard>
	);
};

export default DepositPaymentCard;
