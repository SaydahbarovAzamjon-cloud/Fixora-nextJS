import React from 'react';

interface AuthHeadingProps {
	titleBefore: string;
	titleAccent?: string;
	subtitle: string;
}

const AuthHeading = ({ titleBefore, titleAccent, subtitle }: AuthHeadingProps) => {
	return (
		<div className="auth-heading">
			<h1>
				{titleBefore}
				{titleAccent ? (
					<>
						{' '}
						<span className="auth-heading__accent">{titleAccent}</span>
						<span className="auth-heading__star" aria-hidden="true">
							✦
						</span>
					</>
				) : null}
			</h1>
			<p>{subtitle}</p>
		</div>
	);
};

export default AuthHeading;
