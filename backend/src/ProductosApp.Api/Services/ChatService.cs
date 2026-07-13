using ProductosApp.Api.DTOs.Chat;

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
            var prompt = await BuildPromptAsync(request.Message);

            var reply = await _geminiService.GenerateResponseAsync(prompt, cancellationToken);

            return new AskChatResponse
            {
                SessionId = sessionId,
                Reply = reply,
                Timestamp = DateTime.UtcNow,
                Success = true,
                UsedTools = new List<string> { "ProductoService" }
            };
        }

        private async Task<string> BuildPromptAsync(string message)
        {
            var productos = await _productoService.GetAllAsync();
            var productosTexto = productos.Any()
                ? string.Join("\n", productos.Select(p => $"- {p.Nombre} | Precio: {p.Precio} | Estado: {(p.Estado ? "Activo" : "Inactivo")}"))
                : "No hay productos registrados.";

            return $@"Eres un asistente para un sistema de inventario. Responde de forma breve y útil.

Usuario: {message}

Contexto del negocio:
{productosTexto}

Instrucciones:
- Si el usuario pregunta por productos, responde usando el contexto disponible.
- Si no tienes datos suficientes, dilo de forma clara.
- No inventes información.";
        }
    }
}
