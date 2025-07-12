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

interface RealTimeMapProps {
  clientPosition: [number, number];
  mechanicPosition: [number, number];
  clientName: string;
  mechanicName: string;
}

const RealTimeMap: React.FC<RealTimeMapProps> = ({
  clientPosition,
  mechanicPosition,
  clientName,
  mechanicName
}) => {
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    // Simulate a route between mechanic and client
    // In a real app, you'd use a routing service like OpenRouteService or Mapbox
    const generateRoute = () => {
      const [mechLat, mechLng] = mechanicPosition;
      const [clientLat, clientLng] = clientPosition;
      
      // Create a simple curved route with some waypoints
      const waypoints: [number, number][] = [];
      const steps = 10;
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Add some curvature to make it look more realistic
        const curvature = 0.005 * Math.sin(t * Math.PI);
        const lat = mechLat + (clientLat - mechLat) * t + curvature;
        const lng = mechLng + (clientLng - mechLng) * t + curvature;
        waypoints.push([lat, lng]);
      }
      
      setRoute(waypoints);
    };

    generateRoute();
  }, [mechanicPosition, clientPosition]);

  const center: [number, number] = [
    (clientPosition[0] + mechanicPosition[0]) / 2,
    (clientPosition[1] + mechanicPosition[1]) / 2
  ];

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={14}
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
              <span className="text-sm text-gray-600">Ubicación del cliente</span>
            </div>
          </Popup>
        </Marker>
        
        {/* Mechanic marker */}
        <Marker position={mechanicPosition} icon={mechanicIcon}>
          <Popup>
            <div className="text-center">
              <strong>{mechanicName}</strong>
              <br />
              <span className="text-sm text-gray-600">Mecánico en camino</span>
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
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RealTimeMap;