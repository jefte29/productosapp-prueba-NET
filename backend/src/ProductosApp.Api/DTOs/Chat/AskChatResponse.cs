namespace ProductosApp.Api.DTOs.Chat
{
    public class AskChatResponse
    {
        public Guid SessionId { get; set; }
        public string Reply { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool Success { get; set; } = true;
        public List<string> UsedTools { get; set; } = new();
    }
}
