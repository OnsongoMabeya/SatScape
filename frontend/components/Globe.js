'use client';

import { useEffect, useState } from 'react';
import { Viewer, Entity } from 'resium';
import { Cartesian3, Color, buildModuleUrl } from 'cesium';
import useStore from '../store/useStore';

// Configure Cesium to load assets from the correct path
buildModuleUrl.setBaseUrl('/static/cesium/');

export default function Globe() {
  const { userLocation, satellites, selectedSatellite } = useStore();
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (viewer && userLocation) {
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(
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
      onReady={handleReady}
    >
      {userLocation && (
        <Entity
          position={Cartesian3.fromDegrees(
            userLocation.lng,
            userLocation.lat,
            0
          )}
          point={{ pixelSize: 10, color: Color.YELLOW }}
        />
      )}
      {satellites?.map((satellite) => (
        <Entity
          key={satellite.satid}
          position={Cartesian3.fromDegrees(
            satellite.lng,
            satellite.lat,
            satellite.alt * 1000
          )}
          point={{
            pixelSize: 8,
            color: selectedSatellite?.satid === satellite.satid
              ? Color.RED
              : Color.WHITE
          }}
        />
      ))}
    </Viewer>
  );
}
