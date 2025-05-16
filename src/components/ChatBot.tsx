'use client';

import { useState, useEffect } from 'react';
import { analyzeSymptoms } from '../lib/ai';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hi there! I\'m MediBot, your healthcare assistant. How can I help you today?',
      sender: 'bot',
      timestamp: '2025-05-17T00:46:50+05:00'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Get bot response
    setLoading(true);
    try {
      // Send all messages to maintain conversation context
      const userMessages = messages.filter(msg => msg.sender === 'user').map(msg => msg.content).join('\n');
      const botMessages = messages.filter(msg => msg.sender === 'bot').map(msg => msg.content).join('\n');
      
      const analysis = await analyzeSymptoms(`Previous conversation:
User: ${userMessages}
Bot: ${botMessages}

Current message: ${input}`);
      
      // Format the response to include all relevant information
      const botResponse = `Based on your symptoms, here's what I found:

Condition: ${analysis.condition}
Severity: ${analysis.severity}
Risk Level: ${analysis.riskLevel}

Recommendations:
${analysis.recommendations.join('\n')}`;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: 'Hi there! I\'m MediBot, your healthcare assistant. How can I help you today?',
        sender: 'bot',
        timestamp: '2025-05-17T00:46:50+05:00'
      }
    ]);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="w-full max-w-[90vw] mx-auto sm:max-w-4xl">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`rounded-xl px-3 py-2 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[80%] ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-teal-50 text-gray-800'} shadow-md`}>
                <p className="font-medium text-sm sm:text-base">{message.content}</p>
                <p className="text-xs mt-1 ${message.sender === 'user' ? 'text-blue-200' : 'text-teal-400'}">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-teal-200 bg-white/90 backdrop-blur-sm p-4 sm:p-6">
        <div className="w-full max-w-[90vw] mx-auto sm:max-w-4xl">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 border-teal-300 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-400 bg-teal-50"
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl ${loading || !input.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-teal-500 text-white hover:bg-teal-600'} transition-all duration-200 flex items-center justify-center`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm sm:text-base">Analyzing...</span>
                </div>
              ) : (
                <span className="text-sm sm:text-base">Send</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
