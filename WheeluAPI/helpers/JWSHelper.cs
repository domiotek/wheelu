using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using WheeluAPI.DTO.Errors;

namespace WheeluAPI.Helpers;

public class JWSHelperValidationParams
{
    public required string UrlPrefix { get; set; }

    public required string CertUrl { get; set; }
}

public class JWSHelper
{
    public static ServiceActionResult<JWSErrors> ValidateRequest(
        HttpRequest request,
        JWSHelperValidationParams validationParams,
        string? payload = null
    )
    {
        var result = new ServiceActionResult<JWSErrors>();

        if (!request.Headers.TryGetValue("X-JWS-Signature", out var jws))
        {
            result.ErrorCode = JWSErrors.MissingHeader;
            return result;
        }

        var jwsData = jws.ToString().Split('.');
        if (jwsData.Length != 3)
        {
            result.ErrorCode = JWSErrors.InvalidHeader;
            return result;
        }

        var headers = jwsData[0];
        var signature = jwsData[2];

        var headersJson = Base64UrlDecode(headers);

        var headersData = JsonSerializer.Deserialize<Dictionary<string, string>>(headersJson);
        if (headersData == null || !headersData.TryGetValue("x5u", out var x5u))
        {
            result.ErrorCode = JWSErrors.MissingHeader;
            return result;
        }

        if (!x5u.StartsWith(validationParams.UrlPrefix, StringComparison.OrdinalIgnoreCase))
        {
            result.ErrorCode = JWSErrors.InvalidCertUrl;
            return result;
        }

        var certificate = GetCertificateFromUrl(x5u);

        var trustedCertificate = GetCertificateFromUrl(validationParams.CertUrl);
        if (!VerifyCertificate(certificate, trustedCertificate))
        {
            result.ErrorCode = JWSErrors.CertIssue;
            return result;
        }

        payload = Base64UrlEncode(
            payload ?? new StreamReader(request.Body).ReadToEndAsync().Result
        );

        var decodedSignature = Base64UrlDecodeToBytes(signature);

        var publicKey = certificate.GetRSAPublicKey();
        if (!VerifyJwsSignature(headers, payload, decodedSignature, publicKey!))
        {
            result.ErrorCode = JWSErrors.InvalidSignature;
            return result;
        }

        result.IsSuccess = true;

        return result;
    }

    private static string Base64UrlDecode(string input)
    {
        input = input.Replace('-', '+').Replace('_', '/');
        switch (input.Length % 4)
        {
            case 2:
                input += "==";
                break;
            case 3:
                input += "=";
                break;
        }
        return Encoding.UTF8.GetString(Convert.FromBase64String(input));
    }

    private static byte[] Base64UrlDecodeToBytes(string input)
    {
        input = input.Replace('-', '+').Replace('_', '/');
        switch (input.Length % 4)
        {
            case 2:
                input += "==";
                break;
            case 3:
                input += "=";
                break;
        }
        return Convert.FromBase64String(input);
    }

    private static string Base64UrlEncode(string input)
    {
        var bytes = Encoding.UTF8.GetBytes(input);
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static X509Certificate2 GetCertificateFromUrl(string url)
    {
        using (var client = new HttpClient())
        {
            var certData = client.GetByteArrayAsync(url).Result;
            return new X509Certificate2(certData);
        }
    }

    private static bool VerifyCertificate(
        X509Certificate2 certificate,
        X509Certificate2 trustedCertificate
    )
    {
        using (var chain = new X509Chain())
        {
            chain.ChainPolicy.RevocationMode = X509RevocationMode.NoCheck;
            chain.ChainPolicy.ExtraStore.Add(trustedCertificate);
            chain.ChainPolicy.VerificationFlags =
                X509VerificationFlags.AllowUnknownCertificateAuthority;
            return chain.Build(certificate);
        }
    }

    private static bool VerifyJwsSignature(
        string headers,
        string payload,
        byte[] signature,
        RSA publicKey
    )
    {
        var data = Encoding.UTF8.GetBytes(headers + "." + payload);
        return publicKey.VerifyData(
            data,
            signature,
            HashAlgorithmName.SHA256,
            RSASignaturePadding.Pkcs1
        );
    }
}
