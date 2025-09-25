"use client"

import { useState, useEffect } from "react"
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Upload,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ResultsPage() {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(15)
  const [parcelStatus] = useState<"available" | "disputed" | "titled">("available") // Mock status
  const [legendOpen, setLegendOpen] = useState(false)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "available":
        return {
          label: "Disponible",
          color: "bg-green-500",
          icon: CheckCircle,
          description: "Cette parcelle est disponible pour titrage",
        }
      case "disputed":
        return {
          label: "En litige",
          color: "bg-orange-500",
          icon: AlertTriangle,
          description: "Cette parcelle fait l'objet d'un litige",
        }
      case "titled":
        return {
          label: "Déjà titrée",
          color: "bg-red-500",
          icon: XCircle,
          description: "Cette parcelle possède déjà un titre foncier",
        }
      default:
        return {
          label: "Inconnu",
          color: "bg-gray-500",
          icon: AlertTriangle,
          description: "Statut inconnu",
        }
    }
  }

  const statusInfo = getStatusInfo(parcelStatus)
  const StatusIcon = statusInfo.icon

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 20))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 10))
  }

  const handleReset = () => {
    setZoomLevel(15)
  }

  const downloadReport = () => {
    // In a real app, this would generate and download a PDF
    const link = document.createElement("a")
    link.href = "/rapport-officiel-andf.jpg"
    link.download = "rapport-parcelle-andf.pdf"
    link.click()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/upload" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <div className="flex items-center space-x-2">
                <Image src="/logo_Ayigba-removebg-preview.png" alt="AYIGBA Logo" width={40} height={40} className="w-10 h-10" />
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Étape 3 sur 3</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${statusInfo.color} animate-pulse`} />
            <h1 className="text-3xl font-bold text-foreground">Résultats de l'analyse</h1>
          </div>
          <p className="text-muted-foreground">Votre parcelle a été localisée et analysée avec succès</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-primary/10 to-secondary/10">
                {!mapLoaded ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Chargement de la carte...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mock Map Interface */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50" 
                         style={{ transform: `scale(${1 + (zoomLevel - 15) * 0.1})`, transformOrigin: 'center center' }}>
                      {/* Grid pattern to simulate map */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-8 grid-rows-8 h-full">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div key={i} className="border border-gray-300" />
                          ))}
                        </div>
                      </div>

                      {/* Highlighted Parcel - Size changes with zoom */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div 
                          className="bg-[#2e7d32]/30 border-4 border-[#2e7d32] rounded-lg animate-pulse-green relative transition-all duration-300"
                          style={{ 
                            width: `${8 + (zoomLevel - 10) * 2}rem`, 
                            height: `${6 + (zoomLevel - 10) * 1.5}rem` 
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                            <div className="bg-[#2e7d32] text-white px-3 py-1 rounded-full text-sm font-medium">
                              Votre parcelle
                            </div>
                          </div>
                          <MapPin 
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#2e7d32] transition-all duration-300" 
                            style={{ width: `${1.5 + (zoomLevel - 15) * 0.1}rem`, height: `${1.5 + (zoomLevel - 15) * 0.1}rem` }}
                          />
                        </div>
                      </div>

                      {/* Mock surrounding parcels - Size and position change with zoom */}
                      <div 
                        className="absolute bg-gray-200 border-2 border-gray-400 rounded opacity-60 transition-all duration-300"
                        style={{ 
                          top: '25%', 
                          left: '25%',
                          width: `${5 + (zoomLevel - 15) * 0.5}rem`, 
                          height: `${4 + (zoomLevel - 15) * 0.4}rem` 
                        }}
                      />
                      <div 
                        className="absolute bg-gray-200 border-2 border-gray-400 rounded opacity-60 transition-all duration-300"
                        style={{ 
                          top: '75%', 
                          right: '25%',
                          width: `${6 + (zoomLevel - 15) * 0.6}rem`, 
                          height: `${5 + (zoomLevel - 15) * 0.5}rem` 
                        }}
                      />
                      <div 
                        className="absolute bg-gray-200 border-2 border-gray-400 rounded opacity-60 transition-all duration-300"
                        style={{ 
                          bottom: '25%', 
                          left: '33%',
                          width: `${4 + (zoomLevel - 15) * 0.4}rem`, 
                          height: `${3 + (zoomLevel - 15) * 0.3}rem` 
                        }}
                      />
                    </div>

                    {/* Map Controls */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2">
                      <Button size="sm" variant="secondary" onClick={handleZoomIn} className="w-10 h-10 p-0">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={handleZoomOut} className="w-10 h-10 p-0">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={handleReset} className="w-10 h-10 p-0">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Zoom Level Indicator */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      Zoom: {zoomLevel}x
                    </div>

                    {/* Coordinates */}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      6.3703° N, 2.3912° E
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Legend (Collapsible under map) */}
            <div className="mt-4">
              <Collapsible open={legendOpen} onOpenChange={setLegendOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-white/80 backdrop-blur-sm">
                    <span className="flex items-center space-x-2">
                      <span>Légende de la carte</span>
                    </span>
                    {legendOpen ? (
                      <ChevronDown className="h-4 w-4 transition-transform" />
                    ) : (
                      <ChevronRight className="h-4 w-4 transition-transform" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="p-4 mt-2 bg-white/80 backdrop-blur-sm">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded" />
                        <span className="text-sm">AIF (Association d'Intérêts Foncier)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-green-600 rounded" />
                        <span className="text-sm">Aires protégées</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-cyan-500 rounded" />
                        <span className="text-sm">DPL (Domaine Public Lagunaire)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-teal-500 rounded" />
                        <span className="text-sm">DPM (Domaine Public Maritime)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-orange-400 rounded" />
                        <span className="text-sm">Titres Fonciers démembrés (TF démembrés)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-purple-500 rounded" />
                        <span className="text-sm">Titres Fonciers reconstitués (TF reconstitués)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        <span className="text-sm">TF en cours (Titre foncier en cours)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-indigo-500 rounded" />
                        <span className="text-sm">Parcelles objets d'enregistrement individuel</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-gray-700 rounded" />
                        <span className="text-sm">Titres Fonciers de l'État (TF_État)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded" />
                        <span className="text-sm">Zones litigieuses</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-red-300 rounded border-2 border-red-500" />
                        <span className="text-sm">Zone de restrictions</span>
                      </div>
                    </div>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Right Side Panel */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 ${statusInfo.color} rounded-full flex items-center justify-center`}>
                  <StatusIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Statut de la parcelle</h3>
                  <Badge variant="secondary" className="mt-1">
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{statusInfo.description}</p>

              {parcelStatus === "available" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm font-medium">
                    ✅ Bonne nouvelle ! Cette parcelle peut faire l'objet d'une demande de titre foncier.
                  </p>
                </div>
              )}

              {parcelStatus === "disputed" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 text-sm font-medium">
                    ⚠️ Attention : Cette parcelle fait l'objet d'un litige. Contactez un expert juridique.
                  </p>
                </div>
              )}

              {parcelStatus === "titled" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    ❌ Cette parcelle possède déjà un titre foncier valide.
                  </p>
                </div>
              )}
            </Card>

            {/* Actions Section - Moved under status */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-6 flex items-center">
                <Download className="w-5 h-5 mr-2 text-[#2e7d32]" />
                Actions à faire
              </h3>
              <div className="space-y-4">
                <Button 
                  onClick={downloadReport} 
                  size="lg"
                  className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-semibold py-4 px-6 text-lg rounded-lg btn-animate hover-glow shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Télécharger le rapport PDF
                </Button>
                <Link href="/upload" className="w-full block">
                  <Button 
                    size="lg"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 text-lg rounded-lg btn-animate shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Upload className="w-5 h-5 mr-3" />
                    Nouvelle vérification
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Details Section - Moved to bottom after everything */}
        <div className="mt-12">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">Détails complets de la parcelle</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-[#2e7d32]">Informations générales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Superficie</span>
                    <span className="font-medium">2,450 m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Périmètre</span>
                    <span className="font-medium">198.2 m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Référence</span>
                    <span className="font-medium">CTN-001-2025</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-[#2e7d32]">Localisation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commune</span>
                    <span className="font-medium">Cotonou</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arrondissement</span>
                    <span className="font-medium">1er Arrondissement</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quartier</span>
                    <span className="font-medium">Haie-Vive</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-[#2e7d32]">Classification</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zone</span>
                    <span className="font-medium">Résidentielle</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usage autorisé</span>
                    <span className="font-medium">Habitation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date d'analyse</span>
                    <span className="font-medium">25/09/2025</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Integrated Chatbot Component */}
      <Chatbot />
    </div>
  )
}
