namespace WheeluAPI.helpers;

public class PagingResponse<T> {
	public required List<T> Entries { get; set; }

	public required int TotalCount { get; set; }

	public required int PageSize { get; set; }

	public required int MaxPageSize { get; set; }

	public required int PagesCount { get; set; }
	
}