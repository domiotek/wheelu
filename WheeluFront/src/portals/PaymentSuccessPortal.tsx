import SuccessPortalAction from "./components/SuccessPortalAction";

export default function PaymentSuccessPortal() {
	return (
		<SuccessPortalAction
			message="Płatność zakończona sukcesem 🎉"
			link="/home"
		/>
	);
}
