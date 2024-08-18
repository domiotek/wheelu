using System.Data;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class SchoolApplicationService(ApplicationDbContext dbContext, IMailService mailService): BaseService, ISchoolApplicationService {

	public async Task<ValidationDictionary> ValidateApplicationDataAsync(SchoolApplicationData applicationData) {
		var result = new ValidationDictionary();
		
		if(!RegexPatterns.NIP().Match(applicationData.NIP).Success)
			result.AddError("NIP", "Malformed NIP number.");

		if(!RegexPatterns.Email().Match(applicationData.Email).Success)
			result.AddError("Email", "Malformed email.");

		if(!RegexPatterns.ZipCode().Match(applicationData.ZipCode).Success)
			result.AddError("ZipCode", "Malformed zip code.");

		if(!RegexPatterns.PhoneNumber().Match(applicationData.PhoneNumber).Success)
			result.AddError("PhoneNumber", "Malformed phone number.");

		if(await dbContext.States.Where(s=>s.Name == applicationData.State).SingleOrDefaultAsync()==null) 
			result.AddError("State", "State value not found.");

		try {
			DateOnly.Parse(applicationData.EstablishedDate);
		}catch(FormatException) {
			result.AddError("Established", "Malformed date.");
		}

		return result;
	}

	public async Task<SchoolApplication> CreateApplication(SchoolApplicationData applicationData) {

		SchoolApplication schoolApplication = new() {
			Name = applicationData.SchoolName,
			NIP = applicationData.NIP,
			Email = applicationData.Email,
			Established = DateOnly.Parse(applicationData.EstablishedDate),
			OwnerName = applicationData.OwnerName,
			OwnerSurname = applicationData.OwnerSurname,
			OwnerBirthday = applicationData.OwnerBirthday,
			PhoneNumber = applicationData.PhoneNumber,
			Street = applicationData.Street,
			BuildingNumber = applicationData.BuildingNumber,
			SubBuildingNumber = applicationData.SubBuildingNumber,
			ZipCode = applicationData.ZipCode,
			City = applicationData.City,
			State = applicationData.State,
			NearbyCities = applicationData.NearbyCities,
			AppliedAt = DateTime.UtcNow,
		};

		dbContext.SchoolApplications.Add(schoolApplication);

		await dbContext.SaveChangesAsync();
		return schoolApplication;
	}

	public ValueTask<SchoolApplication?> GetApplicationByID(int id) {
		return dbContext.SchoolApplications.FindAsync(id);
	}

	/// <summary>
	/// Finds applications that has at least one significant property equal to the given data.
	/// </summary>
	/// <returns>Only one of those. Usefull for detecting.</returns>
	public Task<SchoolApplication?> FindExistingApplication(SchoolApplicationData applicationData) {
		return dbContext.SchoolApplications
			.Where(a=>a.NIP==applicationData.NIP || a.Email==applicationData.Email)
			.FirstOrDefaultAsync();
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

	public async Task<ServiceActionResult<RejectionErrors>> RejectApplication(SchoolApplication application, RejectionReason reason, string? message) {
		if(application.Status != SchoolApplicationState.Pending) 
			return new ServiceActionResult<RejectionErrors> {ErrorCode = RejectionErrors.ApplicationResolved};

		application.Status = SchoolApplicationState.Rejected;
		application.ResolvedAt = DateTime.UtcNow;
		application.RejectionReason = reason;
		application.RejectionMessage = message;

		var template = mailService.GetTemplate<SchoolApplicationRejectionTemplateVariables>("school-application-rejection");

		if(template == null) 
			return new ServiceActionResult<RejectionErrors> {};

		var templateData = new SchoolApplicationRejectionTemplateVariables {
			ApplicationID = application.Id.ToString(),
			FirstName = application.OwnerName,
			Reason = application.RejectionReason ?? RejectionReason.Unspecified,
			Message = application.RejectionMessage
		};

		if(await mailService.SendEmail("applications",template.Populate(templateData), [application.Email]) == false)
			return new ServiceActionResult<RejectionErrors> {ErrorCode = RejectionErrors.MailServiceProblem};

		var written = await dbContext.SaveChangesAsync();

		if(written==0) return new ServiceActionResult<RejectionErrors> {ErrorCode = RejectionErrors.DbError};
		
		return new ServiceActionResult<RejectionErrors> {IsSuccess = true};
		 
	}

	public async Task<ServiceActionResult<InitialMailErrors>> SendInitialMail(SchoolApplication application) {
		if(application.Status != SchoolApplicationState.Pending) 
			return new ServiceActionResult<InitialMailErrors> {ErrorCode = InitialMailErrors.ApplicationResolved};

		var template = mailService.GetTemplate<SchoolApplicationInitialTemplateVariables>("school-application-initial");

		if(template == null) 
			return new ServiceActionResult<InitialMailErrors> {};

		var templateData = new SchoolApplicationInitialTemplateVariables {
			ApplicationID = application.Id.ToString(),
			FirstName = application.OwnerName
		};

		if(await mailService.SendEmail("applications",template.Populate(templateData), [application.Email]) == false)
			return new ServiceActionResult<InitialMailErrors> {ErrorCode = InitialMailErrors.MailServiceProblem};
		
		return new ServiceActionResult<InitialMailErrors> {IsSuccess = true};
	}

	public List<SchoolApplicationResponse> MapToDTO(List<SchoolApplication> source) {
		return source.Select(application=>
			new SchoolApplicationResponse {
				Id = application.Id,
				Status = application.Status.ToString().ToLower(),
				AppliedAt = application.AppliedAt,
				ResolvedAt = application.ResolvedAt,
				RejectionReason = application.RejectionReason.ToString(),
				RejectionMessage = application.RejectionMessage,
				SchoolName = application.Name,
				OwnerName = application.OwnerName,
				OwnerSurname = application.OwnerSurname,
				OwnerBirthday = application.OwnerBirthday,
				EstablishedDate = application.Established.ToShortDateString(),
				NIP = application.NIP,
				Street = application.Street,
				BuildingNumber = application.BuildingNumber,
				SubBuildingNumber = application.SubBuildingNumber,
				ZipCode = application.ZipCode,
				City = application.City,
				State = application.State,
				PhoneNumber = application.PhoneNumber,
				Email = application.Email,
				NearbyCities = application.NearbyCities
			}
		).ToList();
	}
}


public interface ISchoolApplicationService {
	Task<ValidationDictionary> ValidateApplicationDataAsync(SchoolApplicationData applicationData);

	Task<SchoolApplication> CreateApplication(SchoolApplicationData applicationData);

	ValueTask<SchoolApplication?> GetApplicationByID(int id);

	Task<SchoolApplication?> FindExistingApplication(SchoolApplicationData applicationData);

	Task<List<SchoolApplication>> GetAllApplications();

	IQueryable<SchoolApplication> GetApplications(PagingMetadata pagingMetadata, out int appliedPageSize);

	Task<int> Count();

	Task<ServiceActionResult<RejectionErrors>> RejectApplication(SchoolApplication application, RejectionReason reason, string? message);

	Task<ServiceActionResult<InitialMailErrors>> SendInitialMail(SchoolApplication application);

	List<SchoolApplicationResponse> MapToDTO(List<SchoolApplication> source);
}