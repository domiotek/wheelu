using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.DTO.Course.InstructorChangeRequest;

public class CreateRequestData
{
    public int? InstructorId { get; set; }

    [MaxLength(255)]
    public required string Note { get; set; }
}
