namespace WheeluAPI.Middlewares;

public class BufferingMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        if (context.Request.Path == "/api/v1/transactions/notify")
        {
            context.Request.EnableBuffering();
        }

        await next(context);
    }
}
