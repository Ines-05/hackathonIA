import { AnalysisResponse } from "@/types/backend";

/**
 * Données de test conformes au backend pour le développement local
 */
export const mockAnalysisResponse: AnalysisResponse = {
  image_id: "test_parcelle_cotonou_" + Date.now(),
  geojson: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [2.3912, 6.3703], // Cotonou, Bénin
            [2.3920, 6.3703],
            [2.3920, 6.3710],
            [2.3912, 6.3710],
            [2.3912, 6.3703]
          ]]
        },
        properties: {
          name: "Parcelle Test - Haie Vive",
          area_hectares: 2.45,
          status: "analysé",
          commune: "Cotonou",
          arrondissement: "1er Arrondissement",
          quartier: "Haie-Vive"
        }
      },
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [2.3915, 6.3705],
            [2.3918, 6.3705],
            [2.3918, 6.3707],
            [2.3915, 6.3707],
            [2.3915, 6.3705]
          ]]
        },
        properties: {
          name: "Zone de conflit - Titre Foncier TF-2019-045",
          conflict_type: "superposition",
          area_hectares: 0.3
        }
      }
    ]
  },
  overlaps: [
    {
      layer_name: "Titres Fonciers",
      overlapping_count: 1,
      details: {
        titre_number: "TF-2019-045",
        area_overlap_hectares: 0.3,
        severity: "high"
      }
    },
    {
      layer_name: "Aires protégées",
      overlapping_count: 1,
      details: {
        protected_area: "Zone tampon lagunaire",
        distance_meters: 50,
        severity: "medium"
      }
    }
  ]
};

/**
 * Réponse de test sans conflit
 */
export const mockAnalysisResponseClean: AnalysisResponse = {
  image_id: "test_parcelle_clean_" + Date.now(),
  geojson: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [2.4012, 6.3803],
            [2.4020, 6.3803],
            [2.4020, 6.3810],
            [2.4012, 6.3810],
            [2.4012, 6.3803]
          ]]
        },
        properties: {
          name: "Parcelle Libre - Zone Résidentielle",
          area_hectares: 1.8,
          status: "libre",
          commune: "Cotonou",
          arrondissement: "1er Arrondissement",
          quartier: "Gbegamey"
        }
      }
    ]
  },
  overlaps: []
};

/**
 * Génère une réponse de test aléatoire
 */
export function generateMockResponse(withConflicts: boolean = Math.random() > 0.5): AnalysisResponse {
  return withConflicts ? mockAnalysisResponse : mockAnalysisResponseClean;
}