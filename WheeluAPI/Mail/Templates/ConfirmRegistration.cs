namespace WheeluAPI.Mail.Templates;

public class ConfirmRegistrationTemplate: ITemplate<ConfirmRegistrationTemplateVariables> {
	public string Uuid { get;} = "33990023-3bb2-4ce7-ab58-ef844f56cd88";

	public PopulatedTemplate Populate(ConfirmRegistrationTemplateVariables variables) {

		IDictionary<string, string> dict = new Dictionary<string, string>
		{
			{ "link", variables.Link }
		};
		
		return new PopulatedTemplate {
			Uuid = Uuid,
			Variables = dict
		};
	}

	public PopulatedTemplate Populate(object variables) {
		return Populate((ConfirmRegistrationTemplateVariables) variables);
	}
}

public class ConfirmRegistrationTemplateVariables {
	public required string Link { get; set; }
}