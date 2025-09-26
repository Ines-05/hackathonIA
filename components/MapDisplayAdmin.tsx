// "use client";

// import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
// import "leaflet-defaulticon-compatibility";
// import { LatLngBoundsExpression } from "leaflet";
// import { useEffect } from "react";

// // Composant interne pour gérer le zoom automatique
// const AutoFitBounds = ({ geojsonData }: { geojsonData: any }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (
//       geojsonData &&
//       geojsonData.features &&
//       geojsonData.features.length > 0
//     ) {
//       // Créer une couche GeoJSON temporaire juste pour calculer les limites
//       const layer = L.geoJSON(geojsonData);
//       const bounds = layer.getBounds();

//       // S'assurer que les limites sont valides avant de zoomer
//       if (bounds.isValid()) {
//         map.fitBounds(bounds, { padding: [50, 50] }); // Ajoute un peu de marge
//         const MIN_ZOOM_LEVEL = 18;

//         // On utilise un petit délai pour s'assurer que le fitBounds est terminé
//         setTimeout(() => {
//           if (map.getZoom() < MIN_ZOOM_LEVEL) {
//             map.setZoom(MIN_ZOOM_LEVEL);
//           }
//         }, 100); // 100ms de délai
//       }
//     }
//   }, [geojsonData, map]); // Se redéclenche si les données ou la carte changent

//   return null; // Ce composant n'affiche rien
// };

// interface MapDisplayProps {
//   geojsonData: any;
// }

// const MapDisplay = ({ geojsonData }: MapDisplayProps) => {
//   // Coordonnées de fallback si aucune donnée n'est disponible
//   const defaultCenter: [number, number] = [9.3077, 2.3158]; // Centre du Bénin

//   return (
//     <MapContainer
//       center={defaultCenter}
//       zoom={8}
//       style={{ height: "100%", width: "100%", borderRadius: "8px" }}
//     >
//       {/* --- MODIFICATION 1: Utilisation de la couche satellite Esri --- */}
//       <TileLayer
//         url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
//         attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
//       />

//       {/* Affichage de la parcelle sur la carte */}
//       {geojsonData && <GeoJSON data={geojsonData} />}

//       {/* --- MODIFICATION 2: Ajout du composant pour le zoom automatique --- */}
//       <AutoFitBounds geojsonData={geojsonData} />
//     </MapContainer>
//   );
// };

// export default MapDisplay;

"use client";

import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useEffect } from "react";

// Composant interne pour le zoom automatique (inchangé)
const AutoFitBounds = ({ geojsonData }: { geojsonData: any }) => {
  const map = useMap();
  useEffect(() => {
    if (geojsonData?.features?.length > 0) {
      const layer = L.geoJSON(geojsonData);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
        setTimeout(() => {
          if (map.getZoom() < 18) {
            map.setZoom(18);
          }
        }, 100);
      }
    }
  }, [geojsonData, map]);
  return null;
};

// --- NOUVELLE INTERFACE POUR LES PROPS ---
interface MapDisplayProps {
  mainGeoJson: any; // La parcelle principale
  // Un objet où la clé est le nom de la couche (ex: 'litige')
  // et la valeur est le GeoJSON de cette couche.
  overlayLayers?: Record<string, { data: any; color: string }>;
}

const MapDisplay = ({ mainGeoJson, overlayLayers = {} }: MapDisplayProps) => {
  const defaultCenter: [number, number] = [9.3077, 2.3158];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={8}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, ..."
      />

      {/* 1. Affichage de la parcelle principale (avec son propre style) */}
      {mainGeoJson && (
        <GeoJSON
          key="main-parcel"
          data={mainGeoJson}
          style={() => ({
            color: "#3388ff", // Couleur de la bordure
            weight: 3,
            fillColor: "#3388ff",
            fillOpacity: 0.2,
          })}
        />
      )}

      {/* --- MODIFICATION PRINCIPALE ICI --- */}
      {/* 2. On boucle sur les couches visibles pour les afficher */}
      {Object.entries(overlayLayers).map(([layerKey, layerInfo]) => (
        <GeoJSON
          key={layerKey} // Une clé unique est cruciale pour que React mette à jour correctement
          data={layerInfo.data}
          style={() => ({
            color: layerInfo.color, // On utilise la couleur fournie
            weight: 2,
            fillColor: layerInfo.color,
            fillOpacity: 0.5,
          })}
        />
      ))}
      {/* --- FIN DE LA MODIFICATION --- */}

      <AutoFitBounds geojsonData={mainGeoJson} />
    </MapContainer>
  );
};

export default MapDisplay;
