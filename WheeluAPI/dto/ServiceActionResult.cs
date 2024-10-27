public class ServiceActionResult<T>
{
    public bool IsSuccess { get; set; } = false;
    public T? ErrorCode { get; set; }
    public List<string> Details { get; set; } = [];
}

public class ServiceActionWithDataResult<T, D>
{
    public bool IsSuccess { get; set; } = false;

    public T? ErrorCode { get; set; }

    public D? Data { get; set; }

    public List<string> Details { get; set; } = [];
}

public class ServiceActionResultEx<T> : ServiceActionResult<T>
{
    public string? Error
    {
        get { return ErrorCode?.ToString(); }
    }
}

public class ServiceActionWithDataResultEx<T, D> : ServiceActionWithDataResult<T, D>
{
    public string? Error
    {
        get { return ErrorCode?.ToString(); }
    }
}
