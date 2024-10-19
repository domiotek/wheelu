namespace WheeluAPI.Mail.Templates;

public class ICRequestResolvedTemplate : ITemplate<ICRequestResolvedTemplateVariables>
{
    public string Uuid { get; } = "7c6fc753-9aad-424a-8db1-4ec012c340fd";

    public PopulatedTemplate Populate(ICRequestResolvedTemplateVariables variables)
    {
        IDictionary<string, string> dict = new Dictionary<string, string>
        {
            { "name", variables.FirstName },
            { "status", variables.OutcomeCaption },
            { "link", variables.Link },
        };

        return new PopulatedTemplate { Uuid = Uuid, Variables = dict };
    }

    public PopulatedTemplate Populate(object variables)
    {
        return Populate((ICRequestResolvedTemplateVariables)variables);
    }
}

public class ICRequestResolvedTemplateVariables
{
    public required string FirstName { get; set; }

    public required string OutcomeCaption { get; set; }

    public required string Link { get; set; }
}
