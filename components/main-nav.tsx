"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Clock, Home, Menu, Package, ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function MainNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-5 w-5 mr-2" />,
      active: pathname === "/",
    },
    {
      href: "/sales",
      label: "Sales",
      icon: <ShoppingCart className="h-5 w-5 mr-2" />,
      active: pathname === "/sales",
    },
    {
      href: "/inventory",
      label: "Inventory",
      icon: <Package className="h-5 w-5 mr-2" />,
      active: pathname === "/inventory",
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5 mr-2" />,
      active: pathname === "/analytics",
    },
    {
      href: "/orders",
      label: "Orders",
      icon: <Clock className="h-5 w-5 mr-2" />,
      active: pathname === "/orders",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center">
          <ShoppingCart className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold">StallMate POS</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold">StallMate POS</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="container grid gap-4 px-4 pb-8 pt-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center py-3 text-base font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
