import { useState } from "react"
import RegisterForm from "./components/RegisterForm";
import RegisterSuccess from "./components/RegisterSuccess";

export default function RegisterPortal() {
	const [submited, setSubmited] = useState(false);

	return (
		submited?
			<RegisterSuccess />
		:
			<RegisterForm onSuccess={()=>setSubmited(true)} />
	)
}
