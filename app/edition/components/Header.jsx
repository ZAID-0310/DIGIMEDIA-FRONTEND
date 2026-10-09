"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-slate-800 text-white px-6 max-[359px]:px-3 py-3 h-16 fixed w-full z-10">
      <div className="flex items-center pl-2 max-[359px]:pl-0 lg:ml-56">
        <Link href="/" className="flex items-center">
          {/* Logo completo (isotipo + texto) - tablet y desktop */}
          <img
            src="/headerFooter/logoblanco2.webp"
            alt="Digimedia"
            width="150"
            height="50"
            className="h-12 w-auto object-contain max-[359px]:hidden"
          />

          {/* Isotipo - pantallas muy pequeñas (320px) */}
          <div className="hidden max-[359px]:block h-9 w-10 overflow-hidden">
            <img
              src="/headerFooter/logoblanco2.webp"
              alt="Digimedia"
              width="150"
              height="50"
              className="h-9 w-auto max-w-none object-contain object-left"
            />
          </div>
        </Link>
      </div>

      <Button variant="destructive" size="sm" asChild className="bg-red-600 hover:bg-red-700 px-2 sm:px-3">
        <Link href="/dashboard/blogs" className="flex items-center" aria-label="Regresar">
          <ArrowLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Regresar</span>
        </Link>
      </Button>
    </header>
  )
}