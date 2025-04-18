"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, ShoppingCart, RefreshCw, Check } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  formatCurrency,
  getProducts,
  saveOrder,
  type Product,
  type OrderItem,
  type Order,
  getNextOrderNumber,
  saveLastOrderNumber,
} from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load products from localStorage
    const loadedProducts = getProducts()
    setProducts(loadedProducts)

    // Load recent orders
    const orders = localStorage.getItem("orders")
    if (orders) {
      const parsedOrders = JSON.parse(orders) as Order[]
      setRecentOrders(parsedOrders.slice(-5).reverse())
    }
  }, [])

  const addToOrder = (product: Product) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id)

      if (existingItem) {
        return prev.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            price: product.salePrice,
          },
        ]
      }
    })
  }

  const removeFromOrder = (productId: string) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.productId === productId)

      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
      } else {
        return prev.filter((item) => item.productId !== productId)
      }
    })
  }

  const resetOrder = () => {
    setCurrentOrder([])
  }

  const checkout = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order before checkout",
        variant: "destructive",
      })
      return
    }

    // Calculate total
    const total = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Calculate cost and profit
    const cost = currentOrder.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)
      return sum + (product?.costPrice || 0) * item.quantity
    }, 0)

    const profit = total - cost

    // Get next order number
    const orderNumber = getNextOrderNumber()

    // Create order object
    const order: Order = {
      id: orderNumber.toString(),
      items: [...currentOrder],
      total,
      timestamp: Date.now(),
      cost,
      profit,
    }

    // Save order
    saveOrder(order)

    // Save last order number
    saveLastOrderNumber(orderNumber)

    // Update recent orders
    setRecentOrders((prev) => [order, ...prev].slice(0, 5))

    // Show success message
    setCheckoutSuccess(true)
    setTimeout(() => setCheckoutSuccess(false), 3000)

    // Reset current order
    resetOrder()

    toast({
      title: "Order Completed",
      description: `Order #${order.id} has been saved`,
    })
  }

  const calculateTotal = () => {
    return currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Sales</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xl font-bold">{formatCurrency(product.salePrice)}</p>
                </CardContent>
                <CardFooter className="p-4 bg-muted/50">
                  <Button className="w-full" onClick={() => addToOrder(product)}>
                    <Plus className="h-4 w-4 mr-2" /> Add to Order
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Current Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentOrder.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No items in order</p>
              ) : (
                <div className="space-y-4">
                  {currentOrder.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromOrder(item.productId)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => addToOrder(products.find((p) => p.id === item.productId)!)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={checkout} disabled={currentOrder.length === 0 || checkoutSuccess}>
                {checkoutSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Order Complete
                  </>
                ) : (
                  "Checkout"
                )}
              </Button>
              <Button variant="outline" className="w-full" onClick={resetOrder} disabled={currentOrder.length === 0}>
                <RefreshCw className="h-4 w-4 mr-2" /> Reset Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <div className="font-medium">{order.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.timestamp).toLocaleTimeString()} •{" "}
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </div>
                    </div>
                    <div className="font-medium">{formatCurrency(order.total)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
