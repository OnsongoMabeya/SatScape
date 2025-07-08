'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Dynamically import Resium components with SSR disabled
const ResiumComponents = dynamic(
  () => 
    import('resium').then((mod) => {
      if (typeof window !== 'undefined') {
        const Cesium = require('cesium');
        window.CESIUM_BASE_URL = '/cesium';
      }
      return {
        Viewer: mod.Viewer,
        Entity: mod.Entity
      };
    }),
  { ssr: false }
);

// Import Cesium only on client side
let Cesium;
if (typeof window !== 'undefined') {
  Cesium = require('cesium');
}

export default function Globe() {
  const [viewer, setViewer] = useState(null);
  const { 
    satellites, 
    satellitePositions, 
    selectedSatellite, 
    setSelectedSatellite, 
    userLocation,
    setUserLocation 
  } = useStore();

  // Handle map click events
  const handleMapClick = (movement) => {
    if (!viewer) return;

    // Get the clicked entity
    const pickedObject = viewer.scene.pick(movement.position);
    if (Cesium?.defined(pickedObject)) {
      const entity = pickedObject.id;
      const satId = entity?.id;
      const satellite = satellites?.find(s => s.satid === satId);
      if (satellite) {
        setSelectedSatellite(satellite);
      }
    } else {
      setSelectedSatellite(null);
    }
  };

  // Configure Cesium Ion token
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN) {
      console.warn('Cesium Ion token not found in environment variables');
      return;
    }
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
  }, []);

  // Get user location and initialize satellites
  useEffect(() => {
    console.log('Getting user location...');
    const defaultLocation = { lat: -1.2921, lng: 36.8219 }; // Nairobi as default

    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got user position:', position.coords);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation(defaultLocation);
        }
      );
    } else {
      console.log('Geolocation not available, using default location');
      setUserLocation(defaultLocation);
    }
  }, [setUserLocation]);

  // Update satellite positions periodically
  useEffect(() => {
    if (!satellites?.length) return;

    // Initial fetch of positions
    const fetchPositions = () => {
      satellites.forEach((satellite) => {
        if (userLocation) {
          useStore.getState().fetchSatellitePosition(satellite.satid);
        }
      });
    };

    fetchPositions();

    // Update positions every 10 seconds
    const interval = setInterval(fetchPositions, 10000);

    return () => clearInterval(interval);
  }, [satellites, userLocation]);

  // Initialize viewer settings and handle camera position
  useEffect(() => {
    if (!viewer) return;

    // Enable lighting and configure globe
    viewer.scene.globe.enableLighting = true;
    viewer.scene.fog.enabled = false;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.tweening = true;

    // Set camera position based on user location or default view
    if (userLocation) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          userLocation.lng,
          userLocation.lat,
          1000000
        ),
        duration: 2
      });
    } else {
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000)
      });
    }
  }, [viewer, userLocation]);

  if (!Cesium) return null;

  return (
    <ResiumComponents.Viewer
      full
      ref={(e) => {
        if (e?.cesiumElement) {
          setViewer(e.cesiumElement);
        }
      }}
      timeline={false}
      animation={false}
      baseLayerPicker={false}
      navigationHelpButton={false}
      homeButton={false}
      geocoder={false}
      onClick={handleMapClick}
      scene3DOnly={true}
    >
      {userLocation && (
        <ResiumComponents.Entity
          position={Cesium.Cartesian3.fromDegrees(
            userLocation.lng,
            userLocation.lat,
            0
          )}
          point={{
            pixelSize: 10,
            color: Cesium.Color.BLUE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
          }}
          label={{
            text: 'Your Location',
            font: '14px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10)
          }}
        />
      )}

      {satellites?.map((satellite) => {
        const position = satellitePositions?.[satellite.satid];
        if (!position) return null;

        const isSelected = selectedSatellite?.satid === satellite.satid;
        return (
          <ResiumComponents.Entity
            key={satellite.satid}
            id={satellite.satid}
            position={Cesium.Cartesian3.fromDegrees(
              position.satlongitude,
              position.satlatitude,
              position.sataltitude * 1000
            )}
            point={{
              pixelSize: isSelected ? 12 : 8,
              color: isSelected ? Cesium.Color.YELLOW : Cesium.Color.RED,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.8)
            }}
            label={{
              text: satellite.satname,
              show: isSelected,
              font: '14px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -10),
              scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.8)
            }}
            path={{
              show: isSelected,
              resolution: 1,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.2,
                color: Cesium.Color.YELLOW
              }),
              width: 2
            }}
          />
        );
      })}
    </ResiumComponents.Viewer>
  );
}
