namespace WheeluAPI.Mail.Templates;

public class CourseInstructorChangedTemplate : ITemplate<CourseInstructorChangedTemplateVariables>
{
    public string Uuid { get; } = "4dfa5c18-fa06-437d-8d98-65ab1bd23a0c";

    public PopulatedTemplate Populate(CourseInstructorChangedTemplateVariables variables)
    {
        IDictionary<string, string> dict = new Dictionary<string, string>
        {
            { "name", variables.FirstName },
            { "desc", variables.Message },
            { "link", variables.Link },
        };

        return new PopulatedTemplate { Uuid = Uuid, Variables = dict };
    }

    public PopulatedTemplate Populate(object variables)
    {
        return Populate((CourseInstructorChangedTemplateVariables)variables);
    }
}

public class CourseInstructorChangedTemplateVariables
{
    public required string FirstName { get; set; }

    public required string Message { get; set; }

    public required string Link { get; set; }

    public required string Email { get; set; }
}
