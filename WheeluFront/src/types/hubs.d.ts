import { ExamCriteriaScope, ExamCriteriumState } from "../modules/enums";
import { API } from "./api";

export {};

declare global {
	namespace Hubs {
		namespace _ {
			interface HubServiceResponse<E = string, D = null, C = number> {
				isSuccess: boolean;
				errorCode?: C;
				error?: E;
				data?: D;
			}

			interface IHub<
				T extends string = string,
				M extends string = string
			> {
				callbacks: {
					[name in T]: (...args: any[]) => void;
				};
				methods: {
					[name in M]: (...args: any[]) => void;
				};
			}
		}

		interface IContext<T extends IHub> {
			established: boolean;
			connected: boolean;
			disconnect: () => void;

			invoke: <
				E extends keyof T["methods"],
				C extends Parameters<T["methods"][E]>,
				R = ReturnType<T["methods"][E]>
			>(
				methodName: E,
				...args: C
			) => Promise<R>;
			on: <E extends keyof T["callbacks"], C extends T["callbacks"][E]>(
				event: E,
				callback: C
			) => void;
		}

		namespace ExamHub {
			namespace RegisterForExamTracking {
				type IResponse = _.HubServiceResponse<
					"NoEntity" | "InvalidState" | "AccessDenied",
					App.Models.IExam
				>;
			}

			namespace ChangeCriteriumState {
				type IResponse = _.HubServiceResponse<
					"DbError" | "AccessDenied" | "NoEntity" | "InvalidState"
				>;
			}

			namespace EndExam {
				type IResponse = _.HubServiceResponse<
					"AccessDenied" | "EntityNotFound" | "DbError"
				>;
			}

			interface IExamHub extends _.IHub {
				callbacks: {
					kick: () => void;
				};
				methods: {
					RegisterForExamTracking: (
						examID: number
					) => ExamHub.RegisterForExamTracking.IResponse;
					ChangeCriteriumState: (
						examID: number,
						scope: ExamCriteriaScope,
						criterium: string,
						state: ExamCriteriumState
					) => ExamHub.ChangeCriteriumState.IResponse;
					EndExam: (examID: number) => ExamHub.EndExam.IResponse;
				};
			}
		}
	}
}
