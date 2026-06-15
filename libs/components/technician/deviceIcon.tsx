import React from 'react';
import { Smartphone, Laptop, Tablet, Watch, Wrench, LucideProps } from 'lucide-react';

const DEVICE_ICON: Record<string, React.ComponentType<LucideProps>> = {
	IPHONE: Smartphone,
	IPAD: Tablet,
	MACBOOK: Laptop,
	APPLE_WATCH: Watch,
};

interface DeviceIconProps extends LucideProps {
	deviceType?: string | null;
}

const DeviceIcon: React.FC<DeviceIconProps> = ({ deviceType, size = 16, ...rest }) => {
	const Icon = DEVICE_ICON[deviceType ?? ''] ?? Wrench;
	return <Icon size={size} {...rest} />;
};

export default DeviceIcon;
