"use dom";

import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

// 🌍 **Definieer interface voor UFO sightings**
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

export default function TabTwoScreen() {
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
    setModalVisible(true);
  };

  // Sluit de modaal
  const closeModal = () => {
    setModalVisible(false);
    setActiveSighting(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sightings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sightingItem}
            onPress={() => handleSightingClick(item)}
          >
            <Text style={styles.sightingTitle}>{item.witnessName}</Text>
            <Text>{item.description}</Text>
            <Text>{item.dateTime}</Text>
          </TouchableOpacity>
        )}
        style={styles.sightingsList}
      />

      {/* Modaal voor details */}
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