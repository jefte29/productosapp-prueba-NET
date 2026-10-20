using System;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProductosApp.Api.Data;
using ProductosApp.Api.Middleware;
using ProductosApp.Api.Options;
using ProductosApp.Api.Services;
using QuestPDF;
using QuestPDF.Infrastructure;

// Cargar variables de entorno desde el archivo .env
DotNetEnv.Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// Configurar licencia de QuestPDF para generación de documentos en tiempo de ejecución
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Evaluation;

// 1. Agregar soporte para Controladores
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(
            ApiProblemDetails.CreateValidationProblem(context.HttpContext, context.ModelState))
        {
            ContentTypes = { "application/problem+json" }
        };
    });
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.Configure<ProductosApp.Api.Options.GeminiOptions>(builder.Configuration.GetSection("Gemini"));
builder.Services.AddSingleton<ProductosApp.Api.Services.GeminiService>();
builder.Services.AddScoped<ProductosApp.Api.Services.ProductoService>();
builder.Services.AddScoped<ProductosApp.Api.Services.ChatService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// 2. Configurar DbContext con SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Configurar la autenticación JWT
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("Jwt:Key debe configurarse con al menos 32 bytes.");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero // Elimina la tolerancia por defecto de 5 min para la expiración de tokens
    };
    options.Events = ApiProblemDetails.CreateJwtBearerEvents();
    options.Events.OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["token"];
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        };
});

// 4. Configurar Swagger con soporte para Tokens JWT (Bearer) - Uso de global:: para evitar colisiones
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new global::Microsoft.OpenApi.Models.OpenApiInfo { Title = "Productos App API", Version = "v1" });
    
    // Agregar definición de seguridad para Bearer Token
    options.AddSecurityDefinition("Bearer", new global::Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = global::Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = global::Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingresa el token JWT en este formato: Bearer {token}"
    });

    options.AddSecurityRequirement(new global::Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new global::Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new global::Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = global::Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseApiStatusCodePages();

// 5. Ejecutar migraciones automáticas y sembrado al arrancar
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        DbInitializer.Initialize(context, builder.Configuration);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error crítico durante la migración o el sembrado de datos.");
        throw;
    }
}

// Configurar el pipeline de solicitudes HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Descomentar esta línea cuando quieras usar HTTPS
// app.UseHttpsRedirection();

app.UseCors("Frontend");

// 6. Registrar la Autenticación (siempre ANTES de la Autorización)
app.UseAuthentication();
app.UseAuthorization();

// 7. Mapear los Controladores
app.MapControllers();

app.Run();
