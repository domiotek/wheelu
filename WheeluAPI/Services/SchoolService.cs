using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.School;
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

	public async Task<School?> CreateSchool(SchoolData requestData) {
		var school = new School {
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

	Task<School?> CreateSchool(SchoolData requestData);
}