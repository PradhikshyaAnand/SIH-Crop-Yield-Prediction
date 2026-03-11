import React, { useState } from "react";
import { View, Text, Button, Image, ActivityIndicator, ScrollView, Alert, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";

type SelectedFile = {
  uri: string;
  name: string;
  mimeType: string;
};

export default function PlantDiseaseScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPestControl, setShowPestControl] = useState(false);

  const BASE_URL = "http://10.145.77.49:8001";
  const router = useRouter();

  const pickImage = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const file: SelectedFile = {
          uri: asset.uri,
          name: asset.name ?? "photo.jpg",
          mimeType: asset.mimeType ?? "image/jpeg",
        };
        setImageUri(file.uri);
        setSelectedFile(file);
        setResult(null);
        setShowPestControl(false);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      Alert.alert("No image selected", "You can view default pest/disease control methods below.");
      return;
    }

    setLoading(true);
    setResult(null);
    setShowPestControl(false);

    try {
      const formData = new FormData();
      const fileUri = selectedFile.uri.startsWith("file://")
        ? selectedFile.uri
        : "file://" + selectedFile.uri;

      formData.append("photo", {
        uri: fileUri,
        name: selectedFile.name,
        type: selectedFile.mimeType,
      } as any);

      const response = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        setResult({
          diagnosis: "Unknown",
          confidence: 0.5,
          recommendation: "Could not get result from server. Try again later."
        });
        return;
      }

      const data = await response.json();
      setResult(data);

    } catch (error: any) {
      setResult({
        diagnosis: "Unknown",
        confidence: 0.5,
        recommendation: "Failed to connect to server. Using default values."
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePestControl = () => {
    setShowPestControl(!showPestControl);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Pick Image Button */}
      <Button title="🌿 Pick Plant Image" onPress={pickImage} color="#81c784" />

      {/* Display selected image and submit */}
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          <View style={styles.buttonContainer}>
            <Button title="🚀 Submit" onPress={uploadImage} color="#81c784" />
          </View>
        </>
      )}

      {/* Show default pest control toggle */}
      {!imageUri && (
        <View style={styles.buttonContainer}>
          <Button
            title={showPestControl ? "Hide Pest Control Methods 🔒" : "Show Default Pest Control Methods 🛠️"}
            onPress={togglePestControl}
            color="#66bb6a"
          />
        </View>
      )}

      {/* Loading indicator */}
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} color="#81c784" />}

      {/* Prediction Result */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>🌱 Diagnosis: {result.diagnosis}</Text>
          <Text style={styles.resultConfidence}>📊 Confidence: {result.confidence}</Text>
          <Text style={styles.resultText}>💡 {result.recommendation}</Text>
        </View>
      )}

      {/* Default Pest Control Suggestions */}
      {showPestControl && !imageUri && (
        <View style={styles.pestCard}>
          <Text style={styles.pestTitle}>🛡️ Disease Control Suggestions:</Text>

          <View style={styles.diseaseCard}>
            <Text style={styles.diseaseName}>🌸 Powdery Mildew:</Text>
            <Text style={styles.diseaseText}>• 🗑 Remove and destroy infected leaves</Text>
            <Text style={styles.diseaseText}>• 🌬 Ensure proper spacing and air circulation</Text>
            <Text style={styles.diseaseText}>• 🧴 Apply sulfur-based fungicides or neem oil sprays</Text>
            <Text style={styles.diseaseText}>• 💧 Avoid overhead watering</Text>
            <Text style={styles.diseaseText}>• ✂️ Prune dense foliage to reduce humidity</Text>
          </View>

          <View style={styles.diseaseCard}>
            <Text style={styles.diseaseName}>🍃 Leaf Spot:</Text>
            <Text style={styles.diseaseText}>• 🗑 Remove and destroy infected leaves</Text>
            <Text style={styles.diseaseText}>• 💧 Water at the base early in the day</Text>
            <Text style={styles.diseaseText}>• 🧴 Apply copper-based fungicides or neem sprays</Text>
            <Text style={styles.diseaseText}>• 🌱 Maintain good soil drainage</Text>
            <Text style={styles.diseaseText}>• ↔️ Avoid overcrowding plants</Text>
          </View>

          <View style={styles.diseaseCard}>
            <Text style={styles.diseaseName}>🦠 Rust:</Text>
            <Text style={styles.diseaseText}>• 🗑 Remove and destroy infected plant debris</Text>
            <Text style={styles.diseaseText}>• 🧴 Apply sulfur or copper-based fungicides</Text>
            <Text style={styles.diseaseText}>• 🌿 Plant resistant varieties if available</Text>
            <Text style={styles.diseaseText}>• ⚖️ Avoid excessive nitrogen fertilization</Text>
            <Text style={styles.diseaseText}>• 🌬 Ensure proper spacing for airflow</Text>
          </View>

          <View style={styles.diseaseCard}>
            <Text style={styles.diseaseName}>🔥 Blight:</Text>
            <Text style={styles.diseaseText}>• 🗑 Remove and destroy infected leaves, stems, and fruits</Text>
            <Text style={styles.diseaseText}>• 🧴 Apply fungicides regularly</Text>
            <Text style={styles.diseaseText}>• ⚖️ Avoid excessive nitrogen fertilization</Text>
            <Text style={styles.diseaseText}>• 🔄 Rotate crops to prevent recurring infections</Text>
            <Text style={styles.diseaseText}>• 🧹 Maintain proper sanitation of tools and equipment</Text>
          </View>
        </View>
      )}

      {/* 🟢 Go to Recommendation Page Button at the Bottom */}
      <View style={{ marginTop: 30, marginBottom: 20 }}>
        <Button
          title="🌾 Go to Crop Recommendation"
          color="#FF9800"
          onPress={() => router.push("../pages/Recommendation")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  image: {
    width: "100%",
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonContainer: {
    marginTop: 10,
  },
  resultCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#81c784",
  },
  resultConfidence: {
    fontSize: 16,
    marginTop: 5,
    color: "#a5d6a7",
  },
  resultText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#e0e0e0",
  },
  pestCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  pestTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffeb3b",
  },
  diseaseCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#2c2c2c",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  diseaseName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#81c784",
    marginBottom: 5,
  },
  diseaseText: {
    fontSize: 14,
    marginLeft: 5,
    lineHeight: 20,
    color: "#e0e0e0",
  },
});
