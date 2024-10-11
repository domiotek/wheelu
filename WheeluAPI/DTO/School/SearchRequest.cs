namespace WheeluAPI.DTO.School;

public enum SortingOptions
{
    Name,
    Rating,
}

public class SchoolSearchRequest
{
    public string? Query { get; set; }

    public required SortingOptions SortingTarget { get; set; }

    public required SortingType SortingType { get; set; }
}
