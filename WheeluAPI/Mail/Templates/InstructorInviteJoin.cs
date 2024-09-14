namespace WheeluAPI.Mail.Templates;

public class InstructorInviteJoinTemplate : ITemplate<InstructorInviteJoinTemplateVariables>
{
    public string Uuid { get; } = "3a920572-02a8-436c-bb30-cd4ea2936443";

    public PopulatedTemplate Populate(InstructorInviteJoinTemplateVariables variables)
    {
        IDictionary<string, string> dict = new Dictionary<string, string>
        {
            { "name", variables.FirstName },
            { "school_name", variables.SchoolName },
            { "link", variables.Link },
        };

        return new PopulatedTemplate { Uuid = Uuid, Variables = dict };
    }

    public PopulatedTemplate Populate(object variables)
    {
        return Populate((InstructorInviteJoinTemplateVariables)variables);
    }
}

public class InstructorInviteJoinTemplateVariables
{
    public required string FirstName { get; set; }
    public required string SchoolName { get; set; }
    public required string Link { get; set; }
}
