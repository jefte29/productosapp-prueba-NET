using System.ComponentModel.DataAnnotations;

namespace ProductosApp.Api.DTOs.Chat
{
    public class AskChatRequest
    {
        [Required]
        [MinLength(1)]
        public string Message { get; set; } = string.Empty;

        public Guid? SessionId { get; set; }
    }
}
