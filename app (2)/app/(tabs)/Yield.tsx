import React, { useState } from "react";
import { ScrollView, Text, View, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

const ip = "http://10.145.77.49:8000"; // 🔹 Replace with your machine IP

/* -------------------- Reusable Picker Component -------------------- */
interface FormPickerProps {
  label: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: string[];
}

const FormPicker: React.FC<FormPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
}) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Picker
      selectedValue={selectedValue}
      onValueChange={(value) => onValueChange(String(value))}
      style={styles.picker}
      dropdownIconColor="#fff"
    >
      {options.map((opt) => (
        <Picker.Item key={opt} label={opt} value={opt} />
      ))}
    </Picker>
  </>
);

/* -------------------- Main Screen -------------------- */
export default function YieldScreen() {
  const router = useRouter();
  const userid = "12345";

  // 🔹 Options
  const districts = [
    "Angul", "Balangir", "Baleswar", "Bargarh", "Bhadrak", "Boudh",
    "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam",
    "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal",
  ];
  const seasons = ["Rabi", "Summer", "Kharif"];
  const crops = [
    "Arhar", "Banana", "Bajra", "Beans", "Black gram", "Brinjal",
    "Cabbage", "Cashew", "Cauliflower", "Chili", "Citrus", "Coffee",
    "Coconut", "Cotton", "Cowpea", "Ginger", "Green gram", "Groundnut",
    "Guava", "Horse gram", "Jowar", "Lentil", "Litchi", "Maize", "Mango",
    "Mustard", "Niger", "Okra", "Paddy", "Papaya", "Pumpkin", "Ragi",
    "Sesame", "Sugarcane", "Sunflower", "Tea", "Tomato", "Turmeric",
  ];
  const irrigationOptions = ["0", "1"];
  const soilTypes = [
    "Coastal Saline", "Alluvial", "Lateritic", "Red Sandy", "Black Cotton",
  ];

  // 🔹 State
  const [district, setDistrict] = useState("Balangir");
  const [season, setSeason] = useState("Summer");
  const [next_crop, setNextCrop] = useState("Cotton");
  const [irrigation_availability, setIrrigation] = useState("0");
  const [soil_type, setSoilType] = useState("Lateritic");

  const [yieldResult, setYieldResult] = useState<any>(null);
  const [fertilizerData, setFertilizerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  /* -------------------- API: Yield Prediction -------------------- */
  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const inputData = {
        district,
        season,
        next_crop,
        irrigation_availability: Number(irrigation_availability),
        soil_type,
      };

      console.log("📡 Sending to backend:", inputData);

      const response = await fetch(`${ip}/users/${userid}/yield`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) throw new Error("Failed to fetch yield");

      const data = await response.json();
      console.log("✅ Backend response:", data);

      setYieldResult(data);
    } catch (err) {
      console.error("❌ Error fetching yield:", err);
      alert("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- API: Fertilizer Recommendation -------------------- */
  const fetchFertilizer = async () => {
    if (!yieldResult) {
      alert("Please get yield prediction first!");
      return;
    }

    setIsLoading(true);
    try {
      const inputData = {
        district,
        season,
        next_crop,
        irrigation_availability: Number(irrigation_availability),
        soil_type,
      };

      console.log("📡 Fetching fertilizer:", inputData);

      const response = await fetch(`${ip}/users/${userid}/fertilizer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });

      if (!response.ok) throw new Error("Failed to fetch fertilizer");

      const data = await response.json();
      console.log("✅ Fertilizer data:", data);

      setFertilizerData(data);
    } catch (err) {
      console.error("❌ Error fetching fertilizer:", err);
      alert("Error fetching fertilizer data");
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌱 Crop Yield Prediction</Text>

      {/* Form Pickers */}
      <FormPicker label="District:" selectedValue={district} onValueChange={setDistrict} options={districts} />
      <FormPicker label="Season:" selectedValue={season} onValueChange={setSeason} options={seasons} />
      <FormPicker label="Crop:" selectedValue={next_crop} onValueChange={setNextCrop} options={crops} />
      <FormPicker label="Irrigation Availability:" selectedValue={irrigation_availability} onValueChange={setIrrigation} options={irrigationOptions} />
      <FormPicker label="Soil Type:" selectedValue={soil_type} onValueChange={setSoilType} options={soilTypes} />

      {/* Buttons */}
      <View style={styles.buttonWrapper}>
        <Button
          title={isLoading ? "Predicting..." : "Predict Yield"}
          onPress={handlePredict}
          color="#4CAF50"
          disabled={isLoading}
        />
        <View style={{ marginVertical: 5 }} />
        <Button
          title="Get Fertilizer Recommendation"
          onPress={fetchFertilizer}
          color="#2196F3"
        />
      </View>
<View style={{ marginVertical: 5 }} />
      <Button 
  title="Go to Pest Control"
  onPress={() => router.push("../pages/PlantDiseaseScreen")}
  color="#FF9800"
/>


      {/* Results */}
      {yieldResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>🌾 Min Yield: {yieldResult.min_yield} t/ha</Text>
          <Text style={styles.resultText}>🌾 Max Yield: {yieldResult.max_yield} t/ha</Text>
          <Text style={styles.resultText}>🌾 Avg Yield: {yieldResult.avg_yield} t/ha</Text>
        </View>
      )}

      {fertilizerData && (
        <View style={styles.fertilizerBox}>
          <Text style={styles.boxTitle}>💧 Recommended Fertilizers</Text>
          <Text style={styles.boxText}>Nitrogen: {fertilizerData.average_recommended_doses.N_dose} kg/ha</Text>
          <Text style={styles.boxText}>Phosphorus: {fertilizerData.average_recommended_doses.P2O5_dose} kg/ha</Text>
          <Text style={styles.boxText}>Potassium: {fertilizerData.average_recommended_doses.K2O_dose} kg/ha</Text>
          <Text style={styles.boxText}>Sulfur: {fertilizerData.average_recommended_doses.S_dose} kg/ha</Text>
          <Text style={styles.boxText}>Zinc: {fertilizerData.average_recommended_doses.Zn_dose} kg/ha</Text>
          <Text style={styles.boxText}>Boron: {fertilizerData.average_recommended_doses.B_dose} kg/ha</Text>
        </View>
      )}
    </ScrollView>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 40,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    color: "#ddd",
  },
  picker: {
    height: 55,
    width: "100%",
    backgroundColor: "#1e1e1e",
    marginVertical: 10,
    color: "#fff",
  },
  buttonWrapper: {
    marginTop: 20,
  },
  resultBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  resultText: {
    fontSize: 16,
    color: "#4CAF50",
    textAlign: "center",
  },
  fertilizerBox: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 10,
    textAlign: "center",
  },
  boxText: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 2,
  },
});
