import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import { custom_map_style } from '@/constants/CustomMapStyle';
import { hotelData } from '@/constants/hotelsData';

const Maps = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [visibleRegion, setVisibleRegion] = useState(null);
    const mapRef = useRef(null);

    const handleMarkerPress = (latitude, longitude) => {
        mapRef.current.animateToRegion(
            {
                latitude,
                longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            },
            1000 // Duration of animation in ms
        );
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                setLocation(location);
            } catch (error) {
                setErrorMsg('Failed to get location');
            }
        })();
    }, []);

    const filteredHotels = useMemo(() => {
        if (!visibleRegion) return [];
        return hotelData.filter(hotel =>
            hotel.latitude >= visibleRegion.latitude - visibleRegion.latitudeDelta / 2 &&
            hotel.latitude <= visibleRegion.latitude + visibleRegion.latitudeDelta / 2 &&
            hotel.longitude >= visibleRegion.longitude - visibleRegion.longitudeDelta / 2 &&
            hotel.longitude <= visibleRegion.longitude + visibleRegion.longitudeDelta / 2
        );
    }, [visibleRegion]);

    const renderMarkers = () => {
        return filteredHotels.map((item, index) => (
            <Marker
                key={index}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                tracksViewChanges={false}
                onPress={() => handleMarkerPress(item.latitude, item.longitude)}
            >
                <View style={styles.markerView}>
                    <Text style={styles.markerText}>{"$" + item.rates_from}</Text>
                </View>
            </Marker>
        ));
    };

    if (errorMsg) {
        return (
            <View style={styles.container}>
                <Text>{errorMsg}</Text>
            </View>
        );
    }

    if (!location) {
        return (
            <View style={styles.container}>
                <Text>Waiting for location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 15,
                    longitudeDelta: 15,
                }}
                customMapStyle={custom_map_style}
                onRegionChangeComplete={setVisibleRegion}
            >
                {renderMarkers()}
            </MapView>

            <ListingItems hotels={filteredHotels} />
        </View>
    );
};

const ListingItems = ({ hotels }) => {
    const renderItem = ({ item }) => (
        <View style={styles.listingItem}>
            <Image 
                source={{ uri: item.photo1 }} 
                style={styles.listingImage}
            />
            <Text style={styles.listingName}>{item.name}</Text>
            <Text style={styles.listingPrice}>{item.hotel_name}</Text>
        </View>
    );

    return (
        <View style={styles.listingsItemsContainer}>
            <FlatList
                data={hotels}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerView: {
        backgroundColor: '#C1292E',
        borderRadius: 10,
        elevation: 5,
        padding: 5,
    },
    markerText: {
        color: '#fff',
    },
    listingsItemsContainer: {
        height: 150,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 20,
        left: 10,
        right: 10,
        elevation: 5,
        borderRadius: 15,
        padding: 10,
    },
    listingItem: {
        width: 120,
        marginRight: 10,
    },
    listingImage: {
        width: '100%',
        height: 80,
        borderRadius: 10,
    },
    listingName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
    },
    listingPrice: {
        fontSize: 12,
        color: '#C1292E',
    },
});

export default Maps;