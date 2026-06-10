import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.png" />

				{/* SEO */}
				<meta
					name="keyword"
					content={'fixora, apple repair, iphone repair, macbook repair, korea, technician marketplace'}
				/>
				<meta
					name={'description'}
					content={
						'Fixora — AI-powered Apple device repair marketplace in South Korea. Find trusted technicians for iPhone, MacBook, iPad, and Apple Watch repairs. | ' +
						'Fixora — маркетплейс ремонта Apple-устройств в Южной Корее. Найдите проверенных мастеров для iPhone, MacBook, iPad и Apple Watch. | ' +
						'Fixora — 대한민국 AI 기반 Apple 기기 수리 마켓플레이스. iPhone, MacBook, iPad, Apple Watch 수리 전문가를 찾아보세요.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
