namespace WheeluAPI.Mail.Templates;

public class SchoolApplicationInitialTemplate: ITemplate<SchoolApplicationInitialTemplateVariables> {
	public string Uuid { get;} = "33990023-3bb2-4ce7-ab58-ef844f56cd88";

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