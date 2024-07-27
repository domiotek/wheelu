namespace WheeluAPI.DTO;


public class GenericResponse<T> {
	public bool state { get; set; }

	public T? data { get; set; }

	public string? error { get; set; }
}