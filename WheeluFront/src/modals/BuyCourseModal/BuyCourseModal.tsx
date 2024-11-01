import { useCallback, useMemo, useState } from "react";
import classes from "./BuyCourseModal.module.css";
import PersonalizeView from "./views/PersonalizeView";
import { useMutation } from "@tanstack/react-query";
import { callAPI } from "../../modules/utils";
import { API } from "../../types/api";
import PurchaseFlow from "../../components/PurchaseFlow/PurchaseFlow";
import InlineDot from "../../components/InlineDot/InlineDot";
import AuthService from "../../services/Auth";

interface IProps {
	offer: App.Models.ICourseOffer;
}

export default function BuyCourseModal({ offer }: IProps) {
	const [instructorID, setInstructorID] = useState<number | null>(null);

	const submitMutation = useMutation<
		API.Courses.Buy.IResponse,
		API.Courses.Buy.IEndpoint["error"],
		{ id: number; instructorID: number }
	>({
		mutationFn: (data) =>
			callAPI<API.Courses.Buy.IEndpoint>(
				"POST",
				"/api/v1/offers/:offerID/purchase",
				{ instructorID: data.instructorID, totalAmount: offer.price },
				{ offerID: data.id }
			),
		onSuccess: (data) => {
			window.location.assign(data.paymentUrl);
		},
	});

	const selectedInstructor = useMemo(() => {
		return offer.instructors.find((i) => i.id == instructorID)?.instructor
			.user;
	}, [instructorID]);

	const purchaseCallback = useCallback(() => {
		submitMutation.mutate({
			id: offer.id,
			instructorID: instructorID!,
		});
	}, [instructorID]);

	return (
		<PurchaseFlow
			className={classes.Modal}
			header="Zakup kurs"
			steps={[
				{
					name: "Dostosuj",
					view: (
						<PersonalizeView
							course={offer}
							selectedInstructorId={instructorID}
							updateSelectedInstructorId={setInstructorID}
						/>
					),
				},
			]}
			onCanGoNext={() => instructorID != null}
			cartItems={[
				{
					name: `Kurs kategorii ${offer.category.name}`,
					helper: (
						<>
							{offer.hoursCount} godzin <InlineDot /> Instruktor{" "}
							{selectedInstructor &&
								AuthService.getUserFullName(selectedInstructor)}
						</>
					),
					count: 1,
					pricePerItem: offer.price,
				},
			]}
			onPurchaseAttempt={purchaseCallback}
			isError={submitMutation.isError}
			isMutationPending={submitMutation.isPending}
		/>
	);
}
