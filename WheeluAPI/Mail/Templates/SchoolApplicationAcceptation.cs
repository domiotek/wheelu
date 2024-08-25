using WheeluAPI.models;

namespace WheeluAPI.Mail.Templates;

public class SchoolApplicationAcceptationTemplate: ITemplate<SchoolApplicationAcceptationTemplateVariables> {
	public string Uuid { get;} = "4013c5b7-5065-47b0-9757-20269c5e15e8";

	public PopulatedTemplate Populate(SchoolApplicationAcceptationTemplateVariables variables) {

		IDictionary<string, string> dict = new Dictionary<string, string>
		{
			{ "application_id", variables.ApplicationID },
			{ "name", variables.FirstName},
			{ "link", variables.Link }
		};
		
		return new PopulatedTemplate {
			Uuid = Uuid,
			Variables = dict
		};
	}

	public PopulatedTemplate Populate(object variables) {
		return Populate((SchoolApplicationInitialTemplateVariables) variables);
	}
}

public class SchoolApplicationAcceptationTemplateVariables {
	public required string ApplicationID { get; set; }
	public required string FirstName { get; set; }
	public required string Link { get; set; }
}