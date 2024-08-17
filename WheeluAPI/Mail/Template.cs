namespace WheeluAPI.Mail;

public interface ITemplate {
	string Uuid { get; }
	PopulatedTemplate Populate(object someObject);
}

public interface ITemplate<T>: ITemplate {
	PopulatedTemplate Populate(T someObject);
}

public class PopulatedTemplate {
	public required string Uuid {get; set;}
	public required IDictionary<string, string> Variables {get; set;}
}