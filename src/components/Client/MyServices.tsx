import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, MessageCircle, CreditCard, Banknote, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ServiceRequest {
  id: string;
  service_type: string;
  description: string;
  client_address: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'card';
  estimated_cost: number;
  actual_cost?: number;
  created_at: string;
  mechanic?: {
    full_name: string;
    phone: string;
    avatar_url?: string;
  };
}

interface MyServicesProps {
  onOpenChat: (serviceId: string, mechanicName: string) => void;
}

const MyServices: React.FC<MyServicesProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      const { data: serviceRequests, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch mechanic profiles for each service
      const servicesWithMechanics = await Promise.all(
        (serviceRequests || []).map(async (service) => {
          if (service.mechanic_id) {
            const { data: mechanicProfile } = await supabase
              .from('profiles')
              .select('full_name, phone, avatar_url')
              .eq('user_id', service.mechanic_id)
              .single();

            return {
              ...service,
              mechanic: mechanicProfile
            };
          }
          return service;
        })
      );

      setServices(servicesWithMechanics);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En progreso';
      case 'accepted':
        return 'Aceptado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  };

  const filteredServices = services.filter(service => {
    if (filter === 'active') {
      return ['pending', 'accepted', 'in_progress'].includes(service.status);
    }
    if (filter === 'completed') {
      return service.status === 'completed';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Servicios</h1>
        <p className="text-gray-600">Historial de solicitudes</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'active', label: 'Activos' },
            { key: 'completed', label: 'Completados' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

      {/* Services List */}
      <div className="p-4 space-y-4">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay servicios</h3>
            <p className="text-gray-500">
              {filter === 'active' ? 'No tienes servicios activos' : 
               filter === 'completed' ? 'No tienes servicios completados' : 
               'Aún no has solicitado ningún servicio'}
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{service.service_type}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                      {getStatusText(service.status)}
                    </span>
                  </div>
                  
                  {service.mechanic && (
                    <div className="flex items-center space-x-2 mb-2">
                      <img
                        src={service.mechanic.avatar_url || 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'}
                        alt={service.mechanic.full_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">{service.mechanic.full_name}</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(service.created_at).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{service.client_address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {service.payment_method === 'card' ? (
                        <CreditCard className="w-3 h-3" />
                      ) : (
                        <Banknote className="w-3 h-3" />
                      )}
                      <span>{service.payment_method === 'card' ? 'Tarjeta' : 'Efectivo'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${service.actual_cost || service.estimated_cost}
                  </p>
                  {service.status === 'completed' && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-500">Calificar</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2 pt-3 border-t border-gray-100">
                {service.status === 'accepted' || service.status === 'in_progress' ? (
                  <button
                    onClick={() => onOpenChat(service.id, service.mechanic?.full_name || 'Mecánico')}
                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                ) : service.status === 'completed' ? (
                  <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Calificar</span>
                  </button>
                ) : null}
                
                <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1">
                  <span>Ver detalles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyServices;