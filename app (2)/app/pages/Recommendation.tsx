import React, { useState } from "react";
import { ScrollView, View, Text, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";

const ip = "http://10.145.77.49:8003"; // Your backend IP

const soilTypes = ["Coastal Saline", "Alluvial", "Lateritic", "Red Sandy", "Black Cotton", "Loamy"];
const seasons = ["Rabi", "Summer", "Kharif"];
const previousCrops = ["Paddy", "Wheat", "Maize", "Cotton", "Sugarcane"];

export default function RecommendationScreen() {
  const [soilType, setSoilType] = useState<string>(soilTypes[0]);
  const [season, setSeason] = useState<string>(seasons[0]);
  const [previousCrop, setPreviousCrop] = useState<string>(previousCrops[0]);
  const [recommendedCrop, setRecommendedCrop] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRecommend = async () => {
    setIsLoading(true);
    setRecommendedCrop(null);

    try {
      const payload = { soil: soilType, season, previous_crop: previousCrop };

      const response = await fetch(`${ip}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.recommended_crop) {
        setRecommendedCrop(data.recommended_crop);
      } else {
        Alert.alert("Error", data.error || "Unknown issue occurred");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("Network Error", "Failed to fetch recommendation from server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crop Recommendation</Text>

      <Text style={styles.label}>Soil Type:</Text>
      <Picker
        selectedValue={soilType}
        onValueChange={setSoilType}
        style={styles.picker}
      >
        {soilTypes.map((s) => (
          <Picker.Item key={s} label={s} value={s} />
        ))}
      </Picker>

      <Text style={styles.label}>Season:</Text>
      <Picker
        selectedValue={season}
        onValueChange={setSeason}
        style={styles.picker}
      >
        {seasons.map((s) => (
          <Picker.Item key={s} label={s} value={s} />
        ))}
      </Picker>

      <Text style={styles.label}>Previous Crop:</Text>
      <Picker
        selectedValue={previousCrop}
        onValueChange={setPreviousCrop}
        style={styles.picker}
      >
        {previousCrops.map((c) => (
          <Picker.Item key={c} label={c} value={c} />
        ))}
      </Picker>

      <View style={{ marginVertical: 15 }} />

      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Button title="Get Recommendation" onPress={handleRecommend} color="#4CAF50" />
      )}

      {recommendedCrop && (
        <Text style={styles.result}>Recommended Crop: {recommendedCrop}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, backgroundColor: "#121212" },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, color: "#ddd", marginTop: 10 },
  picker: { height: 55, width: "100%", backgroundColor: "#1e1e1e", color: "#fff", marginVertical: 10 },
  result: { fontSize: 18, color: "#4CAF50", marginTop: 20, textAlign: "center" },
});
