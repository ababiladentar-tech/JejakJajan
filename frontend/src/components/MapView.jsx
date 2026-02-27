import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import VendorMarker from './VendorMarker';

// Fix marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView({
  vendors = [],
  userLocation,
  onVendorSelect,
  height = 'h-96',
  radarRadius = 500,
  outerRadius = null,
}) {
  const [mapCenter, setMapCenter] = useState([-6.2088, 106.8456]); // Jakarta
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude || userLocation.lat, userLocation.longitude || userLocation.lon]);
      setMapZoom(14);
    }
  }, [userLocation]);

  const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.setView(position, map.getZoom(), { animate: true });
      }
    }, [map, position]);
    return null;
  };

  const createCustomIcon = (status, distanceKM) => {
    const colors = {
      ACTIVE: '#06A77D',
      RESTING: '#F77F00',
      INACTIVE: '#D62828',
    };

    // if vendor is within 500m, make icon larger or with glow
    const nearby = distanceKM != null && distanceKM <= 0.5;
    const size = nearby ? 40 : 30;
    const icon = nearby ? '🔥' : '🛒';
    const border = nearby ? '3px solid gold' : '3px solid white';

    return L.divIcon({
      html: `<div style="background-color: ${colors[status] || '#004E89'}; 
             width: ${size}px; 
             height: ${size}px; 
             border-radius: 50%; 
             border: ${border};
             display: flex;
             align-items: center;
             justify-content: center;
             box-shadow: 0 2px 4px rgba(0,0,0,0.3);
             cursor: pointer;">
             <span style="color: white; font-size: ${nearby ? 20 : 16}px;">${icon}</span>
             </div>`,
      iconSize: [size, size],
      className: 'custom-icon',
    });
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg relative z-0 ${height}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* User location marker */}
        {userLocation && (
          <>
            <RecenterMap
              position={[
                userLocation.latitude || userLocation.lat,
                userLocation.longitude || userLocation.lon,
              ]}
            />
            {outerRadius && (
              <Circle
                center={[
                  userLocation.latitude || userLocation.lat,
                  userLocation.longitude || userLocation.lon,
                ]}
                radius={outerRadius}
                pathOptions={{ color: '#004E89', fillColor: '#004E89', fillOpacity: 0.04, dashArray: '6 6' }}
              />
            )}
            <Circle
              center={[
                userLocation.latitude || userLocation.lat,
                userLocation.longitude || userLocation.lon,
              ]}
              radius={radarRadius}
              pathOptions={{ color: '#06A77D', fillColor: '#06A77D', fillOpacity: 0.1 }}
            />
            <Marker
              position={[
                userLocation.latitude || userLocation.lat,
                userLocation.longitude || userLocation.lon,
              ]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })}
            >
              <Popup>Lokasi kamu</Popup>
            </Marker>
          </>
        )}

        {/* Vendor markers */}
        {vendors.map((vendor) => (
          <Marker
            key={vendor.id || vendor.vendorId}
            position={[vendor.latitude, vendor.longitude]}
            icon={createCustomIcon(vendor.status, vendor.distanceKM)}
            eventHandlers={{
              click: () => onVendorSelect(vendor),
            }}
          >
            <Popup>
              <VendorMarker vendor={vendor} onSelect={onVendorSelect} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
