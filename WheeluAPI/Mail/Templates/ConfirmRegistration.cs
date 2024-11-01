namespace WheeluAPI.Mail.Templates;

public class ConfirmRegistrationTemplate: ITemplate<ConfirmRegistrationTemplateVariables> {
	public string Uuid { get;} = "950faa0a-7520-46dd-9c8e-0b517ce74b7b";

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