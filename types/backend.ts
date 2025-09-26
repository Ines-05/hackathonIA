// Types pour les API du backend
export interface AnalysisRequest {
  file: File;
}

export interface AnalysisResponse {
  image_id: string;
  geojson: GeoJSONFeatureCollection;
  overlaps: Overlap[];
}

export interface Overlap {
  layer_name: string;
  overlapping_count: number;
  details?: any; // Optionnel pour plus de détails
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Polygon" | "Point" | "LineString" | "MultiPolygon";
    coordinates: number[][] | number[][][] | number[];
  };
  properties: {
    [key: string]: any;
  };
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
}

export interface ReportRequest {
  image_id: string;
  geojson: GeoJSONFeatureCollection;
  overlaps: Overlap[];
}

// Types d'erreur du backend
export interface BackendError {
  message?: string;
  detail?: string;
  errors?: string[];
}