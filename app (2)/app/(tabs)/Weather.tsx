import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";

interface WeatherData {
  name: string;
  sys: { country: string };
  main: { temp: number; humidity: number };
  weather: { description: string }[];
  wind: { speed: number };
}

export default function WeatherGPS() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const API_KEY = "e020baffc28f3d59ace35a51bf15a54b"; // Replace with your OpenWeatherMap API key

  const getLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Enable location to get weather for your area");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      fetchWeather(loc.coords.latitude, loc.coords.longitude);
    } catch {
      Alert.alert("Error", "Could not get location");
      setLoading(false);
    }
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod !== 200) {
        Alert.alert("Error", "Could not fetch weather");
        setWeather(null);
      } else {
        setWeather(data);
      }
    } catch {
      Alert.alert("Error", "Something went wrong while fetching weather");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDescription = (data: WeatherData) => {
    // Temperature
    let tempDesc = "";
    if (data.main.temp < 5) tempDesc = "❄ Very cold, only hardy crops like wheat or barley will thrive.";
    else if (data.main.temp < 15) tempDesc = "🧊 Cool temperature, good for cool-season crops.";
    else if (data.main.temp < 25) tempDesc = "🌱 Mild temperature, ideal for most crops.";
    else if (data.main.temp < 35) tempDesc = "☀ Warm temperature, suitable for heat-loving crops like maize and millet.";
    else tempDesc = "🔥 Hot weather, be careful with heat-sensitive crops and ensure irrigation.";

    // Weather condition
    let weatherDesc = "";
    const desc = data.weather[0].description.toLowerCase();
    if (desc.includes("clear")) weatherDesc = "☀ Clear skies, perfect for outdoor farming.";
    else if (desc.includes("few clouds") || desc.includes("scattered clouds")) weatherDesc = "⛅ Partly cloudy, moderate sunlight.";
    else if (desc.includes("rain") || desc.includes("shower")) weatherDesc = "🌧 Rain expected, good for soil moisture.";
    else if (desc.includes("thunderstorm")) weatherDesc = "⚡ Thunderstorm conditions, avoid outdoor activities.";
    else if (desc.includes("snow")) weatherDesc = "❄ Snowy conditions, suitable only for cold-resistant crops.";
    else weatherDesc = "🌤 Moderate weather, adjust farming activities accordingly.";

    // Humidity
    let humidityDesc = "";
    if (data.main.humidity < 20) humidityDesc = "💦 Very low humidity, irrigation strongly recommended.";
    else if (data.main.humidity < 40) humidityDesc = "💧 Low humidity, monitor soil moisture.";
    else if (data.main.humidity < 60) humidityDesc = "🌿 Moderate humidity, ideal for most crops.";
    else if (data.main.humidity < 80) humidityDesc = "🌫 High humidity, risk of fungal diseases, monitor crops.";
    else humidityDesc = "☔ Very high humidity, high risk of diseases, consider protective measures.";

    // Wind speed
    let windDesc = "";
    const wind = data.wind.speed;
    if (wind < 1) windDesc = "🍃 Calm winds, perfect for spraying fertilizers.";
    else if (wind < 3) windDesc = "🌬 Light winds, generally safe for farming activities.";
    else if (wind < 6) windDesc = "💨 Moderate winds, caution with lightweight crops.";
    else if (wind < 10) windDesc = "🌪 Strong winds, secure fragile crops and equipment.";
    else windDesc = "🌀 Very strong winds, dangerous for outdoor farming.";

    return { tempDesc, weatherDesc, humidityDesc, windDesc };
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌤 Weather at Your Location</Text>

      <View style={styles.buttonWrapper}>
        <Button title="Get Weather" onPress={getLocation} color="#4CAF50" />
      </View>

      {loading && <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />}

      {weather && (
        <View style={styles.weatherCard}>
          <Text style={styles.city}>{weather.name}, {weather.sys.country}</Text>

          {(() => {
            const desc = getWeatherDescription(weather);
            return (
              <>
                {/* Temperature */}
                <View style={styles.infoRow}>
                  <Ionicons name="thermometer" size={22} color="#FF7043" style={styles.icon} />
                  <Text style={styles.infoLabel}>Temperature:  </Text>
                  <Text style={[styles.infoValue, { color: "#FF7043" }]}>{weather.main.temp}°C</Text>
                </View>
                <Text style={styles.descText}>{desc.tempDesc}</Text>

                {/* Weather */}
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="weather-partly-cloudy" size={22} color="#acb70aff" style={styles.icon} />
                  <Text style={styles.infoLabel}>Weather:  </Text>
                  <Text style={[styles.infoValue, { color: "#acb70aff" }]}>{weather.weather[0].description}</Text>
                </View>
                <Text style={styles.descText}>{desc.weatherDesc}</Text>

                {/* Humidity */}
                <View style={styles.infoRow}>
                  <FontAwesome5 name="tint" size={20} color="#539abaff" style={styles.icon} />
                  <Text style={styles.infoLabel}>Humidity:  </Text>
                  <Text style={[styles.infoValue, { color: "#539abaff" }]}>{weather.main.humidity}%</Text>
                </View>
                <Text style={styles.descText}>{desc.humidityDesc}</Text>

                {/* Wind */}
                <View style={styles.infoRow}>
                  <Feather name="wind" size={22} color="#615265ff" style={styles.icon} />
                  <Text style={styles.infoLabel}>Wind Speed:  </Text>
                  <Text style={[styles.infoValue, { color: "#615265ff" }]}>{weather.wind.speed} m/s</Text>
                </View>
                <Text style={styles.descText}>{desc.windDesc}</Text>
              </>
            );
          })()}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
    backgroundColor: "#121212",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonWrapper: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  weatherCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  city: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    
  },
  icon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#ccc",
    fontWeight: "500",
    flex: 1,
    
  },
  infoValue: {
    fontSize: 16,
  fontWeight: "bold",
  textAlign: "right",
  },
  descText: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 12,
    paddingLeft: 32,
    padding:10,
  },
});
