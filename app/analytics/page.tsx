"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, getOrders, getProducts, type Order, type Product } from "@/lib/utils"

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [dateFilter, setDateFilter] = useState("today")
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [productStats, setProductStats] = useState<any[]>([])

  useEffect(() => {
    // Load orders and products
    const loadedOrders = getOrders()
    const loadedProducts = getProducts()

    setOrders(loadedOrders)
    setProducts(loadedProducts)
  }, [])

  useEffect(() => {
    // Apply date filter
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 86400000 // 24 hours in milliseconds

    let filtered: Order[]

    switch (dateFilter) {
      case "today":
        filtered = orders.filter((order) => order.timestamp >= today)
        break
      case "yesterday":
        filtered = orders.filter((order) => order.timestamp >= yesterday && order.timestamp < today)
        break
      case "week":
        filtered = orders.filter((order) => order.timestamp >= today - 6 * 86400000)
        break
      case "month":
        filtered = orders.filter((order) => order.timestamp >= today - 29 * 86400000)
        break
      default:
        filtered = orders
    }

    setFilteredOrders(filtered)

    // Calculate product stats
    calculateProductStats(filtered)
  }, [dateFilter, orders, products])

  const calculateProductStats = (filteredOrders: Order[]) => {
    // Create a map to store product stats
    const statsMap = new Map()

    // Initialize with all products
    products.forEach((product) => {
      statsMap.set(product.id, {
        id: product.id,
        name: product.name,
        quantity: 0,
        revenue: 0,
        cost: product.costPrice,
        profit: 0,
      })
    })

    // Process orders
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (statsMap.has(item.productId)) {
          const stats = statsMap.get(item.productId)
          const product = products.find((p) => p.id === item.productId)

          if (product) {
            stats.quantity += item.quantity
            stats.revenue += item.price * item.quantity
            stats.profit += (item.price - product.costPrice) * item.quantity
          }
        }
      })
    })

    // Convert map to array and sort by revenue
    const statsArray = Array.from(statsMap.values())
      .filter((stat) => stat.quantity > 0)
      .sort((a, b) => b.revenue - a.revenue)

    setProductStats(statsArray)
  }

  const getTotalOrders = () => {
    return filteredOrders.length
  }

  const getTotalRevenue = () => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0)
  }

  const getTotalProfit = () => {
    return filteredOrders.reduce((sum, order) => sum + order.profit, 0)
  }

  const getTotalCost = () => {
    return filteredOrders.reduce((sum, order) => sum + order.cost, 0)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalOrders()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalCost())}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalProfit())}</div>
          </CardContent>
        </Card>
      </div>

      {/* Product Analytics Cards */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Product Performance</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productStats.map((stat) => (
            <Card key={stat.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{stat.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items Sold:</span>
                  <span className="font-medium">{stat.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium">{formatCurrency(stat.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor Payment:</span>
                  <span className="font-medium">{formatCurrency(stat.cost * stat.quantity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Profit:</span>
                  <span className="font-medium">{formatCurrency(stat.profit)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {productStats.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-4">
              No sales data available for the selected period
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Performance Table</CardTitle>
          </CardHeader>
          <CardContent>
            {productStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No sales data available for the selected period</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Vendor Payment</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium">{stat.name}</TableCell>
                      <TableCell>{stat.quantity}</TableCell>
                      <TableCell>{formatCurrency(stat.revenue)}</TableCell>
                      <TableCell>{formatCurrency(stat.cost * stat.quantity)}</TableCell>
                      <TableCell>{formatCurrency(stat.profit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
