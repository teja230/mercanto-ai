
import React, { useState, useMemo } from 'react';
import { Message, MessageRole } from '../types';
import AnalyticsChart from './AnalyticsChart';

interface MessageBubbleProps {
    message: Message;
    theme: 'light' | 'dark';
}

const UserIcon = () => (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg border border-white/10">
        U
    </div>
);

const BotIcon = () => (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold flex-shrink-0 shadow-md">
        M
    </div>
);

const TypingIndicator = ({ text }: { text?: string }) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
        </div>
        {text && <p className="text-[10px] text-brand-600 dark:text-brand-500 font-mono tracking-widest uppercase animate-pulse">{text}</p>}
    </div>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, theme }) => {
    const [copied, setCopied] = useState(false);
    const isUser = message.role === MessageRole.USER;

    // Dynamic classes based on role and theme
    const bubbleClasses = isUser
        ? 'bg-gradient-to-br from-brand-600 to-blue-700 text-white rounded-2xl rounded-tr-none shadow-md'
        : 'bg-white dark:bg-gray-800/90 backdrop-blur-md text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none shadow-sm';

    const processedContent = useMemo(() => {
        if (!message.content) return { text: '', chart: null };

        const chartRegex = /```json-chart\n([\s\S]*?)\n```/;
        const match = message.content.match(chartRegex);

        let text = message.content;
        let chart = null;

        if (match) {
            try {
                chart = JSON.parse(match[1]);
                text = message.content.replace(chartRegex, '').trim();
            } catch (e) {
                console.error("Failed to parse chart data", e);
            }
        }

        return { text, chart };
    }, [message.content]);
    
    const renderText = (content: string) => {
        const html = content
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-700 dark:text-brand-300">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-black/40 p-4 rounded-xl overflow-x-auto my-4 border border-gray-200 dark:border-gray-700 shadow-inner"><code class="text-xs font-mono text-gray-800 dark:text-gray-200">$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-brand-600 dark:text-brand-400 font-mono text-[11px] border border-gray-200 dark:border-gray-700">$1</code>')
            .replace(/\n/g, '<br />');

        return <div dangerouslySetInnerHTML={{ __html: html }} className="leading-relaxed text-sm md:text-base" />;
    };

    const handleCopy = async () => {
        if (!message.content) return;
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={`flex items-start gap-3 md:gap-4 w-full mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {isUser ? <UserIcon /> : <BotIcon />}
            <div className={`relative group max-w-[85%] md:max-w-[75%]`}>
                <div className={`px-5 py-4 transition-all duration-300 hover:shadow-lg ${bubbleClasses}`}>
                    {message.isTyping ? (
                        <TypingIndicator text={message.content} />
                    ) : (
                        <>
                            {renderText(processedContent.text)}
                            {processedContent.chart && <AnalyticsChart data={processedContent.chart} theme={theme} />}
                        </>
                    )}
                </div>

                {!isUser && !message.isTyping && (
                     <button
                        onClick={handleCopy}
                        className={`absolute -bottom-3 -right-3 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-1.5 min-w-[32px] justify-center z-20 ${
                            copied ? 'opacity-100 ring-2 ring-green-500/50' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        title="Copy Response"
                     >
                        {copied ? (
                            <>
                                <CheckIcon />
                                <span className="text-[10px] font-bold text-green-500 dark:text-green-400 uppercase tracking-tighter">Copied</span>
                            </>
                        ) : (
                            <CopyIcon />
                        )}
                     </button>
                 )}
            </div>
        </div>
    );
};

export default MessageBubble;
