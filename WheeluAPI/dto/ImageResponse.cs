namespace WheeluAPI.DTO;

public class ImageResponse
{
	public int Id { get; set; }
	public required string Url { get; set; }
	public required DateTime UploadDate { get; set; }
}