import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { userVar } from '../../../apollo/store';
import { CREATE_BOOKING, CREATE_DEVICE, UPDATE_DEVICE } from '../../../apollo/user/mutation';
import { GET_MY_DEVICES } from '../../../apollo/user/query';
import { FixoraButton, FixoraGlassCard, FixoraInput, FixoraSelect } from '../ui';
import BookingServiceTypeOptions from './BookingServiceTypeOptions';
import BookingDeviceImageUpload from './BookingDeviceImageUpload';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useDeviceImageUpload } from '../../hooks/useDeviceImageUpload';
import {
	mergeDeviceImages,
	parseDeviceImagePaths,
	serializeDeviceImages,
} from '../../utils/deviceImage';
import type { Device, DeviceCategory } from '../../types/fixora/fixora';
import { bookingDevicePlaceholderKey } from '../../utils/bookingDevicePlaceholders';
import { ownerMyPageHref } from '../../utils/clientMyPageRoute';

interface BookingFormProps {
	technicianId: string;
	technicianName?: string;
	technicianDeviceCategory?: DeviceCategory;
}

const DEVICE_CATEGORIES: DeviceCategory[] = ['IPHONE', 'IPAD', 'MACBOOK', 'APPLE_WATCH'];

const BookingForm = ({ technicianId, technicianName, technicianDeviceCategory }: BookingFormProps) => {
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

	const deviceSearch = useMemo(
		() => (technicianDeviceCategory ? { deviceCategory: technicianDeviceCategory } : {}),
		[technicianDeviceCategory],
	);

	const { data: devicesData, loading: devicesLoading } = useQuery(GET_MY_DEVICES, {
		skip: !isLoggedIn,
		fetchPolicy: 'network-only',
		variables: {
			input: { page: 1, limit: 20, sort: 'createdAt', direction: 'DESC', search: deviceSearch },
		},
		onCompleted: (data) => {
			const list: Device[] = data?.getMyDevices?.list ?? [];
			setSelectedDeviceId(list.length ? list[0]._id : 'new');
		},
	});

	const devices: Device[] = useMemo(() => {
		const list: Device[] = devicesData?.getMyDevices?.list ?? [];
		if (!technicianDeviceCategory) return list;
		return list.filter((device) => device.deviceCategory === technicianDeviceCategory);
	}, [devicesData, technicianDeviceCategory]);

	const [createDevice] = useMutation(CREATE_DEVICE);
	const [updateDevice] = useMutation(UPDATE_DEVICE);
	const [createBooking] = useMutation(CREATE_BOOKING);

	const onDeviceImageError = useCallback(
		(key: string) => {
			const message =
				key === 'invalidType'
					? t('booking.device.imageInvalidType')
					: key === 'tooLarge'
						? t('booking.device.imageTooLarge')
						: key === 'tooMany'
							? t('booking.device.imageTooMany')
							: t('booking.errors.generic');
			void sweetMixinErrorAlert(message);
		},
		[t],
	);

	const isNewDevice = selectedDeviceId === 'new';

	const selectedDevice = useMemo(
		() => devices.find((device) => device._id === selectedDeviceId),
		[devices, selectedDeviceId],
	);

	const existingDeviceImagePaths = useMemo(
		() => (isNewDevice ? [] : parseDeviceImagePaths(selectedDevice?.deviceImage)),
		[isNewDevice, selectedDevice?.deviceImage],
	);

	const existingDeviceImageCount =
		!isNewDevice && devicesLoading ? 0 : existingDeviceImagePaths.length;

	const deviceImageUpload = useDeviceImageUpload(onDeviceImageError, existingDeviceImageCount);

	const clearDeviceImagesRef = useRef(deviceImageUpload.clearImages);
	clearDeviceImagesRef.current = deviceImageUpload.clearImages;

	const selectDevice = useCallback((deviceId: string) => {
		setSelectedDeviceId(deviceId);
		clearDeviceImagesRef.current();
	}, []);

	const allowedCategories = useMemo(
		() => (technicianDeviceCategory ? [technicianDeviceCategory] : DEVICE_CATEGORIES),
		[technicianDeviceCategory],
	);

	const categoryOptions = useMemo(
		() =>
			allowedCategories.map((category) => ({
				value: category,
				label: t(`booking.device.categories.${category}`),
			})),
		[allowedCategories, t],
	);

	useEffect(() => {
		if (!technicianDeviceCategory) return;
		setDeviceCategory(technicianDeviceCategory);
		if (!devicesLoading) {
			setSelectedDeviceId((current) => {
				if (current !== 'new' && devices.some((device) => device._id === current)) return current;
				return devices.length ? devices[0]._id : 'new';
			});
		}
	}, [technicianDeviceCategory, devices, devicesLoading]);

	const activeDeviceCategory = technicianDeviceCategory ?? deviceCategory;
	const modelPlaceholder = t(bookingDevicePlaceholderKey('model', activeDeviceCategory));
	const issuePlaceholder = t(bookingDevicePlaceholderKey('issue', activeDeviceCategory));
	const descriptionPlaceholder = t(bookingDevicePlaceholderKey('description', activeDeviceCategory));

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
				let deviceImageValue: string | undefined;
				if (deviceImageUpload.hasImages) {
					const paths = await deviceImageUpload.uploadDeviceImages();
					deviceImageValue = serializeDeviceImages(paths);
				}

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
							deviceImage: deviceImageValue,
						},
					},
				});
				deviceId = result.data?.createDevice?._id;
			} else if (deviceImageUpload.hasImages) {
				const newPaths = await deviceImageUpload.uploadDeviceImages();
				const mergedImage = mergeDeviceImages(existingDeviceImagePaths, newPaths);
				if (mergedImage) {
					await updateDevice({
						variables: {
							input: {
								_id: deviceId,
								deviceImage: mergedImage,
							},
						},
					});
				}
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
		updateDevice,
		createBooking,
		deviceCategory,
		deviceModel,
		deviceIssue,
		deviceDescription,
		deviceSerialNumber,
		releaseYear,
		existingDeviceImagePaths,
		deviceImageUpload,
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
					<Link href={ownerMyPageHref('activeRequests')} className="fixora-booking__link">
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
				<p className="fixora-booking__text">
					{technicianDeviceCategory
						? t('booking.device.subheadingForCategory', {
								category: t(`booking.device.categories.${technicianDeviceCategory}`),
							})
						: t('booking.device.subheading')}
				</p>

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
									onChange={() => selectDevice(device._id)}
								/>
								<span className="fixora-booking__device-info">
									<strong>{t(`booking.device.categories.${device.deviceCategory}`)} — {device.deviceModel}</strong>
									<span>{device.deviceIssue}</span>
								</span>
							</label>
						))}
						<label
							className={`fixora-booking__device-option${isNewDevice ? ' fixora-booking__device-option--active' : ''}`}
							onClick={(e) => {
								if (isNewDevice) {
									e.preventDefault();
									if (devices.length > 0) {
										selectDevice(devices[0]._id);
									}
								}
							}}
						>
							<input
								type="radio"
								name="device"
								value="new"
								checked={isNewDevice}
								onChange={() => selectDevice('new')}
								onClick={(e) => {
									if (isNewDevice) e.preventDefault();
								}}
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
						{technicianDeviceCategory ? (
							<FixoraInput
								className="fixora-booking__category-locked"
								label={t('booking.device.category')}
								name="deviceCategory"
								value={t(`booking.device.categories.${technicianDeviceCategory}`)}
								readOnly
								tabIndex={-1}
								aria-readonly="true"
							/>
						) : (
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
						)}
						<FixoraInput
							label={t('booking.device.model')}
							name="deviceModel"
							placeholder={modelPlaceholder}
							value={deviceModel}
							onChange={(e) => setDeviceModel(e.target.value)}
							error={!!errors.deviceModel}
							helperText={errors.deviceModel}
						/>
						<FixoraInput
							label={t('booking.device.issue')}
							name="deviceIssue"
							placeholder={issuePlaceholder}
							value={deviceIssue}
							onChange={(e) => setDeviceIssue(e.target.value)}
							error={!!errors.deviceIssue}
							helperText={errors.deviceIssue}
						/>
						<FixoraInput
							label={t('booking.device.releaseYear')}
							name="releaseYear"
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={4}
							placeholder={t('booking.device.releaseYearPlaceholder')}
							value={releaseYear}
							onChange={(e) => setReleaseYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
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
									placeholder={descriptionPlaceholder}
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

				<BookingServiceTypeOptions />
			</FixoraGlassCard>

			<BookingDeviceImageUpload upload={deviceImageUpload} existingImagePaths={existingDeviceImagePaths} />

			<FixoraButton variant="primary" fullWidth disabled={submitting} onClick={handleSubmit}>
				{submitting ? t('booking.submitting') : t('booking.submit')}
			</FixoraButton>
		</div>
	);
};

export default BookingForm;
