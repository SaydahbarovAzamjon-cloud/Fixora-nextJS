/** Shared GraphQL aggregation shapes (Fixora). */
export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface MeFollowed {
	followerId: string;
	followingId: string;
	myFollowing: boolean;
}

export interface TotalCounter {
	total: number;
}
