import { useState } from "react";
import SchoolApplicationForm from "../components/SchoolApplicationForm/SchoolApplicationForm";
import SchoolApplicationSuccessMessage from "../components/SchoolApplicationSuccessMessage/SchoolApplicationSuccessMessage";

export default function RegisterSchoolPage() {
	const [submissionSuccess, setSubmissionSuccess] = useState(false);

	if(submissionSuccess) return (<SchoolApplicationSuccessMessage />);
	else return (<SchoolApplicationForm onSuccess={()=>setSubmissionSuccess(true)}/>);
}
