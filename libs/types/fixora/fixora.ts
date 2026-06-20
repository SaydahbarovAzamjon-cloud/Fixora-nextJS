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
	badgeLevel?: BadgeLevel;
	followersCount?: number;
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
	userType?: string;
}

export interface Conversation {
	peerId: string;
	bookingId?: string | null;
	bookingStatus?: BookingStatus | null;
	unreadCount: number;
	updatedAt: string;
	peer?: ConversationPeer;
	lastMessage?: Message;
}

export type ArticleCategory = 'FREE' | 'HUMOR' | 'NEWS' | 'RECOMMEND';
export type ArticleStatus = 'ACTIVE' | 'DELETE' | 'DRAFT' | 'PUBLISHED';

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
	userId: string;
	createdAt: string;
	updatedAt?: string;
	deletedAt?: string | null;
	authorData?: ArticleAuthor;
	meLiked?: MeLiked[];
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
}

export type NotificationType = 'BOOKING' | 'COMMENT' | 'FOLLOW' | 'LIKE' | 'MESSAGE' | 'REVIEW';
export type NotificationReferenceType = 'ARTICLE' | 'BOOKING' | 'MESSAGE' | 'REVIEW';

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
