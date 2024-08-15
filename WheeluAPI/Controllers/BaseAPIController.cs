using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.helpers;

namespace WheeluAPI.Controllers;

public class BaseAPIController: ControllerBase {

	public static readonly int MaxPageSize = 50;
	public static readonly int DefaultPageSize = 15;
	protected OkObjectResult Paginated<T>(List<T> results, int totalItems, int pageSize) {
		return Ok(new PagingResponse<T> {
			Entries = results,
			TotalCount = totalItems,
			PageSize = pageSize,
			MaxPageSize = MaxPageSize,
			PagesCount = (int) Math.Ceiling((double) totalItems / pageSize)
		});
	}

	protected IQueryable<T> ApplyPaging<T>(IQueryable<T> query, PagingMetadata meta, out int appliedPageSize) {
		var pageNumber = meta.PageNumber > 0 ? meta.PageNumber:1;
		var pageSize = meta.PageSize > 0 ? meta.PageSize:DefaultPageSize;

		pageSize = pageSize > MaxPageSize?MaxPageSize:pageSize;

		appliedPageSize = pageSize;

		return query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
	}

	public IActionResult ValidationProblem(IDictionary<string, string[]> errors) {
		return base.ValidationProblem(new ValidationProblemDetails { 
			Errors = errors, 
			Extensions = new Dictionary<string, object?> { {"traceId", HttpContext.TraceIdentifier}}
		});
	}

}