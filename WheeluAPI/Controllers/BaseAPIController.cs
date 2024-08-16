using Microsoft.AspNetCore.Mvc;
using WheeluAPI.helpers;

namespace WheeluAPI.Controllers;

public class BaseAPIController: ControllerBase {
	protected OkObjectResult Paginated<T>(List<T> results, int totalItems, int pageSize) {
		return Ok(new PagingResponse<T> {
			Entries = results,
			TotalCount = totalItems,
			PageSize = pageSize,
			PagesCount = (int) Math.Ceiling((double) totalItems / pageSize)
		});
	}

	public IActionResult ValidationProblem(IDictionary<string, string[]> errors) {
		return base.ValidationProblem(new ValidationProblemDetails { 
			Errors = errors, 
			Extensions = new Dictionary<string, object?> { {"traceId", HttpContext.TraceIdentifier}}
		});
	}

}