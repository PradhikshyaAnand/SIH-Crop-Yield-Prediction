import React, { useState } from "react";
import { ScrollView, Text, View, Button, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";

const ip = "http://10.145.77.49:8000"; // Replace with your backend IP
const userId = 1; // 🔹 Replace with actual logged-in user ID if available

// -------------------- Reusable Picker Component --------------------
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

// -------------------- Feedback Screen --------------------
export default function FeedbackScreen() {
  const [district, setDistrict] = useState("Balangir");
  const [season, setSeason] = useState("Summer");
  const [nextCrop, setNextCrop] = useState("Cotton");
  const [soilType, setSoilType] = useState("Lateritic");
  const [irrigation, setIrrigation] = useState("0");
  const [upDown, setUpDown] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const soilTypes = ["Coastal Saline", "Alluvial", "Lateritic", "Red Sandy", "Black Cotton"];

  // -------------------- Submit Feedback --------------------
  const handleSubmit = async () => {
    if (upDown === null) {
      Alert.alert("Missing", "Please select Yes or No for yield increase");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      district,
      season,
      next_crop: nextCrop,
      soil_type: soilType,
      irrigation_availability: Number(irrigation),
      up_down: upDown, // 1 = Yes, 0 = No
    };

    try {
      const response = await fetch(`${ip}/users/${userId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const textResponse = await response.text(); // get raw response first
      console.log("Raw response:", textResponse);

      if (!response.ok) throw new Error(textResponse);

      const data = JSON.parse(textResponse);
      console.log("Feedback saved:", data);

      Alert.alert("✅ Success", "Feedback submitted successfully!");
      setUpDown(null);
    } catch (err: any) {
      console.error("Submit error:", err);
      Alert.alert("❌ Error", err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📝 Yield Feedback</Text>

      <FormPicker label="District:" selectedValue={district} onValueChange={setDistrict} options={districts} />
      <FormPicker label="Season:" selectedValue={season} onValueChange={setSeason} options={seasons} />
      <FormPicker label="Yielded Crop:" selectedValue={nextCrop} onValueChange={setNextCrop} options={crops} />
      <FormPicker label="Soil Type:" selectedValue={soilType} onValueChange={setSoilType} options={soilTypes} />
      <FormPicker label="Irrigation:" selectedValue={irrigation} onValueChange={setIrrigation} options={irrigationOptions} />

      <Text style={[styles.label, { marginTop: 20 }]}>Did the yield increase?</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
        <Button
          title="Yes"
          color={upDown === 1 ? "#40d245ff" : "#20b425ff"}
          onPress={() => setUpDown(1)}
        />
        <Button
          title="No"
          color={upDown === 0 ? "#914545ff" : "#da3d31ff"}
          onPress={() => setUpDown(0)}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Button
          title={isSubmitting ? "Submitting..." : "Submit Feedback"}
          onPress={handleSubmit}
          color="#2196F3"
          disabled={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 40, backgroundColor: "#121212" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#fff" },
  label: { fontSize: 16, color: "#ddd", marginVertical: 5 },
  picker: { height: 55, width: "100%", backgroundColor: "#1e1e1e", marginVertical: 10, color: "#fff" },
});
