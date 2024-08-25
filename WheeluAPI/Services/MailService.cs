namespace WheeluAPI.Services;

using System.Net;
using RestSharp;
using WheeluAPI.Mail;
using WheeluAPI.Mail.Templates;

public class MailService: IMailService {
	private RestClient _client;
	private string _accessToken;
	private IDictionary<string, Sender> _senders =  new Dictionary<string, Sender> {
		{"accounts", new Sender {Email = "accounts@omiotech.pl", Name = "System kont Wheelu"}},
		{"applications", new Sender {Email = "applications@omiotech.pl", Name = "Wheelu - Platforma Szkół Jazdy"}}
	};

	private IDictionary<string, ITemplate> _templates = new Dictionary<string, ITemplate> {
		{"confirm-registration", new ConfirmRegistrationTemplate()},
		{"school-application-initial", new SchoolApplicationInitialTemplate()},
		{"school-application-rejection", new SchoolApplicationRejectionTemplate()},
		{"school-application-acceptation", new SchoolApplicationAcceptationTemplate()}
	};

	public MailService(IConfiguration configuration) {
		try {
			var connectionString = configuration.GetConnectionString("MailTrap") ?? throw new NullReferenceException("Missing connection string.");
			var parts = connectionString.Split(";");
			if(parts.Length != 2) throw new ArgumentException("Unexpected format - 'inboxID;accessToken' format required.");
			_accessToken = parts[1];

			_client = new RestClient($"https://sandbox.api.mailtrap.io/api/send/{parts[0]}");

		}catch(Exception ex) {
			throw new Exception("Failed to parse MailTrap connection string.", ex);
		}
	}

	private string PrepareMessageBody(string senderID, List<string> emails, string template, IDictionary<string, string> variables) {
		Sender? sender;

		if(_senders.TryGetValue(senderID, out sender) == false) 
			throw new Exception($"Requested sender {senderID} is not defined.");

		return new RequestBodyBuilder()
			.AssignSender(sender)
			.AssignReceivers(emails)
			.AssignTemplate(template)
			.AssignVariables(variables)
			.Serialize();
	}

	public ITemplate<T>? GetTemplate<T>(string templatedID) {
		ITemplate? template;

		if(_templates.TryGetValue(templatedID, out template) == false) 
			return null;

		return (ITemplate<T>) template;
	}

	public async Task<bool> SendEmail(string senderID, PopulatedTemplate template, List<string> receivers) {
		var request = new RestRequest();
		request.AddHeader("Authorization", $"Bearer {_accessToken}");
		request.AddHeader("Content-Type", "application/json");

		request.AddParameter(
			"application/json", 
			PrepareMessageBody(senderID, receivers, template.Uuid, template.Variables),
			ParameterType.RequestBody
		);

		var response = await _client.PostAsync(request);

		return response.StatusCode == HttpStatusCode.OK;
	}
}

public interface IMailService {
	ITemplate<T>? GetTemplate<T>(string templateID);
	Task<bool> SendEmail(string senderID, PopulatedTemplate template, List<string> receivers);
}