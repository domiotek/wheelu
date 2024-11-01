import InlineDot from "../components/InlineDot/InlineDot";
import { TransmissionType, VehiclePartType } from "../modules/enums";

interface IEngineProps {
	displacement?: number;
	power?: number;
	transmissionSpeedCount?: number;
	transmissionType?: TransmissionType;
}

export default class VehicleService {
	public static getEngineText({
		displacement,
		power,
		transmissionSpeedCount: speedCount,
		transmissionType: type,
	}: IEngineProps): string {
		const typeText =
			type != undefined && type == 1
				? "automatyczna"
				: type != undefined
				? "manualna"
				: "";

		return `${displacement ? displacement + "L " : ""} ${
			displacement && power ? "(" : ""
		}${power ? power + "KM " : ""}${displacement && power ? ") " : ""}${
			speedCount ? speedCount + "-biegowa" : ""
		}${speedCount && type != undefined ? ", " : ""}${
			type != undefined ? typeText : ""
		} ${type != undefined || speedCount ? "skrzynia" : ""}`;
	}

	public static getPartProps(partID: VehiclePartType) {
		switch (partID) {
			case VehiclePartType.Tires:
				return { icon: "wheel.png", name: "Opony" };
			case VehiclePartType.Battery:
				return { icon: "car-battery.png", name: "Akumulator" };
			case VehiclePartType.Brakes:
				return { icon: "brake.png", name: "Hamulce" };
			case VehiclePartType.Clutch:
				return { icon: "clutch.png", name: "Sprzęgło" };
			case VehiclePartType.Igniters:
				return { icon: "spark-plug.png", name: "Świece" };
			case VehiclePartType.Ligths:
				return { icon: "bulb.png", name: "Żarówki" };
			case VehiclePartType.Oil:
				return { icon: "oil.png", name: "Olej" };
			case VehiclePartType.Suspension:
				return { icon: "damper.png", name: "Amortyzatory" };
		}
	}

	public static getTransmissionTypes() {
		return [
			{
				id: TransmissionType.Manual,
				label: "Manualna",
			},
			{
				id: TransmissionType.Automatic,
				label: "Automatyczna",
			},
		];
	}

	public static getListSecondaryText(vehicle: App.Models.IShortVehicle) {
		return (
			<>
				{vehicle.manufacturingYear}
				{vehicle.displacement && (
					<>
						<InlineDot color="secondary" />
						{vehicle.displacement}L
					</>
				)}

				{vehicle.power && (
					<>
						<InlineDot color="secondary" />
						{vehicle.power}KM
					</>
				)}

				{(vehicle.tranmissionType ||
					vehicle.transmissionSpeedCount) && (
					<>
						<InlineDot color="secondary" />
						{vehicle.transmissionSpeedCount &&
							`${vehicle.transmissionSpeedCount}-biegowa`}
						{vehicle.tranmissionType &&
							`${
								VehicleService.getTransmissionTypes()[
									vehicle.tranmissionType
								].label
							}`}
						skrzynia
					</>
				)}
			</>
		);
	}
}
