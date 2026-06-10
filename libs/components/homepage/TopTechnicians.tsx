import React, { useState } from 'react';
import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EastIcon from '@mui/icons-material/East';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { TechnicianSummary, TechniciansInquiry } from '../../types/fixora/fixora';
import TechnicianCard from './TechnicianCard';
import { T } from '../../types/common';

interface TopTechniciansProps {
	initialInput?: TechniciansInquiry;
}

const DEFAULT_INPUT: TechniciansInquiry = {
	page: 1,
	limit: 8,
	sort: 'averageRating',
	direction: 'DESC',
	search: {},
};

const TopTechnicians = ({ initialInput = DEFAULT_INPUT }: TopTechniciansProps) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const [technicians, setTechnicians] = useState<TechnicianSummary[]>([]);

	useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTechnicians(data?.getTechnicians?.list ?? []);
		},
	});

	if (technicians.length === 0) return null;

	const slides = technicians.map((tech) => (
		<SwiperSlide className="fixora-home-technicians__slide" key={tech._id}>
			<div className="fixora-home-technicians__slide-inner">
				<TechnicianCard technician={tech} />
			</div>
		</SwiperSlide>
	));

	return (
		<Stack className="fixora-home-section fixora-home-technicians">
			<Stack className="container">
				<Box component="div" className="fixora-home-section__head">
					<h2>{t('homepage.technicians.title')}</h2>
					<Link href="/agent" className="fixora-home-section__view-all">
						{t('homepage.viewAll')} <EastIcon fontSize="inherit" />
					</Link>
				</Box>

				{device === 'mobile' ? (
					<Swiper
						className="fixora-home-technicians__swiper"
						slidesPerView="auto"
						centeredSlides
						spaceBetween={16}
						modules={[Autoplay]}
					>
						{slides}
					</Swiper>
				) : (
					<Box component="div" className="fixora-home-technicians__wrapper">
						<Box component="div" className="fixora-home-arrow swiper-technicians-prev">
							<ArrowBackIosNewIcon fontSize="small" />
						</Box>
						<Swiper
							className="fixora-home-technicians__swiper"
							slidesPerView="auto"
							spaceBetween={20}
							modules={[Autoplay, Navigation]}
							navigation={{
								nextEl: '.swiper-technicians-next',
								prevEl: '.swiper-technicians-prev',
							}}
						>
							{slides}
						</Swiper>
						<Box component="div" className="fixora-home-arrow swiper-technicians-next">
							<ArrowForwardIosIcon fontSize="small" />
						</Box>
					</Box>
				)}
			</Stack>
		</Stack>
	);
};

export default TopTechnicians;
