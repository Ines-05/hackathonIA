"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react"

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
      text: "Bonjour ! Je suis votre assistant ANDF. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
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

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText("")

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(text),
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])

      // Text-to-speech for bot response
      if (speechEnabled && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(botResponse.text)
        utterance.lang = "fr-FR"
        utterance.rate = 0.9
        speechSynthesis.speak(utterance)
      }
    }, 1000)
  }

  const handlePredefinedQuestion = (question: string) => {
    sendMessage(question)
  }

  const startListening = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = "fr-FR"
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  const toggleSpeech = () => {
    setSpeechEnabled(!speechEnabled)
    if (speechEnabled && "speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
  }

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <div className="bg-primary text-white px-3 py-1 rounded-lg text-sm animate-blink shadow-lg">
            Besoin d'aide ?
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 ${
          isOpen ? "hidden" : "flex"
        } items-center justify-center bg-primary hover:bg-primary/90 animate-pulse-green`}
      >
        <MessageCircle className="w-6 h-6 text-white animate-blink" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col bg-white border-2 border-primary/20">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">Assistant ANDF</h3>
                <p className="text-xs opacity-90">En ligne</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleSpeech} className="text-white hover:bg-white/20 p-1">
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Predefined Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Questions fréquentes :</p>
              <div className="space-y-1">
                {predefinedQuestions.slice(0, 3).map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePredefinedQuestion(question)}
                    className="w-full justify-start text-xs h-auto py-1 px-2 text-left"
                  >
                    {question}
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
                onClick={startListening}
                disabled={isListening}
                className="p-2 bg-transparent"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button onClick={() => sendMessage(inputText)} disabled={!inputText.trim()} size="sm" className="p-2">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Cliquez sur le micro pour parler ou tapez votre question
            </p>
          </div>
        </Card>
      )}
    </>
  )
}
