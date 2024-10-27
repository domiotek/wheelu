import { CourseCategory, ExamCriteriumState } from "../modules/enums";

declare global {
	namespace App {
		namespace Models {
			namespace ExamResult {
				interface IExamCriterium {
					state: ExamCriteriumState;
					hiddenIn: CourseCategory[];
				}

				type ManueverCriteriaTypes =
					| "preparingVehicle"
					| "drivingStraight"
					| "diagonalParking"
					| "perpendicularParking"
					| "parallelParking"
					| "startingUpHill"
					| "slowSlalom"
					| "fastSlalom"
					| "obstacleBypassing"
					| "eightCurve";

				interface IManeuverCriteria {
					[skillName: ManueverCriteriaTypes]: IExamCriterium;
				}

				type DrivingCriteriaTypes =
					| "joiningTraffic"
					| "driving2Way1Road"
					| "driving2Way2Road"
					| "driving1Way"
					| "equalJunction"
					| "signedJunction"
					| "lightedJunction"
					| "roundaboutJunction"
					| "twoLevelJunction"
					| "drivingThroughCrossing"
					| "turningAround"
					| "tramOrTrainTracksCrossing"
					| "tunnelDriving"
					| "drivingNearPublicTransportStop"
					| "overtaking"
					| "bypassing"
					| "passingBy"
					| "laneChanging"
					| "turningRight"
					| "turningLeft"
					| "turningAroundOnJunction"
					| "stoppingAtDestination"
					| "emergencyStop"
					| "uncoupling"
					| "gearShifting"
					| "engineBraking"
					| "drivingOverSpeedLimit"
					| "horizontalSignObeying"
					| "verticalSignObeying"
					| "lightSignObeying"
					| "personSignObeying"
					| "behaviorTowardsOthers"
					| "overallDriving";

				interface IDrivingCriteria {
					[skillName: DrivingCriteriaTypes]: IExamCriterium;
				}

				type CriteriaTypes =
					| ManueverCriteriaTypes
					| DrivingCriteriaTypes;

				interface IResult
					extends Record<string, Record<IExamCriterium>> {
					maneuverCriteria: IManeuverCriteria;
					drivingCriteria: IDrivingCriteria;
				}
			}
		}
	}
}
