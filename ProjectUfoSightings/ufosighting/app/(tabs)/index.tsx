"use dom";

import { StyleSheet, TouchableOpacity, View } from "react-native";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import React, { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import { Modal, Text, Image, Button } from "react-native";

//  **Aangepaste rode marker voor UFO sightings**
const redMarker = new L.Icon({
  iconUrl:
    "https://cdn1.iconfinder.com/data/icons/color-bold-style/21/14_2-512.png",
  iconSize: [30, 30],
  iconAnchor: [10, 10],
});

//  **Definieer interface voor UFO sightings**
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

  // **API ophalen bij laden van component**
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
    <View style={{ flex: 1 }}>
      <MapContainer
        center={{ lat: 51.230175, lng: 4.41625 }}
        zoom={5}
        scrollWheelZoom={false}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/*  Markers voor UFO sightings */}
        {sightings.map((sighting) => (
          <Marker
            key={sighting.id}
            position={[sighting.location.latitude, sighting.location.longitude]}
            icon={redMarker}
            eventHandlers={{
              click: () => handleSightingClick(sighting), // markerklik handler
            }}
          />
        ))}
      </MapContainer>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{activeSighting?.witnessName}</Text>
            <Text style={styles.modalLabel}>Description:</Text>
            <Text>{activeSighting?.description}</Text>
            <Text style={styles.modalLabel}>Status:</Text>
            <Text>{activeSighting?.status}</Text>
            <Text style={styles.modalLabel}>Date and Time:</Text>
            <Text>{activeSighting?.dateTime}</Text>
            <Text style={styles.modalLabel}>Contact:</Text>
            <Text>{activeSighting?.witnessContact}</Text>

            {activeSighting?.picture ? (
              <Image
                source={{ uri: activeSighting.picture }}
                style={styles.modalImage}
              />
            ) : (
              <Text style={{ fontStyle: "italic", color: "gray" }}>
                No image available
              </Text>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  sightingsList: {
    padding: 10,
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
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
