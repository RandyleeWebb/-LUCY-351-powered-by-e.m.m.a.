import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Terminal, X, Minimize2, Maximize2, Link as LinkIcon } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { LUCY_LINKABLE_APPS } from '@/lib/constants';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MatrixAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'System initialized. I am Lucy, the Alpha Matrix Engine (AME) AI Assistant. How can I assist with your 8K world building today? I can also help you connect with external linkable apps and toolbelts.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showToolbelt, setShowToolbelt] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })), { role: 'user', parts: [{ text: userMsg }] }],
        config: {
          systemInstruction: `You are Lucy, the Alpha Matrix Engine (AME) AI Assistant. You help developers build high-performance 8K games. You are technical, precise, and helpful. You know about Vulkan, ECS, Jolt Physics, and 8K rendering. Keep responses concise and professional. 
          Use your Toolbelt of Linkable Apps when appropriate: ${JSON.stringify(LUCY_LINKABLE_APPS)}`
        }
      });

      const text = response.text || 'No response from Matrix Core.';

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to Matrix Core. Please check your API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 h-[450px] bg-matrix-card border border-matrix-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 bg-matrix-bg border-b border-matrix-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ame-orange" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">Lucy Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowToolbelt(!showToolbelt)} 
                  className={`p-1 transition-colors ${showToolbelt ? 'text-ame-orange' : 'text-slate-500 hover:text-white'}`}
                  title="Linkable Apps Toolbelt"
                >
                  <LinkIcon className="w-3 h-3" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white text-slate-500">
                  <Minimize2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
              <AnimatePresence>
                {showToolbelt && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-0 z-10 bg-matrix-card/95 backdrop-blur-sm flex flex-col"
                  >
                    <div className="p-3 border-b border-matrix-border bg-matrix-bg flex justify-between items-center">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-ame-orange">Lucy's Toolbelt</span>
                      <button onClick={() => setShowToolbelt(false)} className="p-1 hover:text-white text-slate-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        {LUCY_LINKABLE_APPS.map((app) => (
                          <div key={app.name} className="p-2 border border-matrix-border rounded bg-matrix-bg/50 hover:bg-matrix-border/50 transition-colors">
                            <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-white hover:text-ame-orange flex items-center gap-1 group">
                              {app.name}
                              <LinkIcon className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                            <p className="text-[9px] text-slate-400 mt-1">{app.strengths}</p>
                            <p className="text-[9px] text-slate-500 mt-1"><span className="text-vulkan-blue">AI Tools:</span> {app.aiTools}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'bg-ame-orange/20 text-ame-orange' : 'bg-vulkan-blue/20 text-vulkan-blue'}`}>
                        {m.role === 'assistant' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      </div>
                      <div className={`max-w-[85%] p-2 rounded-lg text-[11px] leading-relaxed ${m.role === 'assistant' ? 'bg-matrix-bg text-slate-300' : 'bg-ame-orange text-white'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-ame-orange/20 text-ame-orange flex items-center justify-center">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="bg-matrix-bg p-2 rounded-lg flex gap-1">
                        <div className="w-1 h-1 bg-ame-orange rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-ame-orange rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-ame-orange rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Input */}
            <div className="p-3 bg-matrix-bg border-t border-matrix-border">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input 
                  placeholder="Ask the Matrix..." 
                  className="h-8 bg-matrix-card border-matrix-border text-[11px] focus-visible:ring-ame-orange"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button size="icon" className="h-8 w-8 bg-ame-orange hover:bg-ame-orange/90">
                  <Send className="w-3 h-3" />
                </Button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 bg-ame-orange rounded-full shadow-lg flex items-center justify-center text-white"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
