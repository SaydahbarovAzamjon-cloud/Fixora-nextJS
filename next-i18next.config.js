module.exports = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'kr'],
		localeDetection: false,
	},
	// pick up locale JSON edits in dev without restarting the server
	reloadOnPrerender: process.env.NODE_ENV === 'development',
	trailingSlash: true,
};
