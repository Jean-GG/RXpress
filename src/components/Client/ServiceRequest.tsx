import React, { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Banknote } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PaymentModal from './PaymentModal';

interface Mechanic {
  id: string;
  user_id: string;
  hourly_rate: number;
  profile: {
    full_name: string;
    phone: string;
  };
}

interface ServiceRequestProps {
  mechanic: Mechanic;
  onBack: () => void;
  onRequestCreated: (requestId: string) => void;
}

const ServiceRequest: React.FC<ServiceRequestProps> = ({ mechanic, onBack, onRequestCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    address: '',
    paymentMethod: 'cash' as 'cash' | 'card',
  });
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const serviceTypes = [
    'Vulcanización',
    'Cambio de aceite',
    'Ajuste de frenos',
    'Revisión de suspensión',
    'Diagnóstico de motor',
    'Cambio de batería',
    'Reparación eléctrica',
    'Otro'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cost = mechanic.hourly_rate * 2; // Estimate 2 hours
    setEstimatedCost(cost);

    if (formData.paymentMethod === 'card') {
      setShowPaymentModal(true);
    } else {
      await createServiceRequest();
    }
  };

  const createServiceRequest = async () => {
    setLoading(true);
    
    try {
      // Simulate getting user's location (Nuevo Laredo coordinates)
      const clientLatitude = 27.5024 + (Math.random() - 0.5) * 0.02;
      const clientLongitude = -99.5075 + (Math.random() - 0.5) * 0.02;

      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          client_id: user.id,
          mechanic_id: mechanic.user_id,
          service_type: formData.serviceType,
          description: formData.description,
          client_latitude: clientLatitude,
          client_longitude: clientLongitude,
          client_address: formData.address,
          payment_method: formData.paymentMethod,
          estimated_cost: estimatedCost,
          status: 'accepted' // Auto-accept for demo
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial system message
      await supabase.from('chat_messages').insert({
        service_request_id: data.id,
        sender_id: user.id,
        message: `Solicitud de ${formData.serviceType} creada. El mecánico ${mechanic.profile.full_name} se dirigirá a tu ubicación.`,
        message_type: 'system'
      });

      onRequestCreated(data.id);
    } catch (error) {
      console.error('Error creating service request:', error);
      alert('Error al crear la solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await createServiceRequest();
    setShowPaymentModal(false);
  };

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
            <h1 className="text-xl font-bold text-gray-900">Solicitar Servicio</h1>
            <p className="text-sm text-gray-500">{mechanic.profile.full_name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de servicio *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {serviceTypes.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => setFormData({...formData, serviceType: service})}
                  className={`p-3 text-sm border rounded-lg transition-colors ${
                    formData.serviceType === service
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del problema *
            </label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe detalladamente el problema o servicio que necesitas..."
            />
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Dirección *
            </label>
            <input
              id="address"
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Calle, colonia, referencias..."
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                className={`flex items-center justify-center space-x-2 p-4 border rounded-lg transition-colors ${
                  formData.paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Efectivo</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                className={`flex items-center justify-center space-x-2 p-4 border rounded-lg transition-colors ${
                  formData.paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          {/* Cost Estimate */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-800 mb-2">Estimación de costo</h3>
            <p className="text-sm text-orange-700">
              Tarifa por hora: <span className="font-semibold">${mechanic.hourly_rate}</span>
            </p>
            <p className="text-sm text-orange-700">
              Estimado (2 horas): <span className="font-semibold">${mechanic.hourly_rate * 2}</span>
            </p>
            <p className="text-xs text-orange-600 mt-2">
              *El costo final puede variar según la complejidad del trabajo
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.serviceType || !formData.description || !formData.address}
            className="w-full bg-orange-500 text-white py-4 px-4 rounded-lg font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando solicitud...' : 
             formData.paymentMethod === 'card' ? 'Continuar al pago' : 'Solicitar Servicio'}
          </button>
        </form>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={mechanic.hourly_rate * 2}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ServiceRequest;