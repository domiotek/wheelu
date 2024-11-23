import { RefObject, useEffect, useState } from "react";

interface IOptions {
	root?: Element | null;
	enabled?: boolean;
}

export default function useInView(
	ref: RefObject<HTMLElement>,
	{ root, enabled }: IOptions
) {
	const [isInView, setIsInView] = useState(false);

	useEffect(() => {
		if (!enabled) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsInView(entry.isIntersecting);
			},
			{
				root: null,
				rootMargin: "0px",
				threshold: 0.1,
			}
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, [ref, root, enabled]);

	return isInView;
}
