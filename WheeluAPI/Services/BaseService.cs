using WheeluAPI.helpers;

namespace WheeluAPI.Services;

public class BaseService {
	public static readonly int MaxPageSize = 50;
	public static readonly int DefaultPageSize = 15;

	protected IQueryable<T> ApplyPaging<T>(IQueryable<T> query, PagingMetadata meta, out int appliedPageSize) {
		var pageNumber = meta.PageNumber > 0 ? meta.PageNumber:1;
		int pageSize = meta.PageSize != null && meta.PageSize > 0 ? (int) meta.PageSize:DefaultPageSize;

		pageSize = pageSize > MaxPageSize?MaxPageSize:pageSize;

		appliedPageSize = pageSize;

		return query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
	}
}