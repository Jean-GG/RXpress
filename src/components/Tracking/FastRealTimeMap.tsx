import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mechanicIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface FastRealTimeMapProps {
  clientPosition: [number, number];
  mechanicPosition: [number, number];
  clientName: string;
  mechanicName: string;
  onArrival?: () => void;
}

const FastRealTimeMap: React.FC<FastRealTimeMapProps> = ({
  clientPosition,
  mechanicPosition: initialMechanicPosition,
  clientName,
  mechanicName,
  onArrival
}) => {
  const [mechanicPosition, setMechanicPosition] = useState(initialMechanicPosition);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [estimatedTime, setEstimatedTime] = useState(8); // minutes
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    // Generate route from mechanic to client
    const generateRoute = () => {
      const [mechLat, mechLng] = initialMechanicPosition;
      const [clientLat, clientLng] = clientPosition;
      
      const waypoints: [number, number][] = [];
      const steps = 15;
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Add some realistic street-following curvature
        const curvature = 0.003 * Math.sin(t * Math.PI * 2);
        const lat = mechLat + (clientLat - mechLat) * t + curvature;
        const lng = mechLng + (clientLng - mechLng) * t + curvature * 0.5;
        waypoints.push([lat, lng]);
      }
      
      setRoute(waypoints);
    };

    generateRoute();

    // Fast simulation - mechanic moves every 500ms
    let currentStep = 0;
    const totalSteps = route.length;
    
    const interval = setInterval(() => {
      if (currentStep < totalSteps - 1 && !hasArrived) {
        currentStep++;
        setMechanicPosition(route[currentStep] || initialMechanicPosition);
        
        // Update estimated time (decreases as mechanic gets closer)
        const remainingSteps = totalSteps - currentStep;
        const newEstimatedTime = Math.max(1, Math.round((remainingSteps / totalSteps) * 8));
        setEstimatedTime(newEstimatedTime);
        
        // Check if arrived (within 50 meters)
        if (currentStep >= totalSteps - 2) {
          setHasArrived(true);
          setEstimatedTime(0);
          onArrival?.();
        }
      }
    }, 500); // Update every 500ms for fast simulation

    return () => clearInterval(interval);
  }, [route, hasArrived, onArrival]);

  const center: [number, number] = [
    (clientPosition[0] + mechanicPosition[0]) / 2,
    (clientPosition[1] + mechanicPosition[1]) / 2
  ];

  return (
    <div className="w-full space-y-3">
      {/* Status Bar */}
      <div className={`p-3 rounded-lg ${hasArrived ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${hasArrived ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
            <span className={`font-medium ${hasArrived ? 'text-green-800' : 'text-blue-800'}`}>
              {hasArrived ? '¡El mecánico ha llegado!' : `${mechanicName} en camino`}
            </span>
          </div>
          <span className={`text-sm font-medium ${hasArrived ? 'text-green-600' : 'text-blue-600'}`}>
            {hasArrived ? 'Llegó' : `${estimatedTime} min`}
          </span>
        </div>
        
        {!hasArrived && (
          <div className="mt-2">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((8 - estimatedTime) / 8) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Client marker */}
          <Marker position={clientPosition} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>{clientName}</strong>
                <br />
                <span className="text-sm text-gray-600">Tu ubicación</span>
              </div>
            </Popup>
          </Marker>
          
          {/* Mechanic marker */}
          <Marker position={mechanicPosition} icon={mechanicIcon}>
            <Popup>
              <div className="text-center">
                <strong>{mechanicName}</strong>
                <br />
                <span className="text-sm text-gray-600">
                  {hasArrived ? 'Ha llegado' : 'En camino'}
                </span>
              </div>
            </Popup>
          </Marker>
          
          {/* Route line */}
          {route.length > 0 && (
            <Polyline
              positions={route}
              color="#3B82F6"
              weight={4}
              opacity={0.8}
              dashArray={hasArrived ? "10, 10" : undefined}
            />
          )}
        </MapContainer>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-medium text-gray-900">Tu ubicación</span>
          </div>
          <p className="text-gray-600 text-xs">Av. Guerrero 1234, Centro</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="font-medium text-gray-900">{mechanicName}</span>
          </div>
          <p className="text-gray-600 text-xs">
            {hasArrived ? 'En tu ubicación' : 'Aproximándose'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FastRealTimeMap;