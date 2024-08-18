namespace WheeluAPI.Mail.Templates;

public class SchoolApplicationInitialTemplate: ITemplate<SchoolApplicationInitialTemplateVariables> {
	public string Uuid { get;} = "950faa0a-7520-46dd-9c8e-0b517ce74b7b";

	public PopulatedTemplate Populate(SchoolApplicationInitialTemplateVariables variables) {

		IDictionary<string, string> dict = new Dictionary<string, string>
		{
			{ "application_id", variables.ApplicationID },
			{ "name", variables.FirstName}
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

public class SchoolApplicationInitialTemplateVariables {
	public required string ApplicationID { get; set; }
	public required string FirstName { get; set; }
}