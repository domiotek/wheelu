namespace WheeluAPI.Mail.Templates;

public class InstructorInviteCreateTemplate : ITemplate<InstructorInviteCreateTemplateVariables>
{
    public string Uuid { get; } = "83199097-119d-4202-8c8c-a75707aa3f87";

    public PopulatedTemplate Populate(InstructorInviteCreateTemplateVariables variables)
    {
        IDictionary<string, string> dict = new Dictionary<string, string>
        {
            { "school_name", variables.SchoolName },
            { "link", variables.Link },
        };

        return new PopulatedTemplate { Uuid = Uuid, Variables = dict };
    }

    public PopulatedTemplate Populate(object variables)
    {
        return Populate((InstructorInviteCreateTemplateVariables)variables);
    }
}

public class InstructorInviteCreateTemplateVariables
{
    public required string SchoolName { get; set; }
    public required string Link { get; set; }
}
