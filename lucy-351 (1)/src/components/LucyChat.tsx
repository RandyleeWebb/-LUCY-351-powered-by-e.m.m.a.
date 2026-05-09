import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { lucyService, ChatMessage } from '../services/LucyService';
import { CoreTickContext } from '../types';

interface LucyChatProps {
  context: CoreTickContext;
}

export const LucyChat: React.FC<LucyChatProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'lucy', content: 'Connection established. I am Lucy. I am monitoring the planetary harmonics. How can I assist your alignment today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await lucyService.chat(userMessage, context, messages);
      setMessages(prev => [...prev, { role: 'lucy', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'lucy', content: "Error in neural transmission. Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-agi-accent text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-white/20"
        >
          <Bot size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-agi-success rounded-full border-2 border-agi-bg animate-pulse" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '500px',
              width: isMinimized ? '200px' : '380px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-6 z-50 bg-agi-panel border border-agi-border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 backdrop-blur-xl`}
          >
            {/* Header */}
            <div className={`p-4 border-b border-agi-border flex items-center justify-between bg-agi-accent/10`}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-agi-accent/20 rounded-lg">
                  <Bot size={16} className="text-agi-accent" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-agi-text uppercase tracking-widest">Lucy_Interface</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-agi-success" />
                    <span className="text-[8px] font-mono text-agi-muted">NEURAL_LINK_STABLE</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-agi-muted hover:text-agi-text transition-colors"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-agi-muted hover:text-agi-danger transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Container */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20"
                >
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`mt-1 p-1 rounded-md ${msg.role === 'user' ? 'bg-agi-accent/20' : 'bg-agi-panel border border-agi-border'}`}>
                          {msg.role === 'user' ? <User size={12} /> : <Bot size={12} className="text-agi-accent" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-agi-accent text-white rounded-tr-none' 
                            : 'bg-agi-panel border border-agi-border text-agi-text rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-2 items-center bg-agi-panel border border-agi-border p-3 rounded-2xl rounded-tl-none">
                        <Loader2 size={14} className="animate-spin text-agi-accent" />
                        <span className="text-[10px] font-mono text-agi-muted">Processing sync...</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-agi-border bg-agi-panel/50">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Transmission request..."
                      className="w-full bg-agi-bg/50 border border-agi-border rounded-xl px-4 py-3 text-[11px] focus:outline-none focus:border-agi-accent/50 pr-12 transition-all placeholder:text-agi-muted"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                        input.trim() && !isLoading ? 'text-agi-accent hover:bg-agi-accent/10' : 'text-agi-muted'
                      }`}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between px-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-agi-accent animate-pulse" />
                        <span className="text-[8px] text-agi-muted uppercase font-bold tracking-tighter">Local_Heuristic_Engine</span>
                      </div>
                    </div>
                    <div className="text-[8px] text-agi-muted font-mono">
                      SYNC_ID: {new Date(context.timestamp).toISOString().split('T')[1].split('.')[0]}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
