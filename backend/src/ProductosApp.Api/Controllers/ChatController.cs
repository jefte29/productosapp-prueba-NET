using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductosApp.Api.DTOs.Chat;
using ProductosApp.Api.Services;

namespace ProductosApp.Api.Controllers
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ChatService _chatService;

        public ChatController(ChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpPost("ask")]
        public async Task<ActionResult<AskChatResponse>> Ask([FromBody] AskChatRequest request, CancellationToken cancellationToken)
        {
            var response = await _chatService.AskAsync(request, cancellationToken);
            return Ok(response);
        }
    }
}
