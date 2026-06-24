import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const likeTargetPropertyHandler = async (likeTargetProperty: any, id: string) => {
	try {
		await likeTargetProperty({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetPropertyHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetArticleHandler = async (likeTargetArticle: any, id: string) => {
	try {
		await likeTargetArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

/** @deprecated Use `likeTargetArticleHandler` */
export const likeTargetBoardArticleHandler = likeTargetArticleHandler;

export const likeTargetUserHandler = async (likeTargetUser: any, id: string) => {
	try {
		await likeTargetUser({
			variables: {
				userId: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetUserHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

/** @deprecated Use `likeTargetUserHandler` */
export const likeTargetMemberHandler = likeTargetUserHandler;
