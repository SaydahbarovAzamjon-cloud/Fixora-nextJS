import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import CloseRounded from '@mui/icons-material/CloseRounded';

export interface NewScheduleItem {
	time: string; // HH:mm (today)
	task: string;
	client: string;
}

interface AddScheduleModalProps {
	open: boolean;
	onClose: () => void;
	onAdd: (item: NewScheduleItem) => void;
}

const AddScheduleModal = ({ open, onClose, onAdd }: AddScheduleModalProps) => {
	const { t } = useTranslation('technician');
	const [time, setTime] = useState('');
	const [task, setTask] = useState('');
	const [client, setClient] = useState('');

	useEffect(() => {
		if (!open) {
			setTime('');
			setTask('');
			setClient('');
		}
	}, [open]);

	if (!open) return null;

	const canSave = time !== '' && task.trim() !== '';

	const saveHandler = () => {
		if (!canSave) return;
		onAdd({ time, task: task.trim(), client: client.trim() });
		onClose();
	};

	return (
		<div className="fixora-story-modal__overlay" onClick={onClose}>
			<div className="fixora-story-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
				<div className="fixora-story-modal__head">
					<h3 className="fixora-story-modal__title">{t('schedule.title')}</h3>
					<button className="fixora-story-modal__close" type="button" onClick={onClose}>
						<CloseRounded style={{ fontSize: 20 }} />
					</button>
				</div>

				<div className="fixora-story-modal__body">
					<label className="fixora-sched-field">
						<span className="fixora-sched-field__label">{t('schedule.time')}</span>
						<input
							className="fixora-sched-field__input"
							type="time"
							value={time}
							onChange={(e) => setTime(e.target.value)}
						/>
					</label>

					<label className="fixora-sched-field">
						<span className="fixora-sched-field__label">{t('schedule.task')}</span>
						<input
							className="fixora-sched-field__input"
							type="text"
							placeholder={t('schedule.taskPlaceholder')}
							value={task}
							onChange={(e) => setTask(e.target.value)}
							maxLength={120}
						/>
					</label>

					<label className="fixora-sched-field">
						<span className="fixora-sched-field__label">{t('schedule.clientOptional')}</span>
						<input
							className="fixora-sched-field__input"
							type="text"
							placeholder={t('schedule.clientPlaceholder')}
							value={client}
							onChange={(e) => setClient(e.target.value)}
							maxLength={80}
						/>
					</label>
				</div>

				<div className="fixora-story-modal__foot">
					<button className="fixora-pp-btn fixora-pp-btn--ghost" type="button" onClick={onClose}>
						{t('schedule.cancel')}
					</button>
					<button className="fixora-pp-btn fixora-pp-btn--primary" type="button" onClick={saveHandler} disabled={!canSave}>
						{t('schedule.add')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddScheduleModal;
