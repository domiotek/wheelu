import { useState } from "react";
import PurchaseFlow from "../../components/PurchaseFlow/PurchaseFlow";
import { App } from "../../types/app";
import PersonalizeView from "./views/PersonalizeView";
import classes from "./BuyHoursModal.module.css";
import { useMutation } from "@tanstack/react-query";
import { callAPI } from "../../modules/utils";
import { API } from "../../types/api";

interface IProps {
	course: App.Models.ICourse;
}

export default function BuyHoursModal({ course }: IProps) {
	const [hoursCount, setHoursCount] = useState<number>(1);

	const submitMutation = useMutation<
		API.Courses.BuyHours.IResponse,
		API.Courses.BuyHours.IEndpoint["error"]
	>({
		mutationFn: () =>
			callAPI<API.Courses.BuyHours.IEndpoint>(
				"POST",
				"/api/v1/courses/:courseID/purchase-hours",
				{ hoursCount, totalAmount: hoursCount * course.pricePerHour },
				{ courseID: course.id }
			),
		onSuccess: (data) => {
			window.location.assign(data.paymentUrl);
		},
	});
	return (
		<PurchaseFlow
			className={classes.Modal}
			header="Dokup godziny"
			steps={[
				{
					name: "Dostosuj",
					view: (
						<PersonalizeView
							course={course}
							hoursCount={hoursCount}
							updateHoursCount={setHoursCount}
						/>
					),
				},
			]}
			onCanGoNext={() => hoursCount > 0}
			cartItems={[
				{
					name: "Dodatkowa godzina",
					helper: "Dodatkowa godzina do wykorzystania w kursie, dla którego ją kupujesz.",
					count: hoursCount,
					pricePerItem: course.pricePerHour,
				},
			]}
			onPurchaseAttempt={submitMutation.mutate}
			isError={submitMutation.isError}
			isMutationPending={submitMutation.isPending}
		/>
	);
}
