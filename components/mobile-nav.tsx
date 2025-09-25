"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Upload, Search } from "lucide-react"
import Link from "next/link"

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/results", label: "Résultats", icon: Search },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden touch-target"
        aria-label="Menu de navigation"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-semibold">ANDF</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="touch-target">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors touch-target"
                    >
                      <item.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
