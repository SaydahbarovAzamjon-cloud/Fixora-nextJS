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
	isOnline?: boolean;
	isVerified?: boolean;
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
	reviewContent?: string;
	repairQuality: number;
	repairSpeed: number;
	communication: number;
	createdAt: string;
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

export interface Booking {
	_id: string;
	bookingStatus: BookingStatus;
	bookingType: BookingType;
	bookingDate?: string;
	problemTitle: string;
	problemDescription?: string;
	estimatedPrice?: number;
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
