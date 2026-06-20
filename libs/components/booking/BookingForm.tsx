import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { userVar } from '../../../apollo/store';
import { CREATE_BOOKING, CREATE_DEVICE } from '../../../apollo/user/mutation';
import { GET_MY_DEVICES } from '../../../apollo/user/query';
import { FixoraButton, FixoraGlassCard, FixoraInput, FixoraSelect } from '../ui';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import type { Device, DeviceCategory } from '../../types/fixora/fixora';

interface BookingFormProps {
	technicianId: string;
	technicianName?: string;
}

const DEVICE_CATEGORIES: DeviceCategory[] = ['IPHONE', 'IPAD', 'MACBOOK', 'APPLE_WATCH'];

const BookingForm = ({ technicianId, technicianName }: BookingFormProps) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isLoggedIn = !!user?._id;

	const [selectedDeviceId, setSelectedDeviceId] = useState<string>('new');
	const [deviceCategory, setDeviceCategory] = useState<DeviceCategory | ''>('');
	const [deviceModel, setDeviceModel] = useState('');
	const [deviceIssue, setDeviceIssue] = useState('');
	const [deviceDescription, setDeviceDescription] = useState('');
	const [deviceSerialNumber, setDeviceSerialNumber] = useState('');
	const [releaseYear, setReleaseYear] = useState('');

	const [problemTitle, setProblemTitle] = useState('');
	const [problemDescription, setProblemDescription] = useState('');
	const [estimatedPrice, setEstimatedPrice] = useState('');

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [submitting, setSubmitting] = useState(false);
	const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

	const { data: devicesData, loading: devicesLoading } = useQuery(GET_MY_DEVICES, {
		skip: !isLoggedIn,
		fetchPolicy: 'network-only',
		variables: {
			input: { page: 1, limit: 20, sort: 'createdAt', direction: 'DESC', search: {} },
		},
		onCompleted: (data) => {
			const list: Device[] = data?.getMyDevices?.list ?? [];
			if (list.length) setSelectedDeviceId(list[0]._id);
		},
	});

	const devices: Device[] = devicesData?.getMyDevices?.list ?? [];

	const [createDevice] = useMutation(CREATE_DEVICE);
	const [createBooking] = useMutation(CREATE_BOOKING);

	const isNewDevice = selectedDeviceId === 'new';

	const categoryOptions = useMemo(
		() =>
			DEVICE_CATEGORIES.map((category) => ({
				value: category,
				label: t(`booking.device.categories.${category}`),
			})),
		[t],
	);

	const validate = useCallback(() => {
		const next: Record<string, string> = {};
		if (isNewDevice) {
			if (!deviceCategory) next.deviceCategory = t('booking.validation.deviceCategory');
			if (!deviceModel.trim()) next.deviceModel = t('booking.validation.deviceModel');
			if (!deviceIssue.trim()) next.deviceIssue = t('booking.validation.deviceIssue');
		}
		if (!problemTitle.trim()) next.problemTitle = t('booking.validation.problemTitle');
		if (!estimatedPrice.trim() || Number(estimatedPrice) <= 0) {
			next.estimatedPrice = t('booking.validation.estimatedPrice');
		}
		setErrors(next);
		return Object.keys(next).length === 0;
	}, [isNewDevice, deviceCategory, deviceModel, deviceIssue, problemTitle, estimatedPrice, t]);

	const handleSubmit = useCallback(async () => {
		if (!isLoggedIn) return;
		if (!validate()) return;

		setSubmitting(true);
		try {
			let deviceId = selectedDeviceId;

			if (isNewDevice) {
				const result = await createDevice({
					variables: {
						input: {
							deviceCategory,
							deviceBrand: 'APPLE',
							deviceModel: deviceModel.trim(),
							deviceIssue: deviceIssue.trim(),
							deviceDescription: deviceDescription.trim() || undefined,
							deviceSerialNumber: deviceSerialNumber.trim() || undefined,
							releaseYear: releaseYear ? Number(releaseYear) : undefined,
						},
					},
				});
				deviceId = result.data?.createDevice?._id;
			}

			const bookingResult = await createBooking({
				variables: {
					input: {
						deviceId,
						technicianId,
						problemTitle: problemTitle.trim(),
						problemDescription: problemDescription.trim() || undefined,
						bookingType: 'SHOP_VISIT',
						estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
					},
				},
			});

			const bookingId = bookingResult.data?.createBooking?._id as string | undefined;
			if (!bookingId) throw new Error(t('booking.errors.generic'));
			setCreatedBookingId(bookingId);
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? t('booking.errors.generic'));
		} finally {
			setSubmitting(false);
		}
	}, [
		isLoggedIn,
		validate,
		selectedDeviceId,
		isNewDevice,
		createDevice,
		createBooking,
		deviceCategory,
		deviceModel,
		deviceIssue,
		deviceDescription,
		deviceSerialNumber,
		releaseYear,
		technicianId,
		problemTitle,
		problemDescription,
		estimatedPrice,
		t,
	]);

	if (!isLoggedIn) {
		return (
			<FixoraGlassCard className="fixora-booking__card">
				<h2 className="fixora-booking__heading">{t('booking.loginRequired.title')}</h2>
				<p className="fixora-booking__text">{t('booking.loginRequired.message')}</p>
				<Link href={`/login?redirect=/technicians/${technicianId}/book`} className="fixora-tech-profile__book-btn">
					{t('booking.loginRequired.cta')}
				</Link>
			</FixoraGlassCard>
		);
	}

	if (createdBookingId) {
		return (
			<FixoraGlassCard className="fixora-booking__card fixora-booking__success fixora-booking__waiting">
				<HourglassTopOutlinedIcon className="fixora-booking__success-icon fixora-booking__waiting-icon" />
				<h2 className="fixora-booking__heading">{t('booking.waitingApproval.title')}</h2>
				<p className="fixora-booking__text">{t('booking.waitingApproval.message')}</p>
				{technicianName && (
					<p className="fixora-booking__text fixora-booking__text--muted">
						{t('payment.awaitingApproval.technician', { name: technicianName })}
					</p>
				)}
				<div className="fixora-booking__success-actions">
					<Link href={`/mypage/bookings/${createdBookingId}`} className="fixora-tech-profile__book-btn">
						{t('booking.detail.viewDetail')}
					</Link>
					<Link href="/mypage?tab=requests" className="fixora-booking__link">
						{t('payment.viewRequests')}
					</Link>
					<Link href={`/technicians/${technicianId}`} className="fixora-booking__link">
						{t('booking.success.backToProfile')}
					</Link>
				</div>
			</FixoraGlassCard>
		);
	}

	return (
		<div className="fixora-booking">
			{technicianName && <p className="fixora-booking__intro">{t('booking.subtitle', { technician: technicianName })}</p>}

			<FixoraGlassCard className="fixora-booking__card">
				<h2 className="fixora-booking__heading">{t('booking.device.heading')}</h2>
				<p className="fixora-booking__text">{t('booking.device.subheading')}</p>

				{!devicesLoading && devices.length > 0 && (
					<div className="fixora-booking__device-list">
						{devices.map((device) => (
							<label
								key={device._id}
								className={`fixora-booking__device-option${selectedDeviceId === device._id ? ' fixora-booking__device-option--active' : ''}`}
							>
								<input
									type="radio"
									name="device"
									value={device._id}
									checked={selectedDeviceId === device._id}
									onChange={() => setSelectedDeviceId(device._id)}
								/>
								<span className="fixora-booking__device-info">
									<strong>{t(`booking.device.categories.${device.deviceCategory}`)} — {device.deviceModel}</strong>
									<span>{device.deviceIssue}</span>
								</span>
							</label>
						))}
						<label
							className={`fixora-booking__device-option${isNewDevice ? ' fixora-booking__device-option--active' : ''}`}
						>
							<input
								type="radio"
								name="device"
								value="new"
								checked={isNewDevice}
								onChange={() => setSelectedDeviceId('new')}
							/>
							<span className="fixora-booking__device-info">
								<strong>
									<AddCircleOutlineIcon fontSize="small" /> {t('booking.device.addNew')}
								</strong>
							</span>
						</label>
					</div>
				)}

				{isNewDevice && (
					<div className="fixora-booking__form-grid">
						<FixoraSelect
							label={t('booking.device.category')}
							name="deviceCategory"
							value={deviceCategory}
							onChange={(e) => setDeviceCategory(e.target.value as DeviceCategory)}
							options={categoryOptions}
							placeholder={t('booking.device.categoryPlaceholder')}
							error={!!errors.deviceCategory}
							helperText={errors.deviceCategory}
						/>
						<FixoraInput
							label={t('booking.device.model')}
							name="deviceModel"
							placeholder={t('booking.device.modelPlaceholder')}
							value={deviceModel}
							onChange={(e) => setDeviceModel(e.target.value)}
							error={!!errors.deviceModel}
							helperText={errors.deviceModel}
						/>
						<FixoraInput
							label={t('booking.device.issue')}
							name="deviceIssue"
							placeholder={t('booking.device.issuePlaceholder')}
							value={deviceIssue}
							onChange={(e) => setDeviceIssue(e.target.value)}
							error={!!errors.deviceIssue}
							helperText={errors.deviceIssue}
						/>
						<FixoraInput
							label={t('booking.device.releaseYear')}
							name="releaseYear"
							type="number"
							placeholder={t('booking.device.releaseYearPlaceholder')}
							value={releaseYear}
							onChange={(e) => setReleaseYear(e.target.value)}
						/>
						<FixoraInput
							label={t('booking.device.serialNumber')}
							name="deviceSerialNumber"
							placeholder={t('booking.device.serialNumberPlaceholder')}
							value={deviceSerialNumber}
							onChange={(e) => setDeviceSerialNumber(e.target.value)}
						/>
						<div className="fixora-input fixora-booking__textarea">
							<label className="fixora-input__label" htmlFor="deviceDescription">
								{t('booking.device.description')}
							</label>
							<div className="fixora-input__field fixora-input__field--textarea">
								<textarea
									id="deviceDescription"
									className="fixora-input__control"
									placeholder={t('booking.device.descriptionPlaceholder')}
									value={deviceDescription}
									onChange={(e) => setDeviceDescription(e.target.value)}
									rows={3}
								/>
							</div>
						</div>
					</div>
				)}
			</FixoraGlassCard>

			<FixoraGlassCard className="fixora-booking__card">
				<h2 className="fixora-booking__heading">{t('booking.details.heading')}</h2>

				<div className="fixora-booking__form-grid">
					<FixoraInput
						label={t('booking.details.problemTitle')}
						name="problemTitle"
						placeholder={t('booking.details.problemTitlePlaceholder')}
						value={problemTitle}
						onChange={(e) => setProblemTitle(e.target.value)}
						error={!!errors.problemTitle}
						helperText={errors.problemTitle}
					/>
					<FixoraInput
						label={t('booking.details.estimatedPrice')}
						name="estimatedPrice"
						type="number"
						placeholder={t('booking.details.estimatedPricePlaceholder')}
						value={estimatedPrice}
						onChange={(e) => setEstimatedPrice(e.target.value)}
						error={!!errors.estimatedPrice}
						helperText={errors.estimatedPrice}
					/>
					<div className="fixora-input fixora-booking__textarea">
						<label className="fixora-input__label" htmlFor="problemDescription">
							{t('booking.details.problemDescription')}
						</label>
						<div className="fixora-input__field fixora-input__field--textarea">
							<textarea
								id="problemDescription"
								className="fixora-input__control"
								placeholder={t('booking.details.problemDescriptionPlaceholder')}
								value={problemDescription}
								onChange={(e) => setProblemDescription(e.target.value)}
								rows={3}
							/>
						</div>
					</div>
				</div>

				<div className="fixora-booking__type-options">
					<div className="fixora-booking__type-option fixora-booking__type-option--active">
						<strong>{t('booking.details.typeShopVisit')}</strong>
						<span>{t('booking.details.typeShopVisitDesc')}</span>
					</div>
					<div className="fixora-booking__type-option fixora-booking__type-option--disabled">
						<strong>{t('booking.details.typeOnSite')}</strong>
						<span>{t('booking.details.comingSoon')}</span>
					</div>
				</div>
			</FixoraGlassCard>

			<FixoraButton variant="primary" fullWidth disabled={submitting} onClick={handleSubmit}>
				{submitting ? t('booking.submitting') : t('booking.submit')}
			</FixoraButton>
		</div>
	);
};

export default BookingForm;
