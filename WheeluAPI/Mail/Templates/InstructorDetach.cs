namespace WheeluAPI.Mail.Templates;

public class InstructorDetachTemplate : ITemplate<InstructorDetachTemplateVariables>
{
    public string Uuid { get; } = "6a1542ef-77ba-4ff0-b093-dd92e8bc34d5";

    public PopulatedTemplate Populate(InstructorDetachTemplateVariables variables)
    {
        IDictionary<string, string> dict = new Dictionary<string, string>
        {
            { "name", variables.FirstName },
            { "school_name", variables.SchoolName },
        };

        return new PopulatedTemplate { Uuid = Uuid, Variables = dict };
    }

    public PopulatedTemplate Populate(object variables)
    {
        return Populate((InstructorDetachTemplateVariables)variables);
    }
}

public class InstructorDetachTemplateVariables
{
    public required string SchoolName { get; set; }
    public required string FirstName { get; set; }
}
