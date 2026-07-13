using Google.GenAI;
using ProductosApp.Api.Options;

namespace ProductosApp.Api.Services
{
    public class GeminiService
    {
        private readonly GeminiOptions _options;
        private readonly Client? _client;

        public GeminiService(IConfiguration configuration)
        {
            _options = configuration.GetSection("Gemini").Get<GeminiOptions>() ?? new GeminiOptions();
            if (!string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                _client = new Client(apiKey: _options.ApiKey);
            }
        }

        public async Task<string> GenerateResponseAsync(string prompt, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_options.ApiKey) || _client == null)
            {
                return "El asistente no está configurado todavía. Agrega la API key de Gemini para habilitar respuestas reales.";
            }

            try
            {
                var modelsToTry = GetModelsToTry();

                foreach (var model in modelsToTry)
                {
                    try
                    {
                        var response = await _client.Models.GenerateContentAsync(
                            model: model,
                            contents: prompt,
                            cancellationToken: cancellationToken);

                        if (response.Candidates != null && response.Candidates.Count > 0)
                        {
                            return response.Candidates[0].Content.Parts[0].Text ?? "No se pudo generar una respuesta.";
                        }
                    }
                    catch (Exception ex) when (ex.Message.Contains("429") || ex.Message.Contains("Too Many Requests"))
                    {
                        // Si es un error de rate limiting, intentar con el siguiente modelo
                        continue;
                    }
                }

                return "El asistente está ocupado. Espera unos segundos e intenta de nuevo.";
            }
            catch (OperationCanceledException)
            {
                return "La solicitud al asistente se canceló por timeout. Intenta de nuevo.";
            }
            catch (Exception ex)
            {
                return $"Error inesperado al procesar tu solicitud: {ex.Message}";
            }
        }

        private List<string> GetModelsToTry()
        {
            var models = new List<string>();

            if (!string.IsNullOrWhiteSpace(_options.Model))
            {
                models.Add(_options.Model);
            }

            if (!models.Contains("gemini-3.5-flash", StringComparer.OrdinalIgnoreCase))
            {
                models.Add("gemini-3.5-flash");
            }

            return models;
        }
    }
}
