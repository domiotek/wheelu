import { useEffect, useState } from "react";
import { getBackendImageSrc } from "../../modules/features";
import { Skeleton } from "@mui/material";

interface IProps {
	url: string;
	className?: string;
	alt?: string;
}

export default function LazyBackendImage({ className, url, alt }: IProps) {
	const [imageSource, setImageSource] = useState<string | null>(null);

	useEffect(() => {
		getBackendImageSrc(url).then((source) => setImageSource(source));
	}, [url]);

	if (imageSource == null) return <Skeleton className={className} />;

	return <img className={className} src={imageSource} alt={alt} />;
}
