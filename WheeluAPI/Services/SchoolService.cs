using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class Schoolervice(ApplicationDbContext dbContext): ISchoolService {
	public ValueTask<School?> GetSchoolByID(int id) {
		return dbContext.Schools.FindAsync(id);
	}

	public Task<School?> FindExistingSchool(SchoolApplicationData applicationData) {
		return dbContext.Schools.Where(a=>a.NIP==applicationData.NIP).SingleOrDefaultAsync();
	}
}


public interface ISchoolService {

	ValueTask<School?> GetSchoolByID(int id);

	Task<School?> FindExistingSchool(SchoolApplicationData applicationData);
}