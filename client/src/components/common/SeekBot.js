// client/src/components/common/SeekBot.js
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import { searchArticles } from '../../services/knowledgebaseService';
import { Link } from 'react-router-dom';

const ChatbotWrapper = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1001; /* <-- Increased z-index */

  /* Added media query for mobile */
  @media (max-width: 768px) {
    bottom: 80px;
    right: 1rem;
  }
`;

const ChatIconContainer = styled.div`
  position: relative;
`;

const ChatIcon = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

const CloseIcon = styled(FiX)`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: white;
  color: #333;
  border-radius: 50%;
  padding: 2px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const ChatModal = styled.div`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background-color: #2c2c38;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(20px)')};
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};

  @media (max-width: 768px) {
    width: calc(100vw - 2rem);
    height: calc(100vh - 160px);
  }
`;

const ModalHeader = styled.div`
  padding: 1rem;
  background-color: #1e1e2d;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ChatWindow = styled.div`
  flex-grow: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const Message = styled.div`
  margin-bottom: 1rem;
  max-width: 90%;
  margin-left: ${({ isUser }) => (isUser ? 'auto' : '0')};
  text-align: ${({ isUser }) => (isUser ? 'right' : 'left')};
`;

const MessageBubble = styled.div`
  display: inline-block;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  background-color: ${({ isUser, theme }) => (isUser ? theme.colors.primary : '#3a3a4a')};
  color: ${({ isUser }) => (isUser ? '#1e1e2d' : 'white')};
  text-align: left;
`;

const ArticleLink = styled(Link)`
  display: block;
  background-color: #4a4a5a;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  color: white;
  text-decoration: none;
  border-left: 3px solid ${({ theme }) => theme.colors.primary};
  font-weight: bold;

  &:hover {
    background-color: #5a5a6a;
  }
`;

const TicketLink = styled(Link)`
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #1e1e2d;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
`;

const ChatInputWrapper = styled.form`
  display: flex;
  padding: 1rem;
  border-top: 1px solid #444;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 20px;
  background-color: #33333d;
  color: white;
  margin-right: 0.5rem;
  border: none;
  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: #1e1e2d;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Bubble = styled.div`
  position: absolute;
  bottom: 25px;
  right: 70px;
  background-color: white;
  color: #333;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  width: 240px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  font-size: 0.85rem;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 0.3s, transform 0.3s;
  transform: ${({ show }) => (show ? 'translateY(0)' : 'translateY(10px)')};
  pointer-events: ${({ show }) => (show ? 'auto' : 'none')};
`;

const SeekBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [messages, setMessages] = useState([
    { text: "Hello! I am SeekBOT, here to help you with any questions you have about using SeekMyCourse. How can I assist you today?", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleIconClick = () => {
    setIsOpen(true);
    setShowBubble(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      const { data } = await searchArticles(inputValue);
      if (data.length > 0) {
        const botMessage = {
          text: "I found a few articles that might help:",
          isUser: false,
          articles: data,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botMessage = {
          text: "I couldn't find any articles related to your query. If you'd like, you can raise a support ticket, and our team will get back to you.",
          isUser: false,
          isSuggestion: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      const botMessage = {
        text: "Sorry, I'm having a bit of trouble connecting to our knowledge base. Please try again in a moment.",
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  return (
    <ChatbotWrapper>
       <Bubble show={showBubble && !isOpen}>
        Hello! I am SeekBOT for your assistance.
        <CloseIcon size={18} onClick={(e) => { e.stopPropagation(); setShowBubble(false); }} />
      </Bubble>
      <ChatIconContainer>
        <ChatIcon onClick={handleIconClick}>
          <FiMessageSquare size={28} color="white" />
        </ChatIcon>
      </ChatIconContainer>

      <ChatModal isOpen={isOpen}>
        <ModalHeader>
          <h3>SeekBOT</h3>
          <FiX size={24} color="white" cursor="pointer" onClick={handleClose} />
        </ModalHeader>
        <ChatWindow ref={chatWindowRef}>
          {messages.map((msg, index) => (
            <Message key={index} isUser={msg.isUser}>
              <MessageBubble isUser={msg.isUser}>
                {msg.text}
                {msg.articles && msg.articles.map(article => (
                  <ArticleLink key={article._id} to={`/knowledgebase/article/${article._id}`} target="_blank" onClick={handleClose}>
                    {article.title}
                  </ArticleLink>
                ))}
                {msg.isSuggestion && (
                   <TicketLink to="/support-tickets" onClick={handleClose}>Raise a Ticket</TicketLink>
                )}
              </MessageBubble>
            </Message>
          ))}
        </ChatWindow>
        <ChatInputWrapper onSubmit={handleSendMessage}>
          <ChatInput
            type="text"
            placeholder="Ask a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <SendButton type="submit">
            <FiSend size={20} />
          </SendButton>
        </ChatInputWrapper>
      </ChatModal>
    </ChatbotWrapper>
  );
};

export default SeekBot;