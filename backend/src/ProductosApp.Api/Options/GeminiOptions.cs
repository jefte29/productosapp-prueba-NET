namespace ProductosApp.Api.Options
{
    public class GeminiOptions
    {
        public string? ApiKey { get; set; }
        public string Model { get; set; } = "gemini-3.5-flash";
        public string Endpoint { get; set; } = "https://generativelanguage.googleapis.com/v1beta/models";
    }
}
