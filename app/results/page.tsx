"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Chatbot from "@/components/chatbot"
import {
  ArrowLeft,
  Download,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { AnalysisResponse, Overlap } from "@/types/backend"

// Import dynamique de la carte pour éviter les erreurs SSR
const MapDisplay = dynamic(() => import("@/components/MapDisplay"), {
  ssr: false,
})

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedResult = localStorage.getItem("analysisResult")
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult)
        setResult(parsed)
      } catch (error) {
        console.error("Erreur lors du parsing des résultats:", error)
        router.push("/upload")
      }
    } else {
      // Si aucune donnée n'est trouvée, rediriger vers la page d'upload
      router.push("/upload")
    }
  }, [router])

  const handleDownload = async () => {
    if (!result) return
    
    setIsDownloading(true)
    try {
      const response = await fetch(
        "http://192.168.1.179:5001/workflow/generate-report",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result),
        }
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du PDF.")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "rapport_analyse_fonciere.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error("Erreur de téléchargement:", error)
      alert(`Erreur de téléchargement: ${error.message}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const getOverlapStatusInfo = (overlaps: Overlap[]) => {
    if (overlaps.length === 0) {
      return {
        label: "Aucun conflit",
        color: "bg-green-500",
        icon: CheckCircle,
        description: "Aucune superposition à risque détectée",
      }
    } else {
      return {
        label: "Conflits détectés",
        color: "bg-red-500", 
        icon: AlertTriangle,
        description: `${overlaps.length} superposition(s) détectée(s)`,
      }
    }
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    )
  }

  const statusInfo = getOverlapStatusInfo(result.overlaps)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white relative">
      {/* Background Mascot */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-10 right-10 opacity-5">
          <Image
            src="/Mascotte.png"
            alt="Mascotte AYIGBA"
            width={300}
            height={300}
            className="w-64 h-64 lg:w-80 lg:h-80 object-contain animate-float"
          />
        </div>
      </div>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/upload" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <div className="flex items-center space-x-2">
                <Image src="/logo-andf.png" alt="ANDF Logo" width={120} height={40} className="h-8 w-auto" />
                <Image src="/logo_Ayigba-removebg-preview.png" alt="AYIGBA Logo" width={150} height={50} className="h-10 w-auto" />
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Résultats d'analyse</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Sidebar - Résultats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Status Card */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 ${statusInfo.color} rounded-full flex items-center justify-center`}>
                  <StatusIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{statusInfo.label}</h3>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </div>
              </div>

              {/* Overlaps Details */}
              {result.overlaps.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-medium text-gray-800">Détails des conflits :</h4>
                  {result.overlaps.map((overlap, index) => (
                    <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">{overlap.layer_name}</span>
                      </div>
                      <p className="text-sm text-red-700">
                        {overlap.overlapping_count} élément(s) en conflit détecté(s)
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Success Message */}
              {result.overlaps.length === 0 && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-4">
                  <p className="text-green-800">
                    ✅ Votre parcelle ne présente aucun conflit avec les couches cadastrales existantes.
                  </p>
                </div>
              )}
            </Card>

            {/* Section des boutons d'action */}
            <div className="space-y-4">
              {/* Mascotte animée pour desktop - repositionnée */}
              <div className="hidden lg:block relative mb-6">
                <div className="flex justify-start">
                  <div className="relative">
                    <Image
                      src="/Mascotte.png"
                      alt="Mascotte AYIGBA"
                      width={80}
                      height={80}
                      className="w-14 h-14 object-contain animate-bounce mascot-sway"
                    />
                    {/* Bulle de dialogue */}
                    <div className="absolute -top-12 -right-4 bg-white rounded-lg p-2 shadow-lg border-2 border-green-200 animate-pulse min-w-max">
                      <div className="text-xs font-medium text-green-700">
                        Téléchargez votre rapport !
                      </div>
                      <div className="absolute bottom-[-8px] left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-200"></div>
                    </div>
                    {/* Animation de pointage vers le bouton */}
                    <div className="absolute -bottom-2 right-2 animate-bounce">
                      <div className="text-lg transform rotate-90">👉🏿</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Version mobile de la mascotte - au-dessus du bouton */}
              <div className="block lg:hidden mb-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Image
                      src="/Mascotte.png"
                      alt="Mascotte AYIGBA"
                      width={64}
                      height={64}
                      className="w-12 h-12 object-contain animate-bounce mascot-sway"
                    />
                    {/* Bulle de dialogue mobile */}
                    <div className="absolute -top-10 -left-8 w-32 bg-white rounded-lg p-2 shadow-lg border-2 border-green-200 animate-pulse">
                      <div className="text-xs font-medium text-green-700 text-center">
                        Téléchargez ici !
                      </div>
                      <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-200"></div>
                    </div>
                    {/* Flèche pointant vers le bas */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                      <div className="text-base">👇🏿</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton de téléchargement */}
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-6 text-lg font-semibold"
              >
                <Download className="w-5 h-5 mr-2" />
                {isDownloading ? "Génération du PDF..." : "Télécharger le Rapport PDF"}
              </Button>

              {/* Bouton Nouvelle demande */}
              <Link href="/upload" className="block w-full">
                <Button 
                  variant="outline"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 py-4 text-base font-medium"
                >
                  Nouvelle demande
                </Button>
              </Link>
            </div>

            {/* Legend */}
            <Collapsible open={legendOpen} onOpenChange={setLegendOpen}>
              <Card className="bg-white/90 backdrop-blur-sm">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-6">
                    <span className="font-semibold">Légende des Couches</span>
                    {legendOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>AIF (Association d'Intérêts Fonciers)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-600 rounded"></div>
                        <span>Aires protégées</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                        <span>DPL (Domaine Public Lagunaire)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-700 rounded"></div>
                        <span>DPM (Domaine Public Maritime)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span>Titres Fonciers démembrés</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span>Titres Fonciers reconstitués</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Titres Fonciers en cours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-pink-500 rounded"></div>
                        <span>Parcelles d'enregistrement individuel</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-700 rounded"></div>
                        <span>Titres Fonciers de l'État</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-600 rounded"></div>
                        <span>Zones litigieuses</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-amber-600 rounded"></div>
                        <span>Zones de restrictions</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] lg:h-[700px] overflow-hidden bg-white/90 backdrop-blur-sm">
              <div className="h-full">
                <MapDisplay geojsonData={result.geojson} />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  )
}