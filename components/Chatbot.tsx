
import React, { useState, useRef, useEffect } from 'react';
import { SimulationState, ChatMessage } from '../types';
import { getAssistantResponse } from '../services/geminiService';

interface ChatbotProps {
  state: SimulationState;
}

const Chatbot: React.FC<ChatbotProps> = ({ state }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your ACC Simulation Assistant. Ask me anything about the current vehicle state or road logic.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await getAssistantResponse(userMsg, state);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 h-[450px] bg-[#0d0d0d] border border-gray-800 rounded-xl flex flex-col shadow-2xl overflow-hidden mb-4">
          <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-bold text-sm text-gray-100">ACC Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-lg text-xs text-gray-400 italic">
                   AI is processing current telemetry...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-black border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about speed, safety..."
              className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm p-2 rounded focus:outline-none focus:border-blue-500"
            />
            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white/20"
      >
        <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.61.38 3.12 1.05 4.46l-1.01 3.03a1 1 0 001.27 1.27l3.03-1.01C7.68 20.38 9.19 20.76 10.8 20.76H12c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
        </svg>
      </button>
    </div>
  );
};

export default Chatbot;
