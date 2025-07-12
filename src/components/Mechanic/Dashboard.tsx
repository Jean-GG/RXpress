import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Star, TrendingUp, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ServiceRequest {
  id: string;
  service_type: string;
  status: string;
  created_at: string;
  actual_cost?: number;
  estimated_cost: number;
  client: {
    full_name: string;
  };
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedJobs: 0,
    avgRating: 4.8,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.user_type === 'mechanic') {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent service requests with correct relationship path
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select(`
          *,
          client:users!client_id(
            profiles(full_name)
          )
        `)
        .eq('mechanic_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (requestsError) throw requestsError;

      // Transform the data to match the expected structure
      const transformedRequests = (requestsData || []).map(request => ({
        ...request,
        client: {
          full_name: request.client?.profiles?.full_name || 'N/A'
        }
      }));

      setRequests(transformedRequests);

      // Calculate stats
      const completed = transformedRequests.filter(r => r.status === 'completed');
      const totalEarnings = completed.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost), 0);
      
      const thisMonth = completed
        .filter(r => new Date(r.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost), 0);

      setStats({
        totalEarnings,
        completedJobs: completed.length,
        avgRating: 4.8,
        thisMonth
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">¡Bienvenido de vuelta, {profile?.full_name}!</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Disponible</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trabajos completados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ganancias totales</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating promedio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este mes</p>
                <p className="text-2xl font-bold text-gray-900">${stats.thisMonth}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
          </div>
          
          {requests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No hay servicios recientes</p>
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{request.service_type}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Cliente: {request.client?.full_name || 'N/A'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
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
                          <span>Nuevo Laredo</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${request.actual_cost || request.estimated_cost}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 bg-orange-50 text-orange-700 p-3 rounded-lg hover:bg-orange-100 transition-colors">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">Actualizar Ubicación</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 p-3 rounded-lg hover:bg-blue-100 transition-colors">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Cambiar Estado</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;