"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useEffect } from "react";

// Composant interne pour gérer le zoom automatique
const AutoFitBounds = ({ geojsonData }: { geojsonData: any }) => {
  const map = useMap();
  
  useEffect(() => {
    if (
      geojsonData &&
      geojsonData.features &&
      geojsonData.features.length > 0
    ) {
      // Créer une couche GeoJSON temporaire juste pour calculer les limites
      const L = require('leaflet');
      const layer = L.geoJSON(geojsonData);
      const bounds = layer.getBounds();

      // S'assurer que les limites sont valides avant de zoomer
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
        const MIN_ZOOM_LEVEL = 18;

        // Délai pour s'assurer que le fitBounds est terminé
        setTimeout(() => {
          if (map.getZoom() < MIN_ZOOM_LEVEL) {
            map.setZoom(MIN_ZOOM_LEVEL);
          }
        }, 100);
      }
    }
  }, [geojsonData, map]);

  return null;
};

interface MapDisplayProps {
  geojsonData: any;
}

const MapDisplay = ({ geojsonData }: MapDisplayProps) => {
  // Coordonnées de fallback - Centre du Bénin
  const defaultCenter: LatLngExpression = [9.3077, 2.3158];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={8}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
    >
      {/* Couche satellite Esri */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      />

      {/* Affichage de la parcelle sur la carte */}
      {geojsonData && <GeoJSON data={geojsonData} />}

      {/* Zoom automatique */}
      <AutoFitBounds geojsonData={geojsonData} />
    </MapContainer>
  );
};

export default MapDisplay;