import type { ReactNode } from "react";

interface LogoProps {
	className?: string;
}

export function Logo(props: LogoProps): ReactNode {
	const { className } = props;

	return (
		<img
			alt=""
			aria-hidden={true}
			className={className}
			height={16}
			src="/assets/images/logo-acdh-black.svg"
			width={16}
		/>
	);
}
