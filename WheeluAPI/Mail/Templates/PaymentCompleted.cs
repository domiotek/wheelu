namespace WheeluAPI.Mail.Templates;

public class PaymentCompletedTemplate : ITemplate<PaymentCompletedTemplateVariables>
{
    public string Uuid { get; } = "036e383a-da2c-4195-af71-ec0e6ce31588";

    public PopulatedTemplate Populate(PaymentCompletedTemplateVariables variables)
    {
        IDictionary<string, string> dict = new Dictionary<string, string>
        {
            { "name", variables.FirstName },
            { "category", variables.CategoryName },
            { "school_name", variables.SchoolName },
            { "transaction_id", variables.TransactionId },
        };

        return new PopulatedTemplate { Uuid = Uuid, Variables = dict };
    }

    public PopulatedTemplate Populate(object variables)
    {
        return Populate((PaymentCompletedTemplateVariables)variables);
    }
}

public class PaymentCompletedTemplateVariables
{
    public required string TransactionId { get; set; }
    public required string FirstName { get; set; }
    public required string CategoryName { get; set; }
    public required string SchoolName { get; set; }
}
