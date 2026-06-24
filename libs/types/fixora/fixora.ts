/** Minimal Fixora summaries for homepage sections (full User/Article types arrive with P3-13). */

import { MeLiked } from '../property/property';
import { MeFollowed } from '../follow/follow';

export type BadgeLevel = 'NEW' | 'VERIFIED' | 'PREMIUM_PRO';

export interface UserServiceItem {
	title: string;
	basePrice: number;
}

export interface TechnicianSummary {
	_id: string;
	userNickname?: string;
	userFullName?: string;
	userProfileImage?: string;
	shopName?: string;
	specialty?: string;
	userLocation?: string;
	shopLatitude?: number;
	shopLongitude?: number;
	isOnline?: boolean;
	averageRating?: number;
	reviewCount?: number;
	completedJobsCount?: number;
	avgResponseMinutes?: number;
	badgeLevel?: BadgeLevel;
	followersCount?: number;
	userArticles?: number;
	createdAt?: string;
	services?: UserServiceItem[];
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface ArticleSummary {
	_id: string;
	articleCategory?: string;
	articleTitle: string;
	articleExcerpt?: string;
	articleImage?: string;
	articleLikes: number;
	articleViews: number;
	articleComments: number;
	createdAt: string;
	meLiked?: MeLiked[];
	meSaved?: boolean;
	isFeatured?: boolean;
	allowComments?: boolean;
	authorData?: {
		_id: string;
		userNickname?: string;
		userFullName?: string;
		userProfileImage?: string;
		specialty?: string;
	};
}

export interface TechniciansInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		deviceCategory?: string;
		issueCategory?: string;
		isOnline?: boolean | null;
		minAverageRating?: number;
		text?: string;
		userLocation?: string;
		latitude?: number;
		longitude?: number;
		radiusKm?: number;
		maxAvgResponseMinutes?: number;
	};
}

export interface ArticlesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		articleCategory?: string;
		text?: string;
		userId?: string;
	};
}

export interface UserWorkingHours {
	days: string[];
	startTime?: string;
	endTime?: string;
}

export interface TechnicianProfile {
	_id: string;
	userNickname?: string;
	userFullName?: string;
	userProfileImage?: string;
	userBio?: string;
	shopName?: string;
	specialty?: string;
	userLocation?: string;
	userType?: string;
	isOnline?: boolean;
	isVerified?: boolean;
	verificationStatus?: string;
	averageRating?: number;
	reviewCount?: number;
	completedJobsCount?: number;
	avgResponseMinutes?: number;
	yearsExperience?: number;
	badgeLevel?: BadgeLevel;
	followersCount?: number;
	meFollowed?: MeFollowed[];
	services?: UserServiceItem[];
	portfolioImages?: string[];
	workingHours?: UserWorkingHours;
}

export interface TechnicianReview {
	_id: string;
	userId?: string;
	technicianId?: string;
	reviewContent?: string;
	repairQuality: number;
	repairSpeed: number;
	communication: number;
	createdAt: string;
	customerData?: {
		_id: string;
		userNickname?: string;
		userFullName?: string;
		userProfileImage?: string;
	};
	deviceData?: {
		deviceBrand?: string;
		deviceModel?: string;
	};
}

export interface ReviewsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		technicianId: string;
	};
}

export interface ReviewDistribution {
	star: number;
	count: number;
}

export type DeviceCategory = 'IPHONE' | 'IPAD' | 'MACBOOK' | 'APPLE_WATCH';

export type IssueCategory =
	| 'BATTERY'
	| 'CAMERA'
	| 'CHARGING'
	| 'GENERAL'
	| 'KEYBOARD'
	| 'SCREEN'
	| 'SOFTWARE'
	| 'WATER_DAMAGE';

export type RepairComplexity = 'LOW' | 'MEDIUM' | 'HIGH';

export type ClassificationProviderType = 'GEMINI' | 'RULE_BASED';

export interface IssueClassificationResult {
	deviceType: DeviceCategory;
	issueCategory: IssueCategory;
	repairComplexity: RepairComplexity;
	confidenceScore: number;
	keywords: string[];
	provider: ClassificationProviderType;
}

export interface TechnicianRecommendation {
	technicianId: string;
	score: number;
	matchReason: string;
	technician: TechnicianSummary;
}
export type DeviceBrand = 'APPLE';
export type DeviceStatus = 'ACTIVE' | 'INACTIVE' | 'IN_REPAIR' | 'REPAIR_COMPLETE';
export type BookingType = 'SHOP_VISIT' | 'ON_SITE';
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Device {
	_id: string;
	deviceBrand: DeviceBrand;
	deviceCategory: DeviceCategory;
	deviceModel: string;
	deviceIssue: string;
	deviceDescription?: string;
	deviceSerialNumber?: string;
	deviceImage?: string;
	deviceStatus: DeviceStatus;
	releaseYear?: number;
	userId: string;
	createdAt: string;
}

export interface DeviceInput {
	deviceBrand?: DeviceBrand;
	deviceCategory: DeviceCategory;
	deviceDescription?: string;
	deviceImage?: string;
	deviceIssue: string;
	deviceModel: string;
	deviceSerialNumber?: string;
	releaseYear?: number;
}

export interface DevicesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		deviceCategory?: DeviceCategory;
		deviceStatus?: DeviceStatus;
		text?: string;
	};
}

export type PaymentMethod = 'KAKAOPAY' | 'CARD' | 'CASH';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentType = 'DEPOSIT' | 'FINAL';

export interface Payment {
	_id: string;
	bookingId: string;
	paymentAmount: number;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	paymentType: PaymentType;
	transactionId?: string | null;
	paidAt?: string | null;
	createdAt?: string;
}

export interface ProgressUpdate {
	step: string;
	note?: string;
	timestamp: string;
}

export interface Booking {
	_id: string;
	bookingStatus: BookingStatus;
	bookingType: BookingType;
	bookingDate?: string;
	problemTitle: string;
	problemDescription?: string;
	estimatedPrice?: number;
	finalPrice?: number;
	isPaid?: boolean;
	deviceId: string;
	technicianId: string;
	userId: string;
	createdAt: string;
	completedAt?: string;
	cancelledAt?: string;
	progressUpdates?: ProgressUpdate[];
	deviceData?: Device;
}

export interface BookingReview {
	_id: string;
	bookingId: string;
	technicianId: string;
	userId: string;
	reviewContent?: string;
	repairQuality: number;
	repairSpeed: number;
	communication: number;
	reviewImages?: string[];
	createdAt: string;
	deviceData?: Device;
}

export interface CreateReviewInput {
	bookingId: string;
	communication: number;
	repairQuality: number;
	repairSpeed: number;
	reviewContent?: string;
	reviewImages?: string[];
}

export interface BookingInput {
	deviceId: string;
	technicianId: string;
	problemTitle: string;
	problemDescription?: string;
	bookingType?: BookingType;
	bookingDate?: string;
	estimatedPrice?: number;
}

export type MessageType = 'TEXT' | 'IMAGE';

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	bookingId?: string | null;
	messageContent: string;
	messageType: MessageType;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ConversationPeer {
	_id: string;
	userNickname?: string;
	userFullName?: string;
	shopName?: string;
	userProfileImage?: string;
	isOnline?: boolean;
	isVerified?: boolean;
	userType?: string;
	userLocation?: string;
	specialty?: string;
	averageRating?: number;
	reviewCount?: number;
	verificationStatus?: string;
}

export interface Conversation {
	peerId: string;
	bookingId?: string | null;
	bookingStatus?: BookingStatus | null;
	deviceLabel?: string | null;
	deviceModel?: string | null;
	unreadCount: number;
	updatedAt: string;
	peer?: ConversationPeer;
	lastMessage?: Message;
}

export type ArticleCategory =
	| 'FREE'
	| 'HUMOR'
	| 'NEWS'
	| 'RECOMMEND'
	| 'REPAIR_GUIDE'
	| 'QUICK_TIP'
	| 'CASE_STUDY'
	| 'TECHNIQUE';
export type ArticleStatus = 'ACTIVE' | 'DELETE' | 'DRAFT' | 'PUBLISHED';
export type ArticleVisibility = 'PUBLIC' | 'TECHNICIANS_ONLY';

export interface MeSaved {
	articleRefId: string;
	memberId: string;
	mySaved: boolean;
}

export interface ArticleAuthor {
	_id: string;
	userNickname?: string;
	userFullName?: string;
	userProfileImage?: string;
	specialty?: string;
	shopName?: string;
}

export interface Article {
	_id: string;
	articleCategory?: ArticleCategory | null;
	articleTitle: string;
	articleContent?: string;
	articleExcerpt?: string | null;
	articleImage?: string | null;
	articleStatus: ArticleStatus;
	articleLikes: number;
	articleViews: number;
	articleComments: number;
	articleVisibility?: ArticleVisibility | null;
	isFeatured?: boolean | null;
	allowComments?: boolean | null;
	scheduledPublishAt?: string | null;
	seoTitle?: string | null;
	seoDescription?: string | null;
	seoKeywords?: string | null;
	repairDeviceCategory?: string | null;
	userId: string;
	createdAt: string;
	updatedAt?: string;
	deletedAt?: string | null;
	authorData?: ArticleAuthor;
	/**
	 * Legacy compatibility alias used by older community/member cards.
	 * Apollo queries map `authorData` -> `memberData` during P3-13 migration.
	 */
	memberData?: {
		_id: string;
		memberNick?: string;
		memberFullName?: string;
		memberImage?: string;
		memberDesc?: string;
	};
	meLiked?: MeLiked[];
	meSaved?: MeSaved[];
}

export interface StoryImage {
	url: string;
	order: number;
}

export interface Story {
	_id: string;
	userId: string;
	images: StoryImage[];
	caption?: string | null;
	viewCount: number;
	reportCount?: number;
	createdAt: string;
	expiresAt?: string;
	isExpired?: boolean;
	userData?: {
		_id: string;
		userNickname?: string;
		userFullName?: string;
		userProfileImage?: string;
	};
}

export interface StoryImageInput {
	url: string;
	order: number;
}

export interface CreateStoryInput {
	images: StoryImageInput[];
	caption?: string | null;
}

export interface FollowedTechnician {
	_id: string;
	userNickname?: string;
	userFullName?: string;
	shopName?: string;
	specialty?: string;
	userProfileImage?: string;
	averageRating: number;
	reviewCount: number;
	isOnline: boolean;
	badgeLevel?: BadgeLevel;
	userArticles?: number;
}

export interface Following {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: string;
	followingData?: FollowedTechnician;
}

export type CommentGroup = 'ARTICLE' | 'USER';
export type CommentStatus = 'ACTIVE' | 'DELETE';

export interface Comment {
	_id: string;
	commentContent: string;
	commentGroup: CommentGroup;
	commentRefId: string;
	commentStatus: CommentStatus;
	memberId: string;
	authorData?: ArticleAuthor;
	createdAt: string;
	updatedAt: string;
}

export interface CommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: {
		commentRefId: string;
	};
}

export interface CommentInput {
	commentGroup: CommentGroup;
	commentRefId: string;
	commentContent: string;
}

export interface CommentUpdate {
	_id: string;
	commentContent?: string;
	commentStatus?: CommentStatus;
}

export interface ArticleInput {
	articleCategory?: ArticleCategory;
	articleTitle: string;
	articleContent: string;
	articleExcerpt?: string;
	articleImage?: string;
	articleStatus?: ArticleStatus;
	articleVisibility?: ArticleVisibility;
	isFeatured?: boolean;
	allowComments?: boolean;
	repairDeviceCategory?: string;
	scheduledPublishAt?: string;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string;
}

export interface ArticleUpdate {
	_id: string;
	articleTitle?: string;
	articleContent?: string;
	articleExcerpt?: string;
	articleImage?: string;
	articleStatus?: ArticleStatus;
	articleVisibility?: ArticleVisibility;
	isFeatured?: boolean;
	allowComments?: boolean;
	repairDeviceCategory?: string;
	scheduledPublishAt?: string | null;
	seoTitle?: string;
	seoDescription?: string;
	seoKeywords?: string;
}

export type EarningsReportPeriod = 'ALL_TIME' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'THIS_MONTH';

export type NotificationType = 'BOOKING' | 'COMMENT' | 'FOLLOW' | 'LIKE' | 'MESSAGE' | 'PAYMENT' | 'REVIEW';
export type NotificationReferenceType = 'ARTICLE' | 'BOOKING' | 'MESSAGE' | 'PAYMENT' | 'REVIEW' | 'USER';

export interface Notification {
	_id: string;
	userId: string;
	receiverId: string;
	notificationType: NotificationType;
	notificationTitle: string;
	notificationDescription?: string;
	referenceType?: NotificationReferenceType | null;
	referenceId?: string | null;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
}
