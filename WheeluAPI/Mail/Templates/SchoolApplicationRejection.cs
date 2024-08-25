using WheeluAPI.models;

namespace WheeluAPI.Mail.Templates;

public class SchoolApplicationRejectionTemplate: ITemplate<SchoolApplicationRejectionTemplateVariables> {
	public string Uuid { get;} = "7815d10c-62d9-4e3b-bf54-abe74bfd80fc";

	public PopulatedTemplate Populate(SchoolApplicationRejectionTemplateVariables variables) {
		var additionalMessage = variables.Message!=null?$"<br/>Oto dodatkowe informacje od osoby, która zajmowała się Twoim wnioskiem: <br/>{variables.Message}":"";

		
		string message = variables.Reason switch
		{
			RejectionReason.InvalidData => $"W Twoim wniosku zabrakło istotnych informacji, lub niektóre z nich były niepoprawne. {additionalMessage}",
			RejectionReason.PlatformSaturated => $@"Nasza platforma pęka w szwach! A przynajmniej, jest takie zagrożenie... 
				Niestety nie możemy teraz dodać kolejnej szkoły, ponieważ obawiamy się, że nasze systemy mogłyby tego nie wytrzymać. 
				Bez obaw, możesz spróbować ponownie za jakiś czas. {additionalMessage}",
			RejectionReason.BadReputation => $@"Znaleźliśmy nieprzychylne opinie na temat Twojej szkoły jazdy. Musimy dbać o bezpieczeństwo oraz standardy
				naszej platformy, dlatego też byliśmy zmuszeni odrzucić wniosek. {additionalMessage}",
			_ => $"{additionalMessage}",
		};


		IDictionary<string, string> dict = new Dictionary<string, string>
		{
			{ "application_id", variables.ApplicationID },
			{ "name", variables.FirstName},
			{ "reason_description", message }
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

public class SchoolApplicationRejectionTemplateVariables {
	public required string ApplicationID { get; set; }
	public required string FirstName { get; set; }

	public required RejectionReason Reason { get; set; }

	public required string? Message { get; set; }
}