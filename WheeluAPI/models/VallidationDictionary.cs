using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace WheeluAPI.models;

public class ValidationDictionary(): IValidationDictionary {
	private Dictionary<string, List<string>> _errors {get; } = [];

	public IDictionary<string, string[]> Errors {get {return _errors.ToDictionary(x=>x.Key, x=>x.Value.ToArray());}}

	public void AddError(string key, string value) { 
		List<string>? messages = [];

		if(_errors.TryGetValue(key, out messages)) {
			messages.Add(value);
		}else _errors.Add(key, [value]);
	}
    public bool IsValid { get {return _errors.Count==0;} }
}

public interface IValidationDictionary {
	IDictionary<string, string[]> Errors { get; }

	void AddError(string key, string message);
    bool IsValid { get; }
}