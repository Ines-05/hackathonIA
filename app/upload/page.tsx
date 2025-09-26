"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, Camera, FileText, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Chatbot from "@/components/chatbot"
import Image from "next/image"
import { AnalysisResponse, BackendError } from "@/types/backend"
import { validateAnalysisResponse, formatAnalysisSummary } from "@/utils/validation"
import { generateMockResponse } from "@/utils/mockData"

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const router = useRouter()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    console.log("handleDrop appelé")
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log("Fichier déposé via drag&drop:", e.dataTransfer.files[0].name)
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileInput appelé")
    if (e.target.files && e.target.files[0]) {
      console.log("Fichier sélectionné via input:", e.target.files[0].name)
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    console.log("handleFile appelé avec:", selectedFile.name, selectedFile.type)
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

    if (!validTypes.includes(selectedFile.type)) {
      console.log("Type de fichier non valide:", selectedFile.type)
      setUploadStatus("error")
      return
    }

    console.log("Fichier valide, mise à jour du state et démarrage de l'upload")
    setFile(selectedFile)
    setUploadStatus("idle")
    // Passer le fichier directement à simulateUpload
    simulateUpload(selectedFile)
  }

  const handleDropZoneClick = () => {
    document.getElementById('file-input')?.click()
  }

  const simulateUpload = async (selectedFile?: File) => {
    // Utiliser le fichier passé en paramètre ou celui du state
    const fileToUpload = selectedFile || file
    if (!fileToUpload) {
      console.log("Aucun fichier à uploader")
      return
    }
    
    console.log("Début de l'upload pour:", fileToUpload.name)
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", fileToUpload)

    // Déclaration du progressInterval en dehors du try/catch
    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Simulation du progrès pour l'UX
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            return 90
          }
          return prev + 15
        })
      }, 200)

      // Appel direct au backend local
      const response = await fetch(
        "http://192.168.1.179:5001/workflow/process-and-analyze",
        {
          method: "POST",
          body: formData,
          // Note: Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
        }
      )

      // Arrêter l'intervalle de progression
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }

      console.log("Réponse du serveur - Status:", response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.detail || errorMessage
          console.log("Détails de l'erreur:", errorData)
        } catch (e) {
          // Si on ne peut pas parser le JSON d'erreur
          const errorText = await response.text()
          console.log("Réponse d'erreur (text):", errorText)
          if (errorText) {
            errorMessage = `${errorMessage} - ${errorText}`
          }
        }
        throw new Error(errorMessage)
      }

      let result: AnalysisResponse
      try {
        result = await response.json()
        console.log("Résultat brut de l'analyse:", result)
      } catch (e) {
        console.error("Erreur lors du parsing de la réponse JSON:", e)
        throw new Error("Réponse du serveur invalide (pas de JSON valide)")
      }

      // Validation stricte avec notre validateur
      if (!validateAnalysisResponse(result)) {
        console.error("❌ Données reçues non conformes:", result)
        throw new Error("Les données reçues ne sont pas conformes au format attendu")
      }
      
      console.log("✅ Validation réussie - Données 100% conformes au backend")
      console.log("📊 Résumé de l'analyse:")
      console.log(formatAnalysisSummary(result))

      // Stocker les résultats dans localStorage pour la page des résultats
      localStorage.setItem("analysisResult", JSON.stringify(result))

      // Finaliser le progrès
      setUploadProgress(100)
      setUploading(false)
      setUploadStatus("success")

      // Redirection vers les résultats après 2 secondes
      setTimeout(() => {
        router.push("/results")
      }, 2000)

    } catch (error: any) {
      // S'assurer que l'intervalle est arrêté en cas d'erreur
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
      
      console.error("Erreur lors de l'analyse:", error)
      console.error("Status:", error.status)
      console.error("Response:", error.response)
      
      setUploading(false)
      setUploadStatus("error")
      
      // Afficher l'erreur détaillée à l'utilisateur
      alert(`Erreur: ${error.message}`)
    }
  }

  const handleCameraCapture = () => {
    // In a real app, this would open camera
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files[0]) {
        handleFile(target.files[0])
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 relative">
      {/* Background Mascot */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-10 right-10 opacity-10">
          <Image
            src="/Mascotte.png"
            alt="Mascotte AYIGBA"
            width={300}
            height={300}
            className="w-64 h-64 lg:w-80 lg:h-80 object-contain animate-drag-drop"
          />
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <div className="flex items-center space-x-2">
                <Image src="/logo-andf.png" alt="ANDF Logo" width={120} height={40} className="h-8 w-auto" />
                <Image src="/logo_Ayigba-removebg-preview.png" alt="AYIGBA Logo" width={150} height={50} className="h-10 w-auto" />
              </div>
            </Link>
            <div className="text-sm text-gray-600">Étape 1 sur 3</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ajoutez votre document</h1>
          <p className="text-xl text-gray-600">Déposez ou importez votre levé topographique (image)</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Upload Area */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 lg:p-8 border-2 border-dashed border-green-300 hover:border-green-500 transition-colors bg-white/80 backdrop-blur-sm h-full flex flex-col justify-center min-h-[400px] sm:min-h-[500px]">
              <div
                className={`relative ${dragActive ? "bg-green-50" : ""} rounded-lg p-4 sm:p-6 lg:p-8 pt-6 sm:pt-8 pl-6 sm:pl-8 lg:pt-6 lg:pl-8 transition-colors cursor-pointer hover:bg-gray-50 flex-1 flex flex-col justify-center`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleDropZoneClick}
              >
                {!file ? (
                  <div className="text-center relative">
                    {/* Version mobile - layout centré avec espacement approprié */}
                    <div className="block sm:hidden">
                      {/* Container repositionné pour pointer vers l'icône d'upload */}
                      <div className="relative mb-4">
                        {/* Mascotte positionnée à gauche pour pointer vers l'icône */}
                        <div className="absolute top-8 left-2">
                          <div className="relative">
                            <Image
                              src="/Mascotte.png"
                              alt="Mascotte AYIGBA"
                              width={64}
                              height={64}
                              className={`w-14 h-14 object-contain transition-all duration-500 mascot-sway ${
                                dragActive 
                                  ? 'animate-bounce scale-110 mascot-sway-fast' 
                                  : ''
                              }`}
                            />
                            {/* Bulle de dialogue mobile repositionnée */}
                            <div className={`absolute -top-10 -right-4 w-28 bg-white rounded-lg p-1.5 shadow-lg border-2 border-green-200 transition-all duration-300 ${
                              dragActive ? 'scale-110' : 'scale-100'
                            }`}>
                              <div className="text-xs font-medium text-green-700 text-center leading-tight">
                                {dragActive ? "Parfait !" : "Glissez ici !"}
                              </div>
                              <div className="absolute bottom-[-6px] left-6 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-green-200"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Animation de pointage mobile - pointant vers l'icône d'upload */}
                        <div className={`absolute top-12 left-16 transition-all duration-1000 ${
                          dragActive ? 'scale-0' : 'animate-bounce'
                        }`}>
                          <div className="text-sm transform rotate-45">👉🏿</div>
                        </div>
                      </div>
                    </div>

                    {/* Version desktop - layout original */}
                    <div className="hidden sm:block">
                      <div className="absolute -top-4 -left-4 lg:-left-20 lg:top-0 lg:translate-x-0">
                        <div className="relative">
                          <Image
                            src="/Mascotte.png"
                            alt="Mascotte AYIGBA"
                            width={120}
                            height={120}
                            className={`w-16 h-16 lg:w-24 lg:h-24 object-contain transition-all duration-500 mascot-sway ${
                              dragActive 
                                ? 'animate-bounce scale-110 mascot-sway-fast' 
                                : ''
                            }`}
                          />
                          {/* Bulle de dialogue desktop */}
                          <div className={`absolute -top-16 -right-8 bg-white rounded-lg p-2 shadow-lg border-2 border-green-200 transition-all duration-300 ${
                            dragActive ? 'scale-110' : 'scale-100'
                          }`}>
                            <div className="text-sm font-medium text-green-700 leading-tight">
                              {dragActive ? "Parfait ! Lâchez ici !" : "Cliquez ou glissez votre fichier ici !"}
                            </div>
                            <div className="absolute bottom-[-8px] left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-200"></div>
                          </div>
                          {/* Animation de pointage desktop */}
                          <div className={`absolute -right-8 top-8 transition-all duration-1000 ${
                            dragActive ? 'scale-0' : 'animate-bounce'
                          }`}>
                            <div className="text-2xl">👉🏿</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 mt-6 sm:mt-0">
                      <Upload className={`w-6 h-6 sm:w-8 sm:h-8 text-green-600 transition-all duration-300 ${
                        dragActive ? 'animate-bounce text-green-700' : ''
                      }`} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">Glissez-déposez votre fichier</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">ou cliquez <strong>ici</strong> pour sélectionner depuis vos fichiers</p>

                    <div className="flex flex-col gap-3 justify-center max-w-xs sm:max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("file-input")?.click()}
                        className="flex items-center justify-center space-x-2 border-green-300 text-green-600 hover:bg-green-50 px-4 py-2 text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Choisir un fichier</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleCameraCapture}
                        className="flex items-center justify-center space-x-2 border-green-300 text-green-600 hover:bg-green-50 bg-transparent px-4 py-2 text-sm"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Prendre une photo</span>
                      </Button>
                    </div>

                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />

                    <p className="text-xs text-gray-500 mt-4">Formats acceptés: JPG, PNG, JPEG (Max 10MB)</p>
                  </div>
                ) : (
                  <div className="text-center relative">
                    {/* Mascotte animée pour le succès - visible sur tous les écrans */}
                    <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-8 lg:-left-20 lg:top-0 lg:translate-x-0">
                      <div className="relative">
                        <Image
                          src="/Mascotte.png"
                          alt="Mascotte AYIGBA"
                          width={120}
                          height={120}
                          className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain transition-all duration-500 ${
                            uploadStatus === "success" 
                              ? 'animate-bounce scale-110 mascot-excited' 
                              : uploading
                              ? 'mascot-analyzing'
                              : uploadStatus === "error"
                              ? 'opacity-50 animate-pulse'
                              : 'mascot-sway'
                          }`}
                        />
                        {/* Bulle de dialogue pour l'état */}
                        <div className="absolute -top-16 -right-8 bg-white rounded-lg p-2 shadow-lg border-2 border-green-200">
                          <div className="text-sm font-medium text-green-700">
                            {uploadStatus === "success" ? "Bravo ! 🎉" : 
                             uploading ? "Analyse en cours..." :
                             uploadStatus === "error" ? "Oups ! Erreur !" :
                             "Fichier sélectionné !"}
                          </div>
                          <div className="absolute bottom-[-8px] left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-200"></div>
                        </div>
                        {/* Emoji de célébration pour succès */}
                        {uploadStatus === "success" && (
                          <div className="absolute -right-8 top-8 animate-bounce">
                            <div className="text-2xl">🎉</div>
                          </div>
                        )}
                        {/* Animation de pointage pour analyse en cours */}
                        {uploading && (
                          <div className="absolute -right-4 sm:-right-8 top-4 sm:top-8 transition-all duration-1000 animate-pulse">
                            <div className="text-lg sm:text-2xl animate-bounce">⚡</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {uploadStatus === "success" ? (
                        <CheckCircle className="w-8 h-8 text-green-600 animate-bounce" />
                      ) : uploadStatus === "error" ? (
                        <XCircle className="w-8 h-8 text-red-600 animate-pulse" />
                      ) : (
                        <FileText className="w-8 h-8 text-green-600" />
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{file.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                    {uploading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-gray-600">Analyse en cours... {uploadProgress}%</p>
                      </div>
                    )}

                    {uploadStatus === "success" && (
                      <div className="space-y-2">
                        <p className="text-green-600 font-medium">✅ Document valide</p>
                        <p className="text-sm text-gray-600">Redirection vers les résultats...</p>
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="space-y-4">
                        <p className="text-red-600 font-medium">❌ Fichier non conforme</p>
                        <p className="text-sm text-gray-600">Veuillez ajouter un levé topographique valide</p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFile(null)
                            setUploadStatus("idle")
                          }}
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          Essayer un autre fichier
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Help Section */}
          <div className="space-y-4 sm:space-y-6 flex flex-col">
            <Card className="p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-sm h-full flex flex-col justify-center min-h-[400px] sm:min-h-[500px]">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">💡</span>
                  Conseils d'utilisation
                </h3>
              </div>
              
              <ul className="space-y-4 sm:space-y-6 text-sm sm:text-base lg:text-lg text-gray-700 flex-1 flex flex-col justify-center">
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <span className="text-green-600 text-lg sm:text-xl font-bold">•</span>
                  <span className="leading-relaxed">Assurez-vous que votre document est lisible et de bonne qualité</span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <span className="text-green-600 text-lg sm:text-xl font-bold">•</span>
                  <span className="leading-relaxed">Les coordonnées géographiques doivent être visibles</span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <span className="text-green-600 text-lg sm:text-xl font-bold">•</span>
                  <span className="leading-relaxed">Évitez les photos floues ou mal éclairées</span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <span className="text-green-600 text-lg sm:text-xl font-bold">•</span>
                  <span className="leading-relaxed">Le fichier ne doit pas dépasser 10MB</span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <span className="text-green-600 text-lg sm:text-xl font-bold">•</span>
                  <span className="leading-relaxed">Formats acceptés: JPG, PNG, JPEG</span>
                </li>
              </ul>
              
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-green-50 rounded-lg text-center">
                <p className="text-green-800 font-medium text-sm sm:text-base lg:text-lg">
                  📋 Un document de qualité garantit une analyse précise !
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Security Section - Mobile Optimized */}
        <div className="mt-8 sm:mt-12">
          <Card className="p-4 sm:p-6 bg-green-50 border-green-200 max-w-2xl mx-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center justify-center">
              <span className="text-xl sm:text-2xl mr-2">🔒</span>
              Sécurité et confidentialité
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
              Vos documents sont traités de manière sécurisée.
              Toutes les données sont chiffrées et protégées selon les standards de sécurité les plus élevés.
            </p>
          </Card>
        </div>
      </div>

      {/* Integrated Chatbot Component */}
      <Chatbot />
    </div>
  )
}