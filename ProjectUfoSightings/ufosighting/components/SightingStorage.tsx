import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Definieer en exporteer de Sighting interface
export interface Sighting {
  witnessName: string;
  description: string;
  status: string;
  dateTime: string;
  contact: string;
  location: { lat: number; lng: number }; // Specificeer locatie als object
}

const SightingStorage = ({
  onAddSighting,
}: {
  onAddSighting: (sighting: Sighting) => void;
}) => {
  const [witnessName, setWitnessName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [dateTime, setDateTime] = useState(new Date().toISOString()); // Huidige datum en tijd als standaard
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0 }); // Standaard locatie

  const [sightings, setSightings] = useState<Sighting[]>([]);

  useEffect(() => {
    loadSightings();
  }, []);

  const loadSightings = async () => {
    try {
      const storedSightings = await AsyncStorage.getItem("sightings");
      if (storedSightings) {
        setSightings(JSON.parse(storedSightings));
      }
    } catch (error) {
      console.error("Fout bij laden:", error);
    }
  };

  const saveSightings = async (newSightings: Sighting[]) => {
    try {
      await AsyncStorage.setItem("sightings", JSON.stringify(newSightings));
      setSightings(newSightings);
    } catch (error) {
      console.error("Fout bij opslaan:", error);
    }
  };

  const handleSubmit = async () => {
    if (!witnessName || !description || !contact || !location) {
      alert("Vul alle velden in!");
      return;
    }

    const newSighting: Sighting = {
      witnessName,
      description,
      status,
      dateTime,
      contact,
      location,
    };

    try {
      // API-aanroep om sighting te sturen naar de server
      await axios.post("https://your-api-endpoint.com/sightings", newSighting);

      // Voeg de sighting toe aan de lijst en sla deze op in AsyncStorage
      const updatedSightings = [...sightings, newSighting];
      saveSightings(updatedSightings);

      // Voeg marker toe aan kaart via callback
      onAddSighting(newSighting);

      // Reset de form
      setWitnessName("");
      setDescription("");
      setContact("");
      setLocation({ lat: 0, lng: 0 });
    } catch (error) {
      console.error("Fout bij toevoegen van sighting:", error);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Voeg een UFO-sighting toe:</Text>

      <TextInput
        value={witnessName}
        onChangeText={setWitnessName}
        placeholder="Getuige Naam"
        style={styles.input}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Beschrijving"
        style={styles.input}
      />
      <TextInput
        value={contact}
        onChangeText={setContact}
        placeholder="Contact"
        style={styles.input}
      />
      <TextInput
        value={dateTime}
        onChangeText={setDateTime}
        placeholder="Datum en Tijd"
        style={styles.input}
      />
      <TextInput
        value={`${location.lat}, ${location.lng}`}
        onChangeText={(text) => {
          const [lat, lng] = text.split(",").map(Number);
          setLocation({ lat, lng });
        }}
        placeholder="Locatie (Lat, Lng)"
        style={styles.input}
      />

      <Button title="Opslaan" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
  },
});

export default SightingStorage;
