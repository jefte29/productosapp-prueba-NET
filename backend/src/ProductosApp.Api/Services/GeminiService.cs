using Google.GenAI;
using Google.GenAI.Types;
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
            return await GenerateResponseWithToolsAsync(prompt, null, null, cancellationToken);
        }

        public async Task<string> GenerateResponseWithToolsAsync(
            string prompt, 
            List<Tool>? tools, 
            Func<string, IDictionary<string, object>, Task<object>>? executeToolAsync, 
            CancellationToken cancellationToken = default)
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
                        var contents = new List<Content>
                        {
                            new Content { Role = "user", Parts = new List<Part> { new Part { Text = prompt } } }
                        };
                        
                        var config = new GenerateContentConfig();
                        if (tools != null)
                        {
                            config.Tools = tools;
                        }

                        var response = await _client.Models.GenerateContentAsync(
                            model: model,
                            contents: contents,
                            config: config,
                            cancellationToken: cancellationToken);

                        if (response.Candidates != null && response.Candidates.Count > 0)
                        {
                            var firstCandidate = response.Candidates[0];
                            if (firstCandidate?.Content?.Parts != null && firstCandidate.Content.Parts.Count > 0)
                            {
                                var part = firstCandidate.Content.Parts[0];
                                
                                if (part.FunctionCall != null && executeToolAsync != null)
                                {
                                    var functionName = part.FunctionCall.Name ?? string.Empty;
                                    var args = part.FunctionCall.Args as IDictionary<string, object> ?? new Dictionary<string, object>();

                                    var toolResult = await executeToolAsync(functionName, args);
                                    var functionResponseData = toolResult as Dictionary<string, object> ?? new Dictionary<string, object> { { "result", toolResult } };

                                    contents.Add(firstCandidate.Content);

                                    contents.Add(new Content
                                    {
                                        Role = "user",
                                        Parts = new List<Part>
                                        {
                                            new Part
                                            {
                                                FunctionResponse = new FunctionResponse
                                                {
                                                    Name = functionName,
                                                    Response = functionResponseData
                                                }
                                            }
                                        }
                                    });

                                    var finalResponse = await _client.Models.GenerateContentAsync(
                                        model: model,
                                        contents: contents,
                                        config: config,
                                        cancellationToken: cancellationToken);

                                    if (finalResponse.Candidates != null && finalResponse.Candidates.Count > 0)
                                    {
                                        return finalResponse.Candidates[0].Content?.Parts?[0]?.Text ?? "No se pudo generar una respuesta.";
                                    }
                                }

                                return part.Text ?? "No se pudo generar una respuesta.";
                            }
                        }
                    }
                    catch (Exception ex) when (ex.Message.Contains("429") || ex.Message.Contains("Too Many Requests"))
                    {
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
