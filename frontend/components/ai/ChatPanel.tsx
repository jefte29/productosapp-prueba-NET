"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai", text: string }[]>([
    { role: "ai", text: "¡Hola! Soy tu asistente de inventario. ¿En qué te puedo ayudar hoy?" }
  ]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const currentMessage = message;
    const newHistory = [...chatHistory, { role: "user" as const, text: currentMessage }];
    setChatHistory(newHistory);
    setMessage("");
    setIsLoading(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5033";
      const response = await fetch(`${API_BASE_URL}/api/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // For auth cookies if any
        body: JSON.stringify({
          message: currentMessage,
          sessionId: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error("Error al comunicarse con el servidor");
      }

      const data = await response.json();
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      setChatHistory([...newHistory, { role: "ai", text: data.reply || "Sin respuesta" }]);
    } catch (error) {
      console.error("Error de conexión con el Asistente IA");
      setChatHistory([...newHistory, { role: "ai", text: "Hubo un error de conexión o el asistente IA no está disponible en estos momentos, vuelve más tarde." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] max-h-[calc(100vh-8rem)] bg-white shadow-2xl border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <h2 className="font-semibold text-white">Asistente IA</h2>
        </div>
        <button 
          onClick={onClose}
          aria-label="Cerrar panel de chat"
          className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {chatHistory.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-2.5 text-sm shadow-sm bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-slate-500 italic text-xs">Generando respuesta...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu petición..."
            aria-label="Mensaje para el asistente"
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50 text-sm transition-all disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            aria-label="Enviar mensaje"
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
