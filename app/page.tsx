import Link from "next/link"
import { ArrowRight, BarChart3, Clock, Package, ShoppingCart } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">StallMate POS</h1>
        <p className="text-muted-foreground mt-2">Simple point of sale system for your food stall</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/sales">
          <Card className="h-full transition-all hover:bg-muted/50">
            <CardHeader>
              <ShoppingCart className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Sales</CardTitle>
              <CardDescription>Process orders and checkout</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between" size="sm">
                Go to Sales
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
        <Link href="/inventory">
          <Card className="h-full transition-all hover:bg-muted/50">
            <CardHeader>
              <Package className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Inventory</CardTitle>
              <CardDescription>Manage your products and prices</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between" size="sm">
                Go to Inventory
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
        <Link href="/analytics">
          <Card className="h-full transition-all hover:bg-muted/50">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Analytics</CardTitle>
              <CardDescription>View sales data and insights</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between" size="sm">
                Go to Analytics
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
        <Link href="/orders">
          <Card className="h-full transition-all hover:bg-muted/50">
            <CardHeader>
              <Clock className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Recent Orders</CardTitle>
              <CardDescription>View and manage recent orders</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between" size="sm">
                View Orders
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  )
}
