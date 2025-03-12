import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Button,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Aangepaste rode marker voor UFO sightings
const redMarker = new L.Icon({
  iconUrl:
    "https://cdn1.iconfinder.com/data/icons/color-bold-style/21/14_2-512.png",
  iconSize: [30, 30],
  iconAnchor: [10, 10],
});

// Definieer interface voor UFO sightings
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

const MarkerLayer = ({
  handleMapPress,
}: {
  handleMapPress: (e: any) => void;
}) => {
  useMapEvents({
    click: (e) => handleMapPress(e),
  });
  return null;
};

export default function TabOneScreen() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [activeSighting, setActiveSighting] = useState<Sighting | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [witnessName, setWitnessName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("unconfirmed");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [latitude, setLatitude] = useState<string>(""); // Keep track of latitude
  const [longitude, setLongitude] = useState<string>(""); // Keep track of longitude
  const [dateTime, setDateTime] = useState<string>(""); // Keep track of date and time

  useEffect(() => {
    // Fetch UFO sightings from the API
    axios
      .get<Sighting[]>("https://sampleapis.assimilate.be/ufo/sightings")
      .then((response) => {
        loadSightings(response.data); // Merge API sightings with AsyncStorage sightings
      })
      .catch((error) => {
        console.error("Error fetching UFO sightings:", error);
      });
  }, []);

  const loadSightings = async (apiSightings: Sighting[]) => {
    try {
      const storedSightings = await AsyncStorage.getItem("sightings");
      const storedData = storedSightings ? JSON.parse(storedSightings) : [];
      const allSightings = [...storedData, ...apiSightings]; // Merge the API data with local data
      setSightings(allSightings); // Set the merged sightings to state
    } catch (error) {
      console.error("Error loading sightings from AsyncStorage:", error);
    }
  };

  const saveSightings = async (newSightings: Sighting[]) => {
    try {
      await AsyncStorage.setItem("sightings", JSON.stringify(newSightings));
      setSightings(newSightings);
    } catch (error) {
      console.error("Error saving sightings to AsyncStorage:", error);
    }
  };

  const handleSightingClick = (sighting: Sighting) => {
    setActiveSighting(sighting);
    setModalVisible(true);
  };

  const handleMapPress = (e: any) => {
    if (e.latlng) {
      const { lat, lng } = e.latlng;
      setLocation({ latitude: lat, longitude: lng });
      setLatitude(lat.toString()); // Update latitude input field
      setLongitude(lng.toString()); // Update longitude input field
      setDateTime(new Date().toISOString()); // Set the current date and time
      setModalVisible(true);
      setActiveSighting(null); // Ensures the map press opens a new report, not a sighting
    } else {
      console.error("Error: latlng not found in map press event", e);
    }
  };

  const handleSubmit = () => {
    const newSighting: Sighting = {
      id: sightings.length + 1,
      witnessName,
      location: location!,
      description,
      picture: "",
      status,
      dateTime,
      witnessContact: contact,
    };

    // Add the new sighting to the state
    const updatedSightings = [...sightings, newSighting];
    setSightings(updatedSightings);

    // Save the new sightings to AsyncStorage
    saveSightings(updatedSightings);

    // Reset the form
    setWitnessName("");
    setDescription("");
    setContact("");
    setLocation(null);
    setLatitude(""); // Reset latitude input field
    setLongitude(""); // Reset longitude input field
    setDateTime(""); // Reset dateTime field
    setModalVisible(false);
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
        <MarkerLayer handleMapPress={handleMapPress} />

        {sightings.map((sighting) => (
          <Marker
            key={sighting.id}
            position={[sighting.location.latitude, sighting.location.longitude]}
            icon={redMarker}
          >
            <Popup>
              <TouchableOpacity onPress={() => handleSightingClick(sighting)}>
                <Text>Click to view or edit this sighting</Text>
              </TouchableOpacity>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Modal for displaying the UFO sighting details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {activeSighting ? "Edit UFO Sighting" : "UFO Sighting Report"}
            </Text>

            {/* Display sighting details when activeSighting is set */}
            {activeSighting ? (
              <>
                <Text style={styles.modalLabel}>
                  Witness Name: {activeSighting.witnessName}
                </Text>
                <Text style={styles.modalLabel}>
                  Description: {activeSighting.description}
                </Text>
                <Text style={styles.modalLabel}>
                  Status: {activeSighting.status}
                </Text>
                <Text style={styles.modalLabel}>
                  Date and Time: {activeSighting.dateTime}
                </Text>
                <Text style={styles.modalLabel}>
                  Contact: {activeSighting.witnessContact}
                </Text>
                <Text style={styles.modalLabel}>
                  Location: {activeSighting.location.latitude},{" "}
                  {activeSighting.location.longitude}
                </Text>
              </>
            ) : (
              <>
                <TextInput
                  placeholder="Witness Name"
                  value={witnessName}
                  onChangeText={setWitnessName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Description"
                  value={description}
                  onChangeText={setDescription}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Contact Information"
                  value={contact}
                  onChangeText={setContact}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Latitude"
                  value={latitude}
                  onChangeText={setLatitude}
                  style={styles.input}
                  editable={false}
                />
                <TextInput
                  placeholder="Longitude"
                  value={longitude}
                  onChangeText={setLongitude}
                  style={styles.input}
                  editable={false}
                />
                <TextInput
                  placeholder="Date and Time"
                  value={dateTime}
                  onChangeText={setDateTime}
                  style={styles.input}
                  editable={false}
                />
              </>
            )}

            <Button
              title={activeSighting ? "Update Sighting" : "Submit Report"}
              onPress={handleSubmit}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
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
    width: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#ff6347",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    textAlign: "center",
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
});
