import React from "react";
import { translateGenericErrorCodes } from "../modules/utils";
import { API } from "../types/api";
import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { App } from "../types/app";

export default class AuthService {
	public static translateSignInErrorCode(
		errCode: API.Auth.SignIn.IEndpoint["errCodes"]
	) {
		switch (errCode) {
			case "AccountNotActivated":
				return React.createElement(
					React.Fragment,
					null,
					"Twoje konto jest nieaktywne. Jeśli email nie dotarł, spróbuj ",
					React.createElement(
						Link,
						{
							component: RouterLink,
							to: "/resend-activation-link",
						} as any,
						"wysłać go ponownie"
					),
					"."
				);
			case "InvalidCredentials":
				return "Niepoprawny login lub hasło.";
			default:
				return translateGenericErrorCodes(errCode);
		}
	}

	public static getUserFullName(user: App.Models.IShortUser) {
		return `${user.name} ${user.surname}`;
	}
}
