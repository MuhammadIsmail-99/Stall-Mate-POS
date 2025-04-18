"use client"

import { useState, useEffect } from "react"
import { Download, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, getOrders, exportToCSV, type Order } from "@/lib/utils"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])

  useEffect(() => {
    // Load orders
    const loadedOrders = getOrders()
    setOrders(loadedOrders.sort((a, b) => b.timestamp - a.timestamp))
  }, [])

  useEffect(() => {
    // Filter orders based on search term
    if (searchTerm) {
      const filtered = orders.filter((order) => order.id.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredOrders(filtered)
    } else {
      setFilteredOrders(orders)
    }
  }, [searchTerm, orders])

  const handleExport = () => {
    // Prepare data for export
    const exportData = filteredOrders.map((order) => ({
      OrderID: order.id,
      Date: new Date(order.timestamp).toLocaleDateString(),
      Time: new Date(order.timestamp).toLocaleTimeString(),
      Items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      Total: order.total,
      Cost: order.cost,
      Profit: order.profit,
    }))

    // Export to CSV
    exportToCSV(exportData, `orders-export-${Date.now()}.csv`)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Recent Orders</h1>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID..."
              className="pl-8 w-full sm:w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {searchTerm ? "No orders found matching your search" : "No orders available"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      {new Date(order.timestamp).toLocaleDateString()} {new Date(order.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px] truncate">
                        {order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>{formatCurrency(order.profit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
