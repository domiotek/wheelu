using System.Data;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class SchoolApplicationService(ApplicationDbContext dbContext): BaseService, ISchoolApplicationService {

	public ValidationDictionary ValidateApplicationData(SchoolApplicationData applicationData) {
		var result = new ValidationDictionary();
		
		if(!RegexPatterns.NIP().Match(applicationData.NIP).Success)
			result.AddError("NIP", "Malformed NIP number.");

		if(!RegexPatterns.Email().Match(applicationData.Email).Success)
			result.AddError("Email", "Malformed email.");

		if(!RegexPatterns.ZipCode().Match(applicationData.ZipCode).Success)
			result.AddError("ZipCode", "Malformed zip code.");

		if(!RegexPatterns.PhoneNumber().Match(applicationData.PhoneNumber).Success)
			result.AddError("PhoneNumber", "Malformed phone number.");

		try {
			DateOnly.Parse(applicationData.EstablishedDate);
		}catch(FormatException) {
			result.AddError("Established", "Malformed date.");
		}

		return result;
	}

	public async Task<bool> CreateApplication(SchoolApplicationData applicationData) {

		SchoolApplication schoolApplication = new() {
			Name = applicationData.SchoolName,
			NIP = applicationData.NIP,
			Email = applicationData.Email,
			Established = DateOnly.Parse(applicationData.EstablishedDate),
			OwnerName = applicationData.OwnerName,
			OwnerSurname = applicationData.OwnerSurname,
			PhoneNumber = applicationData.PhoneNumber,
			Street = applicationData.Street,
			BuildingNumber = applicationData.BuildingNumber,
			SubBuildingNumber = applicationData.SubBuildingNumber,
			ZipCode = applicationData.ZipCode,
			City = applicationData.City,
			NearbyCities = applicationData.NearbyCities,
			AppliedAt = DateTime.UtcNow,
		};

		dbContext.SchoolApplications.Add(schoolApplication);

		await dbContext.SaveChangesAsync();
		return true;
	}

	public ValueTask<SchoolApplication?> GetApplicationByID(int id) {
		return dbContext.SchoolApplications.FindAsync(id);
	}

	public Task<SchoolApplication?> FindExistingApplication(SchoolApplicationData applicationData) {
		return dbContext.SchoolApplications.Where(a=>a.NIP==applicationData.NIP || a.Email==applicationData.Email).SingleOrDefaultAsync();
	}

	public Task<List<SchoolApplication>> GetAllApplications() {
		return dbContext.SchoolApplications.ToListAsync();
	}

	public IQueryable<SchoolApplication> GetApplications(PagingMetadata meta, out int appliedPageSize) {
		var results = ApplyPaging(dbContext.SchoolApplications.AsQueryable(), meta, out int actualPageSize);

		appliedPageSize =  actualPageSize;

		return results;
	}

	public Task<int> Count() {
		return dbContext.SchoolApplications.CountAsync();
	}
}


public interface ISchoolApplicationService {
	ValidationDictionary ValidateApplicationData(SchoolApplicationData applicationData);

	Task<bool> CreateApplication(SchoolApplicationData applicationData);

	ValueTask<SchoolApplication?> GetApplicationByID(int id);

	Task<SchoolApplication?> FindExistingApplication(SchoolApplicationData applicationData);

	Task<List<SchoolApplication>> GetAllApplications();

	IQueryable<SchoolApplication> GetApplications(PagingMetadata pagingMetadata, out int appliedPageSize);

	Task<int> Count();
}