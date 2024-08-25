using System.Data;
using System.Transactions;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Location;
using WheeluAPI.DTO.School;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class SchoolApplicationService(
	ApplicationDbContext dbContext,
	ISchoolService schoolService,
	IMailService mailService, 
	IUserService userService,
	ILocationService locationService): BaseService, ISchoolApplicationService {

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

		if(applicationData.SubBuildingNumber!=null&&int.TryParse(applicationData.SubBuildingNumber, out int sbn)==false) 
			result.AddError("SubBuildingNumber", "Must be a number or be empty.");
		

		return result;
	}

	public async Task<SchoolApplication> CreateApplication(SchoolApplicationData applicationData) {

		SchoolApplication schoolApplication = new() {
			Name = applicationData.SchoolName,
			NIP = applicationData.NIP,
			Email = applicationData.Email,
			Established = applicationData.EstablishedDate,
			OwnerName = applicationData.OwnerName,
			OwnerSurname = applicationData.OwnerSurname,
			OwnerBirthday = applicationData.OwnerBirthday,
			PhoneNumber = applicationData.PhoneNumber,
			Street = applicationData.Street,
			BuildingNumber = applicationData.BuildingNumber,
			SubBuildingNumber = applicationData.SubBuildingNumber!=null?int.Parse(applicationData.SubBuildingNumber):0,
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

	public async Task<ServiceActionResult<ApplicationRejectErrors>> RejectApplication(SchoolApplication application, RejectionReason reason, string? message) {
		if(application.Status != SchoolApplicationState.Pending) 
			return new ServiceActionResult<ApplicationRejectErrors> {ErrorCode = ApplicationRejectErrors.ApplicationResolved};

		application.Status = SchoolApplicationState.Rejected;
		application.ResolvedAt = DateTime.UtcNow;
		application.RejectionReason = reason;
		application.RejectionMessage = message;

		var template = mailService.GetTemplate<SchoolApplicationRejectionTemplateVariables>("school-application-rejection");

		if(template == null) 
			return new ServiceActionResult<ApplicationRejectErrors> {};

		var templateData = new SchoolApplicationRejectionTemplateVariables {
			ApplicationID = application.Id.ToString(),
			FirstName = application.OwnerName,
			Reason = application.RejectionReason ?? RejectionReason.Unspecified,
			Message = application.RejectionMessage
		};

		if(await mailService.SendEmail("applications",template.Populate(templateData), [application.Email]) == false)
			return new ServiceActionResult<ApplicationRejectErrors> {ErrorCode = ApplicationRejectErrors.MailServiceProblem};

		var written = await dbContext.SaveChangesAsync();

		if(written==0) return new ServiceActionResult<ApplicationRejectErrors> {ErrorCode = ApplicationRejectErrors.DbError};
		
		return new ServiceActionResult<ApplicationRejectErrors> {IsSuccess = true};
		 
	}

	public async Task<ServiceActionResult<ApplicationAcceptErrors>> AcceptApplication(SchoolApplication application, SchoolRegistrationData finalData) {
		if(application.Status != SchoolApplicationState.Pending) 
			return new ServiceActionResult<ApplicationAcceptErrors> {ErrorCode = ApplicationAcceptErrors.ApplicationResolved};

		application.Status = SchoolApplicationState.Accepted;
		application.ResolvedAt = DateTime.UtcNow;

		var userDetails = new UserSignUpRequest {
			Username = finalData.Email,
			Password = Guid.NewGuid().ToString()+"!T",
			Name = finalData.OwnerName,
			Surname = finalData.OwnerSurname,
			Birthday = finalData.OwnerBirthday
		};

		using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled)) {
			var accountResult = await userService.CreateAccountAsync(userDetails, UserRole.SchoolManager,true);

			if(!accountResult.IsSuccess || accountResult.User==null) 
				return new ServiceActionResult<ApplicationAcceptErrors> {
					ErrorCode = ApplicationAcceptErrors.AccountCreationProblem, 
					Details = [accountResult.ErrorCode.ToString()]
				};

			var cities = await locationService.ResolveNearbyCities(finalData.NearbyCities);

			var addressData = new ComposeAddressData {
				Street = finalData.Street,
				BuildingNumber = finalData.BuildingNumber,
				SubBuildingNumber = finalData.SubBuildingNumber,
				ZipCode = finalData.ZipCode,
				City = finalData.City,
				State = finalData.State
			};

			var address = await locationService.ComposeAddress(addressData);

			if(!address.IsSuccess || address.Address==null) 
				return new ServiceActionResult<ApplicationAcceptErrors> {
					ErrorCode = ApplicationAcceptErrors.AddressResolvingProblem,
					Details = [address.ErrorCode.ToString(), address.Details[0]]
				};

			var schoolData = new SchoolData {
				SchoolName = finalData.SchoolName,
				Nip = finalData.Nip,
				Owner = accountResult.User,
				EstablishedDate = finalData.EstablishedDate,
				PhoneNumber = finalData.PhoneNumber,
				Address = address.Address,
				NearbyCities = cities
			};

			var school = await schoolService.CreateSchool(schoolData);

			if(school==null) return new ServiceActionResult<ApplicationAcceptErrors> {
					ErrorCode = ApplicationAcceptErrors.DbError, 
					Details=["Couldn't create school object"]
				};
			
			var deliveryResult = await SendAcceptationMail(application, accountResult.User);

			if(!deliveryResult.IsSuccess) return new ServiceActionResult<ApplicationAcceptErrors> {
				ErrorCode = ApplicationAcceptErrors.MailServiceProblem,
				Details = [deliveryResult.ErrorCode.ToString()]
			};

			scope.Complete();
		}

		return new ServiceActionResult<ApplicationAcceptErrors> {IsSuccess = true};
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

	public async Task<ServiceActionResult<AcceptMailErrors>> SendAcceptationMail(SchoolApplication application, User user) {
		if(application.Status != SchoolApplicationState.Accepted) 
			return new ServiceActionResult<AcceptMailErrors> {ErrorCode = AcceptMailErrors.UnexpectedApplicationStatus};

		var template = mailService.GetTemplate<SchoolApplicationAcceptationTemplateVariables>("school-application-acceptation");

		var token = await userService.GetAccountTokenAsync(user, AccountTokenType.PasswordResetToken);

		if(token==null) return new ServiceActionResult<AcceptMailErrors> {
			ErrorCode = AcceptMailErrors.TokenProblem, 
			Details=["Couldn't acquire account-setup token"]
		};

		if(template == null) 
			return new ServiceActionResult<AcceptMailErrors> {};

		var templateData = new SchoolApplicationAcceptationTemplateVariables {
			ApplicationID = application.Id.ToString(),
			FirstName = application.OwnerName,
			Link = $"http://localhost:5173/reset-password?token={token?.Id}"
		};

		if(await mailService.SendEmail("applications",template.Populate(templateData), [application.Email]) == false)
			return new ServiceActionResult<AcceptMailErrors> {ErrorCode = AcceptMailErrors.MailServiceProblem};

		return new ServiceActionResult<AcceptMailErrors> {IsSuccess = true};
	}

	public List<SchoolApplicationResponse> MapToDTO(List<SchoolApplication> source) {
		return source.Select(MapToDTO).ToList();
	}

	public SchoolApplicationResponse MapToDTO(SchoolApplication application) {
		return new SchoolApplicationResponse {
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
				EstablishedDate = application.Established,
				NIP = application.NIP,
				Street = application.Street,
				BuildingNumber = application.BuildingNumber,
				SubBuildingNumber = application.SubBuildingNumber==0?"":application.SubBuildingNumber.ToString(),
				ZipCode = application.ZipCode,
				City = application.City,
				State = application.State,
				PhoneNumber = application.PhoneNumber,
				Email = application.Email,
				NearbyCities = application.NearbyCities
		};
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

	Task<ServiceActionResult<ApplicationAcceptErrors>> AcceptApplication(SchoolApplication application, SchoolRegistrationData finalData);
	Task<ServiceActionResult<ApplicationRejectErrors>> RejectApplication(SchoolApplication application, RejectionReason reason, string? message);

	Task<ServiceActionResult<InitialMailErrors>> SendInitialMail(SchoolApplication application);

	List<SchoolApplicationResponse> MapToDTO(List<SchoolApplication> source);
	SchoolApplicationResponse MapToDTO(SchoolApplication source);
}