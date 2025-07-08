'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import useStore from '../store/useStore';

// Dynamically import Cesium components with no SSR
const CesiumViewer = dynamic(
  () => import('resium').then(mod => {
    // Configure Cesium after import
    const Cesium = require('cesium');
    window.CESIUM_BASE_URL = '/cesium';
    return mod.Viewer;
  }),
  { ssr: false }
);

const CesiumEntity = dynamic(
  () => import('resium').then(mod => mod.Entity),
  { ssr: false }
);

// Import Cesium styles
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Import Cesium for types
const Cesium = typeof window !== 'undefined' ? require('cesium') : null;

export default function Globe() {
  // Configure Cesium Ion token
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN) {
      console.warn('Cesium Ion token not found in environment variables');
      return;
    }
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
  }, []);

  const { userLocation, satellites, satellitePositions, selectedSatellite } = useStore();
  const [viewer, setViewer] = useState(null);

  // Initialize viewer settings
  useEffect(() => {
    if (!viewer) return;

    console.log('Initializing viewer settings');
    
    // Enable lighting and configure globe
    viewer.scene.globe.enableLighting = true;
    viewer.scene.fog.enabled = false;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;

    // Set initial camera position
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000)
    });

    // Enable smooth camera animations
    viewer.scene.tweening = true;
  }, [viewer]);

  // Get user location and initialize satellites
  useEffect(() => {
    console.log('Getting user location...');
    const defaultLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi as default

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got user position:', position.coords);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          useStore.getState().setUserLocation(location);
        },
        (error) => {
          console.error('Error getting location:', {
            code: error.code,
            message: error.message
          });
          // Handle specific geolocation errors
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log('Location permission denied by user');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('Location information unavailable');
              break;
            case error.TIMEOUT:
              console.log('Location request timed out');
              break;
            default:
              console.log('Unknown error occurred while getting location');
          }
          console.log('Using default location (Nairobi)');
          useStore.getState().setUserLocation(defaultLocation);
        }
      );
    } else {
      console.warn('Geolocation not supported');
      console.log('Using default location (Nairobi)');
      useStore.getState().setUserLocation(defaultLocation);
    }
  }, []);

  // Update satellite positions periodically
  useEffect(() => {
    if (!satellites?.length) return;

    // Initial fetch of positions
    useStore.getState().fetchPositionsInBatches(satellites);

    // Update positions every 10 seconds
    const interval = setInterval(() => {
      useStore.getState().fetchPositionsInBatches(satellites);
    }, 10000);

    return () => clearInterval(interval);
  }, [satellites]);
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

  if (!Cesium) return null;

  return (
    <CesiumViewer
      full
      ref={(e) => {
        if (e?.cesiumElement) {
          setViewer(e.cesiumElement);
        }
      }}
      timeline={false}
      animation={false}
      baseLayerPicker={true}
      navigationHelpButton={false}
      sceneModePicker={true}
      homeButton={true}
      geocoder={false}
      scene3DOnly={false}
    >
      {userLocation && (
        <CesiumEntity
          position={Cesium.Cartesian3.fromDegrees(
            userLocation.lng,
            userLocation.lat,
            0
          )}
          point={{ pixelSize: 10, color: Cesium.Color.YELLOW }}
        />
      )}
      {satellites?.map((satellite) => {
        console.log('Rendering satellite:', satellite.satid);
        const satPosition = satellitePositions[satellite.satid];
        if (!satPosition) {
          console.log('No position data for satellite:', satellite.satid);
          return null;
        }
        
        return (
          <CesiumEntity
            key={satellite.satid}
            position={Cesium.Cartesian3.fromDegrees(
              satPosition.satlongitude,
              satPosition.satlatitude,
              satPosition.sataltitude * 1000
            )}
            point={{
              pixelSize: 12,
              color: selectedSatellite?.satid === satellite.satid
                ? Cesium.Color.YELLOW
                : Cesium.Color.CYAN,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            }}
            label={{
              text: satellite.satname,
              font: '12px Roboto',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -10)
            }}
            path={{
              resolution: 1,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.2,
                color: selectedSatellite?.satid === satellite.satid 
                  ? Cesium.Color.YELLOW 
                  : Cesium.Color.CYAN
              }),
              width: 2
            }}
          />
        );
      })}
    </CesiumViewer>
  );
}
