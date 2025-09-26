"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Import dynamique de la carte pour éviter les erreurs SSR
const MapDisplay = dynamic(() => import("@/app/components/MapDisplayAdmin"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-200">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

interface LayerInfo {
  key: string;
  name: string;
  color: string;
}
interface RequestDetail {
  id: string;
  geojson: any;
  overlaps: any[];
  image_id: string;
}
interface VisibleLayerData {
  [key: string]: {
    data: any; // Le GeoJSON de la couche
    color: string;
  };
}

export default function RequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [details, setDetails] = useState<RequestDetail | null>(null);
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<Record<string, any>>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const fetchAllData = async () => {
      try {
        const [detailsRes, layersRes] = await Promise.all([
          fetch(`http://192.168.1.1.179:5001/admin/requests/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://192.168.1.1.179:5001/layers/info"),
        ]);

        if (detailsRes.status === 401) {
          localStorage.removeItem("admin_token");
          router.push("/admin/login");
          return;
        }

        if (detailsRes.ok) setDetails(await detailsRes.json());
        // if (layersRes.ok) setLayers(await layersRes.json());
        if (layersRes.ok) {
          const data = await layersRes.json();

          // génère une couleur hexadécimale aléatoire
          const getRandomColor = () =>
            "#" +
            Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, "0");

          const layersWithColors = data.map((layer) => ({
            ...layer,
            color: getRandomColor(),
          }));

          setLayers(layersWithColors);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast("Erreur", {
          description: "Impossible de charger les données.",
        });
      }
    };

    fetchAllData();
  }, [params.id, router, toast]);

  //   const handleLayerToggle = async (layerKey: string, isChecked: boolean) => {
  //     if (isChecked) {
  //       const res = await fetch(`http://192.168.1.1.179:5001/layers/data/${layerKey}`);
  //       if (res.ok) {
  //         const data = await res.json();
  //         setVisibleLayers((prev) => ({ ...prev, [layerKey]: data }));
  //       }
  //     } else {
  //       setVisibleLayers((prev) => {
  //         const newState = { ...prev };
  //         delete newState[layerKey];
  //         return newState;
  //       });
  //     }
  //   };
  //   const handleLayerToggle = async (layer: LayerInfo, isChecked: boolean) => {
  //     const { key, color } = layer;
  //     console.log(layer);
  //     if (isChecked) {
  //       try {
  //         const res = await fetch(`http://192.168.1.1.179:5001/layers/data/${key}`);
  //         if (res.ok) {
  //           const data = await res.json();
  //           // On stocke les données ET la couleur
  //           setVisibleLayers((prev) => ({ ...prev, [key]: { data, color } }));
  //         } else {
  //           toast({
  //             variant: "destructive",
  //             title: "Erreur",
  //             description: `Impossible de charger la couche ${layer.name}.`,
  //           });
  //         }
  //       } catch (error) {
  //         toast("Erreur réseau", {
  //           description: `Impossible de contacter le serveur pour la couche ${layer.name}.`,
  //         });
  //       }
  //     } else {
  //       setVisibleLayers((prev) => {
  //         const newState = { ...prev };
  //         delete newState[key];
  //         return newState;
  //       });
  //     }
  //   };

  const getParcelCentroid = (
    geojson: any
  ): { lat: number; lon: number } | null => {
    if (!geojson?.features) return null;

    const parcelFeature = geojson.features.find(
      (f: any) => f.properties?.type === "parcel_boundary"
    );

    if (!parcelFeature?.geometry?.coordinates) return null;

    // On prend le premier anneau du polygone
    const coords = parcelFeature.geometry.coordinates[0];
    if (!coords || coords.length === 0) return null;

    let totalLat = 0;
    let totalLon = 0;
    // On ignore le dernier point qui est le même que le premier
    const pointCount = coords.length - 1;

    for (let i = 0; i < pointCount; i++) {
      totalLon += coords[i][0]; // longitude
      totalLat += coords[i][1]; // latitude
    }

    return {
      lat: totalLat / pointCount,
      lon: totalLon / pointCount,
    };
  };
  // --- FIN DE LA NOUVELLE FONCTION ---

  const handleDownload = async () => {
    if (!details) return;
    setIsDownloading(true);
    try {
      const response = await fetch(
        "http://192.168.1.1.179:5001/workflow/generate-report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(details),
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la génération du PDF.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rapport_analyse_fonciere.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast("Erreur de téléchargement", {
        description: error.message,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLayerToggle = async (layer: LayerInfo, isChecked: boolean) => {
    const { key, color, name } = layer;

    if (isChecked) {
      let fetchUrl = `http://192.168.1.1.179:5001/layers/data/${key}`;

      // Si la couche est "parcelles", on construit une URL spéciale
      if (key === "parcelles") {
        if (!details?.geojson) {
          toast("Erreur", {
            description:
              "Les données de la parcelle principale ne sont pas chargées.",
          });
          return;
        }
        const center = getParcelCentroid(details.geojson);
        if (!center) {
          toast("Erreur", {
            description:
              "Impossible de déterminer le centre de la parcelle pour charger les parcelles voisines.",
          });
          return;
        }
        fetchUrl += `?lat=${center.lat}&lon=${center.lon}&radius=1000`; // Radius de 1km par défaut
        console.log(
          `Chargement des parcelles voisines autour de : lat=${center.lat}, lon=${center.lon}`
        );
      }

      try {
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const data = await res.json();
          setVisibleLayers((prev) => ({ ...prev, [key]: { data, color } }));
        } else {
          toast("destructive", {
            description: `Impossible de charger la couche ${name}.`,
          });
        }
      } catch (error) {
        toast("Erreur réseau", {
          description: `Impossible de contacter le serveur pour la couche ${name}.`,
        });
      }
    } else {
      // La logique pour décocher reste la même
      setVisibleLayers((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  if (!details)
    return (
      <div className="flex h-screen items-center justify-center">
        Chargement des détails de la demande...
      </div>
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-screen max-h-screen overflow-hidden">
      <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Couches de Données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {layers.map((layer) => (
              <div key={layer.key} className="flex items-center space-x-2">
                <Switch
                  id={layer.key}
                  onCheckedChange={(checked) =>
                    handleLayerToggle(layer, checked)
                  }
                />
                <Label htmlFor={layer.key} style={{ color: layer.color }}>
                  {layer.name}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analyse de Superposition</CardTitle>
          </CardHeader>
          <CardContent>
            {details.overlaps.length === 0 ? (
              <p className="text-green-600">
                ✅ Aucune superposition à risque détectée.
              </p>
            ) : (
              <ul className="space-y-3">
                {details.overlaps.map((overlap, index) => (
                  <li key={index} className="text-red-600 font-medium">
                    ⚠️ Chevauchement avec :{" "}
                    <span style={{ color: overlap.layer_color }}>
                      {overlap.layer_name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération...
            </>
          ) : (
            "Télécharger le Rapport PDF"
          )}
        </Button>
      </div>

      {/* <div className="lg:col-span-2 h-[50vh] lg:h-full rounded-lg overflow-hidden"> */}
      {/* Vous devrez modifier MapDisplay pour qu'il puisse afficher plusieurs GeoJSON */}
      {/* Pour l'instant, il n'affiche que la parcelle principale */}
      {/* <MapDisplay geojsonData={details.geojson} /> */}
      {/* </div> */}

      <div className="lg:col-span-2 h-[50vh] lg:h-full rounded-lg overflow-hidden">
        {/* --- MODIFICATION PRINCIPALE ICI --- */}
        <MapDisplay
          mainGeoJson={details.geojson}
          overlayLayers={visibleLayers}
        />
        {/* --- FIN DE LA MODIFICATION --- */}
      </div>
    </div>
  );
}
