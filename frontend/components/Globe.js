'use client';

import { useEffect, useState } from 'react';
import { Viewer, Entity } from 'resium';
import { Cartesian3, Color, Ion } from 'cesium';
import useStore from '../store/useStore';
import '@cesium/widgets/Source/widgets.css';

// Configure Cesium access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YzE3ZjVmZi1hZmRjLTRhODItOWY3ZS1kZGRlZTYzYWU0MjgiLCJpZCI6MTg2MzE0LCJpYXQiOjE3MDI4OTgwMzl9.8U7h5AiuDjGz3vVvFSqO_HKHfU_SjKPkc_HRKjHNZxY';

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
