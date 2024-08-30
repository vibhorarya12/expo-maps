import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import { custom_map_style } from '@/constants/CustomMapStyle';
import { hotelData } from '@/constants/hotelsData';
import * as Animatable from 'react-native-animatable';
const Maps = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [visibleRegion, setVisibleRegion] = useState(null);
    const mapRef = useRef(null);
    const [showHotelCard, setShowHotelCard] = useState(false);
    const [currentCard, SetCurrentCard] = useState({img:'', name:''});

    const handleMarkerPress = (latitude, longitude , hotelImg, hotelName) => {
        SetCurrentCard({img:hotelImg, name:hotelName})
        setShowHotelCard(true);
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
                onPress={() => handleMarkerPress(item.latitude, item.longitude, item.photo1, item.hotel_name)}
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

            {showHotelCard && <HotelCard setShowHotelCard={setShowHotelCard} item ={currentCard} />}
        </View>
    );
};


const HotelCard = ({ setShowHotelCard ,item}) => {


    return (<Animatable.View animation="slideInUp" direction="alternate" style={styles.listingsItemsContainer} >
        <TouchableOpacity onPress={() => setShowHotelCard(false)} style={styles.cancelBtn}>
            <Text style={{ fontSize: 20, color: '#fff' }}>X</Text>
        </TouchableOpacity>
        <Image
                source={{ uri: item.img }}
                style={styles.listingImage}
            />
            <Text style={styles.listingName}>{item.name}</Text>
    </Animatable.View>)
}












const ListingItems = ({ hotels, zoomIntoLocation }) => {
    const renderItem = ({ item }) => (

        <TouchableOpacity style={styles.listingItem} onPress={() => zoomIntoLocation(item.latitude, item.longitude)}>
            <Image
                source={{ uri: item.photo1 }}
                style={styles.listingImage}
            />
            <Text style={styles.listingName}>{item.hotel_name}</Text>
            <Text style={styles.listingDistance}>{'300 km'}</Text>
        </TouchableOpacity>
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
        height: 200,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 20,
        left: 10,
        right: 10,
        elevation: 5,
        borderRadius: 15,
        padding: 10,
        width: 'auto',

    },
    listingItem: {
        width: 120,
        marginRight: 10,

    },
    listingImage: {
        width: '100%',
        height: 120,
        borderRadius: 10,
    },
    listingName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
    },
    listingDistance: {
        fontSize: 12,
        color: '#C1292E',
    },
    cancelBtn: {
        backgroundColor: 'grey', width: 30,
        justifyContent: 'center', alignItems: 'center',
        borderRadius: 10,
        position:'absolute',
        right:5,
        top:2,
        opacity:0.7,
        zIndex:2
    }
});

export default Maps;