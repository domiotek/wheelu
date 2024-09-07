using WheeluAPI.DTO.Errors;

namespace WheeluAPI.DTO.Image;


public class SaveImageResult : ServiceActionResult<SaveImageErrors>
{
	public models.Image? Image { get; set; }
}