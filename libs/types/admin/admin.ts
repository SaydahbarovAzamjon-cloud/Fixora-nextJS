import type { BadgeLevel, BookingStatus, BookingType, DeviceCategory, DeviceStatus, PaymentMethod, PaymentStatus, PaymentType } from '../fixora/fixora';

export type AdminUserType = 'USER' | 'TECHNICIAN' | 'ADMIN';
export type AdminUserStatus = 'ACTIVE' | 'BLOCK' | 'DELETE';
export type VerificationStatus = 'NONE' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type ArticleStatus = 'ACTIVE' | 'DELETE' | 'DRAFT' | 'PUBLISHED';
export type ArticleCategory = 'FREE' | 'HUMOR' | 'NEWS' | 'RECOMMEND';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTIONED';

export interface AdminUser {
	_id: string;
	userFullName?: string;
	userNickname?: string;
	userEmail?: string;
	userPhoneNumber?: string;
	userProfileImage?: string;
	userType: AdminUserType;
	userStatus: AdminUserStatus;
	badgeLevel: BadgeLevel;
	averageRating: number;
	reviewCount?: number;
	isVerified: boolean;
	verificationStatus: VerificationStatus;
	verificationDocuments?: string[];
	verificationRejectionReason?: string;
	shopName?: string;
	specialty?: string;
	userLocation?: string;
	userBio?: string;
	yearsExperience?: number;
	services?: { title: string; basePrice: number }[];
	workingHours?: { days: string[]; startTime?: string; endTime?: string };
	profileComplete?: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface UsersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		text?: string;
		userStatus?: AdminUserStatus;
		userType?: AdminUserType;
	};
}

export interface AllBookingsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		text?: string;
		bookingStatus?: BookingStatus;
		bookingType?: BookingType;
		userId?: string;
		technicianId?: string;
		deviceId?: string;
	};
}

export interface AdminBooking {
	_id: string;
	bookingStatus: BookingStatus;
	bookingType: BookingType;
	problemTitle: string;
	problemDescription?: string;
	estimatedPrice?: number;
	finalPrice?: number;
	bookingDate?: string;
	createdAt: string;
	technicianId: string;
	userId: string;
	deviceId: string;
	customerData?: AdminUser;
	deviceData?: {
		_id: string;
		deviceModel: string;
		deviceCategory: DeviceCategory;
		deviceIssue?: string;
	};
}

export interface AllPaymentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		bookingId?: string;
		paymentMethod?: PaymentMethod;
		paymentStatus?: PaymentStatus;
		paymentType?: PaymentType;
		userId?: string;
		technicianId?: string;
		text?: string;
	};
}

export interface AdminPayment {
	_id: string;
	bookingId: string;
	userId: string;
	paymentAmount: number;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	paymentType: PaymentType;
	transactionId?: string | null;
	paidAt?: string | null;
	createdAt: string;
}

export interface AllDevicesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		text?: string;
		deviceCategory?: DeviceCategory;
		deviceStatus?: DeviceStatus;
		userId?: string;
	};
}

export interface AdminDevice {
	_id: string;
	deviceBrand: string;
	deviceCategory: DeviceCategory;
	deviceModel: string;
	deviceIssue: string;
	deviceDescription?: string;
	deviceStatus: DeviceStatus;
	releaseYear?: number;
	userId: string;
	createdAt: string;
}

export interface AllArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		articleCategory?: ArticleCategory;
		articleStatus?: ArticleStatus;
	};
}

export interface AdminArticle {
	_id: string;
	articleTitle: string;
	articleStatus: ArticleStatus;
	articleCategory?: ArticleCategory;
	articleViews: number;
	articleLikes: number;
	articleComments: number;
	createdAt: string;
	authorData?: AdminUser;
}

export interface TechnicianVerificationInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: { text?: string; verificationStatus?: VerificationStatus };
}

export type AdminDashboardPeriod = 'MONTH' | 'QUARTER' | 'YEAR';

export interface AdminKpiStat {
	value: number;
	trendPercent: number;
}

export interface AdminTechniciansKpi extends AdminKpiStat {
	verifiedCount: number;
}

export interface AdminBookingsKpi extends AdminKpiStat {
	activeCount: number;
}

export interface AdminReportsKpi extends AdminKpiStat {
	criticalCount: number;
}

export interface AdminMonthlyPoint {
	month: string;
	revenue: number;
	bookings: number;
}

export interface AdminDashboardStats {
	period: AdminDashboardPeriod;
	totalUsers: AdminKpiStat;
	totalTechnicians: AdminTechniciansKpi;
	pendingVerifications: AdminKpiStat;
	totalBookings: AdminBookingsKpi;
	platformRevenue: AdminKpiStat;
	openReports: AdminReportsKpi;
	monthlySeries: AdminMonthlyPoint[];
}

export interface AdminActivityItem {
	eventType: string;
	message: string;
	createdAt: string;
	severity: 'INFO' | 'WARNING' | 'CRITICAL';
	actorName?: string;
	entityId: string;
}

export interface AdminPaymentSummary {
	totalRevenue: number;
	pendingAmount: number;
	pendingCount: number;
	refundedAmount: number;
	refundedCount: number;
	failedAmount: number;
	failedCount: number;
	currency: string;
}

export interface AdminPlatformSettings {
	defaultLocale: string;
	defaultCurrency: string;
	defaultTimezone: string;
	moderationSlaHours: number;
}

export interface AdminComment {
	_id: string;
	commentContent: string;
	commentStatus: string;
	commentRefId: string;
	createdAt: string;
	articleTitle?: string;
	authorData?: { _id: string; userNickname?: string; userImage?: string };
}

export interface AdminSearchHit {
	_id: string;
	label: string;
	subtitle?: string;
	route: string;
}

export interface StoryReport {
	_id: string;
	storyId: string;
	userId: string;
	reason: string;
	comment?: string;
	status: string;
	createdAt: string;
	reporterData?: AdminUser;
}

export interface AdminStory {
	_id: string;
	caption?: string;
	viewCount: number;
	reportCount: number;
	expiresAt: string;
	createdAt: string;
	userData?: AdminUser;
	images?: { url: string; order: number }[];
}
