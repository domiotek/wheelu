using Microsoft.AspNetCore.Mvc;

namespace WheeluAPI.Helpers;

public class TokenResolveResult<TokenType>
{
    public bool IsSuccess { get; set; } = false;
    public ActionResult? ErrorResult { get; set; }

    public TokenType? Token { get; set; }
}
