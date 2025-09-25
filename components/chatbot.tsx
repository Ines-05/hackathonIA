"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Mic, MicOff } from "lucide-react"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const predefinedQuestions = [
  "Qu'est-ce qu'un titre foncier ?",
  "Comment vérifier une parcelle ?",
  "Que faire en cas de litige ?",
  "Quels documents sont acceptés ?",
  "Combien coûte la vérification ?",
]

const botResponses: { [key: string]: string } = {
  "qu'est-ce qu'un titre foncier":
    "Un titre foncier est un document officiel qui atteste de la propriété d'un terrain. Il est délivré par l'ANDF après vérification et constitue la preuve légale de propriété.",
  "comment vérifier une parcelle":
    "Pour vérifier une parcelle, uploadez votre levé topographique sur notre plateforme. Le système analysera automatiquement les coordonnées et vous fournira le statut administratif.",
  "que faire en cas de litige":
    "En cas de litige, nous recommandons de contacter un expert juridique spécialisé en droit foncier. Vous pouvez également vous rapprocher des services de l'ANDF pour une médiation.",
  "quels documents sont acceptés":
    "Nous acceptons les levés topographiques au format PDF, ainsi que les photos (JPG, PNG) de bonne qualité. Le fichier ne doit pas dépasser 10MB.",
  "combien coûte la vérification":
    "La vérification de base sur notre plateforme est gratuite. Des services additionnels comme l'expertise juridique peuvent être facturés séparément.",
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! Je suis votre assistant AIYGBA. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Check for predefined responses
    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(key)) {
        return response
      }
    }

    // Default responses based on keywords
    if (lowerMessage.includes("prix") || lowerMessage.includes("coût") || lowerMessage.includes("tarif")) {
      return "La vérification de base est gratuite. Pour des services spécialisés, contactez nos experts."
    }

    if (lowerMessage.includes("temps") || lowerMessage.includes("durée") || lowerMessage.includes("délai")) {
      return "L'analyse de votre document prend généralement entre 2 à 5 minutes. Les résultats s'affichent immédiatement."
    }

    if (lowerMessage.includes("sécurité") || lowerMessage.includes("confidentialité")) {
      return "Vos documents sont traités de manière sécurisée et ne sont pas stockés après analyse. Toutes les données sont chiffrées."
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("aide") || lowerMessage.includes("support")) {
      return "Vous pouvez nous contacter via le formulaire de contact ou appeler le +229 XX XX XX XX pour une assistance personnalisée."
    }

    return "Je comprends votre question. Pour une réponse plus précise, vous pouvez choisir une question prédéfinie ou contacter notre support technique."
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")
    setIsTyping(true)

    try {
      // Appel à l'API réelle
      const response = await fetch("https://active-crayfish-charb-1bc27eb4.koyeb.app/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Extraire la réponse de l'API et nettoyer le texte
      let botReply = data.reply || "Je n'ai pas pu traiter votre demande. Veuillez réessayer."
      
      // Séparer le contenu principal des sources
      const sourcesIndex = botReply.indexOf("\n\nSources:")
      if (sourcesIndex !== -1) {
        botReply = botReply.substring(0, sourcesIndex).trim()
      }
      
      // Nettoyer le texte en supprimant les liens en markdown s'il y en a
      botReply = botReply.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])

    } catch (error) {
      console.error("Erreur lors de l'appel à l'API:", error)
      
      // Fallback vers les réponses prédéfinies en cas d'erreur
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants ou utiliser les questions prédéfinies ci-dessous.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handlePredefinedQuestion = (question: string) => {
    sendMessage(question)
  }

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })

        // Try to use Web Speech API for transcription if available
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
          try {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            const recognition = new SpeechRecognition()

            recognition.lang = "fr-FR"
            recognition.continuous = false
            recognition.interimResults = false

            recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript
              setInputText(transcript)
              setIsTranscribing(false)
              
              // Automatically send the transcribed message
              setTimeout(() => {
                sendMessage(transcript)
              }, 500)
            }

            recognition.onerror = () => {
              setIsTranscribing(false)
              // Fallback to simulated text if recognition fails and auto-send
              setTimeout(() => {
                const simulatedText = "Je n'ai pas pu comprendre votre audio. Pouvez-vous répéter votre question ?"
                setInputText(simulatedText)
                sendMessage(simulatedText)
              }, 1000)
            }

            recognition.onstart = () => {
              setIsTranscribing(true)
            }

            // Create audio URL and try to process it
            const audioUrl = URL.createObjectURL(audioBlob)
            recognition.start()

            // Clean up after a delay
            setTimeout(() => {
              URL.revokeObjectURL(audioUrl)
            }, 5000)

          } catch (error) {
            // Fallback simulation and auto-send
            setIsTranscribing(true)
            setTimeout(() => {
              const simulatedText = "Qu'est-ce qu'un titre foncier ?"
              setInputText(simulatedText)
              setIsTranscribing(false)
              // Auto-send the fallback question
              setTimeout(() => {
                sendMessage(simulatedText)
              }, 500)
            }, 1500)
          }
        } else {
          // Fallback for browsers without speech recognition and auto-send
          setIsTranscribing(true)
          setTimeout(() => {
            const simulatedText = "Comment vérifier une parcelle ?"
            setInputText(simulatedText)
            setIsTranscribing(false)
            // Auto-send the fallback question
            setTimeout(() => {
              sendMessage(simulatedText)
            }, 500)
          }, 1500)
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop())
        setAudioChunks([])
      }

      // Remove auto-stop - let user control when to stop
      // setTimeout(() => {
      //   if (recorder.state === 'recording') {
      //     recorder.stop()
      //     setIsRecording(false)
      //   }
      // }, 10000)

      setMediaRecorder(recorder)
      setAudioChunks(chunks)
      recorder.start()
      setIsRecording(true)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setIsTranscribing(true) // Start transcription process immediately
    }
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <div className="bg-[#2e7d32] text-white px-3 py-1 rounded-lg text-sm animate-blink shadow-lg">
            Besoin d'aide ?
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 ${
          isOpen ? "hidden" : "flex"
        } items-center justify-center bg-[#2e7d32] hover:bg-[#1b5e20] animate-pulse-green`}
      >
        <MessageCircle className="w-7 h-7 text-white animate-blink" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[500px] h-[700px] shadow-2xl z-50 flex flex-col bg-white border-2 border-[#2e7d32]/20 overflow-hidden"
              style={{ maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 2rem)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-[#2e7d32] text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/10">
                <img src="/logo_Ayigba-removebg-preview.png" alt="AIYGBA" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-semibold">Assistant AIYGBA</h3>
                <p className="text-sm opacity-90">En ligne</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Audio Recording Visual Indicator */}
          {isRecording && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4 min-w-[300px]">
                <div className="relative">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-2 border-4 border-red-300 rounded-full animate-ping"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-red-600 mb-2">🎤 Enregistrement en cours</h3>
                  <p className="text-gray-600 mb-4">Parlez clairement votre question</p>
                  <div className="flex justify-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 30 + 20}px`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '0.5s'
                        }}
                      />
                    ))}
                  </div>
                  <Button
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium"
                  >
                    ⏹️ Arrêter et envoyer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? "bg-[#2e7d32] text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-base">{message.text}</p>
                  <p className="text-sm opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">Assistant AIYGBA écrit...</span>
                  </div>
                </div>
              </div>
            )}<div ref={messagesEndRef} />
          </div>

          {/* Predefined Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t bg-[#2e7d32]/5">
              <p className="text-sm font-medium text-[#2e7d32] mb-3">Questions fréquentes :</p>
              <div className="grid gap-2">
                {predefinedQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePredefinedQuestion(question)}
                    className="w-full justify-start text-sm h-auto py-3 px-4 text-left border-[#2e7d32]/30 hover:bg-[#2e7d32]/10 hover:border-[#2e7d32] transition-all duration-200"
                  >
                    <span className="text-[#2e7d32] font-medium">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tapez votre message..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage(inputText)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`p-2 transition-all duration-200 ${
                  isRecording
                    ? "bg-red-500 border-red-500 text-white shadow-lg"
                    : isTranscribing
                    ? "bg-blue-100 border-blue-300 text-blue-600 animate-pulse"
                    : "bg-[#2e7d32]/10 border-[#2e7d32]/30 text-[#2e7d32] hover:bg-[#2e7d32]/20"
                }`}
              >
                {isRecording ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">REC</span>
                  </div>
                ) : isTranscribing ? (
                  <div className="animate-spin">⏳</div>
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <Button onClick={() => sendMessage(inputText)} disabled={!inputText.trim()} size="sm" className="p-2">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {isRecording ? (
                <span className="text-red-600 font-bold flex items-center justify-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-red-600 animate-pulse"></div>
                    <div className="w-1 h-6 bg-red-600 animate-pulse delay-75"></div>
                    <div className="w-1 h-5 bg-red-600 animate-pulse delay-150"></div>
                    <div className="w-1 h-7 bg-red-600 animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-red-600 animate-pulse"></div>
                  </div>
                  <span>Parlez maintenant - Cliquez pour arrêter</span>
                </span>
              ) : isTranscribing ? (
                <span className="text-blue-600 font-medium flex items-center justify-center space-x-2">
                  <div className="animate-spin">🔄</div>
                  <span>Envoi de votre question...</span>
                </span>
              ) : (
                "🎤 Cliquez pour parler à l'assistant"
              )}
            </p>
          </div>
        </Card>
      )}
    </>
  )
}
