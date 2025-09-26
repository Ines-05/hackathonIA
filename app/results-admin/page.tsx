"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Import dynamique de la carte pour éviter les erreurs SSR
const MapDisplay = dynamic(() => import("@/app/components/MapDisplayAdmin"), {
  ssr: false,
});

interface AnalysisResult {
  image_id: string; // On s'attend maintenant à recevoir cet ID

  geojson: any;
  overlaps: any[];
}

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedResult = localStorage.getItem("analysisResult");
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // Si aucune donnée n'est trouvée, rediriger vers la page d'accueil
      router.push("/");
    }
  }, [router]);

  const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);
    try {
      const response = await fetch(
        "http://192.168.1.1.179:5001/workflow/generate-report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
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
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!result) {
    return <div>Chargement des résultats...</div>; // Ou un spinner de chargement
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 h-screen">
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Résultats de l'Analyse</CardTitle>
          </CardHeader>
          <CardContent>
            {result.overlaps.length === 0 ? (
              <p className="text-green-600">
                ✅ Aucune superposition à risque détectée.
              </p>
            ) : (
              <ul className="space-y-2">
                {result.overlaps.map((overlap, index) => (
                  <li key={index} className="text-red-600">
                    <strong>⚠️ {overlap.layer_name}:</strong>{" "}
                    {overlap.overlapping_count} élément(s) en conflit.
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Button onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? "Génération..." : "Télécharger le Rapport PDF"}
        </Button>
      </div>
      <div className="lg:col-span-2 h-[50vh] lg:h-full">
        <MapDisplay geojsonData={result.geojson} />
      </div>
    </div>
  );
}
