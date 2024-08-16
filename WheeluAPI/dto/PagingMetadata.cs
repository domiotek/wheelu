namespace WheeluAPI.helpers;


public class PagingMetadata {
	public required int PageNumber { get; set; }

	public int? PageSize { get; set; }
}

public class OptionalPagingMetadata {
	public int? PageNumber { get; set; }

	public int? PageSize { get; set; }
}