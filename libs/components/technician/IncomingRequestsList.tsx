import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';

interface RequestCard {
	id: string;
	deviceType: string;
	deviceModel: string;
	customerName: string;
	location: string;
	price: number;
	isNew: boolean;
	timestamp: string;
	customerImage?: string;
}

interface IncomingRequestsListProps {
	requests: RequestCard[];
	selectedId?: string;
	onSelectRequest: (id: string) => void;
}

const IncomingRequestsList: React.FC<IncomingRequestsListProps> = ({
	requests,
	selectedId,
	onSelectRequest,
}) => {
	const { t } = useTranslation('common');
	const [searchText, setSearchText] = useState('');
	const [filters, setFilters] = useState({
		service: 'all',
		device: 'all',
		location: 'all',
		sortBy: 'newest',
	});

	const filteredRequests = requests.filter((req) => {
		const matchesSearch =
			req.deviceModel.toLowerCase().includes(searchText.toLowerCase()) ||
			req.customerName.toLowerCase().includes(searchText.toLowerCase());
		return matchesSearch;
	});

	return (
		<div className="fixora-incoming-requests-list">
			{/* Header */}
			<div className="fixora-requests-list__header">
				<h2 className="fixora-requests-list__title">All Services</h2>
				<span className="fixora-requests-list__count">{filteredRequests.length}</span>
			</div>

			{/* Search Bar */}
			<div className="fixora-requests-list__search">
				<SearchIcon />
				<input
					type="text"
					placeholder="Search requests..."
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
			</div>

			{/* Filters */}
			<div className="fixora-requests-list__filters">
				<select
					className="fixora-requests-list__filter-item"
					value={filters.service}
					onChange={(e) => setFilters({ ...filters, service: e.target.value })}
				>
					<option value="all">All Services</option>
					<option value="screen">Screen Repair</option>
					<option value="battery">Battery Replacement</option>
					<option value="water">Water Damage</option>
				</select>

				<select
					className="fixora-requests-list__filter-item"
					value={filters.device}
					onChange={(e) => setFilters({ ...filters, device: e.target.value })}
				>
					<option value="all">All Devices</option>
					<option value="iphone">iPhone</option>
					<option value="macbook">MacBook</option>
					<option value="ipad">iPad</option>
					<option value="watch">Apple Watch</option>
				</select>

				<select
					className="fixora-requests-list__filter-item"
					value={filters.location}
					onChange={(e) => setFilters({ ...filters, location: e.target.value })}
				>
					<option value="all">All Locations</option>
					<option value="seoul">Seoul</option>
					<option value="busan">Busan</option>
					<option value="incheon">Incheon</option>
				</select>

				<select
					className="fixora-requests-list__filter-item"
					value={filters.sortBy}
					onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
				>
					<option value="newest">Sort by Newest</option>
					<option value="oldest">Sort by Oldest</option>
					<option value="price-high">Sort by Price (High)</option>
					<option value="price-low">Sort by Price (Low)</option>
				</select>

				<button className="fixora-requests-list__filters-btn">
					⚙️ Filters
				</button>
			</div>

			{/* Requests List */}
			<div className="fixora-requests-list__items">
				{filteredRequests.length > 0 ? (
					filteredRequests.map((request) => (
						<div
							key={request.id}
							className={`fixora-request-card ${
								selectedId === request.id ? 'fixora-request-card--active' : ''
							}`}
							onClick={() => onSelectRequest(request.id)}
						>
							{request.isNew && (
								<div className="fixora-request-card__badge">New</div>
							)}

							<div className="fixora-request-card__image">
								{request.deviceType === 'iPhone' && '📱'}
								{request.deviceType === 'MacBook' && '💻'}
								{request.deviceType === 'iPad' && '📱'}
								{request.deviceType === 'Apple Watch' && '⌚'}
							</div>

							<div className="fixora-request-card__content">
								<div className="fixora-request-card__title">
									{request.deviceType} {request.deviceModel}
								</div>
								<div className="fixora-request-card__customer">
									{request.customerName}
								</div>
								<div className="fixora-request-card__location">
									📍 {request.location}
								</div>
								<div className="fixora-request-card__time">
									{request.timestamp}
								</div>
							</div>

							<div className="fixora-request-card__price">
								${request.price}
							</div>
						</div>
					))
				) : (
					<div className="fixora-requests-list__empty">
						<p>No requests found</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default IncomingRequestsList;
