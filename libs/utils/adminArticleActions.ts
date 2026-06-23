import type { ApolloClient } from '@apollo/client';
import { REMOVE_ARTICLE_BY_ADMIN, UPDATE_ARTICLE_BY_ADMIN } from '../../apollo/admin/mutation';

/** Hard delete when backend supports it; otherwise soft-delete via articleStatus DELETE. */
export async function deleteArticleByAdmin(client: ApolloClient<unknown>, articleId: string): Promise<'removed' | 'deleted'> {
	try {
		await client.mutate({
			mutation: REMOVE_ARTICLE_BY_ADMIN,
			variables: { articleId },
		});
		return 'removed';
	} catch {
		await client.mutate({
			mutation: UPDATE_ARTICLE_BY_ADMIN,
			variables: { input: { _id: articleId, articleStatus: 'DELETE' } },
		});
		return 'deleted';
	}
}
