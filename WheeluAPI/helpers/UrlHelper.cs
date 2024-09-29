namespace WheeluAPI.Helpers;

public class UrlResolver(IConfiguration configuration)
{
    public string? GetClientUrl()
    {
        return configuration["Urls:Client"];
    }

    public string? GetAPIUrl()
    {
        return configuration["Urls:API"];
    }

    public string? GetTPayAPIUrl()
    {
        return configuration["Urls:TPay"];
    }
}
