import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Dimensions, Text, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const API_KEY = 'API키 넣는 곳';

const icons = {};

export default function App() {
  const [city, setCity] = useState('Loading...');
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync(); //fore: 앱사용중, back: 앱사용안할떄도 -> 위치추적
    if (!granted) setOk(false);

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
    setCity(location[0].city);
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    response = await response.json();
    await setDays(
      response.list.filter((data) => {
        if (data.dt_txt.includes('00:00:00')) return data;
      })
    );
  };
  useEffect(() => {
    getWeather();
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar style='light' />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.weather}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator color='white' size='large' />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <Text style={styles.temp}>{day.dt_txt.slice(5, 10)}</Text>
              <Text style={styles.detail}>{parseFloat(day.main.temp).toFixed(1)}°C</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name='water-outline' size={38} color='white' />
                <Text style={styles.detail}>{day.main.humidity}%</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B76E0',
  },
  city: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  cityName: {
    color: 'white',
    fontSize: 58,
    fontWeight: '500',
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  temp: {
    fontSize: 88,
    color: 'white',
  },
  detail: {
    fontSize: 35,
    color: 'white',
  },
});
