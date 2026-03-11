import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Type-safe icon names for MaterialCommunityIcons
type FeatureIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type Feature = {
  title: string;
  description: string;
  icon: FeatureIconName;
  color: string;
};

export default function HomeScreen() {
  const router = useRouter();

  const features: Feature[] = [
    {
      title: 'Yield Prediction',
      description:
        'Predict your crop yield based on soil type, weather conditions, and farming practices.',
      icon: 'calculator-variant',
      color: '#4CAF50',
    },
    {
      title: 'Crop Suggestion',
      description:
        'Get personalized crop suggestions based on soil quality, climate, and season.',
      icon: 'leaf',
      color: '#dbf321ff',
    },
    {
      title: 'Fertilizer Recommendation',
      description:
        'Receive expert fertilizer advice tailored to your soil’s nutrients.',
      icon: 'bag-personal',
      color: '#FF9800',
    },
    {
      title: 'Pest Control',
      description:
        'Protect your crops with safe and effective pest control solutions.',
      icon: 'bug',
      color: '#F44336',
    },
    {
      title: 'Weather Info',
      description:
        'Check the weather at your location to plan your farming activities.',
      icon: 'weather-partly-cloudy',
      color: '#2196F3',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>
        🌱 <Text style={styles.Gree}>Crop</Text> Yield Predictor
      </Text>
      <Text style={styles.subtitle}>
        Welcome! Predict your crop yield and get fertilizer recommendations.
      </Text>

      {/* Predict Button */}
      <View style={styles.buttonWrapper}>
        <Button
          title="Predict Crop Yield"
          color="#4CAF50"
          onPress={() => router.push('/Yield')}
        />
      </View>

      {/* Features Section */}
      <Text style={styles.featureHeader}>App Features</Text>
      {features.map((feature, index) => (
        <View
          key={index}
          style={[styles.featureCard, { borderLeftColor: feature.color }]}
        >
          <MaterialCommunityIcons
            name={feature.icon}
            size={28}
            color={feature.color}
            style={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        </View>
      ))}

      {/* Footer */}
      <Text style={styles.footer}>Grow smarter, farm better, harvest more.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 40,
    backgroundColor: '#121212',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonWrapper: {
    width: '80%',
    marginVertical: 20,
  },
  Gree: {
    color: 'green',
  },
  featureHeader: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    borderLeftWidth: 5,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: '#ccc',
  },
  footer: {
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
    fontSize: 14,
  },
});
