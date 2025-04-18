"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Edit, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, getProducts, saveProduct, deleteProduct, type Product } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    costPrice: 0,
    salePrice: 0,
  })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load products from localStorage
    const loadedProducts = getProducts()
    setProducts(loadedProducts)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]: name === "name" ? value : Number.parseFloat(value) || 0,
      })
    } else {
      setNewProduct({
        ...newProduct,
        [name]: name === "name" ? value : Number.parseFloat(value) || 0,
      })
    }
  }

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newProduct.name) {
      toast({
        title: "Missing Information",
        description: "Please enter a product name",
        variant: "destructive",
      })
      return
    }

    const product: Product = {
      id: `PROD-${Date.now().toString().slice(-6)}`,
      name: newProduct.name || "",
      costPrice: newProduct.costPrice || 0,
      salePrice: newProduct.salePrice || 0,
    }

    // Save to localStorage
    saveProduct(product)

    // Update state
    setProducts([...products, product])

    // Reset form
    setNewProduct({
      name: "",
      costPrice: 0,
      salePrice: 0,
    })

    toast({
      title: "Product Added",
      description: `${product.name} has been added to inventory`,
    })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
  }

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingProduct) return

    // Save to localStorage
    saveProduct(editingProduct)

    // Update state
    setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)))

    // Reset editing state
    setEditingProduct(null)

    toast({
      title: "Product Updated",
      description: `${editingProduct.name} has been updated`,
    })
  }

  const handleDeleteProduct = (id: string) => {
    // Delete from localStorage
    deleteProduct(id)

    // Update state
    setProducts(products.filter((p) => p.id !== id))

    toast({
      title: "Product Deleted",
      description: "The product has been removed from inventory",
    })
  }

  const cancelEdit = () => {
    setEditingProduct(null)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No products in inventory</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                        <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                        <TableCell>{formatCurrency(product.salePrice - product.costPrice)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editingProduct ? editingProduct.name : newProduct.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="costPrice">Cost Price</Label>
                    <Input
                      id="costPrice"
                      name="costPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct ? editingProduct.costPrice : newProduct.costPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input
                      id="salePrice"
                      name="salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct ? editingProduct.salePrice : newProduct.salePrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button type="submit" className="w-full">
                      {editingProduct ? (
                        "Update Product"
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" /> Add Product
                        </>
                      )}
                    </Button>

                    {editingProduct && (
                      <Button type="button" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
