import { useEffect, useRef } from 'react';
import { Viewer, Entity, CameraFlyTo } from 'resium';
import { Cartesian3, Color } from 'cesium';
import useStore from '@/store/useStore';

const Globe = () => {
  const viewerRef = useRef(null);
  const { userLocation, satellitesAbove, selectedSatellite } = useStore();

  useEffect(() => {
    if (viewerRef.current) {
      // Initialize viewer settings
      const viewer = viewerRef.current.cesiumElement;
      viewer.scene.globe.enableLighting = true;
    }
  }, []);

  return (
    <Viewer
      ref={viewerRef}
      full
      timeline={false}
      animation={false}
      baseLayerPicker={false}
    >
      {userLocation && (
        <Entity
          position={Cartesian3.fromDegrees(
            userLocation.longitude,
            userLocation.latitude,
            0
          )}
          point={{
            pixelSize: 10,
            color: Color.BLUE,
          }}
        />
      )}

      {satellitesAbove.map((satellite) => (
        <Entity
          key={satellite.satid}
          position={Cartesian3.fromDegrees(
            satellite.satlongitude,
            satellite.satlatitude,
            satellite.sataltitude * 1000
          )}
          point={{
            pixelSize: 8,
            color: selectedSatellite?.satid === satellite.satid
              ? Color.YELLOW
              : Color.RED,
          }}
        />
      ))}

      {selectedSatellite && (
        <CameraFlyTo
          destination={Cartesian3.fromDegrees(
            selectedSatellite.satlongitude,
            selectedSatellite.satlatitude,
            selectedSatellite.sataltitude * 1000 + 1000000
          )}
        />
      )}
    </Viewer>
  );
};

export default Globe;
