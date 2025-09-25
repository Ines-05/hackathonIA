"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, Maximize } from 'lucide-react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function TutorialVideo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVerificationButton, setShowVerificationButton] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180) // 3 minutes par défaut
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setShowVerificationButton(true)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      // Afficher le bouton quand la vidéo arrive à 80% de completion
      if (videoRef.current.currentTime / duration > 0.8) {
        setShowVerificationButton(true)
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <section id="tutorial-video" className="py-12 sm:py-16 lg:py-20 mobile-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in-up">
            Comment utiliser la plateforme ?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Regardez cette vidéo de 3 minutes pour apprendre à vérifier votre terrain facilement.
          </p>
        </div>

        {/* Video Container */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl animate-scale-in group" style={{ animationDelay: "0.4s" }}>
          <div className="aspect-video relative">
            {/* Placeholder Video Area */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {/* Play Button Overlay */}
              <button 
                onClick={togglePlay}
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 animate-pulse-green group-hover:scale-110"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white ml-1" />
                )}
              </button>

              {/* Video Info Overlay */}
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center space-x-2 text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                <button className="p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors">
                  <Volume2 className="w-4 h-4 text-white" />
                </button>
                <button className="p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors">
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* For future real video implementation */}
            {/* <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnd}
              style={{ display: 'none' }} // Hidden until real video is available
            >
              <source src="/tutorial-video.mp4" type="video/mp4" />
            </video> */}
          </div>
        </div>

        {/* Instructions below video */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            Cliquez sur le bouton play pour démarrer la vidéo
          </div>
        </div>

        {/* Action button - always visible but with different states */}
        <div className={`mt-8 transition-all duration-500 ${showVerificationButton ? 'animate-bounce-gentle' : ''}`}>
          <Link href="/upload">
            <Button
              size="lg"
              className={`bg-green-600 hover:bg-green-700 text-white px-16 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 btn-animate hover-glow text-xl font-bold min-h-[70px] ${
                showVerificationButton ? 'animate-pulse-green scale-110' : ''
              }`}
            >
              {showVerificationButton ? 'Faire une vérification maintenant' : 'Passer la vidéo et vérifier'}
              <ArrowRight className="w-7 h-7 ml-4" />
            </Button>
          </Link>
          <p className="text-gray-500 text-base mt-4">
            {showVerificationButton 
              ? 'Parfait ! Vous êtes prêt à vérifier votre terrain !' 
              : 'Ou commencez directement votre vérification'
            }
          </p>
        </div>
      </div>
    </section>
  )
}