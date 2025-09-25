"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export default function ResponsiveHero() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 mobile-padding bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="animate-fade-in-up order-2 lg:order-1">
            <div className="inline-flex items-center bg-primary/10 text-primary px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
              Plateforme Officielle ANDF
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 text-balance leading-tight">
              Benin Land Check
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 text-pretty max-w-2xl">
              Bienvenue. Uploadez votre levé topographique pour vérifier la situation de votre terrain.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/upload" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 btn-animate hover-glow touch-target"
                >
                  Commencer la Vérification
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-transparent hover-lift touch-target"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Tutoriel Vidéo
              </Button>
            </div>
          </div>

          {/* Visual Content */}
          <div className="animate-slide-in-right order-1 lg:order-2">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border hover-lift">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                    <span className="text-2xl sm:text-3xl">😊</span>
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg">Comment ça marche ?</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                    Suivez ces étapes simples pour vérifier votre parcelle.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: "Upload", desc: "Ajoutez votre document", color: "bg-blue-500" },
                    { label: "Analyse", desc: "Traitement automatique", color: "bg-purple-500" },
                    { label: "Carte", desc: "Visualisation sur carte", color: "bg-green-500" },
                    { label: "PDF", desc: "Rapport officiel", color: "bg-orange-500" },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors card-interactive"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm animate-scale-in`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{step.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
