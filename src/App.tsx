import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navigation from './components/Layout/Navigation';
import LandingPage from './components/Client/LandingPage';
import MechanicsList from './components/Client/MechanicsList';
import ServiceRequest from './components/Client/ServiceRequest';
import MyServices from './components/Client/MyServices';
import Profile from './components/Client/Profile';
import ChatInterface from './components/Chat/ChatInterface';
import Dashboard from './components/Mechanic/Dashboard';
import RequestsList from './components/Mechanic/RequestsList';
import MechanicChat from './components/Mechanic/MechanicChat';

interface Mechanic {
  id: string;
  user_id: string;
  hourly_rate: number;
  profile: {
    full_name: string;
    phone: string;
  };
}

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [activeMechanicName, setActiveMechanicName] = useState<string>('');
  const [activeChatClient, setActiveChatClient] = useState<string>('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show auth screens only when explicitly requested
  if (showAuth && (!user || !profile)) {
    return authMode === 'login' ? (
      <Login 
        onToggleMode={() => setAuthMode('register')} 
        onBack={() => setShowAuth(false)}
      />
    ) : (
      <Register 
        onToggleMode={() => setAuthMode('login')} 
        onBack={() => setShowAuth(false)}
      />
    );
  }

  // Show main landing page if not authenticated
  if (!user || !profile) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // Show mechanic chat if there's an active service for mechanic
  if (activeServiceId && profile.user_type === 'mechanic') {
    return (
      <MechanicChat
        serviceRequestId={activeServiceId}
        clientName={activeChatClient}
        onClose={() => {
          setActiveServiceId(null);
          setActiveChatClient('');
          setCurrentView('requests');
        }}
      />
    );
  }

  // Show chat if there's an active service
  if (activeServiceId) {
    return (
      <ChatInterface
        serviceRequestId={activeServiceId}
        mechanicName={activeMechanicName}
        clientName={profile.full_name}
        status="accepted"
        onClose={() => {
          setActiveServiceId(null);
          setActiveMechanicName('');
          setSelectedMechanic(null);
          setCurrentView('home');
        }}
      />
    );
  }

  // Show service request form if mechanic is selected
  if (selectedMechanic && profile.user_type === 'client') {
    return (
      <ServiceRequest
        mechanic={selectedMechanic}
        onBack={() => setSelectedMechanic(null)}
        onRequestCreated={(requestId) => {
          setActiveServiceId(requestId);
          setActiveMechanicName(selectedMechanic.profile.full_name);
        }}
      />
    );
  }

  const renderCurrentView = () => {
    if (profile.user_type === 'mechanic') {
      switch (currentView) {
        case 'dashboard':
        default:
          return <Dashboard />;
        case 'requests':
          return (
            <RequestsList
              onOpenChat={(serviceId, clientName) => {
                setActiveServiceId(serviceId);
                setActiveChatClient(clientName);
              }}
            />
          );
        case 'chat':
          return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Chat</h2>
              <p className="text-gray-600">Vista de chat en desarrollo</p>
            </div>
          </div>;
        case 'profile':
          return <Profile />;
      }
    } else {
      switch (currentView) {
        case 'home':
        default:
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Bienvenido, {profile.full_name}!</h2>
                <p className="text-gray-600 mb-6">¿Qué servicio necesitas hoy?</p>
                <button
                  onClick={() => setCurrentView('mechanics')}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Buscar Mecánicos
                </button>
              </div>
            </div>
          );
        case 'mechanics':
          return (
            <MechanicsList
              onBack={() => setCurrentView('home')}
              onSelectMechanic={setSelectedMechanic}
            />
          );
        case 'requests':
          return (
            <MyServices
              onOpenChat={(serviceId, mechanicName) => {
                setActiveServiceId(serviceId);
                setActiveMechanicName(mechanicName);
              }}
            />
          );
        case 'profile':
          return <Profile />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentView()}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;