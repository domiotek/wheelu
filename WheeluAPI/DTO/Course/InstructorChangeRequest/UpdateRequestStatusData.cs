using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course.InstructorChangeRequest;

public class UpdateRequestStatusData
{
    public required RequestStatus NewStatus { get; set; }
}
