'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUp,
  Loader2,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  LifeBuoy,
} from 'lucide-react';
import * as conversationApi from '@/services/conversationApi';

function KaryaLogo({ size = 28, className = '' }) {
  return (
    <Image
      src="/karya-ai-logo.png"
      alt="Karya AI"
      width={size}
      height={size}
      className={`rounded-lg object-contain ${className}`}
    />
  );
}

function ChatSidebar({ isOpen, onToggle, conversations, activeId, onSelect, onNew, onDelete, isLoading }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`flex flex-col bg-gray-900 text-white transition-all duration-300 shrink-0 ${
          isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2.5">
            <KaryaLogo size={28} />
            <span className="text-sm font-semibold whitespace-nowrap">Karya AI</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-600 hover:bg-gray-800 transition-colors text-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider px-2 pt-2 pb-1">
            Recent
          </p>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-gray-500 px-2 py-4 text-center">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeId === conversation._id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <button
                  onClick={() => onSelect(conversation._id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(conversation._id);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-600 transition-all shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                </button>
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

function AgentChat({ sidebarOpen, onToggleSidebar, conversationId, onTitleUpdate, onConversationCreated }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const loadConversation = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await conversationApi.getConversation(conversationId);
        const conversation = res.data;
        setMessages(
          (conversation.messages || []).map((message) => ({
            role: message.role,
            message: message.content,
          }))
        );
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversationId]);

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const handleSendText = async (event) => {
    event.preventDefault();

    const text = (inputRef.current?.value || inputText).trim();
    if (!text || isTyping) return;

    setInputText('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: 'user', message: text }]);

    let createdConversation = null;

    try {
      let activeId = conversationIdRef.current;

      if (!activeId) {
        const created = await conversationApi.createConversation();
        activeId = created.data._id;
        conversationIdRef.current = activeId;
        createdConversation = created.data;
      }

      const response = await conversationApi.sendAgentMessage(activeId, text);
      const { agentMessage, title } = response.data;

      if (conversationIdRef.current === activeId) {
        setMessages((prev) => [
          ...prev,
          { role: agentMessage.role, message: agentMessage.content },
        ]);
      }

      if (title && title !== 'New conversation') {
        if (createdConversation) {
          onConversationCreated?.({ ...createdConversation, title });
        } else {
          onTitleUpdate(activeId, title);
        }
      } else if (createdConversation) {
        onConversationCreated?.(createdConversation);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      if (createdConversation) {
        onConversationCreated?.(createdConversation);
      }
      setMessages((prev) => [
        ...prev,
        { role: 'system', message: err.message || 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSendText(event);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {!sidebarOpen && (
        <div className="absolute top-auto left-0 z-10 p-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 bg-gray-900 cursor-pointer"
            title="Open sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Loading conversation...</p>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center ring-4 ring-gray-100">
                <KaryaLogo size={72} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <LifeBuoy className="h-3.5 w-3.5 text-white" />
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Karya AI Support</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              How can I help today?
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, index) => {
              if (msg.role === 'system') {
                return (
                  <div key={`${msg.role}-${index}`} className="flex justify-center py-1">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {msg.message}
                    </span>
                  </div>
                );
              }

              const isAgent = msg.role === 'agent';

              return (
                <div key={`${msg.role}-${index}`} className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
                  {isAgent ? (
                    <div className="w-7 h-7 shrink-0 mt-0.5">
                      <KaryaLogo size={28} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-semibold text-white">
                        {getUserInitials(user?.fullName)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] text-sm leading-relaxed ${
                      isAgent
                        ? 'text-gray-800'
                        : 'bg-gray-100 px-4 py-3 rounded-2xl text-gray-800'
                    }`}
                  >
                    {isAgent ? (
                      <div className="prose prose-sm prose-gray max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>p:last-child]:mb-0 [&>ul:last-child]:mb-0 [&>ol:last-child]:mb-0">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.message}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.message
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 shrink-0 mt-0.5">
                  <KaryaLogo size={28} />
                </div>
                <div className="flex items-center gap-1 py-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSendText} className="flex items-end gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onInput={(event) => setInputText(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Karya AI Support..."
              rows={1}
              disabled={isTyping}
              className="flex-1 resize-none bg-transparent py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isTyping}
              className={`p-1.5 rounded-lg transition-all shrink-0 mb-0.5 ${
                !isTyping && inputText.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-white cursor-default'
              }`}
              title="Send message"
            >
              {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AgentPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchConversations = async () => {
      try {
        const response = await conversationApi.getConversations();
        setConversations(response.data || []);
        if (response.data && response.data.length > 0) {
          setActiveConversationId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [isAuthenticated]);

  const handleNewChat = async () => {
    try {
      const response = await conversationApi.createConversation();
      const newConversation = response.data;
      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversationId(newConversation._id);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await conversationApi.deleteConversation(id);
      setConversations((prev) => prev.filter((conversation) => conversation._id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter((conversation) => conversation._id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleTitleUpdate = (id, newTitle) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation._id === id ? { ...conversation, title: newTitle } : conversation
      )
    );
  };

  const handleConversationCreated = (newConversation) => {
    setConversations((prev) => {
      if (prev.some((conversation) => conversation._id === newConversation._id)) {
        return prev;
      }
      return [newConversation, ...prev];
    });
    setActiveConversationId(newConversation._id);
  };

  if (loading || (!loading && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={handleNewChat}
        onDelete={handleDeleteConversation}
        isLoading={isLoadingConversations}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <AgentChat
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
          conversationId={activeConversationId}
          onTitleUpdate={handleTitleUpdate}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
