import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Types for our POS system
export interface Product {
  id: string
  name: string
  costPrice: number
  salePrice: number
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  timestamp: number
  cost: number
  profit: number
}

// File system helpers
const PRODUCTS_FILE_KEY = "products_csv_data"
const ORDERS_FILE_KEY = "orders_csv_data"

// Local storage helpers
export function getProducts(): Product[] {
  if (typeof window === "undefined") return []

  // Try to get from localStorage first
  const products = localStorage.getItem("products")
  if (products) {
    return JSON.parse(products)
  }

  // If not in localStorage, try to load from saved CSV data
  const productsCSV = localStorage.getItem(PRODUCTS_FILE_KEY)
  if (productsCSV) {
    const importedProducts = importProductsFromCSV(productsCSV)
    if (importedProducts.length > 0) {
      return importedProducts
    }
  }

  return []
}

export function saveProduct(product: Product) {
  const products = getProducts()
  const existingIndex = products.findIndex((p) => p.id === product.id)

  if (existingIndex >= 0) {
    products[existingIndex] = product
  } else {
    products.push(product)
  }

  localStorage.setItem("products", JSON.stringify(products))

  // Automatically save to CSV format in localStorage
  autoSaveProductsToCSV(products)
}

export function deleteProduct(id: string) {
  const products = getProducts()
  const filtered = products.filter((p) => p.id !== id)
  localStorage.setItem("products", JSON.stringify(filtered))

  // Automatically save to CSV format in localStorage
  autoSaveProductsToCSV(filtered)
}

export function getOrders(): Order[] {
  if (typeof window === "undefined") return []

  // Try to get from localStorage first
  const orders = localStorage.getItem("orders")
  if (orders) {
    return JSON.parse(orders)
  }

  // If not in localStorage, try to load from saved CSV data
  const ordersCSV = localStorage.getItem(ORDERS_FILE_KEY)
  if (ordersCSV) {
    const importedOrders = importOrdersFromCSV(ordersCSV)
    if (importedOrders.length > 0) {
      return importedOrders
    }
  }

  return []
}

export function saveOrder(order: Order) {
  const orders = getOrders()
  orders.push(order)
  localStorage.setItem("orders", JSON.stringify(orders))

  // Automatically save to CSV format in localStorage
  autoSaveOrdersToCSV(orders)
}

export function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0])
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(","))

  // Add rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      return `"${value}"`
    })
    csvRows.push(values.join(","))
  }

  // Create CSV content
  const csvContent = csvRows.join("\n")

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Add these functions to handle sequential order numbers and CSV import/export

// Get the next order number
export function getNextOrderNumber(): number {
  if (typeof window === "undefined") return 1
  const lastOrderNumber = localStorage.getItem("lastOrderNumber")
  return lastOrderNumber ? Number.parseInt(lastOrderNumber) + 1 : 1
}

// Save the last order number
export function saveLastOrderNumber(orderNumber: number) {
  localStorage.setItem("lastOrderNumber", orderNumber.toString())
}

// Auto-save products to CSV format in localStorage
function autoSaveProductsToCSV(products: Product[]) {
  if (products.length === 0) return

  const headers = ["id", "name", "costPrice", "salePrice"]
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(","))

  // Add rows
  for (const product of products) {
    const values = headers.map((header) => {
      const value = product[header as keyof Product]
      return `"${value}"`
    })
    csvRows.push(values.join(","))
  }

  // Create CSV content
  const csvContent = csvRows.join("\n")

  // Save to localStorage
  localStorage.setItem(PRODUCTS_FILE_KEY, csvContent)
}

// Auto-save orders to CSV format in localStorage
function autoSaveOrdersToCSV(orders: Order[]) {
  if (orders.length === 0) return

  const headers = ["id", "timestamp", "total", "cost", "profit", "items"]
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(","))

  // Add rows
  for (const order of orders) {
    const values = headers.map((header) => {
      if (header === "items") {
        return `"${JSON.stringify(order.items).replace(/"/g, '""')}"`
      }
      const value = order[header as keyof Order]
      return `"${value}"`
    })
    csvRows.push(values.join(","))
  }

  // Create CSV content
  const csvContent = csvRows.join("\n")

  // Save to localStorage
  localStorage.setItem(ORDERS_FILE_KEY, csvContent)
}

// Import products from CSV
export function importProductsFromCSV(csvContent: string): Product[] {
  try {
    const lines = csvContent.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    // Validate headers
    if (
      !headers.includes("id") ||
      !headers.includes("name") ||
      !headers.includes("costPrice") ||
      !headers.includes("salePrice")
    ) {
      return []
    }

    const products: Product[] = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      // Handle quoted values with commas inside
      const values: string[] = []
      let inQuotes = false
      let currentValue = ""

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(currentValue.replace(/"/g, ""))
          currentValue = ""
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.replace(/"/g, ""))

      const product: any = {}
      headers.forEach((header, index) => {
        if (header === "costPrice" || header === "salePrice") {
          product[header] = Number.parseFloat(values[index])
        } else {
          product[header] = values[index]
        }
      })

      products.push(product as Product)
    }

    // Save products to localStorage
    localStorage.setItem("products", JSON.stringify(products))
    return products
  } catch (error) {
    console.error("Error importing products:", error)
    return []
  }
}

// Import orders from CSV
export function importOrdersFromCSV(csvContent: string): Order[] {
  try {
    const lines = csvContent.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    // Validate headers
    if (
      !headers.includes("id") ||
      !headers.includes("timestamp") ||
      !headers.includes("total") ||
      !headers.includes("items")
    ) {
      return []
    }

    const orders: Order[] = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      // Handle quoted values with commas inside
      const values: string[] = []
      let inQuotes = false
      let currentValue = ""

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(currentValue.replace(/"/g, ""))
          currentValue = ""
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.replace(/"/g, ""))

      const order: any = {}
      headers.forEach((header, index) => {
        if (header === "items") {
          try {
            order[header] = JSON.parse(values[index])
          } catch {
            order[header] = []
          }
        } else if (header === "total" || header === "cost" || header === "profit") {
          order[header] = Number.parseFloat(values[index])
        } else if (header === "timestamp") {
          order[header] = Number.parseInt(values[index])
        } else {
          order[header] = values[index]
        }
      })

      orders.push(order as Order)
    }

    // Save orders to localStorage
    localStorage.setItem("orders", JSON.stringify(orders))

    // Update last order number
    const orderNumbers = orders.map((order) => {
      const num = Number.parseInt(order.id.replace(/\D/g, ""))
      return isNaN(num) ? 0 : num
    })

    if (orderNumbers.length > 0) {
      const maxOrderNumber = Math.max(...orderNumbers)
      saveLastOrderNumber(maxOrderNumber)
    }

    return orders
  } catch (error) {
    console.error("Error importing orders:", error)
    return []
  }
}

// Function to check if data needs to be restored
export function checkAndRestoreData() {
  // Check if we need to restore products
  const products = localStorage.getItem("products")
  if (!products || JSON.parse(products).length === 0) {
    const productsCSV = localStorage.getItem(PRODUCTS_FILE_KEY)
    if (productsCSV) {
      importProductsFromCSV(productsCSV)
    }
  }

  // Check if we need to restore orders
  const orders = localStorage.getItem("orders")
  if (!orders || JSON.parse(orders).length === 0) {
    const ordersCSV = localStorage.getItem(ORDERS_FILE_KEY)
    if (ordersCSV) {
      importOrdersFromCSV(ordersCSV)
    }
  }
}
