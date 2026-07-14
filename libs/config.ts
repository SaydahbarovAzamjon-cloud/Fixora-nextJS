import { getApiBaseUrl } from './env/publicEnv';

export const REACT_APP_API_URL = getApiBaseUrl();

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
	/** Shown instead of raw browser "Failed to fetch" */
	errorNetwork:
		"Couldn't connect to the server. Check your internet connection and try again.",
	errorNetworkKo:
		'서버에 연결할 수 없습니다. 인터넷 연결을 확인한 후 다시 시도해 주세요.',
};
