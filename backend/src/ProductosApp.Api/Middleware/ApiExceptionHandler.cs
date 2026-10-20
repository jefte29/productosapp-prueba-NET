using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;

namespace ProductosApp.Api.Middleware;

public sealed class ApiExceptionHandler : IExceptionHandler
{
    private readonly ILogger<ApiExceptionHandler> _logger;

    public ApiExceptionHandler(ILogger<ApiExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (httpContext.Response.HasStarted)
        {
            return false;
        }

        var traceId = Activity.Current?.TraceId.ToString() ?? httpContext.TraceIdentifier;
        _logger.LogError(exception, "Unhandled exception while processing request. TraceId: {TraceId}", traceId);

        httpContext.Response.Clear();
        await ApiProblemDetails.WriteAsync(
            httpContext,
            ApiProblemDetails.Create(
                httpContext,
                StatusCodes.Status500InternalServerError,
                "No se pudo completar la solicitud."),
            cancellationToken);

        return true;
    }
}
