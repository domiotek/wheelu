
public class ServiceActionResult<T> {
	public bool IsSuccess { get; set; } = false;
	public T? ErrorCode { get; set; }
	public List<string> Details { get; set; } = [];
}