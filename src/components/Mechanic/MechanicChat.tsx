import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MapPin, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'system';
  created_at: string;
}

interface MechanicChatProps {
  serviceRequestId: string;
  clientName: string;
  onClose: () => void;
}

const MechanicChat: React.FC<MechanicChatProps> = ({
  serviceRequestId,
  clientName,
  onClose
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<string>('accepted');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [finalCost, setFinalCost] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServiceDetails();
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

    // Simulate client responses
    const responseInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        simulateClientResponse();
      }
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(responseInterval);
    };
  }, [serviceRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchServiceDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('status, estimated_cost')
        .eq('id', serviceRequestId)
        .single();

      if (error) throw error;
      
      setServiceStatus(data.status);
      setEstimatedCost(data.estimated_cost);
      setFinalCost(data.estimated_cost.toString());
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

  const simulateClientResponse = async () => {
    if (!user) return;

    const clientResponses = [
      "¿Ya estás en camino?",
      "¿Cuánto tiempo más?",
      "Perfecto, te espero",
      "¿Necesitas que compre alguna pieza?",
      "Gracias por el servicio",
      "¿Cuánto va a costar?",
      "Está bien, procede",
      "¿Ya terminaste?",
      "Excelente trabajo"
    ];

    const randomResponse = clientResponses[Math.floor(Math.random() * clientResponses.length)];
    
    // Create a simulated client ID for the response
    const simulatedClientId = crypto.randomUUID();
    
    const newMessage = {
      id: crypto.randomUUID(),
      service_request_id: serviceRequestId,
      sender_id: simulatedClientId,
      message: randomResponse,
      message_type: 'text' as const,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
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
      const messageData = {
        service_request_id: serviceRequestId,
        sender_id: user.id,
        message: newMessage.trim(),
        message_type: 'text'
      };

      await supabase.from('chat_messages').insert(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendQuickMessage = async (message: string) => {
    if (!user) return;

    try {
      await supabase.from('chat_messages').insert({
        service_request_id: serviceRequestId,
        sender_id: user.id,
        message: message,
        message_type: 'text'
      });
    } catch (error) {
      console.error('Error sending quick message:', error);
    }
  };

  const updateServiceStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: newStatus })
        .eq('id', serviceRequestId);

      if (error) throw error;
      
      setServiceStatus(newStatus);
      
      // Send status update message
      const statusMessages = {
        'in_progress': 'He llegado y comenzaré el servicio',
        'completed': 'Servicio completado exitosamente'
      };
      
      if (statusMessages[newStatus as keyof typeof statusMessages]) {
        await sendQuickMessage(statusMessages[newStatus as keyof typeof statusMessages]);
      }
    } catch (error) {
      console.error('Error updating service status:', error);
    }
  };

  const completeService = async () => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ 
          status: 'completed',
          actual_cost: parseFloat(finalCost) || estimatedCost
        })
        .eq('id', serviceRequestId);

      if (error) throw error;
      
      setServiceStatus('completed');
      setShowCompleteModal(false);
      
      await sendQuickMessage(`Servicio completado. Costo total: $${finalCost}. ¡Gracias por confiar en nuestro servicio!`);
    } catch (error) {
      console.error('Error completing service:', error);
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
    switch (serviceStatus) {
      case 'accepted':
        return 'Servicio aceptado';
      case 'in_progress':
        return 'Servicio en progreso';
      case 'completed':
        return 'Servicio completado';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = () => {
    switch (serviceStatus) {
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

  const quickMessages = [
    "Estoy en camino a tu ubicación",
    "Llegare en 10 minutos",
    "He llegado, ¿dónde te encuentras?",
    "Necesito revisar el problema primero",
    "El servicio tomará aproximadamente 30 minutos",
    "¿Tienes alguna pregunta sobre el servicio?"
  ];

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
            <h2 className="font-semibold text-gray-900">{clientName}</h2>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">${estimatedCost}</span>
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Service Actions */}
      {serviceStatus !== 'completed' && (
        <div className="bg-white border-b p-4">
          <div className="flex space-x-2">
            {serviceStatus === 'accepted' && (
              <button
                onClick={() => updateServiceStatus('in_progress')}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
              >
                <Clock className="w-4 h-4" />
                <span>Iniciar Servicio</span>
              </button>
            )}
            
            {serviceStatus === 'in_progress' && (
              <button
                onClick={() => setShowCompleteModal(true)}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Completar Servicio</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Messages */}
      <div className="bg-gray-50 border-b p-3">
        <p className="text-xs text-gray-500 mb-2">Mensajes rápidos:</p>
        <div className="flex space-x-2 overflow-x-auto">
          {quickMessages.map((msg, index) => (
            <button
              key={index}
              onClick={() => sendQuickMessage(msg)}
              className="bg-white text-gray-700 px-3 py-1 rounded-full text-xs whitespace-nowrap hover:bg-gray-100 transition-colors border"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

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

      {/* Complete Service Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Completar Servicio</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo final del servicio
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Costo estimado: ${estimatedCost}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={completeService}
                  className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Completar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicChat;