namespace WheeluAPI.DTO.Errors;

public enum ManageScheduleSlotErrors
{
    DBError,
    InstructorNotEmployed,
}

public enum NewScheduleSlotErrors
{
    DBError,
    SlotOverlap,
    InvalidDuration,
    InvalidSlotPlacement,
}

public enum UpdateScheduleSlotErrors
{
    DBError,
    SlotOverlap,
    RideAssigned,
    InvalidDuration,
    InvalidSlotPlacement,
}

public enum DeleteScheduleSlotErrors
{
    DBError,
    RideAssigned,
}

public enum CreateRideErrors
{
    DBError,
    RideAssigned,
    VehicleUnavailable,
    InsufficientHoursLeft,
}

public enum ChangeRideVehicleErrors
{
    DBError,
    VehicleUnavailable,
    InvalidRideStatus,
}

public enum ChangeRideStateErrors
{
    DBError,
    InvalidRideStatus,
}
