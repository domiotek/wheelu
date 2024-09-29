namespace WheeluAPI.DTO.Errors;

public enum JWSErrors
{
    MissingHeader,
    InvalidHeader,
    InvalidCertUrl,
    CertIssue,
    InvalidSignature,
}
