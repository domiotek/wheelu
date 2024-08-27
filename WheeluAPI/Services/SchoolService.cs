using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.School;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class Schoolervice(ApplicationDbContext dbContext): BaseService, ISchoolService {
	public ValueTask<School?> GetSchoolByID(int id) {
		return dbContext.Schools.FindAsync(id);
	}

	public Task<School?> FindExistingSchool(SchoolApplicationData applicationData) {
		return dbContext.Schools.Where(a=>a.NIP==applicationData.NIP).SingleOrDefaultAsync();
	}

	public Task<List<School>> GetAllSchools() {
		return dbContext.Schools.ToListAsync();
	}

	public IQueryable<School> GetSchools(PagingMetadata meta, out int appliedPageSize) {
		var results = ApplyPaging(dbContext.Schools.AsQueryable(), meta, out int actualPageSize);

		appliedPageSize =  actualPageSize;

		return results;
	}

	public Task<int> Count() {
		return dbContext.Schools.CountAsync();
	}

	public List<SchoolResponse> MapToDTO(List<School> source) {
		return source.Select(s=>s.GetDTO()).ToList();
	}

	public async Task<School?> CreateSchool(SchoolData requestData) {
		var school = new School {
			Hidden = true,
			Name = requestData.SchoolName,
			NIP = requestData.Nip,
			Owner = requestData.Owner,
			Address = requestData.Address,
			Established = requestData.EstablishedDate,
			Joined = DateTime.UtcNow,
			PhoneNumber = requestData.PhoneNumber
		};

		dbContext.Schools.Add(school);
		var written = await dbContext.SaveChangesAsync();

		return written>0?school:null;
	}
}


public interface ISchoolService {

	ValueTask<School?> GetSchoolByID(int id);

	Task<School?> FindExistingSchool(SchoolApplicationData applicationData);

	Task<List<School>> GetAllSchools();

	IQueryable<School> GetSchools(PagingMetadata meta, out int appliedPageSize);

	Task<int> Count();

	List<SchoolResponse> MapToDTO(List<School> source);

	Task<School?> CreateSchool(SchoolData requestData);
}