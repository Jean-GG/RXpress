import React, { useState } from 'react';
import { User, Phone, Mail, Edit3, Camera, MapPin, CreditCard, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { profile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
  });

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-8">
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={profile?.avatar_url || 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
              alt={profile?.full_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <h1 className="text-2xl font-bold text-white mt-4">{profile?.full_name}</h1>
          <p className="text-orange-100">{profile?.email}</p>
          <div className="flex items-center justify-center space-x-1 mt-2">
            <MapPin className="w-4 h-4 text-orange-100" />
            <span className="text-orange-100 text-sm">Nuevo Laredo, Tamaulipas</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.full_name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.email}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Configuración de Cuenta</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            <button className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors">
              <div className="bg-blue-100 p-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Métodos de pago</p>
                <p className="text-sm text-gray-500">Gestionar tarjetas y métodos de pago</p>
              </div>
            </button>

            <button className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors">
              <div className="bg-green-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Notificaciones</p>
                <p className="text-sm text-gray-500">Configurar alertas y notificaciones</p>
              </div>
            </button>

            <button className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Privacidad y seguridad</p>
                <p className="text-sm text-gray-500">Cambiar contraseña y configuración</p>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Información de la App</h2>
          </div>
          
          <div className="p-4 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Versión</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Servicios completados</span>
              <span>12</span>
            </div>
            <div className="flex justify-between">
              <span>Miembro desde</span>
              <span>Enero 2024</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={signOut}
          className="w-full bg-red-50 text-red-600 py-3 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;