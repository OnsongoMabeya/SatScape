'use client';

import { useEffect, useState } from 'react';
import { Viewer, Entity } from 'resium';
import * as Cesium from 'cesium';
import useStore from '../store/useStore';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Configure Cesium
window.CESIUM_BASE_URL = '/cesium';

// Create Bing Maps imagery provider
const imageryProvider = new Cesium.BingMapsImageryProvider({
  url: 'https://dev.virtualearth.net',
  key: 'AuYN8ifR-YgbPqwxQ-Y1F4YHmqpBEECvvmCW4u-kyhgHkx1FpRZ_MNOBwIuxoI7k',
  mapStyle: Cesium.BingMapsStyle.AERIAL
});

export default function Globe() {
  const { userLocation, satellites, selectedSatellite } = useStore();
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (viewer && userLocation) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          userLocation.lng,
          userLocation.lat,
          1000000.0
        ),
      });
    }
  }, [viewer, userLocation]);

  const handleReady = (tileset) => {
    if (tileset && tileset.cesiumElement) {
      setViewer(tileset.cesiumElement);
    }
  };

  return (
    <Viewer
      full
      timeline={false}
      animation={false}
      baseLayerPicker={false}
      navigationHelpButton={false}
      sceneModePicker={false}
      homeButton={false}
      geocoder={false}
      scene3DOnly={true}
      imageryProvider={imageryProvider}
      onReady={handleReady}
    >
      {userLocation && (
        <Entity
          position={Cesium.Cartesian3.fromDegrees(
            userLocation.lng,
            userLocation.lat,
            0
          )}
          point={{ pixelSize: 10, color: Cesium.Color.YELLOW }}
        />
      )}
      {satellites?.map((satellite) => (
        <Entity
          key={satellite.satid}
          position={Cesium.Cartesian3.fromDegrees(
            satellite.lng,
            satellite.lat,
            satellite.alt * 1000
          )}
          point={{
            pixelSize: 8,
            color: selectedSatellite?.satid === satellite.satid
              ? Cesium.Color.RED
              : Cesium.Color.WHITE
          }}
        />
      ))}
    </Viewer>
  );
}
