import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Mechanic {
  id: string;
  user_id: string;
  specialties: string[];
  rating: number;
  total_reviews: number;
  hourly_rate: number;
  availability_status: string;
  profile: {
    full_name: string;
    phone: string;
    avatar_url?: string;
  };
}

interface MechanicsListProps {
  onBack: () => void;
  onSelectMechanic: (mechanic: Mechanic) => void;
}

const MechanicsList: React.FC<MechanicsListProps> = ({ onBack, onSelectMechanic }) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    try {
      // First, fetch mechanic profiles
      const { data: mechanicProfiles, error: mechanicError } = await supabase
        .from('mechanic_profiles')
        .select('*')
        .eq('availability_status', 'available');

      if (mechanicError) throw mechanicError;

      if (!mechanicProfiles || mechanicProfiles.length === 0) {
        setMechanics([]);
        return;
      }

      // Extract user_ids from mechanic profiles
      const userIds = mechanicProfiles.map(mechanic => mechanic.user_id);

      // Fetch corresponding profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone, avatar_url')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      // Combine the data
      const mechanicsWithProfiles = mechanicProfiles.map(mechanic => {
        const profile = profiles?.find(p => p.user_id === mechanic.user_id);
        return {
          ...mechanic,
          profile: profile || {
            full_name: 'Nombre no disponible',
            phone: 'Teléfono no disponible',
            avatar_url: null
          }
        };
      });

      setMechanics(mechanicsWithProfiles);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mecánicos disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mecánicos Disponibles</h1>
            <p className="text-sm text-gray-500">Selecciona un profesional</p>
          </div>
        </div>
      </div>

      {/* Mechanics List */}
      <div className="p-4 pb-20">
        {mechanics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay mecánicos disponibles en este momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mechanics.map((mechanic) => (
              <div
                key={mechanic.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={mechanic.profile?.avatar_url || `https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`}
                      alt={mechanic.profile?.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {mechanic.profile?.full_name}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700">
                            {mechanic.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({mechanic.total_reviews} reseñas)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">
                          ${mechanic.hourly_rate}/hr
                        </p>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Disponible
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Especialidades:</p>
                      <div className="flex flex-wrap gap-2">
                        {mechanic.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{mechanic.profile?.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>Nuevo Laredo</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onSelectMechanic(mechanic)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                      >
                        Solicitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MechanicsList;