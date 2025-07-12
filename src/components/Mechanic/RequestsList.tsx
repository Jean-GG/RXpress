import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, Phone, DollarSign, Check, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ServiceRequest {
  id: string;
  client_id: string;
  service_type: string;
  description: string;
  client_address: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'card';
  estimated_cost: number;
  created_at: string;
  client: {
    full_name: string;
    phone: string;
    avatar_url?: string;
  };
}

interface RequestsListProps {
  onOpenChat: (requestId: string, clientName: string) => void;
}

const RequestsList: React.FC<RequestsListProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'in_progress' | 'all'>('pending');

  useEffect(() => {
    if (user) {
      fetchRequests();
      // Simulate new requests coming in
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          generateNewRequest();
        }
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data: serviceRequests, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('mechanic_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch client profiles for each request
      const requestsWithClients = await Promise.all(
        (serviceRequests || []).map(async (request) => {
          const { data: clientProfile } = await supabase
            .from('profiles')
            .select('full_name, phone, avatar_url')
            .eq('user_id', request.client_id)
            .single();

          return {
            ...request,
            client: clientProfile || {
              full_name: 'Cliente',
              phone: 'N/A',
              avatar_url: null
            }
          };
        })
      );

      setRequests(requestsWithClients);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewRequest = async () => {
    if (!user) return;

    // First, fetch existing client user IDs from the profiles table
    const { data: clientProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone, avatar_url')
      .eq('user_type', 'client')
      .limit(10);

    if (profilesError || !clientProfiles || clientProfiles.length === 0) {
      console.error('Error fetching client profiles or no clients available:', profilesError);
      return;
    }

    // Select a random client from the existing clients
    const randomClient = clientProfiles[Math.floor(Math.random() * clientProfiles.length)];

    const serviceTypes = [
      'Vulcanización',
      'Cambio de aceite',
      'Ajuste de frenos',
      'Revisión de suspensión',
      'Diagnóstico de motor',
      'Cambio de batería'
    ];

    const addresses = [
      'Av. Reforma 123, Centro',
      'Calle Hidalgo 456, San José',
      'Blvd. Independencia 789, Viveros',
      'Av. Guerrero 321, Jardín',
      'Calle Morelos 654, Madero'
    ];

    const descriptions = [
      'Mi carro no enciende, creo que es la batería',
      'Se me ponchó la llanta en la carretera',
      'El motor hace ruidos extraños',
      'Los frenos están fallando',
      'Necesito cambio de aceite urgente',
      'El carro vibra mucho al frenar'
    ];

    const randomServiceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          client_id: randomClient.user_id,
          mechanic_id: user.id,
          service_type: randomServiceType,
          description: randomDescription,
          client_latitude: 27.5024 + (Math.random() - 0.5) * 0.02,
          client_longitude: -99.5075 + (Math.random() - 0.5) * 0.02,
          client_address: randomAddress,
          payment_method: Math.random() > 0.5 ? 'cash' : 'card',
          estimated_cost: Math.floor(Math.random() * 300) + 200,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new request to the list with actual client data
      const newRequest = {
        ...data,
        client: {
          full_name: randomClient.full_name || 'Cliente',
          phone: randomClient.phone || 'N/A',
          avatar_url: randomClient.avatar_url
        }
      };

      setRequests(prev => [newRequest, ...prev]);
    } catch (error) {
      console.error('Error generating new request:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: 'accepted' as const } : req
        )
      );

      // Create initial system message
      await supabase.from('chat_messages').insert({
        service_request_id: requestId,
        sender_id: user?.id,
        message: 'Solicitud aceptada. Me dirijo a tu ubicación.',
        message_type: 'system'
      });
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: 'cancelled' as const } : req
        )
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleStartService = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'in_progress' })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev =>
        prev.map(req =>
          req.id === requestId ? { ...req, status: 'in_progress' as const } : req
        )
      );
    } catch (error) {
      console.error('Error starting service:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptado';
      case 'in_progress':
        return 'En progreso';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Servicio</h1>
        <p className="text-gray-600">Gestiona tus solicitudes de trabajo</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { key: 'pending', label: 'Pendientes' },
            { key: 'accepted', label: 'Aceptadas' },
            { key: 'in_progress', label: 'En progreso' },
            { key: 'all', label: 'Todas' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="p-4 space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-500">
              {filter === 'pending' ? 'No tienes solicitudes pendientes' : 
               filter === 'accepted' ? 'No tienes solicitudes aceptadas' : 
               filter === 'in_progress' ? 'No tienes servicios en progreso' : 
               'No tienes solicitudes de servicio'}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{request.service_type}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={request.client.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'}
                      alt={request.client.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{request.client.full_name}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{request.client.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(request.created_at).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{request.client_address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>${request.estimated_cost}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aceptar</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  </>
                )}
                
                {request.status === 'accepted' && (
                  <>
                    <button
                      onClick={() => handleStartService(request.id)}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Iniciar Servicio
                    </button>
                    <button
                      onClick={() => onOpenChat(request.id, request.client.full_name)}
                      className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat</span>
                    </button>
                  </>
                )}
                
                {request.status === 'in_progress' && (
                  <button
                    onClick={() => onOpenChat(request.id, request.client.full_name)}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Abrir Chat</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestsList;