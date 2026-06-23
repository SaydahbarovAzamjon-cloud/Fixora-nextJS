import React from 'react';
import { FixoraSelect, type FixoraSelectProps } from '../../ui';

/** Compact Fixora-styled select for admin toolbars and forms. */
const AdminSelect: React.FC<FixoraSelectProps> = ({ className = '', ...props }) => (
	<FixoraSelect className={`fixora-admin-fixora-select ${className}`.trim()} {...props} />
);

export default AdminSelect;
