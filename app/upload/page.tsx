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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

    if (!validTypes.includes(selectedFile.type)) {
      setUploadStatus("error")
      return
    }

    setFile(selectedFile)
    setUploadStatus("idle")
    simulateUpload()
  }

  const simulateUpload = () => {
    setUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setUploadStatus("success")
          // Redirect to results after 2 seconds
          setTimeout(() => {
            router.push("/results")
          }, 2000)
          return 100
        }
        return prev + 10
      })
    }, 200)
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
            src="/mascot-african.jpg"
            alt="Mascotte ANDF"
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
              <Image src="/logo-andf.png" alt="ANDF Logo" width={120} height={40} className="h-8 w-auto" />
            </Link>
            <div className="text-sm text-gray-600">Étape 1 sur 3</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ajoutez votre document</h1>
          <p className="text-xl text-gray-600">Déposez ou importez votre levé topographique (PDF ou photo)</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Upload Area */}
          <div className="space-y-6">
            <Card className="p-8 border-2 border-dashed border-green-300 hover:border-green-500 transition-colors bg-white/80 backdrop-blur-sm">
              <div
                className={`relative ${dragActive ? "bg-green-50" : ""} rounded-lg p-8 transition-colors`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!file ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Glissez-déposez votre fichier</h3>
                    <p className="text-gray-600 mb-6">ou cliquez pour sélectionner depuis vos fichiers</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("file-input")?.click()}
                        className="flex items-center space-x-2 border-green-300 text-green-600 hover:bg-green-50"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Choisir un fichier</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleCameraCapture}
                        className="flex items-center space-x-2 border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
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

                    <p className="text-xs text-gray-500 mt-4">Formats acceptés: PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {uploadStatus === "success" ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : uploadStatus === "error" ? (
                        <XCircle className="w-8 h-8 text-red-600" />
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
          <div className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Conseils d'utilisation
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">•</span>
                  <span>Assurez-vous que votre document est lisible et de bonne qualité</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">•</span>
                  <span>Les coordonnées géographiques doivent être visibles</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">•</span>
                  <span>Évitez les photos floues ou mal éclairées</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600">•</span>
                  <span>Le fichier ne doit pas dépasser 10MB</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-green-50 border-green-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">🔒</span>
                Sécurité et confidentialité
              </h3>
              <p className="text-sm text-gray-600">
                Vos documents sont traités de manière sécurisée et ne sont pas stockés sur nos serveurs après analyse.
                Toutes les données sont chiffrées et protégées selon les standards de sécurité les plus élevés.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Integrated Chatbot Component */}
      <Chatbot />
    </div>
  )
}
