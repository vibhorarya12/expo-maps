import { View, Text, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const Initial_Loc = {
    latitude:37.33,
    longitude : -122,
    latitudeDelta : 2,
    longitudeDelta :2,
}
const Maps = () => {

    return (<View style={styles.container}>
       <MapView style={StyleSheet.absoluteFill}  provider={PROVIDER_GOOGLE}
        showsUserLocation
       initialRegion={Initial_Loc}
       />
    </View>)

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
       
    }
})


export default Maps;