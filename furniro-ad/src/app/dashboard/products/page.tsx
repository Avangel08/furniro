"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Package, ImagePlus, X } from "lucide-react";

// Mock product data
const mockProducts = [
  {
    id: "1",
    name: "Modern Beige Sofa",
    category: "Seating",
    price: "$1,299",
    stock: 24,
    status: "Active",
    image: "/placeholder-furniture.jpg",
    sku: "SOF-MOD-001"
  },
  {
    id: "2",
    name: "Oak Coffee Table",
    category: "Tables",
    price: "$499",
    stock: 12,
    status: "Active", 
    image: "/placeholder-furniture.jpg",
    sku: "TBL-OAK-002"
  },
  {
    id: "3",
    name: "Scandinavian Chair Set",
    category: "Seating", 
    price: "$299",
    stock: 0,
    status: "Out of Stock",
    image: "/placeholder-furniture.jpg",
    sku: "CHR-SCA-003"
  },
  {
    id: "4",
    name: "Wooden Wardrobe",
    category: "Storage",
    price: "$899",
    stock: 8,
    status: "Active",
    image: "/placeholder-furniture.jpg", 
    sku: "WAR-WOO-004"
  },
  {
    id: "5",
    name: "Minimalist Bed Frame",
    category: "Bedroom",
    price: "$699",
    stock: 15,
    status: "Active",
    image: "/placeholder-furniture.jpg",
    sku: "BED-MIN-005"
  },
  {
    id: "6",
    name: "Vintage Armchair",
    category: "Seating",
    price: "$799",
    stock: 3,
    status: "Low Stock",
    image: "/placeholder-furniture.jpg",
    sku: "CHR-VIN-006"
  }
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products] = useState(mockProducts);
  const { toast } = useToast();

  // Add Product sheet/modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const imagePreviews = useMemo(() => selectedImages.map((f) => URL.createObjectURL(f)), [selectedImages]);

  const addProductSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    sku: z.string().min(2, "SKU is required"),
    category: z.string().min(2, "Category is required"),
    price: z
      .string()
      .refine((v) => /^\d+(\.|,)?\d{0,2}$/.test(v), {
        message: "Enter a valid price",
      }),
    stock: z
      .string()
      .refine((v) => /^\d+$/.test(v), { message: "Stock must be a number" }),
  });

  type AddProductForm = z.infer<typeof addProductSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      price: "",
      stock: "",
    },
  });

  const handleSelectImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const combined = [...selectedImages, ...newFiles].slice(0, 5);
    setSelectedImages(combined);
  };

  const removeImageAt = (idx: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (values: AddProductForm) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));

    toast({
      title: "Product created",
      description: "Your product has been added to inventory.",
    });

    // Reset form and close
    reset();
    setSelectedImages([]);
    setIsAddOpen(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-furniro-brown">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your furniture inventory and product catalog
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-gradient-beige hover:opacity-90 transition-smooth">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Add Product Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="right" className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-furniro-brown">Add New Product</SheetTitle>
            <SheetDescription>
              Enter product details. Upload up to 5 images that showcase the furniture.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="Ex: Modern Beige Sofa" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="Ex: SOF-MOD-001" {...register("sku")} />
                {errors.sku && (
                  <p className="text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Ex: Seating" {...register("category")} />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" placeholder="1299" {...register("price")} />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" placeholder="24" {...register("stock")} />
                {errors.stock && (
                  <p className="text-sm text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Product Images</Label>
              <div className="rounded-lg border border-dashed p-4 bg-gradient-beige/40">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Upload up to 5 images. PNG, JPG recommended.
                  </div>
                  <label htmlFor="images" className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground cursor-pointer hover:opacity-90">
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Choose Files
                  </label>
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleSelectImages(e.target.files)}
                  />
                </div>

                {selectedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={src} className="relative group rounded-md overflow-hidden bg-white shadow-soft">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Preview ${idx + 1}`} className="h-24 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-white/90 shadow hover:bg-white"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-beige hover:opacity-90" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products by name, category, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">Category</Button>
            <Button variant="outline">Status</Button>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Product Inventory ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-beige rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-furniro-brown" />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {product.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{product.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${product.stock < 5 && product.stock > 0 ? 'text-yellow-600' : product.stock === 0 ? 'text-red-600' : ''}`}>
                        {product.stock}
                      </span>
                      <span className="text-muted-foreground text-sm">units</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={getStatusColor(product.status)}
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
