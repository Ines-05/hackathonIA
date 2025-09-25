"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, MapPin, FileText, Play, Upload, BarChart3 } from "lucide-react"
import Link from "next/link"
import Chatbot from "@/components/chatbot"
import MobileNav from "@/components/mobile-nav"
import TutorialVideo from "@/components/tutorial-video"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto mobile-padding py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Image src="/logo-andf.png" alt="ANDF Logo" width={120} height={40} className="h-8 sm:h-10 w-auto" />
              <Image src="/logo_Ayigba-removebg-preview.png" alt="AIYGBA Logo" width={150} height={50} className="h-10 sm:h-12 w-auto" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="touch-target">
                  Aide
                </Button>
                <Button variant="outline" size="sm" className="touch-target bg-transparent">
                  Contact
                </Button>
              </div>
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with terrain image */}
        <div className="absolute inset-0">
          {/* Terrain background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/terrain-background.png')",
            }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Green gradient overlay to maintain theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-800/40 to-green-700/60" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto mobile-padding">
          <div className="inline-flex items-center bg-green-100/90 backdrop-blur-sm text-green-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
            Plateforme Officielle ANDF
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 text-balance leading-tight animate-fade-in-up drop-shadow-lg">
            Bienvenue sur la plateforme foncière
            <span className="text-green-300 block">AIYGBA</span>
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

      {/* Tutorial Video Section - Replaced with interactive component */}
      <TutorialVideo />

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 mobile-padding">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 animate-fade-in-up">
              Une plateforme accessible à tous
            </h2>
            <p
              className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Conçue pour les citoyens béninois, alphabètes et analphabètes, urbains et ruraux.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Interface Simple",
                description: "Guidage visuel avec mascotte et animations pour une utilisation intuitive.",
                icon: "🎯",
              },
              {
                title: "Résultats Instantanés",
                description: "Vérification rapide du statut administratif de votre parcelle.",
                icon: "⚡",
              },
              {
                title: "Assistant Disponible",
                description: "Chatbot intelligent pour vous guider à chaque étape de votre vérification.",
                icon: "🤖",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-white card-interactive animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 mobile-padding text-white" style={{ backgroundColor: '#2e7d32' }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 animate-fade-in-up">
            Prêt à vérifier votre terrain ?
          </h2>
          <p
            className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Commencez dès maintenant et obtenez votre rapport officiel en quelques minutes.
          </p>
          <Link href="/upload">
            <Button
              size="lg"
              variant="secondary"
              className="px-12 sm:px-16 py-5 sm:py-6 rounded-full hover:bg-white/90 btn-animate hover-glow touch-target animate-fade-in-up text-xl font-bold min-h-[70px]"
              style={{ 
                animationDelay: "0.4s",
                backgroundColor: '#ffffff',
                color: '#2e7d32'
              }}
            >
              Vérifier maintenant
              <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 ml-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 sm:py-12 mobile-padding bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <Image
                src="/logo-andf.png"
                alt="ANDF Logo"
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto mb-3 sm:mb-4"
              />
              <p className="text-xs sm:text-sm text-gray-600">
                Agence Nationale du Domaine Foncier - République du Bénin
              </p>
            </div>

            {[
              {
                title: "Services",
                items: ["Vérification Foncière", "Titres de Propriété", "Cadastre National"],
              },
              {
                title: "Support",
                items: ["Centre d'Aide", "Tutoriels", "Contact"],
              },
              {
                title: "Légal",
                items: ["Conditions d'Utilisation", "Politique de Confidentialité", "Mentions Légales"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">{section.title}</h4>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="hover:text-gray-900 transition-colors cursor-pointer">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-600">
            <p>&copy; 2025 ANDF - Tous droits réservés</p>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  )
}
