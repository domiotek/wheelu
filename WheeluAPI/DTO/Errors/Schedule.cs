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
}

public enum ChangeRideStateErrors
{
    DBError,

    InvalidRideStatus,
}
