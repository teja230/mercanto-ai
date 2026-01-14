
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, MessageRole } from '../types';
import { sendMessageToGemini, resetSession } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import UserInput from './UserInput';

const STORAGE_KEY = 'mercanto_agent_history';

interface ChatInterfaceProps {
    theme: 'light' | 'dark';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ theme }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [useThinking, setUseThinking] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // Load history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setMessages(parsed);
                setIsLoading(false);
            } catch (e) {
                console.error("Failed to parse history", e);
                initializeChat();
            }
        } else {
            initializeChat();
        }
    }, []);

    // Save history to localStorage on change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
        const timeout = setTimeout(scrollToBottom, 150);
        return () => clearTimeout(timeout);
    }, [messages]);

    const initializeChat = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const initialResponse = await sendMessageToGemini("Hello! Please introduce yourself as Mercanto.");
            const newMessages = [{ role: MessageRole.MODEL, content: initialResponse }];
            setMessages(newMessages);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
        } catch (e) {
            setError('Failed to initialize Mercanto. Please check your connection.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleClearHistory = () => {
        if (window.confirm("Clear all chat history? This cannot be undone.")) {
            localStorage.removeItem(STORAGE_KEY);
            setMessages([]);
            resetSession();
            initializeChat();
        }
    };

    const handleSendMessage = async (input: string) => {
        if (!input.trim()) return;

        const userMessage: Message = { role: MessageRole.USER, content: input };
        const thinkingPlaceholder: Message = { 
            role: MessageRole.MODEL, 
            content: useThinking ? "Analyzing market trends and strategy..." : "", 
            isTyping: true 
        };

        const currentHistory = [...messages];
        setMessages(prev => [...prev, userMessage, thinkingPlaceholder]);
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await sendMessageToGemini(input, currentHistory, useThinking);
            setMessages(prev => {
                const filtered = prev.filter(msg => !msg.isTyping);
                return [...filtered, { role: MessageRole.MODEL, content: response }];
            });
        } catch (e) {
            const errorMessage = "I encountered an issue processing your request. Please try again.";
            setError(errorMessage);
            setMessages(prev => {
                const filtered = prev.filter(msg => !msg.isTyping);
                 return [...filtered, { role: MessageRole.MODEL, content: errorMessage }];
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col flex-1 h-full bg-gray-50/50 dark:bg-gray-900/40 overflow-hidden backdrop-blur-sm relative transition-colors duration-300">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                 <button 
                    onClick={handleClearHistory}
                    className="px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 hover:bg-red-50 dark:hover:bg-red-900/40 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm backdrop-blur-sm"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear History
                 </button>
            </div>

            <div 
                ref={chatContainerRef} 
                className="flex-1 p-4 md:p-8 space-y-2 overflow-y-auto scroll-smooth scrollbar-hide pt-12"
            >
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} theme={theme} />
                    ))}
                    {error && (
                        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 p-4 rounded-xl text-center text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="max-w-4xl w-full mx-auto p-4 md:p-0">
                <div className="mb-4 flex items-center justify-between bg-white/50 dark:bg-gray-800/50 p-2 px-4 rounded-xl border border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${useThinking ? 'bg-brand-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {useThinking ? 'Deep Thinking Mode (Strategy)' : 'Standard Mode (Speed)'}
                        </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={useThinking} 
                            onChange={(e) => setUseThinking(e.target.checked)} 
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                </div>
                <UserInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default ChatInterface;
