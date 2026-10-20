using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace ProductosApp.Api.Middleware;

public static class ApiProblemDetails
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static ProblemDetails Create(HttpContext context, int status, string title)
    {
        var problemDetails = new ProblemDetails
        {
            Status = status,
            Title = title
        };

        problemDetails.Extensions["traceId"] =
            System.Diagnostics.Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;

        return problemDetails;
    }

    public static ProblemDetails CreateValidationProblem(
        HttpContext context,
        ModelStateDictionary modelState)
    {
        var problemDetails = Create(
            context,
            StatusCodes.Status400BadRequest,
            "La solicitud contiene datos inválidos.");
        problemDetails.Extensions["errors"] = modelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .ToDictionary(
                entry => entry.Key,
                _ => new[] { "El valor enviado no es válido." });

        return problemDetails;
    }

    public static JwtBearerEvents CreateJwtBearerEvents()
    {
        return new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.Headers.Append("WWW-Authenticate", JwtBearerDefaults.AuthenticationScheme);
                await WriteAsync(
                    context.HttpContext,
                    Create(
                        context.HttpContext,
                        StatusCodes.Status401Unauthorized,
                        "Debes iniciar sesión para acceder a este recurso."),
                    context.HttpContext.RequestAborted);
            },
            OnForbidden = async context =>
            {
                await WriteAsync(
                    context.HttpContext,
                    Create(
                        context.HttpContext,
                        StatusCodes.Status403Forbidden,
                        "No tienes permiso para realizar esta acción."),
                    context.HttpContext.RequestAborted);
            }
        };
    }

    public static void UseApiStatusCodePages(this IApplicationBuilder app)
    {
        app.UseStatusCodePages(async statusCodeContext =>
        {
            var httpContext = statusCodeContext.HttpContext;
            if (!httpContext.Request.Path.StartsWithSegments("/api"))
            {
                return;
            }

            var (status, title) = httpContext.Response.StatusCode switch
            {
                StatusCodes.Status400BadRequest => (StatusCodes.Status400BadRequest, "La solicitud no es válida."),
                StatusCodes.Status401Unauthorized => (StatusCodes.Status401Unauthorized, "Debes iniciar sesión para acceder a este recurso."),
                StatusCodes.Status403Forbidden => (StatusCodes.Status403Forbidden, "No tienes permiso para realizar esta acción."),
                StatusCodes.Status404NotFound => (StatusCodes.Status404NotFound, "No se encontró el recurso solicitado."),
                _ => (httpContext.Response.StatusCode, "No se pudo completar la solicitud.")
            };

            await WriteAsync(
                httpContext,
                Create(httpContext, status, title),
                httpContext.RequestAborted);
        });
    }

    public static async Task WriteAsync(
        HttpContext context,
        ProblemDetails problemDetails,
        CancellationToken cancellationToken = default)
    {
        context.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";
        await JsonSerializer.SerializeAsync(
            context.Response.Body,
            problemDetails,
            JsonOptions,
            cancellationToken);
    }
}
