namespace WheeluAPI.Mail.Templates;

public class PaymentCanceledTemplate : ITemplate<PaymentCanceledTemplateVariables>
{
    public string Uuid { get; } = "1f86a468-e0ff-4dd2-9684-ba104ee150d7";

    public PopulatedTemplate Populate(PaymentCanceledTemplateVariables variables)
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
        return Populate((PaymentCanceledTemplateVariables)variables);
    }
}

public class PaymentCanceledTemplateVariables
{
    public required string TransactionId { get; set; }
    public required string FirstName { get; set; }
}
