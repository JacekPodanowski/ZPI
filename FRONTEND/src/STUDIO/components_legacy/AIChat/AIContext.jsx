// AIContext.jsx - Empty context provider placeholder
import { createContext, useContext, useState } from 'react';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = async (text) => {
    // TODO: Implement real AI logic
    setIsProcessing(true);
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'AI Assistant placeholder - real implementation coming soon.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value = {
    messages,
    isProcessing,
    sendMessage,
    clearMessages
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export default AIContext;
