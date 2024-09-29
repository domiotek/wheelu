namespace WheeluAPI.Mail.Templates;

public class PaymentRefundedTemplate : ITemplate<PaymentRefundedTemplateVariables>
{
    public string Uuid { get; } = "c8202ed7-48e6-47ba-a376-ff9d1c1a0a5a";

    public PopulatedTemplate Populate(PaymentRefundedTemplateVariables variables)
    {
        IDictionary<string, string> dict = new Dictionary<string, string>
        {
            { "name", variables.FirstName },
            { "transaction_id", variables.TransactionId },
        };

        return new PopulatedTemplate { Uuid = Uuid, Variables = dict };
    }

    public PopulatedTemplate Populate(object variables)
    {
        return Populate((PaymentRefundedTemplateVariables)variables);
    }
}

public class PaymentRefundedTemplateVariables
{
    public required string TransactionId { get; set; }
    public required string FirstName { get; set; }
}
