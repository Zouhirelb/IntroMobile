"use dom"

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'

export default function TabOneScreen() {
    return (
      <View style={{ flex: 1 }}>
        <MapContainer
          center={{ lat: 51.505, lng: -0.09 }}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </View>
  );
}

interface LocationHandlerProps {
  addMarker: (lat: number, lng: number) => void;
}
const LocationHandler = ({addMarker} : LocationHandlerProps) => {
  const map = useMapEvents({
    dragend: () => {
      console.log(map.getCenter());
    },
    click: (e: { latlng: { lat: number; lng: number; }; }) => {
      addMarker(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}
