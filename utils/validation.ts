import { AnalysisResponse, GeoJSONFeatureCollection, Overlap } from "@/types/backend";

/**
 * Valide si un objet est une réponse d'analyse valide du backend
 */
export function validateAnalysisResponse(data: any): data is AnalysisResponse {
  if (!data || typeof data !== 'object') {
    console.error('❌ Données manquantes ou invalides');
    return false;
  }

  // Vérifier image_id
  if (!data.image_id || typeof data.image_id !== 'string') {
    console.error('❌ image_id manquant ou invalide:', data.image_id);
    return false;
  }

  // Vérifier geojson
  if (!validateGeoJSON(data.geojson)) {
    console.error('❌ GeoJSON invalide');
    return false;
  }

  // Vérifier overlaps
  if (!Array.isArray(data.overlaps)) {
    console.error('❌ overlaps n\'est pas un tableau:', data.overlaps);
    return false;
  }

  // Valider chaque overlap
  for (let i = 0; i < data.overlaps.length; i++) {
    if (!validateOverlap(data.overlaps[i])) {
      console.error(`❌ Overlap ${i} invalide:`, data.overlaps[i]);
      return false;
    }
  }

  console.log('✅ Réponse d\'analyse valide');
  return true;
}

/**
 * Valide si un objet est un GeoJSON FeatureCollection valide
 */
export function validateGeoJSON(geojson: any): geojson is GeoJSONFeatureCollection {
  if (!geojson || typeof geojson !== 'object') {
    console.error('❌ GeoJSON manquant');
    return false;
  }

  if (geojson.type !== 'FeatureCollection') {
    console.error('❌ Type GeoJSON invalide:', geojson.type);
    return false;
  }

  if (!Array.isArray(geojson.features)) {
    console.error('❌ Features GeoJSON invalides');
    return false;
  }

  // Valider chaque feature
  for (let i = 0; i < geojson.features.length; i++) {
    const feature = geojson.features[i];
    if (!feature || feature.type !== 'Feature') {
      console.error(`❌ Feature ${i} invalide:`, feature);
      return false;
    }

    if (!feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
      console.error(`❌ Géométrie de la feature ${i} invalide:`, feature.geometry);
      return false;
    }

    if (!feature.properties || typeof feature.properties !== 'object') {
      console.error(`❌ Propriétés de la feature ${i} invalides:`, feature.properties);
      return false;
    }
  }

  console.log(`✅ GeoJSON valide avec ${geojson.features.length} feature(s)`);
  return true;
}

/**
 * Valide si un objet est un overlap valide
 */
export function validateOverlap(overlap: any): overlap is Overlap {
  if (!overlap || typeof overlap !== 'object') {
    return false;
  }

  if (!overlap.layer_name || typeof overlap.layer_name !== 'string') {
    return false;
  }

  if (typeof overlap.overlapping_count !== 'number' || overlap.overlapping_count < 0) {
    return false;
  }

  return true;
}

/**
 * Formate un résumé des données pour le logging
 */
export function formatAnalysisSummary(data: AnalysisResponse): string {
  const summary = [
    `📍 ID: ${data.image_id}`,
    `🗺️ Features: ${data.geojson.features.length}`,
    `⚠️ Conflits: ${data.overlaps.length}`,
  ];

  if (data.overlaps.length > 0) {
    const conflicts = data.overlaps.map(o => `${o.layer_name} (${o.overlapping_count})`).join(', ');
    summary.push(`🚨 Détails: ${conflicts}`);
  }

  return summary.join('\n');
}