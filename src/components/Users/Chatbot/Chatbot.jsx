
import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your CurricFlow assistant. I can help you find curricula, check approval statuses, or answer questions about the system. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const generateBotResponse = (userMessage) => {
    const responses = {
      curricula: 'I can help you find specific curricula. We currently have 247 curricula across 8 schools. What subject or program are you looking for?',
      status: 'To check the approval status of a curriculum, please provide the curriculum title or ID.',
      search: 'You can search for curricula using the search box on the dashboard. Try searching by program name, department, or keywords.',
      help: 'I can assist with: finding curricula, checking approval status, navigating the system, and answering questions about programs and departments.',
      default: 'I understand you\'re asking about curriculum management. Could you be more specific? I can help with searches, status checks, or general navigation.'
    };

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('curricula') || lowerMessage.includes('curriculum')) return responses.curricula;
    if (lowerMessage.includes('status') || lowerMessage.includes('approval')) return responses.status;
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) return responses.search;
    if (lowerMessage.includes('help')) return responses.help;

    return responses.default;
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

   
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="user-chatbot-container user-no-print">
      <button 
        className="user-chatbot-toggle"
        onClick={toggleChatbot}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <i className={`fas fa-${isOpen ? 'times' : 'comments'}`} />
        {!isOpen && unreadCount > 0 && (
          <div className="user-chatbot-notification user-pulse">
            {unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="user-chatbot-panel user-fade-in">
          <div className="user-chatbot-header">
            <div className="user-chatbot-avatar">
              <i className="fas fa-robot" />
            </div>
            <div className="user-chatbot-info">
              <h4>CurricFlow Assistant</h4>
              <p>Online • Ready to help</p>
            </div>
          </div>

          <div className="user-chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`user-chatbot-message user-chatbot-message--${message.sender}`}>
                <div className={`user-message-avatar user-message-avatar--${message.sender}`}>
                  <i className={`fas fa-${message.sender === 'bot' ? 'robot' : 'user'}`} />
                </div>
                <div className="user-message-content">
                  {message.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="user-chatbot-message user-chatbot-message--bot">
                <div className="user-message-avatar user-message-avatar--bot">
                  <i className="fas fa-robot" />
                </div>
                <div className="user-message-content user-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="user-chatbot-input">
            <div className="user-input-container">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                aria-label="Chat message input"
              />
              <button 
                className="user-send-btn"
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
              >
                <i className="fas fa-paper-plane" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;