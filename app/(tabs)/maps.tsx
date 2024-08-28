import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text , Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from 'expo-location';
import { custom_map_style } from '@/constants/CustomMapStyle';
import { hotelData } from '@/constants/hotelsData';
import hotel_img from '@/assets/images/hotel.png';
const Maps = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

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
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
               
                // region={{
                //     latitude: location.coords.latitude,
                //     longitude: location.coords.longitude,
                //     latitudeDelta: 0.0922,
                //     longitudeDelta: 0.0421,
                // }}
                customMapStyle={custom_map_style}

                
            >
               
                {hotelData.map((item, index)=><Marker  key={index} coordinate={{latitude: item.latitude,longitude: item.longitude}} >
                       {/* <Image style={{width:40, height:40}} source={hotel_img} /> */}
                      </Marker>
                    )}
            </MapView>

           

        </View>
    );
};








const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    markerViewBox:{
        width:100,
        height:50,
        backgroundColor:'grey',
        borderRadius:5
        
    }
});

export default Maps;
