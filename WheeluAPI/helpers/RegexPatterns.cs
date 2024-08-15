using System.Text.RegularExpressions;

namespace WheeluAPI.helpers;
public partial class RegexPatterns {	

	[GeneratedRegex("^\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$")]
	public static partial Regex Email();

	[GeneratedRegex("^\\d{10}$")]
	public static partial Regex NIP();

	[GeneratedRegex("\\d{2}-\\d{3}")]
	public static partial Regex ZipCode();

	[GeneratedRegex("(?<!\\w)(\\(?(\\+|00)?48\\)?)?[ -]?\\d{3}[ -]?\\d{3}[ -]?\\d{3}(?!\\w)")]
	public static partial Regex PhoneNumber();
}