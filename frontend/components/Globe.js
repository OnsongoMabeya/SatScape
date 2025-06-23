'use client';

import { useEffect, useState } from 'react';
import { Viewer, Entity } from 'resium';
import * as Cesium from 'cesium';
import useStore from '../store/useStore';
import { useState, useEffect } from 'react';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Configure Cesium
window.CESIUM_BASE_URL = '/cesium';

// Configure Cesium Ion token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0OWY4MmQyZi02ZjZhLTQyNDEtOGZhZC0wODQ4MTU3YjRmMzMiLCJpZCI6MTgzNDQzLCJpYXQiOjE3MDI5OTc1ODZ9.JBFHGqxQZjbf8oX2ZWqxlgwg5g7TF_AqWkv4vUgpYOk';

export default function Globe() {
  const { userLocation, satellites, selectedSatellite } = useStore();
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (viewer) {
      // Enable lighting based on sun/moon positions
      viewer.scene.globe.enableLighting = true;
      
      // Disable fog
      viewer.scene.fog.enabled = false;
      
      // Enable depth testing
      viewer.scene.globe.depthTestAgainstTerrain = true;
    }
  }, [viewer]);

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
      ref={(e) => {
        if (e?.cesiumElement) {
          setViewer(e.cesiumElement);
        }
      }}
      timeline={false}
      animation={false}
      baseLayerPicker={true}
      navigationHelpButton={false}
      sceneModePicker={false}
      homeButton={false}
      geocoder={false}
      scene3DOnly={true}
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
