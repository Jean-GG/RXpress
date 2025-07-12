import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import FastRealTimeMap from '../Tracking/FastRealTimeMap';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'system';
  created_at: string;
  sender_name?: string;
}

interface ChatInterfaceProps {
  serviceRequestId: string;
  mechanicName: string;
  clientName: string;
  status: string;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  serviceRequestId,
  mechanicName,
  clientName,
  status,
  onClose
}) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [mechanicArrived, setMechanicArrived] = useState(false);
  const [mechanicId, setMechanicId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulated positions for Nuevo Laredo
  const clientPosition: [number, number] = [27.5024, -99.5075];
  const mechanicPosition: [number, number] = [27.4989, -99.5142];

  useEffect(() => {
    fetchServiceRequestDetails();
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${serviceRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `service_request_id=eq.${serviceRequestId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate mechanic messages for demo
    const interval = setInterval(() => {
      if (profile?.user_type === 'client' && mechanicId && Math.random() > 0.8 && !mechanicArrived) {
        simulateMechanicMessage();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [profile?.user_type, mechanicId, mechanicArrived]);

  const fetchServiceRequestDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('mechanic_id')
        .eq('id', serviceRequestId)
        .single();

      if (error) throw error;
      setMechanicId(data?.mechanic_id || null);
    } catch (error) {
      console.error('Error fetching service request details:', error);
    }
  };

  const simulateMechanicMessage = async () => {
    if (!mechanicId) return;

    const demoMessages = [
      "Estoy en camino a tu ubicación",
      "Llegare en aproximadamente 5 minutos",
      "¿Podrías enviarme más detalles del problema?",
      "Ya estoy cerca de tu ubicación",
      "Veo tu ubicación en el mapa"
    ];

    const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
    
    // This would normally come from the mechanic's client
    if (profile?.user_type === 'client') {
      await supabase.from('chat_messages').insert({
        service_request_id: serviceRequestId,
        sender_id: mechanicId,
        message: randomMessage,
        message_type: 'text'
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('service_request_id', serviceRequestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await supabase.from('chat_messages').insert({
        service_request_id: serviceRequestId,
        sender_id: user.id,
        message: newMessage.trim(),
        message_type: 'text'
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = () => {
    if (mechanicArrived) return 'Mecánico en ubicación';
    switch (status) {
      case 'accepted':
        return 'Mecánico asignado';
      case 'in_progress':
        return 'En progreso';
      case 'completed':
        return 'Completado';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = () => {
    if (mechanicArrived) return 'bg-green-100 text-green-800';
    switch (status) {
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMechanicArrival = () => {
    if (!mechanicId) return;

    setMechanicArrived(true);
    // Send arrival message
    supabase.from('chat_messages').insert({
      service_request_id: serviceRequestId,
      sender_id: mechanicId,
      message: '¡He llegado a tu ubicación! Te estoy esperando.',
      message_type: 'text'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">
              {profile?.user_type === 'client' ? mechanicName : clientName}
            </h2>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center space-x-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Mapa</span>
        </button>
      </div>

      {/* Map Section */}
      {showMap && (
        <div className="bg-white border-b p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Seguimiento en Tiempo Real</h3>
            <button
              onClick={() => setShowMap(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <FastRealTimeMap
            clientPosition={clientPosition}
            mechanicPosition={mechanicPosition}
            clientName={clientName}
            mechanicName={mechanicName}
            onArrival={handleMechanicArrival}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === user?.id;
          const isSystemMessage = message.message_type === 'system';
          
          if (isSystemMessage) {
            return (
              <div key={message.id} className="text-center">
                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm inline-block">
                  {message.message}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(message.created_at)}
                </p>
              </div>
            );
          }
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                isOwnMessage
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;