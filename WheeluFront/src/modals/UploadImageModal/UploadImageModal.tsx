import React, {
	CSSProperties,
	ChangeEvent,
	DragEvent,
	FormEvent,
	useCallback,
	useContext,
	useLayoutEffect,
	useState,
} from "react";
import classes from "./UploadImageModal.module.css";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import { fetchLocalFile } from "../../modules/utils";
import SimpleBar from "simplebar-react";
import { Button, Card, Typography } from "@mui/material";
import { Upload } from "@mui/icons-material";

export interface IFileData {
	blob: File;
	preview: any;
}

interface IProps {
	images: Record<string, IFileData>;
	onUpdate: (images: Record<string, IFileData>) => void;
	allowMultiple?: boolean;
}

export default function UploadImageModal({
	images,
	onUpdate,
	allowMultiple,
}: IProps) {
	const { setHostClassName, closeModal } = useContext(ModalContext);
	const [dragOverStatus, setDragOverStatus] = useState<boolean>(false);
	const [files, setFiles] = useState<Map<string, IFileData>>(new Map());

	useLayoutEffect(() => {
		const map = new Map();

		for (const key in images) {
			map.set(key, images[key]);
		}
		setFiles(map);

		setHostClassName(classes.Modal);
	}, []);

	const confirmCallback = useCallback(
		(e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			const result: Record<string, IFileData> = {};

			for (const [key, value] of files.entries()) {
				result[key] = value;
			}

			onUpdate(result);
			closeModal();
		},
		[files]
	);

	function addPictures(fileList: FileList) {
		const ref: { current: typeof files } = {
			current: new Map(allowMultiple ? files : undefined),
		};
		const newFiles = ref.current;

		for (const file of fileList) {
			if (/image\/.*/.test(file.type) == false) continue;

			newFiles.set(file.name, { blob: file, preview: null });

			fetchLocalFile(file).then((data) => {
				const map = new Map(allowMultiple ? ref.current : undefined);
				map.set(file.name, { blob: file, preview: data.content });
				ref.current = map;
				setFiles(map);
			});
		}

		setFiles(newFiles);
	}

	const inputCallback = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) addPictures(e.target.files);
	};

	const dropCallback = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();

		addPictures(e.dataTransfer.files);
		setDragOverStatus(false);
	};

	const deleteImage = useCallback(
		(name: string) => {
			const newFiles = new Map(files);
			newFiles.delete(name);
			setFiles(newFiles);
		},
		[files]
	);

	return (
		<form className={classes.Form} onSubmit={confirmCallback}>
			<Typography variant="h5">
				Prześlij plik{allowMultiple ? "i" : ""}
			</Typography>

			<div
				className={`${classes.UploadContainer} ${
					dragOverStatus ? classes.DraggedOver : ""
				}`}
				onDragEnter={() => setDragOverStatus(true)}
				onDragLeave={() => setDragOverStatus(false)}
				onDrop={dropCallback}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOverStatus(true);
				}}
			>
				<Upload color="secondary" />
				<label>
					<input
						type="file"
						title="Image"
						hidden
						onChange={inputCallback}
						multiple={allowMultiple}
					/>
					<strong>Wybierz plik</strong> lub upuść go tutaj.
				</label>
			</div>
			<SimpleBar className={classes.ImagePreviewsScroller}>
				<div className={classes.ImagePreviews}>
					{Array.from(files.values()).map((fileData) => (
						<ImagePreviewPanel
							key={fileData.blob.name}
							name={fileData.blob.name}
							src={fileData.preview}
							onDelete={() => deleteImage(fileData.blob.name)}
						/>
					))}
				</div>
			</SimpleBar>
			<div className={` ${classes.ButtonBar}`}>
				<Button type="button" onClick={closeModal}>
					Anuluj
				</Button>
				<Button variant="contained" type="submit">
					Zatwierdź
				</Button>
			</div>
		</form>
	);
}

interface IImageProps {
	name: string;
	src: string;
	onDelete?: () => void;
}

const ImagePreviewPanel = React.memo(function ({ src, onDelete }: IImageProps) {
	return (
		<Card style={{ "--image-src": `url('${src}')` } as CSSProperties}>
			<span onClick={onDelete}>
				<i className="fas fa-close" />
			</span>
		</Card>
	);
});
