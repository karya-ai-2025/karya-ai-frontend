'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Mic,
  MicOff,
  ArrowUp,
  Loader2,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Trash2,
} from 'lucide-react';
import * as conversationApi from '@/services/conversationApi';

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

function buildContextSummary(msgs) {
  const recent = msgs.slice(-20);
  const lines = recent.map(m => `${m.role}: ${m.message}`);
  return `The following is the prior conversation history with this user. Continue from where you left off:\n\n${lines.join('\n')}`;
}

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
            conversations.map((c) => (
              <div
                key={c._id}
                className={`group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeId === c._id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <button
                  onClick={() => onSelect(c._id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(c._id); }}
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
  const [isConnected, setIsConnected] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const conversationIdRef = useRef(conversationId);
  const messagesRef = useRef(messages);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const loadConversation = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await conversationApi.getConversation(conversationId);
        const conv = res.data;
        setMessages(
          (conv.messages || []).map(m => ({ role: m.role, message: m.content }))
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

  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs: connected');
      setIsConnected(true);
      const activeId = conversationIdRef.current;
      if (activeId) {
        const elConvId = conversation.getId?.();
        if (elConvId) {
          conversationApi.updateConversation(activeId, {
            elevenlabsConversationId: elConvId
          }).catch(err => console.error('Failed to save EL conv ID:', err));
        }
      }
    },
    onDisconnect: (details) => {
      console.log('ElevenLabs: disconnected', details);
      setIsConnected(false);
      setVoiceMode(false);
    },
    onMessage: (props) => {
      if (props.role === 'user') return;
      setIsTyping(false);
      setMessages(prev => [...prev, { role: props.role, message: props.message }]);
      const activeId = conversationIdRef.current;
      if (activeId) {
        conversationApi.addMessage(activeId, props.role, props.message).catch(err => {
          console.error('Failed to save agent message:', err);
        });
      }
    },
    onError: (message, context) => {
      console.error('ElevenLabs error:', message, context);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'system', message: 'Something went wrong. Please try again.' }
      ]);
    },
  });

  const handleStartSession = async () => {
    if (!AGENT_ID) return;
    try {
      console.log('ElevenLabs: starting session with agent', AGENT_ID);
      await conversation.startSession({ agentId: AGENT_ID, textOnly: true });
      console.log('ElevenLabs: session started');
      if (messagesRef.current.length > 0) {
        const summary = buildContextSummary(messagesRef.current);
        conversation.sendContextualUpdate(summary);
      }
    } catch (err) {
      console.error('ElevenLabs: failed to start session', err);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isConnected && !voiceMode) {
      inputRef.current?.focus();
    }
  }, [isConnected, voiceMode]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    const text = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', message: text }]);
    setIsTyping(true);
    conversation.sendUserMessage(text);
    setInputText('');
    inputRef.current?.focus();

    try {
      let activeId = conversationIdRef.current;
      if (!activeId) {
        const res = await conversationApi.createConversation();
        activeId = res.data._id;
        conversationIdRef.current = activeId;
        if (onConversationCreated) onConversationCreated(res.data);
      }
      const res = await conversationApi.addMessage(activeId, 'user', text);
      if (res.data.title && res.data.title !== 'New conversation') {
        onTitleUpdate(activeId, res.data.title);
      }
    } catch (err) {
      console.error('Failed to save user message:', err);
    }
  };

  const handleToggleVoice = async () => {
    if (voiceMode) {
      conversation.endSession();
      setVoiceMode(false);
      setTimeout(() => {
        conversation.startSession({ agentId: AGENT_ID, textOnly: true });
      }, 300);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        conversation.endSession();
        setTimeout(() => {
          conversation.startSession({ agentId: AGENT_ID });
          setVoiceMode(true);
        }, 300);
      } catch {
        setMessages(prev => [
          ...prev,
          { role: 'system', message: 'Microphone access is required for voice mode.' }
        ]);
      }
    }
  };

  const handleToggleMute = () => {
    conversation.setMuted(!conversation.isMuted);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendText(e);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(w => w.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sidebar toggle (only when sidebar is closed) */}
      {!sidebarOpen && (
        <div className="absolute top-auto left-0 z-10 p-2">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-300 bg-gray-900 cursor-pointer"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Loading conversation...</p>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div
              onClick={!isConnected && conversation.status !== 'connecting' ? handleStartSession : undefined}
              className={`relative group mb-6 ${!isConnected && conversation.status !== 'connecting' ? 'cursor-pointer' : ''}`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isConnected
                  ? 'ring-4 ring-green-100'
                  : conversation.status === 'connecting'
                  ? 'ring-4 ring-blue-100 animate-pulse'
                  : 'ring-4 ring-gray-100 group-hover:ring-blue-200 group-hover:scale-105'
              }`}>
                <KaryaLogo size={72} />
              </div>
              {isConnected && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
              )}
              {conversation.status === 'connecting' && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full animate-pulse" />
              )}
            </div>

            {isConnected ? (
              <>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">What can I help with?</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Type your message below or use voice to start a conversation.
                </p>
              </>
            ) : conversation.status === 'connecting' ? (
              <>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Waking up...</h3>
                <p className="text-sm text-gray-500 max-w-md">Connecting to Karya AI Agent</p>
                <div className="flex items-center gap-1.5 mt-4">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Karya AI Agent</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-5">
                  Wake it up to start chatting.
                </p>
                <button
                  onClick={handleStartSession}
                  className="group/btn flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-full transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 cursor-pointer"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  Wake Up
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, i) => {
              if (msg.role === 'system') {
                return (
                  <div key={i} className="flex justify-center py-1">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {msg.message}
                    </span>
                  </div>
                );
              }

              const isAgent = msg.role === 'agent';

              return (
                <div key={i} className={`flex gap-3 ${isAgent ? '' : 'flex-row-reverse'}`}>
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

            {voiceMode && isConnected && (
              <div className="flex gap-3">
                <div className="w-7 h-7 shrink-0 mt-0.5">
                  <KaryaLogo size={28} />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${conversation.isSpeaking ? 'bg-blue-600 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
                  {conversation.isSpeaking ? 'Agent is speaking...' : 'Listening to you...'}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Connection status pill */}
          {isConnected && (
            <div className="flex items-center justify-center mb-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-green-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Connected
                {voiceMode && (
                  <span className="text-blue-600 ml-1">
                    {conversation.isSpeaking ? '— Agent speaking' : '— Listening'}
                  </span>
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleSendText} className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !isConnected ? 'Wake up the agent to start chatting...' :
                voiceMode ? 'Voice mode active — speak or type here...' :
                'Message Karya AI...'
              }
              rows={1}
              className="flex-1 resize-none bg-transparent py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            {voiceMode && isConnected && (
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-2 rounded-lg transition-all shrink-0 ${
                  conversation.isMuted
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                }`}
                title={conversation.isMuted ? 'Unmute' : 'Mute'}
              >
                {conversation.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleVoice}
              disabled={!isConnected || conversation.status === 'connecting'}
              className={`p-2 rounded-lg transition-all shrink-0 ${
                voiceMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : isConnected
                  ? 'text-gray-900 hover:text-black cursor-pointer'
                  : 'text-gray-300 cursor-default'
              } disabled:opacity-30`}
              title={voiceMode ? 'End voice mode' : 'Start voice mode'}
            >
              {voiceMode ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              type="submit"
              disabled={!isConnected || !inputText.trim()}
              className={`p-1.5 rounded-lg transition-all shrink-0 ${
                isConnected && inputText.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-white cursor-default'
              }`}
            >
              <ArrowUp className="h-5 w-5" />
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
        const res = await conversationApi.getConversations();
        setConversations(res.data || []);
        if (res.data && res.data.length > 0) {
          setActiveConversationId(res.data[0]._id);
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
      const res = await conversationApi.createConversation();
      const newConv = res.data;
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv._id);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await conversationApi.deleteConversation(id);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter(c => c._id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleTitleUpdate = (id, newTitle) => {
    setConversations(prev =>
      prev.map(c => c._id === id ? { ...c, title: newTitle } : c)
    );
  };

  const handleConversationCreated = (newConv) => {
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv._id);
  };

  if (loading || (!loading && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ConversationProvider>
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
    </ConversationProvider>
  );
}
