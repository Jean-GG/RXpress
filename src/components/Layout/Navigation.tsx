import React from 'react';
import { Wrench, Home, MessageCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { profile, signOut } = useAuth();

  const navItems = profile?.user_type === 'mechanic' 
    ? [
        { id: 'dashboard', icon: Home, label: 'Dashboard' },
        { id: 'requests', icon: Wrench, label: 'Solicitudes' },
        { id: 'chat', icon: MessageCircle, label: 'Chat' },
        { id: 'profile', icon: User, label: 'Perfil' },
      ]
    : [
        { id: 'home', icon: Home, label: 'Inicio' },
        { id: 'mechanics', icon: Wrench, label: 'Mecánicos' },
        { id: 'requests', icon: MessageCircle, label: 'Mis Servicios' },
        { id: 'profile', icon: User, label: 'Perfil' },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
        
        <button
          onClick={signOut}
          className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-xs font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;