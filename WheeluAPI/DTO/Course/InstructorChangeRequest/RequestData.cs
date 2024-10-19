using System.ComponentModel.DataAnnotations;
using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course.InstructorChangeRequest;

public class InstructorChangeData
{
    public required Models.Course Course { get; set; }

    public required models.User Requestor { get; set; }

    public SchoolInstructor? RequestedInstructor { get; set; }

    [MaxLength(255)]
    public required string Note { get; set; }
}
