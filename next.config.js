/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		REACT_APP_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL:
			process.env.NEXT_PUBLIC_GRAPHQL_URL ||
			process.env.REACT_APP_API_GRAPHQL_URL ||
			'http://localhost:2000/graphql',
		REACT_APP_API_WS:
			process.env.NEXT_PUBLIC_WS_URL || process.env.REACT_APP_API_WS || 'ws://localhost:2000',
		NEXT_PUBLIC_GRAPHQL_URL:
			process.env.NEXT_PUBLIC_GRAPHQL_URL ||
			process.env.REACT_APP_API_GRAPHQL_URL ||
			'http://localhost:2000/graphql',
		NEXT_PUBLIC_WS_URL:
			process.env.NEXT_PUBLIC_WS_URL || process.env.REACT_APP_API_WS || 'ws://localhost:2000',
		NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
		NEXT_PUBLIC_KAKAO_JS_KEY: process.env.NEXT_PUBLIC_KAKAO_JS_KEY || '',
	},
	async redirects() {
		return [
			{
				source: '/account/join',
				destination: '/login',
				permanent: false,
			},
		];
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
