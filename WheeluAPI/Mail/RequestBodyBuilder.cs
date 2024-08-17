using Newtonsoft.Json;

namespace WheeluAPI.Mail;

public class RequestBodyBuilder {
	private Sender? _sender = null;
	private List<Receiver> _receivers = [];
	private string _template = "";
	private IDictionary<string, string>? _variables = null;

	public RequestBodyBuilder AssignSender(Sender sender) {
		_sender = sender;
		return this;
	}

	public RequestBodyBuilder AssignReceivers(List<string> emailAddresses) {
		
		foreach(string email in emailAddresses) {
			_receivers.Add(new Receiver { Email = email});
		}
		
		return this;
	}

	public RequestBodyBuilder AssignTemplate(string templateUUID) {
		_template = templateUUID;
		return this;
	}

	public RequestBodyBuilder AssignVariables(IDictionary<string, string> templateVariables) {
		_variables = templateVariables;
		return this;
	}


	public string Serialize() {
		var body = new {
			from = _sender,
			to = _receivers,
			template_uuid = _template,
			template_variables = _variables
		};

		return JsonConvert.SerializeObject(body);
	}
}