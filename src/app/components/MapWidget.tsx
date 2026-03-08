import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Driver, Delivery } from '../lib/mock-data';
import { MapLegend } from './MapLegend';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapWidgetProps {
  drivers: Driver[];
  deliveries: Delivery[];
  height?: string;
}

// Custom marker icons
const createDriverIcon = (status: string) => {
  const color = status === 'available' ? '#10b981' : status === 'delivering' ? '#3b82f6' : '#6b7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createDeliveryIcon = (priority: string) => {
  const color = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#6b7280';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 4px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Component to handle map animations
function AnimatedDrivers({ drivers }: { drivers: Driver[] }) {
  const map = useMap();
  const [positions, setPositions] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    // Initialize positions
    const initialPositions: Record<string, [number, number]> = {};
    drivers.forEach(driver => {
      initialPositions[driver.id] = [driver.lat, driver.lng];
    });
    setPositions(initialPositions);

    // Simulate driver movement
    const interval = setInterval(() => {
      setPositions(prev => {
        const newPositions = { ...prev };
        drivers.forEach(driver => {
          if (driver.status === 'delivering') {
            // Small random movement to simulate driving
            const currentPos = newPositions[driver.id] || [driver.lat, driver.lng];
            newPositions[driver.id] = [
              currentPos[0] + (Math.random() - 0.5) * 0.001,
              currentPos[1] + (Math.random() - 0.5) * 0.001,
            ];
          }
        });
        return newPositions;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [drivers]);

  return (
    <>
      {drivers.map(driver => {
        const position = positions[driver.id] || [driver.lat, driver.lng];
        return (
          <Marker
            key={driver.id}
            position={position}
            icon={createDriverIcon(driver.status)}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-gray-900">{driver.name}</p>
                <p className="text-xs text-gray-600">ID: {driver.id}</p>
                <p className="text-xs text-gray-600 mt-1">Status: {driver.status}</p>
                {driver.currentDelivery && (
                  <p className="text-xs text-gray-600">Order: {driver.currentDelivery}</p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export function MapWidget({ drivers, deliveries, height = '600px' }: MapWidgetProps) {
  const center: [number, number] = [40.7489, -73.9680]; // New York City
  
  // Generate route paths for active deliveries
  const routes = drivers
    .filter(d => d.status === 'delivering' && d.currentDelivery)
    .map(driver => {
      const delivery = deliveries.find(del => del.orderId === driver.currentDelivery);
      if (!delivery) return null;
      
      return {
        driverId: driver.id,
        positions: [
          [driver.lat, driver.lng] as [number, number],
          [delivery.lat, delivery.lng] as [number, number],
        ],
        color: '#3b82f6',
      };
    })
    .filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route paths */}
        {routes.map((route, idx) => 
          route && (
            <Polyline
              key={idx}
              positions={route.positions}
              color={route.color}
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )
        )}

        {/* Delivery markers */}
        {deliveries.map(delivery => (
          <Marker
            key={delivery.id}
            position={[delivery.lat, delivery.lng]}
            icon={createDeliveryIcon(delivery.priority)}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-gray-900">{delivery.orderId}</p>
                <p className="text-xs text-gray-600 mt-1">{delivery.customerAddress}</p>
                <p className="text-xs text-gray-600">Priority: {delivery.priority}</p>
                <p className="text-xs text-gray-600">Status: {delivery.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Animated driver markers */}
        <AnimatedDrivers drivers={drivers} />
      </MapContainer>
      <MapLegend />
    </div>
  );
}