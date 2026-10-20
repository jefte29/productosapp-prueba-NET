using Google.GenAI.Types;
using ProductosApp.Api.DTOs.Chat;
using System.Text.Json;

namespace ProductosApp.Api.Services
{
    public class ChatService
    {
        private readonly ProductoService _productoService;
        private readonly GeminiService _geminiService;

        public ChatService(ProductoService productoService, GeminiService geminiService)
        {
            _productoService = productoService;
            _geminiService = geminiService;
        }

        public async Task<AskChatResponse> AskAsync(AskChatRequest request, CancellationToken cancellationToken = default)
        {
            var sessionId = request.SessionId ?? Guid.NewGuid();
            var prompt = $@"Eres un asistente para un sistema de inventario. Responde de forma breve y útil.
Usuario: {request.Message}

Instrucciones:
- Tienes acceso a varias herramientas (funciones) para obtener información del inventario.
- Úsalas si el usuario pregunta por productos, cantidades o busca algo en específico.
- Si no tienes datos suficientes o las herramientas no te dan la respuesta, dilo de forma clara.
- No inventes información.";

            var tools = new List<Tool>
            {
                new Tool
                {
                    FunctionDeclarations = new List<FunctionDeclaration>
                    {
                        new FunctionDeclaration { Name = "GetAllProductsAsync", Description = "Obtiene todos los productos del inventario." },
                        new FunctionDeclaration { Name = "GetActiveProductsAsync", Description = "Obtiene solo los productos que están activos." },
                        new FunctionDeclaration { Name = "GetInactiveProductsAsync", Description = "Obtiene solo los productos que están inactivos." },
                        new FunctionDeclaration { Name = "CountActiveAsync", Description = "Obtiene la cantidad total de productos activos." },
                        new FunctionDeclaration { Name = "CountInactiveAsync", Description = "Obtiene la cantidad total de productos inactivos." },
                        new FunctionDeclaration 
                        { 
                            Name = "SearchByNameAsync", 
                            Description = "Busca productos por coincidencia de nombre. Argumento requerido: 'search' (string).",
                        },
                        new FunctionDeclaration 
                        { 
                            Name = "GetProductByIdAsync", 
                            Description = "Obtiene un producto específico por su ID único. Argumento requerido: 'id' (string).",
                        }
                    }
                }
            };

            var usedTools = new List<string>();

            Func<string, IDictionary<string, object>, Task<object>> executeToolAsync = async (name, args) =>
            {
                usedTools.Add(name);
                switch (name)
                {
                    case "GetAllProductsAsync":
                        return await _productoService.GetAllProductsAsync();
                    case "GetActiveProductsAsync":
                        return await _productoService.GetActiveProductsAsync();
                    case "GetInactiveProductsAsync":
                        return await _productoService.GetInactiveProductsAsync();
                    case "CountActiveAsync":
                        return await _productoService.CountActiveAsync();
                    case "CountInactiveAsync":
                        return await _productoService.CountInactiveAsync();
                    case "SearchByNameAsync":
                        var search = args != null && args.TryGetValue("search", out var s) ? s?.ToString() ?? "" : "";
                        return await _productoService.SearchByNameAsync(search);
                    case "GetProductByIdAsync":
                        if (args != null && args.TryGetValue("id", out var idStr) && Guid.TryParse(idStr?.ToString(), out var guidId))
                        {
                            return await _productoService.GetProductByIdAsync(guidId) ?? (object)"No encontrado";
                        }
                        return "ID inválido";
                    default:
                        return "Función no encontrada.";
                }
            };

            var reply = await _geminiService.GenerateResponseWithToolsAsync(prompt, tools, executeToolAsync, cancellationToken);

            return new AskChatResponse
            {
                SessionId = sessionId,
                Reply = reply,
                Timestamp = DateTime.UtcNow,
                Success = true,
                UsedTools = usedTools.Count > 0 ? usedTools : new List<string> { "Ninguna" }
            };
        }
    }
}
