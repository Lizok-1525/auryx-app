import React from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

export default function NativeMap({ initialRegion, customMapStyle, markerCoordinate, markerColor }: any) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
      customMapStyle={customMapStyle}
    >
      <Marker
        coordinate={markerCoordinate}
        title="Repartidor"
        pinColor={markerColor}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' }
});
