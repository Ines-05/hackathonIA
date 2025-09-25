"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import Link from "next/link"

export default function ResultsPage() {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(15)
  const [parcelStatus] = useState<"available" | "disputed" | "titled">("available") // Mock status

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
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-semibold">ANDF Platform</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Étape 3 sur 3</div>
              <Button onClick={downloadReport} className="bg-primary hover:bg-primary-dark">
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
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
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
                      {/* Grid pattern to simulate map */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-8 grid-rows-8 h-full">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div key={i} className="border border-gray-300" />
                          ))}
                        </div>
                      </div>

                      {/* Highlighted Parcel */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-24 bg-primary/30 border-4 border-primary rounded-lg animate-pulse-green relative">
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                            <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                              Votre parcelle
                            </div>
                          </div>
                          <MapPin className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                        </div>
                      </div>

                      {/* Mock surrounding parcels */}
                      <div className="absolute top-1/4 left-1/4 w-20 h-16 bg-gray-200 border-2 border-gray-400 rounded opacity-60" />
                      <div className="absolute top-3/4 right-1/4 w-24 h-20 bg-gray-200 border-2 border-gray-400 rounded opacity-60" />
                      <div className="absolute bottom-1/4 left-1/3 w-16 h-12 bg-gray-200 border-2 border-gray-400 rounded opacity-60" />
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
          </div>

          {/* Info Panel */}
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

            {/* Parcel Details */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Détails de la parcelle</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Superficie</span>
                  <span className="font-medium">2,450 m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commune</span>
                  <span className="font-medium">Cotonou</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arrondissement</span>
                  <span className="font-medium">1er Arrondissement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone</span>
                  <span className="font-medium">Résidentielle</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Référence</span>
                  <span className="font-medium">CTN-001-2025</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Actions disponibles</h3>
              <div className="space-y-3">
                <Button onClick={downloadReport} className="w-full bg-primary hover:bg-primary-dark">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le rapport PDF
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Contacter un expert
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Demander une vérification
                </Button>
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Légende</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-sm">Parcelle disponible</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded" />
                  <span className="text-sm">Parcelle en litige</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-sm">Parcelle titrée</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-400 rounded" />
                  <span className="text-sm">Autres parcelles</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Integrated Chatbot Component */}
      <Chatbot />
    </div>
  )
}
