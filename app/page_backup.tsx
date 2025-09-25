"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, MapPin, FileText, Play, Upload, BarChart3 } from "lucide-react"
import Link from "next/link"
import Chatbot from "@/components/chatbot"
import TutorialVideo from "@/components/tutorial-video"
import Image from "next/image"

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const heroImages = [
    {
      src: '/Gemini_Generated_Image_5xi4bi5xi4bi5xi4.png',
      title: 'Étape 1: Upload du levé',
      description: 'Téléchargez votre levé topographique en toute sécurité'
    },
    {
      src: '/Gemini_Generated_Image_lhx1vglhx1vglhx1.png',
      title: 'Étape 2: Analyse automatique',
      description: 'Notre IA analyse votre document en quelques secondes'
    },
    {
      src: '/Gemini_Generated_Image_rycm8drycm8drycm.png',
      title: 'Étape 3: Rapport officiel',
      description: 'Recevez votre rapport de situation administrative'
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [heroImages.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Carousel */}
        <div className="absolute inset-0">
          {/* Background images carousel */}
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentImageIndex 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              {/* Mascot image overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full max-w-2xl h-[600px]">
                  <Image
                    src={image.src}
                    alt={image.title}
                    fill
                    className="object-contain animate-fade-in-up drop-shadow-2xl"
                    style={{
                      filter: 'brightness(0.9) drop-shadow(0 20px 25px rgba(0, 0, 0, 0.4))',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Static overlays - réduits pour mieux voir la mascotte */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-green-800/30 to-green-700/50" />
          
          {/* Image indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-white shadow-lg scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Content - Restored Original */}
        <div className="relative z-10 text-center max-w-4xl mx-auto mobile-padding">
          <div className="inline-flex items-center bg-green-100/90 backdrop-blur-sm text-green-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
            Plateforme Officielle ANDF
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 text-balance leading-tight animate-fade-in-up drop-shadow-lg">
            Bienvenue sur la plateforme foncière
            <span className="text-green-300 block">inclusive</span>
          </h1>

          <p
            className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 text-pretty max-w-2xl mx-auto animate-fade-in-up drop-shadow-md"
            style={{ animationDelay: "0.2s" }}
          >
            Uploadez votre levé topographique pour vérifier la situation administrative de votre terrain. Obtenez votre
            rapport officiel en quelques minutes.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in-up items-center justify-center"
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/upload" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-12 sm:px-16 py-5 sm:py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 btn-animate hover-glow touch-target backdrop-blur-sm text-xl font-bold min-h-[70px]"
              >
                Faire une vérification
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 ml-4" />
              </Button>
            </Link>

            <div className="relative w-full sm:w-auto">
              {/* Hand cursor indicator - positioned on the right pointing to the button */}
              <div className="absolute top-1/2 -right-6 sm:-right-8 transform -translate-y-1/2 z-20 animate-click-indicator pointer-events-none">
                <div className="text-5xl sm:text-6xl filter drop-shadow-2xl animate-click-hand">👈🏿</div>
              </div>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-12 sm:px-16 py-5 sm:py-6 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover-lift touch-target border-white/50 text-gray-800 hover:text-gray-900 shadow-xl text-xl font-bold animate-blink-soft animate-pulse-green min-h-[70px]"
                onClick={() => document.getElementById('tutorial-video')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7 mr-3" />
                Vidéo d'utilisation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Notre plateforme utilise l'intelligence artificielle pour analyser votre levé topographique
              et vous fournir un rapport de situation administrative précis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Uploadez votre document</h3>
              <p className="text-gray-600">
                Déposez facilement votre levé topographique sur notre plateforme sécurisée.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Analyse automatique</h3>
              <p className="text-gray-600">
                Notre IA analyse votre document et vérifie la situation administrative de votre terrain.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Rapport officiel</h3>
              <p className="text-gray-600">
                Recevez votre rapport de situation administrative officiel en quelques minutes.
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full"
              >
                Commencer maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tutorial Video Section */}
      <section className="py-16 sm:py-24 bg-gray-50" id="tutorial-video">
        <div className="max-w-6xl mx-auto px-6">
          <TutorialVideo />
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-green-50 p-8 rounded-2xl mb-8">
            <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Service officiel de l'ANDF
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Cette plateforme est le service officiel de l'Agence Nationale du Domaine Foncier (ANDF)
              pour la vérification de la situation administrative des terrains. Tous les rapports générés
              sont officiels et reconnus par les autorités compétentes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Sécurité garantie</h4>
              <p className="text-gray-600 text-sm">
                Vos documents sont traités en toute sécurité et supprimés automatiquement après traitement.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-2">Résultats rapides</h4>
              <p className="text-gray-600 text-sm">
                Obtenez votre rapport de situation administrative en quelques minutes seulement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Chatbot />
    </div>
  )
}