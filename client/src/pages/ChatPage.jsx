import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import { 
  Send, 
  MessageSquare, 
  Home, 
  User, 
  Check, 
  CheckCheck, 
  Sparkles, 
  Info, 
  MapPin, 
  Calendar,
  ArrowLeft
} from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const conversationQueryId = searchParams.get('conversation');
  const propertyQueryId = searchParams.get('property');
  const bookingQueryId = searchParams.get('booking');

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');

  // Typing state
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversation list
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.data);

        // If query param passed or first conversation available, select it
        if (conversationQueryId) {
          const target = res.data.data.find((c) => c._id === conversationQueryId);
          if (target) setSelectedConversation(target);
        } else if (res.data.data.length > 0 && !selectedConversation) {
          setSelectedConversation(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
      setError(err.response?.data?.message || 'Failed to load chat conversations.');
    } finally {
      setLoading(false);
    }
  };

  // Handle URL params auto-create conversation
  useEffect(() => {
    const handleUrlQueryCreate = async () => {
      if (propertyQueryId || bookingQueryId) {
        try {
          const res = await API.post('/conversations', {
            propertyId: propertyQueryId || undefined,
            bookingId: bookingQueryId || undefined,
          });
          if (res.data.success) {
            const newConv = res.data.data;
            setSelectedConversation(newConv);
            setConversations((prev) => {
              const exists = prev.some((c) => c._id === newConv._id);
              return exists ? prev : [newConv, ...prev];
            });
            setSearchParams({ conversation: newConv._id });
          }
        } catch (err) {
          console.error('Auto conversation creation error:', err);
          if (err.response?.status === 400) {
            setSearchParams({});
          }
        }
      }
    };

    handleUrlQueryCreate();
  }, [propertyQueryId, bookingQueryId]);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch message history when selected conversation changes
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await API.get(`/messages/${selectedConversation._id}`);
        if (res.data.success) {
          setMessages(res.data.data);
          scrollToBottom();

          // Mark messages as read
          await API.patch(`/messages/${selectedConversation._id}/read`).catch(() => {});
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();

    // Join Socket Room
    if (socket) {
      socket.emit('joinConversation', { conversationId: selectedConversation._id });
      socket.emit('markAsRead', { conversationId: selectedConversation._id });
    }
  }, [selectedConversation, socket]);

  // Socket Event Listeners for Messages, Typing & Read Receipts
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      const msgConvId = msg.conversation?._id || msg.conversation;
      if (selectedConversation && msgConvId === selectedConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
        socket.emit('markAsRead', { conversationId: selectedConversation._id });
      }

      // Update last message in sidebar conversations
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msgConvId ? { ...c, lastMessage: msg, updatedAt: new Date() } : c
        )
      );
    };

    const handleUserTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id && data.userId !== user._id) {
        setIsTyping(true);
        setTypingUserName(data.userName || data.name || 'User');
      }
    };

    const handleUserStopTyping = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setIsTyping(false);
      }
    };

    const handleMessagesRead = (data) => {
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    };

    socket.on('newMessage', handleReceiveMessage);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStopTyping', handleUserStopTyping);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('newMessage', handleReceiveMessage);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStopTyping', handleUserStopTyping);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, selectedConversation, user]);

  // Handle Input Typing Event
  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);

    if (socket && selectedConversation) {
      socket.emit('typing', { conversationId: selectedConversation._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { conversationId: selectedConversation._id });
      }, 2000);
    }
  };

  // Send Message Submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedConversation) return;

    const messageText = newMessageText.trim();
    setNewMessageText('');

    if (socket) {
      socket.emit('stopTyping', { conversationId: selectedConversation._id });
      socket.emit('sendMessage', {
        conversationId: selectedConversation._id,
        message: messageText,
        messageText: messageText,
      });
    }
  };

  // Extract recipient details from selected conversation
  const getRecipient = (conv) => {
    if (!conv || !conv.participants) return null;
    return conv.participants.find((p) => p._id !== user._id) || conv.participants[0];
  };

  const recipient = getRecipient(selectedConversation);
  const isRecipientOnline = recipient ? onlineUsers.has(recipient._id.toString()) : false;

  if (loading) return <LoadingSpinner fullScreen label="Loading chat engine..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[85vh]">
      <div className="glass-panel h-full rounded-3xl border border-slate-800 shadow-2xl flex overflow-hidden">
        
        {/* SIDEBAR: CONVERSATION LIST */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/40">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" /> Retreat Chat
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations yet. Contact a host on any retreat page!
              </div>
            ) : (
              conversations.map((conv) => {
                const partner = getRecipient(conv);
                const isOnline = partner ? onlineUsers.has(partner._id.toString()) : false;
                const isSelected = selectedConversation?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setSearchParams({ conversation: conv._id });
                    }}
                    className={`w-full p-3 rounded-2xl flex items-start gap-3 transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40'
                        : 'hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    {/* Avatar with online badge */}
                    <div className="relative shrink-0">
                      <img
                        src={partner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={partner?.name}
                        className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-700"
                      />
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold text-white truncate">{partner?.name || 'User'}</p>
                        <span className="text-[10px] text-slate-500">
                          {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      {conv.property && (
                        <p className="text-[11px] text-indigo-400 truncate font-medium mb-1">
                          {conv.property.title}
                        </p>
                      )}

                      <p className="text-xs text-slate-400 truncate">
                        {conv.lastMessage ? conv.lastMessage.message : 'No messages yet...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>

        {/* MAIN CHAT THREAD AREA */}
        <div className="flex-1 flex flex-col h-full bg-slate-900/20">
          {selectedConversation ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={recipient?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={recipient?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    {isRecipientOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {recipient?.name}
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        recipient?.role === 'owner' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {recipient?.role}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isRecipientOnline ? (
                        <span className="text-emerald-400 font-semibold">Active Online</span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>

                {/* Property context preview badge */}
                {selectedConversation.property && (
                  <Link
                    to={`/properties/${selectedConversation.property._id}`}
                    className="hidden sm:flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition text-xs text-slate-300"
                  >
                    <Home className="w-4 h-4 text-indigo-400" />
                    <span className="truncate max-w-[150px] font-medium">{selectedConversation.property.title}</span>
                  </Link>
                )}
              </div>

              {/* Messages Thread Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <LoadingSpinner label="Loading message history..." />
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                    <Sparkles className="w-8 h-8 text-indigo-400" />
                    <p className="text-sm font-semibold">Start the conversation</p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Send a message to ask about retreat availability, check-in instructions, or custom requests.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                    const isSystem = msg.messageType === 'system' || !msg.sender;

                    if (isSystem) {
                      return (
                        <div key={msg._id} className="flex justify-center my-2">
                          <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs text-center max-w-md shadow">
                            <span className="font-semibold">{msg.message}</span>
                            <span className="block text-[9px] text-indigo-400/70 mt-0.5">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg._id}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={msg.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                          />
                        )}

                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              msg.isRead ? (
                                <CheckCheck className="w-3 h-3 text-emerald-300" title="Read" />
                              ) : (
                                <Check className="w-3 h-3" title="Sent" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse pl-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span>{typingUserName || 'Host'} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 backdrop-blur">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 rounded-xl glass-input text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim()}
                    className="p-3 rounded-xl gradient-button text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a Conversation"
                description="Choose an existing conversation from the sidebar or contact a retreat host."
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPage;
