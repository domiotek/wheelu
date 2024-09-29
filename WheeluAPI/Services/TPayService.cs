namespace WheeluAPI.Services;

using System;
using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.TPay;
using WheeluAPI.Helpers;

public class TPayService(HttpClient httpClient, UrlResolver urlHelper, ILogger<TPayService> logger)
{
    private readonly string? BaseAPIURL = urlHelper.GetTPayAPIUrl();

    public async Task<ServiceActionWithDataResult<TPayAuthorizationErrors, string>> GetAccessToken()
    {
        var url = $"{BaseAPIURL}/oauth/auth";
        var clientId = Environment.GetEnvironmentVariable("TPAY_CLIENT");
        var clientSecret = Environment.GetEnvironmentVariable("TPAY_SECRET");

        var result = new ServiceActionWithDataResult<TPayAuthorizationErrors, string>();

        if (BaseAPIURL == null || clientId == null || clientSecret == null)
        {
            result.ErrorCode = TPayAuthorizationErrors.ConfigurationError;
            return result;
        }

        var data = new AuthRequest { ClientId = clientId, ClientSecret = clientSecret };

        var jsonData = JsonConvert.SerializeObject(data);
        var requestContent = new StringContent(jsonData, Encoding.UTF8, "application/json");

        try
        {
            HttpResponseMessage response = await httpClient.PostAsync(url, requestContent);

            response.EnsureSuccessStatusCode();

            string responseString = await response.Content.ReadAsStringAsync();

            AuthResponse responseObject =
                JsonConvert.DeserializeObject<AuthResponse>(responseString)
                ?? throw new Exception("Unprocessable response.");

            result.IsSuccess = true;
            result.Data = responseObject.AccessToken;
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(
                "Exception occurred while requesting TPay access token: {message}",
                ex.Message
            );
            result.ErrorCode = TPayAuthorizationErrors.APIError;
            return result;
        }
    }

    private async Task<ServiceActionWithDataResult<TPayTransactionErrors, string>> PostTPayAsync(
        string url,
        object data
    )
    {
        url = BaseAPIURL + url;

        var result = new ServiceActionWithDataResult<TPayTransactionErrors, string>();

        var accessToken = await GetAccessToken();

        if (accessToken.IsSuccess == false)
        {
            result.ErrorCode = TPayTransactionErrors.AccessError;
            return result;
        }

        var jsonData = JsonConvert.SerializeObject(data);
        var requestContent = new StringContent(jsonData, Encoding.UTF8, "application/json");

        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            accessToken.Data
        );

        try
        {
            HttpResponseMessage response = await httpClient.PostAsync(url, requestContent);
            string contentString = await response.Content.ReadAsStringAsync();

            response.EnsureSuccessStatusCode();
            result.IsSuccess = true;
            result.Data = contentString;

            return result;
        }
        catch (Exception)
        {
            result.ErrorCode = TPayTransactionErrors.APIError;
            return result;
        }
    }

    public async Task<
        ServiceActionWithDataResult<TPayTransactionErrors, RegisterTransactionResponse>
    > RegisterTransaction(RegisterTransactionRequest request)
    {
        var result =
            new ServiceActionWithDataResult<TPayTransactionErrors, RegisterTransactionResponse>();
        var clientUrl = urlHelper.GetClientUrl();
        var apiUrl = urlHelper.GetAPIUrl();

        var data = new TPayCreateTransactionRequest
        {
            Amount = request.Amount,
            Description = request.Description,
            HiddenDescription = request.SchoolID.ToString(),
            Payer = request.Payer,
            Callbacks = new CallbacksObject
            {
                PayerUrls = new PayerCallbacksObject
                {
                    Success = $"{clientUrl}/payment-success",
                    Error = $"{clientUrl}/payment-failure",
                },
                Notification = new NotificationCallbacksObject
                {
                    Url = $"{apiUrl}/api/v1/transactions/notify",
                },
            },
        };

        try
        {
            var apiResult = await PostTPayAsync("/transactions", data);

            if (!apiResult.IsSuccess)
            {
                result.ErrorCode = apiResult.ErrorCode;
            }

            TPayCreateTransactionResponse responseObject =
                JsonConvert.DeserializeObject<TPayCreateTransactionResponse>(apiResult.Data!)
                ?? throw new Exception("Unprocessable response.");

            if (responseObject.Status == "failed")
            {
                result.ErrorCode = TPayTransactionErrors.APIError;
                result.Details = [.. responseObject.Errors?.Select(x => x.ErrorCode)];
                return result;
            }

            result.IsSuccess = true;
            result.Data = new RegisterTransactionResponse
            {
                TransactionId = responseObject.TransactionId,
                Title = responseObject.Title,
                TransactionPaymentUrl = responseObject.TransactionPaymentUrl!,
            };

            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(
                "Exception occurred while registering transaction: {message}",
                ex.Message
            );
            return result;
        }
    }

    public async Task<ServiceActionResult<TPayTransactionErrors>> RefundTransaction(
        RefundTransactionRequest request
    )
    {
        var result = new ServiceActionResult<TPayTransactionErrors>();

        var data = new TPayRefundTransactionRequest { Amount = request.Amount };

        try
        {
            var apiResult = await PostTPayAsync(
                $"/transactions/{request.TransactionId}/refunds",
                data
            );
            TPayRefundTransactionResponse responseObject =
                JsonConvert.DeserializeObject<TPayRefundTransactionResponse>(apiResult.Data!)
                ?? throw new Exception("Unprocessable response.");

            if (responseObject.Status == "failed")
            {
                result.ErrorCode = TPayTransactionErrors.APIError;
                result.Details = [.. responseObject.Errors?.Select(x => x.ErrorCode)];
                return result;
            }

            result.IsSuccess = true;
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(
                "Exception occurred while registering transaction: {message}",
                ex.Message
            );
            return result;
        }
    }
}
