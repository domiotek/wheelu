namespace WheeluAPI.models;

public class Image
{
	public int Id { get; set; }
	public required string FileName { get; set; }
	public required DateTime UploadDate { get; set; }

}