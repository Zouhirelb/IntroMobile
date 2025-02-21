import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from "react-native";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import React, { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";

// 🔴 **CSS Rode Marker**
const redMarkerIcon = new L.DivIcon({
  className: "custom-marker",
  html: '<div class="red-marker"></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const redMarkerCSS = `
  .red-marker {
    background-color: red;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
  }
`;

document.head.insertAdjacentHTML("beforeend", `<style>${redMarkerCSS}</style>`);

interface Location {
  latitude: number;
  longitude: number;
}

interface Sighting {
  id: number;
  witnessName: string;
  location: Location;
  description: string;
  picture: string;
  status: string;
  dateTime: string;
  witnessContact: string;
}

export default function TabOneScreen() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [activeSighting, setActiveSighting] = useState<Sighting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 🚀 **API ophalen bij laden van component**
  useEffect(() => {
    axios
      .get<Sighting[]>("https://sampleapis.assimilate.be/ufo/sightings")
      .then((response) => {
        setSightings(response.data);
      })
      .catch((error) => {
        console.error("Error fetching UFO sightings:", error);
      });
  }, []);

  // Functie voor het openen van de modaal
  const handleSightingClick = (sighting: Sighting) => {
    setActiveSighting(sighting);
    setModalVisible(true); // Toon de modaal met de details van de sighting
  };

  // Sluit de modaal
  const closeModal = () => {
    setModalVisible(false);
    setActiveSighting(null);
  };

  return (
    <View style={styles.container}>
      {/* De kaart */}
      <MapContainer
        center={{ lat: 51.230175, lng: 4.41625 }}
        zoom={3}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "50%", // De kaart neemt de bovenste helft in
        }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {sightings.map((sighting) => (
          <Marker
            key={sighting.id}
            position={[sighting.location.latitude, sighting.location.longitude]}
            icon={redMarkerIcon}
            eventHandlers={{
              click: () => handleSightingClick(sighting), // markerklik handler
            }}
          />
        ))}
      </MapContainer>

      {/* Lijst van sightings */}
      <FlatList
        data={sightings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sightingItem}
            onPress={() => handleSightingClick(item)} // Klikbare sighting
          >
            <Text style={styles.sightingTitle}>{item.witnessName}</Text>
            <Text>{item.description}</Text>
            <Text>{item.dateTime}</Text>
          </TouchableOpacity>
        )}
        style={styles.sightingsList}
      />

      {/* Modaal voor het tonen van details van de sighting */}
      {activeSighting && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {activeSighting.witnessName}
              </Text>
              <Text style={styles.modalLabel}>Description:</Text>
              <Text>{activeSighting.description}</Text>
              <Text style={styles.modalLabel}>Status:</Text>
              <Text>{activeSighting.status}</Text>
              <Text style={styles.modalLabel}>Date and Time:</Text>
              <Text>{activeSighting.dateTime}</Text>
              <Text style={styles.modalLabel}>Contact:</Text>
              <Text>{activeSighting.witnessContact}</Text>
              <Text style={styles.modalLabel}>Picture:</Text>
              <Image
                source={{ uri: activeSighting.picture }}
                style={styles.modalImage}
              />
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sightingsList: {
    padding: 10,
    backgroundColor: "white", // Zorgt ervoor dat de lijst een witte achtergrond heeft
  },
  sightingItem: {
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sightingTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Donkere achtergrond
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
    overflow: "scroll",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalLabel: {
    fontWeight: "bold",
    marginTop: 5,
  },
  modalImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
  },
});
