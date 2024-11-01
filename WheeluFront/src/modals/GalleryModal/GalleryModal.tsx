import {
	CSSProperties,
	TouchEvent,
	useCallback,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import classes from "./GalleryModal.module.css";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import SimpleBar from "simplebar-react";
import { Button, CircularProgress, IconButton } from "@mui/material";
import { c } from "../../modules/utils";
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";

interface IProps {
	images: App.UI.IImageData[];
	initialImage?: string;
	editAllowed: boolean;
	coverImage?: string;
	deletedImages?: string[];
	onUpdate: (coverImageID: string, deletedImages: string[]) => void;
}

export default function GalleryModal({
	images,
	editAllowed,
	initialImage,
	deletedImages: initialDeletedImages,
	coverImage,
	onUpdate,
}: IProps) {
	const { setHostClassName, setRenderHost, closeModal } =
		useContext(ModalContext);
	const [canvasSet, setCanvasSet] = useState<boolean>(false);
	const [imageLoadState, setImageState] = useState<
		"initial" | "loading" | "loaded"
	>("initial");
	const [loadedIndex, setLoadedIndex] = useState<number>(0);
	const [deletedImages, setDeletedImages] = useState<string[]>(
		initialDeletedImages ?? []
	);

	const [coverImageID, setCoverImageID] = useState<string>(coverImage ?? "");

	const swipeCoordRef = useRef<number>();

	const imageRef = useRef<HTMLImageElement>(null);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
		setRenderHost(false);
		setTimeout(() => setCanvasSet(true), 400);

		for (let i = 0; i < images.length; i++) {
			if (images[i].id == initialImage) setLoadedIndex(i);
		}
	}, []);

	const prevImageCallback = useCallback(() => {
		if (loadedIndex > 0) setLoadedIndex(loadedIndex - 1);
	}, [loadedIndex]);

	const nextImageCallback = useCallback(() => {
		if (loadedIndex < images.length - 1) setLoadedIndex(loadedIndex + 1);
	}, [loadedIndex]);

	const switchToImageCallback = useCallback(function (this: number) {
		setLoadedIndex(this);
	}, []);

	const touchStartCallback = useCallback(
		(e: TouchEvent<HTMLImageElement>) => {
			swipeCoordRef.current = e.changedTouches[0].screenX;
		},
		[]
	);

	const touchEndCallback = useCallback(
		(e: TouchEvent<HTMLImageElement>) => {
			const touchendX = e.changedTouches[0].screenX;
			const touchstartX = swipeCoordRef.current ?? touchendX;
			if (touchendX < touchstartX) nextImageCallback();
			if (touchendX > touchstartX) prevImageCallback();

			if (imageRef.current)
				imageRef.current.style.transform = `translate(0)`;
		},
		[nextImageCallback, prevImageCallback]
	);

	const touchMoveCallback = useCallback(
		(e: TouchEvent<HTMLImageElement>) => {
			if (!imageRef.current) return;

			if (loadedIndex == 0 || loadedIndex == images.length - 1) return;

			const MAX_OFFSET = 50;

			const touchendX = e.changedTouches[0].screenX;
			const touchstartX = swipeCoordRef.current ?? touchendX;

			const delta = touchendX - touchstartX;
			const absDelta = Math.abs(delta);
			const direction = delta < 0 ? -1 : 1;

			const offset = Math.min(MAX_OFFSET, absDelta) * direction;

			imageRef.current.style.transform = `translate(${offset}px)`;
		},
		[loadedIndex]
	);

	const setAsCoverCallback = useCallback(() => {
		setCoverImageID(images[loadedIndex].id);
	}, [loadedIndex]);

	const toggleDeletionMarkCallback = useCallback(() => {
		const newArray = Array.from(deletedImages);

		const currID = images[loadedIndex].id;

		if (newArray.includes(currID))
			newArray.splice(newArray.indexOf(currID), 1);
		else newArray.push(currID);

		setDeletedImages(newArray);
	}, [deletedImages, loadedIndex]);

	const closeCallback = useCallback(() => {
		onUpdate(coverImageID, deletedImages);
		closeModal();
	}, [coverImageID, deletedImages]);

	return (
		<div className={classes.Main}>
			<IconButton onClick={closeCallback} title="Close">
				<Close />
			</IconButton>
			<div className={classes.Picture}>
				<img
					ref={imageRef}
					className={`${classes.Canvas} ${
						canvasSet ? classes.Set : ""
					} ${imageLoadState == "loaded" ? classes.Painted : ""}`}
					src={images[loadedIndex].src}
					alt="Image"
					onLoad={() => setImageState("loaded")}
					onTouchStart={touchStartCallback}
					onTouchEnd={touchEndCallback}
					onTouchMove={touchMoveCallback}
				/>
				<CircularProgress
					className={classes.LoadingAnim}
					variant="indeterminate"
				/>
				<IconButton
					color="primary"
					size="large"
					className={c([
						classes.PrevPictureButton,
						[classes.Hidden, loadedIndex == 0],
					])}
					title="Previous image"
					onClick={prevImageCallback}
				>
					<ChevronLeft />
				</IconButton>

				<IconButton
					color="primary"
					size="large"
					className={c([
						classes.NextPictureButton,
						[classes.Hidden, loadedIndex == images.length - 1],
					])}
					title="Next image"
					onClick={nextImageCallback}
				>
					<ChevronRight />
				</IconButton>
				<Button
					className={c([
						classes.SetAsCoverButton,
						[classes.Hidden, !editAllowed],
						[
							classes.Active,
							images[loadedIndex].id == coverImageID,
						],
					])}
					onClick={setAsCoverCallback}
				>
					Ustaw jako główny
				</Button>

				<Button
					className={c([
						classes.DeleteImageButton,
						[
							classes.Hidden,
							!editAllowed ||
								images[loadedIndex].id == coverImageID,
						],
					])}
					title="Delete image"
					onClick={toggleDeletionMarkCallback}
				>
					Oznaczone do usunięcia
				</Button>
			</div>

			<div className={classes.CarouselWrapper}>
				<SimpleBar>
					<div className={classes.Carousel}>
						{images.map((data, index) => (
							<div
								key={data.id}
								className={classes.CarouselPanel}
								style={
									{
										"--img-src": `url('${data.src}')`,
									} as CSSProperties
								}
								onClick={switchToImageCallback.bind(index)}
							/>
						))}
					</div>
				</SimpleBar>
			</div>
		</div>
	);
}
