import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation } from '@apollo/client';
import CloseRounded from '@mui/icons-material/CloseRounded';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { CREATE_STORY } from '../../../apollo/user/story';
import { getJwtToken } from '../../auth';
import { getGraphqlUrl } from '../../env/publicEnv';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = any;

const MAX_IMAGES = 5;
const MAX_CAPTION = 200;
const ACCEPTED = ['image/png', 'image/jpg', 'image/jpeg'];

const FRIENDLY: Record<string, string> = {
	'Minimum 1 image required': 'Add at least one image.',
	'Maximum 5 images per story': 'You can add up to 5 images.',
	'Only verified technicians can create stories': 'Your technician account must be approved first.',
};

const toFriendly = (err: T): string => {
	const raw = err?.response?.data?.errors?.[0]?.message || err?.graphQLErrors?.[0]?.message || err?.message || '';
	return FRIENDLY[raw] || raw || 'Something went wrong. Please try again.';
};

interface CreateStoryModalProps {
	open: boolean;
	onClose: () => void;
	onCreated?: () => void;
}

const CreateStoryModal = ({ open, onClose, onCreated }: CreateStoryModalProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [caption, setCaption] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const [createStory] = useMutation(CREATE_STORY);

	// Build/cleanup object-URL previews
	useEffect(() => {
		const urls = files.map((f) => URL.createObjectURL(f));
		setPreviews(urls);
		return () => urls.forEach((u) => URL.revokeObjectURL(u));
	}, [files]);

	// Reset state whenever the modal closes
	useEffect(() => {
		if (!open) {
			setFiles([]);
			setCaption('');
			setSubmitting(false);
		}
	}, [open]);

	if (!open) return null;

	const pickFilesHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = Array.from(e.target.files ?? []);
		e.target.value = '';
		if (!selected.length) return;

		const valid = selected.filter((f) => ACCEPTED.includes(f.type));
		if (valid.length !== selected.length) {
			sweetMixinErrorAlert('Only PNG or JPG images are allowed.').then();
		}
		const next = [...files, ...valid].slice(0, MAX_IMAGES);
		if (files.length + valid.length > MAX_IMAGES) {
			sweetMixinErrorAlert(`You can add up to ${MAX_IMAGES} images.`).then();
		}
		setFiles(next);
	};

	const removeImageHandler = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const uploadImages = async (): Promise<string[]> => {
		const token = getJwtToken();
		const formData = new FormData();
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
					imagesUploader(files: $files, target: $target)
				}`,
				variables: { files: files.map(() => null), target: 'story' },
			}),
		);
		const map: Record<string, string[]> = {};
		files.forEach((_, i) => {
			map[String(i)] = [`variables.files.${i}`];
		});
		formData.append('map', JSON.stringify(map));
		files.forEach((file, i) => formData.append(String(i), file));

		const response = await axios.post(getGraphqlUrl(), formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
				Authorization: `Bearer ${token}`,
			},
		});
		if (response.data?.errors?.length) throw response.data;
		return response.data?.data?.imagesUploader ?? [];
	};

	const submitHandler = async () => {
		if (files.length < 1 || submitting) return;
		try {
			setSubmitting(true);

			const urls = await uploadImages();
			if (urls.length < files.length) {
				throw new Error('Some images failed to upload. Please try again.');
			}

			const images = urls.map((url, i) => ({ url, order: i + 1 }));
			await createStory({ variables: { input: { images, caption: caption.trim() || null } } });

			await sweetMixinSuccessAlert('Story posted!');
			onCreated?.();
			onClose();
		} catch (err) {
			await sweetMixinErrorAlert(toFriendly(err as T));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="fixora-story-modal__overlay" onClick={onClose}>
			<div className="fixora-story-modal" onClick={(e) => e.stopPropagation()}>
				<div className="fixora-story-modal__head">
					<h3 className="fixora-story-modal__title">New Story</h3>
					<button className="fixora-story-modal__close" type="button" onClick={onClose}>
						<CloseRounded style={{ fontSize: 20 }} />
					</button>
				</div>

				<div className="fixora-story-modal__body">
					<div className="fixora-story-modal__section-label">Add to your story</div>
					<div className="fixora-story-modal__grid">
						{previews.map((src, i) => (
							<div key={src} className="fixora-story-modal__thumb">
								<img src={src} alt="" />
								<span className="fixora-story-modal__order">{i + 1}</span>
								<button
									className="fixora-story-modal__remove"
									type="button"
									onClick={() => removeImageHandler(i)}
									aria-label="Remove image"
								>
									<CloseOutlined style={{ fontSize: 14 }} />
								</button>
							</div>
						))}
						{files.length < MAX_IMAGES && (
							<button className="fixora-story-modal__add" type="button" onClick={() => inputRef.current?.click()}>
								<AddPhotoAlternateOutlined style={{ fontSize: 26 }} />
							</button>
						)}
					</div>
					<div className="fixora-story-modal__hint">Max {MAX_IMAGES} images • PNG/JPG only</div>

					<input
						ref={inputRef}
						type="file"
						accept="image/png,image/jpeg,image/jpg"
						multiple
						hidden
						onChange={pickFilesHandler}
					/>

					<textarea
						className="fixora-story-modal__caption"
						placeholder="Add a caption… (optional)"
						maxLength={MAX_CAPTION}
						value={caption}
						onChange={(e) => setCaption(e.target.value)}
					/>
					<div className="fixora-story-modal__counter">
						{caption.length}/{MAX_CAPTION}
					</div>
				</div>

				<div className="fixora-story-modal__foot">
					<button className="fixora-pp-btn fixora-pp-btn--ghost" type="button" onClick={onClose} disabled={submitting}>
						Cancel
					</button>
					<button
						className="fixora-pp-btn fixora-pp-btn--primary"
						type="button"
						onClick={submitHandler}
						disabled={files.length < 1 || submitting}
					>
						{submitting ? 'Posting…' : 'Share Story'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default CreateStoryModal;
