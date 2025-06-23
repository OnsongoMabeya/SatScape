'use client';

import { useEffect, useState } from 'react';
import { Viewer, Entity } from 'resium';
import * as Cesium from 'cesium';
import useStore from '../store/useStore';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Configure Cesium
window.CESIUM_BASE_URL = '/cesium';

// Configure Cesium Ion token from environment variable
if (!process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN) {
  console.warn('Cesium Ion token not found in environment variables');
}
Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;

export default function Globe() {
  const { userLocation, satellites, satellitePositions, selectedSatellite } = useStore();
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (!viewer) return;

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

  // Update satellite positions every second
  useEffect(() => {
    if (!viewer || !satellites) return;

    console.log('Satellites data:', satellites); // Debug log
    console.log('Satellite positions:', satellitePositions); // Debug log

    const interval = setInterval(() => {
      satellites.forEach(sat => {
        const satPosition = satellitePositions[sat.satid];
        if (!satPosition) {
          console.warn('No position data for satellite:', sat.satid);
          return;
        }

        // Convert to Cesium position
        const position = Cesium.Cartesian3.fromDegrees(
          satPosition.satlongitude,
          satPosition.satlatitude,
          satPosition.sataltitude * 1000 // Convert to meters
        );

        // Update entity position
        if (viewer.entities.getById(sat.satid)) {
          viewer.entities.getById(sat.satid).position = new Cesium.ConstantPositionProperty(position);
        } else {
          // Create new satellite entity
          viewer.entities.add({
            id: sat.satid,
            position: position,
            point: {
              pixelSize: 10,
              color: selectedSatellite?.satid === sat.satid 
                ? Cesium.Color.YELLOW 
                : Cesium.Color.CYAN,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2
            },
            label: {
              text: sat.satname,
              font: '12px Roboto',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              outlineWidth: 2,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -10),
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000)
            },
            path: {
              resolution: 1,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.2,
                color: selectedSatellite?.satid === sat.satid 
                  ? Cesium.Color.YELLOW 
                  : Cesium.Color.CYAN
              }),
              width: 2
            }
          });
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (viewer) {
        viewer.entities.removeAll();
      }
    };
  }, [viewer, satellites, satellitePositions, selectedSatellite]);
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
      sceneModePicker={true}
      homeButton={true}
      geocoder={false}
      scene3DOnly={false}
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
