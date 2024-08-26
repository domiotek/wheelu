namespace WheeluAPI.Mail.Templates;

public class AccountRecoveryTemplate: ITemplate<AccountRecoveryTemplateVariables> {
	public string Uuid { get;} = "0786abfb-df02-4f1e-b280-52d779894f03";

	public PopulatedTemplate Populate(AccountRecoveryTemplateVariables variables) {

		IDictionary<string, string> dict = new Dictionary<string, string>
		{
			{ "name", variables.Name},
			{ "link", variables.Link }
		};
		
		return new PopulatedTemplate {
			Uuid = Uuid,
			Variables = dict
		};
	}

	public PopulatedTemplate Populate(object variables) {
		return Populate((AccountRecoveryTemplateVariables) variables);
	}
}

public class AccountRecoveryTemplateVariables {
	public required string Name { get; set; }
	public required string Link { get; set; }
}