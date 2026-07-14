/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		REACT_APP_API_URL:
			process.env.NEXT_PUBLIC_API_URL ||
			process.env.REACT_APP_API_URL ||
			(process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:2000/graphql').replace(/\/graphql\/?$/, ''),
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
	async rewrites() {
		// Local UI → remote GraphQL without CORS (browser hits same-origin /graphql).
		// Only active when GRAPHQL_PROXY_TARGET is set AND GraphQL URL points at localhost.
		const target = (process.env.GRAPHQL_PROXY_TARGET || '').replace(/\/$/, '');
		if (!target) return [];

		const graphqlUrl =
			process.env.NEXT_PUBLIC_GRAPHQL_URL ||
			process.env.REACT_APP_API_GRAPHQL_URL ||
			'';
		const usesLocalProxy =
			graphqlUrl.includes('localhost') || graphqlUrl.includes('127.0.0.1');
		if (!usesLocalProxy) return [];

		return [
			{
				source: '/graphql',
				destination: `${target}/graphql`,
			},
		];
	},
	async redirects() {
		return [
			{
				source: '/account/join',
				destination: '/login',
				permanent: false,
			},
			{ source: '/property', destination: '/search', permanent: false },
			{ source: '/property/:path*', destination: '/search', permanent: false },
			{ source: '/agent', destination: '/search', permanent: false },
			{ source: '/agent/:path*', destination: '/search', permanent: false },
			{ source: '/about', destination: '/', permanent: false },
			{ source: '/admin', destination: '/_admin', permanent: false },
			{ source: '/admin/dashboard', destination: '/_admin', permanent: false },
			{ source: '/admin/verification', destination: '/_admin/verification', permanent: false },
			{ source: '/admin/users', destination: '/_admin/users', permanent: false },
			{ source: '/admin/bookings', destination: '/_admin/bookings', permanent: false },
			{ source: '/admin/payments', destination: '/_admin/payments', permanent: false },
			{ source: '/admin/devices', destination: '/_admin/devices', permanent: false },
			{ source: '/admin/moderation', destination: '/_admin/moderation', permanent: false },
			{ source: '/admin/settings', destination: '/_admin/settings', permanent: false },
			{ source: '/admin/:path*', destination: '/_admin/:path*', permanent: false },
		];
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
