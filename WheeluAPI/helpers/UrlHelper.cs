using DotNetEnv;

namespace WheeluAPI.Helpers;

public class UrlResolver(IConfiguration configuration)
{
    public string? GetClientUrl()
    {
        return Env.GetString("Urls.Client") ?? configuration["Urls:Client"];
    }

    public string? GetAPIUrl()
    {
        return Env.GetString("Urls.API") ?? configuration["Urls:API"];
    }

    public string? GetTPayAPIUrl()
    {
        return Env.GetString("Urls.TPay") ?? configuration["Urls:TPay"];
    }
}
