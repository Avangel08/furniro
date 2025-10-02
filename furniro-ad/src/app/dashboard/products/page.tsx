"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, CreateProductData, UpdateProductData } from "@/services/productService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
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

// Product interface for display
interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  status: string;
  sku: string;
  brand?: string;
  description: string;
  weight?: number;
  dimensions?: string;
  material?: string;
  color?: string;
  tags?: string[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Fetch products from MongoDB
  const { 
    data: productsResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => productService.getProducts({ 
      search: searchQuery || undefined,
      limit: 50 
    }),
  });

  const products = productsResponse?.data || [];

  // Add Product sheet/modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [editSelectedImages, setEditSelectedImages] = useState<File[]>([]);
  const imagePreviews = useMemo(() => selectedImages.map((f) => URL.createObjectURL(f)), [selectedImages]);
  const editImagePreviews = useMemo(() => editSelectedImages.map((f) => URL.createObjectURL(f)), [editSelectedImages]);

  const addProductSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    sku: z.string().min(2, "SKU is required"),
    category: z.enum(["Dining", "Living", "Bedroom"], {
      required_error: "Please select a category",
    }),
    brand: z.string().optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z
      .string()
      .refine((v) => /^\d+(\.|,)?\d{0,2}$/.test(v), {
        message: "Enter a valid price",
      }),
    oldPrice: z
      .string()
      .optional()
      .refine((v) => !v || /^\d+(\.|,)?\d{0,2}$/.test(v), {
        message: "Enter a valid old price",
      }),
    stock: z
      .string()
      .refine((v) => /^\d+$/.test(v), { message: "Stock must be a number" }),
    status: z.enum(["Active", "Inactive", "Draft"], {
      required_error: "Please select a status",
    }),
    weight: z.string().optional(),
    dimensions: z.string().optional(),
    material: z.string().optional(),
    color: z.string().optional(),
    tags: z.string().optional(),
    images: z.array(z.string()).optional(),
  });

  type AddProductForm = z.infer<typeof addProductSchema>;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "Dining" as const,
      brand: "",
      description: "",
      price: "",
      oldPrice: "",
      stock: "",
      status: "Active" as const,
      weight: "",
      dimensions: "",
      material: "",
      color: "",
      tags: "",
      images: [],
    },
  });

  // Edit Product form
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    reset: editReset,
    control: editControl,
    formState: { errors: editErrors, isSubmitting: editIsSubmitting },
  } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
  });

  const handleSelectImages = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    newFiles.forEach((file) => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB. Please choose a smaller file.`,
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return;
      }
      
      validFiles.push(file);
    });
    
    // Check if we would exceed the limit
    const totalFiles = selectedImages.length + validFiles.length;
    const finalFiles = [...selectedImages, ...validFiles].slice(0, 6);
    
    console.log('🔍 Image Upload Debug:', {
      currentImages: selectedImages.length,
      newValidFiles: validFiles.length,
      totalFiles,
      finalFilesCount: finalFiles.length,
      maxAllowed: 6
    });
    
    setSelectedImages(finalFiles);
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Some files were skipped",
        description: "Only valid image files under 5MB were added.",
        variant: "destructive",
      });
    }
    
    if (totalFiles > 6) {
      const skippedCount = totalFiles - 6;
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to 6 images per product. ${skippedCount} file(s) were not added.`,
        variant: "destructive",
      });
    }
  };

  const removeImageAt = (idx: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEditSelectImages = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    newFiles.forEach((file) => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB. Please choose a smaller file.`,
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return;
      }
      
      validFiles.push(file);
    });
    
    // Check total images limit (current + existing new + new files)
    const currentImagesCount = selectedProduct?.images?.length || 0;
    const existingNewImagesCount = editSelectedImages.length;
    const totalAfterAdding = currentImagesCount + existingNewImagesCount + validFiles.length;
    
    // Calculate how many new images we can actually add
    const maxNewImages = Math.max(0, 6 - currentImagesCount - existingNewImagesCount);
    const finalFiles = [...editSelectedImages, ...validFiles.slice(0, maxNewImages)];
    
    setEditSelectedImages(finalFiles);
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Some files were skipped",
        description: "Only valid image files under 5MB were added.",
        variant: "destructive",
      });
    }
    
    if (totalAfterAdding > 6) {
      const skippedCount = totalAfterAdding - 6;
      toast({
        title: "Maximum total images reached",
        description: `You can only have 6 images total per product. ${skippedCount} file(s) were not added. Current: ${currentImagesCount}, New: ${finalFiles.length}`,
        variant: "destructive",
      });
    }
  };

  const removeEditImageAt = (idx: number) => {
    setEditSelectedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductData) => productService.createProduct(data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Product created",
          description: `"${response.data?.name}" has been added to inventory with status: ${response.data?.status}.`,
        });
        
        // Refresh products list
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        // Reset form and close
        reset();
        setSelectedImages([]);
        setIsAddOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create product",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: AddProductForm) => {
    try {
      let imageUrls: string[] = [];
      
      // Upload images if any were selected
      if (selectedImages.length > 0) {
        setIsUploadingImages(true);
        
        const uploadFormData = new FormData();
        selectedImages.forEach((file) => {
          uploadFormData.append('files', file);
        });
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.success) {
          imageUrls = uploadResult.data;
          toast({
            title: "Images uploaded",
            description: `Successfully uploaded ${imageUrls.length} images`,
          });
        } else {
          toast({
            title: "Image upload failed",
            description: uploadResult.error || "Failed to upload images",
            variant: "destructive",
          });
          return; // Don't proceed if image upload fails
        }
      }
      
      // Create product with uploaded image URLs
      const formData = {
        ...values,
        oldPrice: values.oldPrice ? parseFloat(values.oldPrice) : undefined,
        images: imageUrls
      };
      
      createProductMutation.mutate(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImages(false);
    }
  };

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) => 
      productService.updateProduct(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Product updated",
          description: `"${response.data?.name}" has been updated successfully.`,
        });
        
        // Refresh products list
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        // Reset form and close
        editReset();
        setEditSelectedImages([]);
        setIsEditOpen(false);
        setSelectedProduct(null);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update product",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Product deleted",
          description: "Product has been successfully deleted.",
        });
        
        // Refresh products list
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        // Close dialog
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete product",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const onEditSubmit = async (values: AddProductForm) => {
    if (!selectedProduct) return;
    
    try {
      let newImageUrls: string[] = [];
      
      // Upload new images if any were selected
      if (editSelectedImages.length > 0) {
        const uploadFormData = new FormData();
        editSelectedImages.forEach((file) => {
          uploadFormData.append('files', file);
        });
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        const uploadResult = await uploadResponse.json();
        
        if (uploadResult.success) {
          newImageUrls = uploadResult.data;
        } else {
          toast({
            title: "Image upload failed",
            description: uploadResult.error || "Failed to upload new images",
            variant: "destructive",
          });
          return; // Don't proceed if image upload fails
        }
      }
      
      // Use current images from selectedProduct (which may have been modified by delete actions)
      const currentImages = selectedProduct.images || [];
      const formData = {
        ...values,
        oldPrice: values.oldPrice ? parseFloat(values.oldPrice) : undefined,
        images: [...currentImages, ...newImageUrls]
      };
      
      updateProductMutation.mutate({ 
        id: selectedProduct._id, 
        data: formData 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    }
  };

  // Event handlers
  const handleViewDetails = async (productId: string) => {
    try {
      const response = await productService.getProduct(productId);
      if (response.success && response.data) {
        setSelectedProduct(response.data as Product);
        setIsViewOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (productId: string) => {
    try {
      const response = await productService.getProduct(productId);
      if (response.success && response.data) {
        const product = response.data as Product;
        setSelectedProduct(product);
        
        // Pre-fill form with current data
        editReset({
          name: product.name,
          sku: product.sku,
          category: product.category as "Dining" | "Living" | "Bedroom",
          brand: product.brand || "",
          description: product.description,
          price: product.price.toString(),
          oldPrice: product.oldPrice?.toString() || "",
          stock: product.stock.toString(),
          status: product.status as "Active" | "Inactive" | "Draft",
          weight: product.weight?.toString() || "",
          dimensions: product.dimensions || "",
          material: product.material || "",
          color: product.color || "",
          tags: product.tags?.join(", ") || "",
          images: product.images || [],
        });
        
        setEditSelectedImages([]);
        setIsEditOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to load product for editing",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product for editing",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete._id);
    }
  };

  // Products are already filtered by the API call, so we use them directly
  const filteredProducts = products;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return '';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-furniro-brown">Products</h1>
            <p className="text-muted-foreground mt-1">Loading products...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-furniro-brown">Products</h1>
            <p className="text-muted-foreground mt-1">Error loading products</p>
          </div>
        </div>
        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Failed to load products. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-furniro-brown">Add New Product</SheetTitle>
            <SheetDescription>
              Enter product details. Upload up to 6 images that showcase the furniture.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" placeholder="Ex: Modern Beige Sofa" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea 
                  id="description"
                  placeholder="Describe the product features, materials, and benefits..."
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input 
                    id="sku" 
                    placeholder="Ex: SOF-MOD-001" 
                    {...register("sku")} 
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      register("sku").onChange(e);
                    }}
                  />
                  {errors.sku && (
                    <p className="text-sm text-red-600">{errors.sku.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dining">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              Dining
                            </div>
                          </SelectItem>
                          <SelectItem value="Living">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Living
                            </div>
                          </SelectItem>
                          <SelectItem value="Bedroom">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              Bedroom
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" placeholder="Ex: IKEA, West Elm" {...register("brand")} />
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Pricing & Inventory</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="price" placeholder="1299" className="pl-8" {...register("price")} />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oldPrice">Old Price ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="oldPrice" placeholder="1599" className="pl-8" {...register("oldPrice")} />
                  </div>
                  {errors.oldPrice && (
                    <p className="text-sm text-red-600">{errors.oldPrice.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Optional. Used to show discount pricing.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input id="stock" placeholder="24" type="number" {...register("stock")} />
                  {errors.stock && (
                    <p className="text-sm text-red-600">{errors.stock.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Product Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="Inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            Inactive
                          </div>
                        </SelectItem>
                        <SelectItem value="Draft">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Draft
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Product Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" placeholder="Ex: 25.5" {...register("weight")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions (L x W x H)</Label>
                  <Input id="dimensions" placeholder="Ex: 200 x 80 x 75 cm" {...register("dimensions")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input id="material" placeholder="Ex: Solid Wood, Fabric" {...register("material")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" placeholder="Ex: Beige, Brown, White" {...register("color")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" placeholder="Ex: modern, comfortable, durable (comma separated)" {...register("tags")} />
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
              </div>
            </div>

            {/* Product Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Product Images</h3>
              
              <div className="rounded-lg border border-dashed p-6 bg-gradient-beige/40 hover:bg-gradient-beige/60 transition-colors">
                <div className="text-center">
                  <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-furniro-brown">
                      Upload Product Images
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upload up to 6 images. PNG, JPG recommended. Max 5MB per image.
                    </p>
                  </div>
                  
                  <label htmlFor="images" className="inline-flex items-center px-4 py-2 mt-4 rounded-md bg-primary text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity">
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
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-furniro-brown">
                        Selected Images ({selectedImages.length}/6)
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedImages([])}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {imagePreviews.map((src, idx) => (
                        <div key={src} className="relative group rounded-lg overflow-hidden bg-white shadow-soft border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Preview ${idx + 1}`} className="h-32 w-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          
                          {/* Image Number Badge */}
                          <div className="absolute top-2 left-2 bg-furniro-brown text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {idx + 1}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeImageAt(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-white/90 rounded px-2 py-1">
                              <p className="text-xs font-medium text-furniro-brown truncate">
                                Image {idx + 1}: {selectedImages[idx]?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(selectedImages[idx]?.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-xs text-muted-foreground">
                * Required fields
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAddOpen(false);
                    reset();
                    setSelectedImages([]);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-beige hover:opacity-90 transition-opacity" 
                  disabled={isSubmitting || createProductMutation.isPending || isUploadingImages}
                >
                  {isUploadingImages ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading Images...
                    </>
                  ) : isSubmitting || createProductMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving Product...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Save Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Product Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-furniro-brown">Edit Product</SheetTitle>
            <SheetDescription>
              Update product information. Changes will be saved immediately.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={editHandleSubmit(onEditSubmit)} className="mt-6 space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input id="edit-name" placeholder="Ex: Modern Beige Sofa" {...editRegister("name")} />
                {editErrors.name && (
                  <p className="text-sm text-red-600">{editErrors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <textarea 
                  id="edit-description"
                  placeholder="Describe the product features, materials, and benefits..."
                  className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...editRegister("description")}
                />
                {editErrors.description && (
                  <p className="text-sm text-red-600">{editErrors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU *</Label>
                  <Input 
                    id="edit-sku" 
                    placeholder="Ex: SOF-MOD-001" 
                    {...editRegister("sku")} 
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      editRegister("sku").onChange(e);
                    }}
                  />
                  {editErrors.sku && (
                    <p className="text-sm text-red-600">{editErrors.sku.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Controller
                    name="category"
                    control={editControl}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dining">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              Dining
                            </div>
                          </SelectItem>
                          <SelectItem value="Living">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Living
                            </div>
                          </SelectItem>
                          <SelectItem value="Bedroom">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              Bedroom
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {editErrors.category && (
                    <p className="text-sm text-red-600">{editErrors.category.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-brand">Brand</Label>
                <Input id="edit-brand" placeholder="Ex: IKEA, West Elm" {...editRegister("brand")} />
              </div>
            </div>

            {/* Pricing & Inventory Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Pricing & Inventory</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price ($) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="edit-price" placeholder="1299" className="pl-8" {...editRegister("price")} />
                  </div>
                  {editErrors.price && (
                    <p className="text-sm text-red-600">{editErrors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-oldPrice">Old Price ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="edit-oldPrice" placeholder="1599" className="pl-8" {...editRegister("oldPrice")} />
                  </div>
                  {editErrors.oldPrice && (
                    <p className="text-sm text-red-600">{editErrors.oldPrice.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Optional. Used to show discount pricing.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock Quantity *</Label>
                  <Input id="edit-stock" placeholder="24" type="number" {...editRegister("stock")} />
                  {editErrors.stock && (
                    <p className="text-sm text-red-600">{editErrors.stock.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Product Status *</Label>
                <Controller
                  name="status"
                  control={editControl}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="Inactive">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            Inactive
                          </div>
                        </SelectItem>
                        <SelectItem value="Draft">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Draft
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {editErrors.status && (
                  <p className="text-sm text-red-600">{editErrors.status.message}</p>
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Product Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight (kg)</Label>
                  <Input id="edit-weight" placeholder="Ex: 25.5" {...editRegister("weight")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dimensions">Dimensions (L x W x H)</Label>
                  <Input id="edit-dimensions" placeholder="Ex: 200 x 80 x 75 cm" {...editRegister("dimensions")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-material">Material</Label>
                  <Input id="edit-material" placeholder="Ex: Solid Wood, Fabric" {...editRegister("material")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <Input id="edit-color" placeholder="Ex: Beige, Brown, White" {...editRegister("color")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags</Label>
                <Input id="edit-tags" placeholder="Ex: modern, comfortable, durable (comma separated)" {...editRegister("tags")} />
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
              </div>
            </div>

            {/* Product Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Product Images</h3>
              
              {/* Current Images */}
              {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-furniro-brown">
                      Current Images ({selectedProduct.images.length})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      These images will be kept unless you delete them
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedProduct.images.map((image, index) => (
                      <div key={`current-${index}`} className="relative group rounded-lg overflow-hidden bg-white shadow-soft border">
                        <img 
                          src={image} 
                          alt={`Current ${index + 1}`}
                          className="h-32 w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/image/placeholder.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        
                        {/* Image Number Badge */}
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </div>
                        
                        {/* Delete Current Image Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedProduct) {
                              const updatedImages = selectedProduct.images.filter((_, i) => i !== index);
                              setSelectedProduct({
                                ...selectedProduct,
                                images: updatedImages
                              });
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove current image"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                        
                        {/* Image Info */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-white/90 rounded px-2 py-1">
                            <p className="text-xs font-medium text-green-700">
                              Current Image {index + 1}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="rounded-lg border border-dashed p-6 bg-gradient-beige/40 hover:bg-gradient-beige/60 transition-colors">
                <div className="text-center">
                  <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-furniro-brown">
                      Upload New Images
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedProduct && selectedProduct.images ? 
                        `Add more images (max ${6 - selectedProduct.images.length} more). Total limit: 6 images per product.` :
                        'Upload up to 6 images. PNG, JPG recommended. Max 5MB per image.'
                      }
                    </p>
                  </div>
                  
                  {(() => {
                    const currentCount = selectedProduct?.images?.length || 0;
                    const newCount = editSelectedImages.length;
                    const totalCount = currentCount + newCount;
                    const canAddMore = totalCount < 6;
                    
                    return (
                      <>
                        <label 
                          htmlFor="edit-images" 
                          className={`inline-flex items-center px-4 py-2 mt-4 rounded-md transition-opacity ${
                            canAddMore 
                              ? 'bg-primary text-primary-foreground cursor-pointer hover:opacity-90' 
                              : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                        >
                          <ImagePlus className="h-4 w-4 mr-2" />
                          {canAddMore ? 'Choose Files' : 'Limit Reached (6/6)'}
                        </label>
                        <input
                          id="edit-images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={!canAddMore}
                          onChange={(e) => handleEditSelectImages(e.target.files)}
                        />
                      </>
                    );
                  })()}
                </div>

                {editSelectedImages.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-furniro-brown">
                        New Images ({editSelectedImages.length}/{Math.max(0, 6 - (selectedProduct?.images?.length || 0))})
                        {selectedProduct && selectedProduct.images && selectedProduct.images.length > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Total: {selectedProduct.images.length + editSelectedImages.length}/6)
                          </span>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => setEditSelectedImages([])}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Clear All
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {editImagePreviews.map((src, idx) => (
                        <div key={src} className="relative group rounded-lg overflow-hidden bg-white shadow-soft border">
                          <img src={src} alt={`Preview ${idx + 1}`} className="h-32 w-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          
                          {/* Image Number Badge */}
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {(selectedProduct?.images?.length || 0) + idx + 1}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeEditImageAt(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </button>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-white/90 rounded px-2 py-1">
                              <p className="text-xs font-medium text-blue-700 truncate">
                                New Image {(selectedProduct?.images?.length || 0) + idx + 1}: {editSelectedImages[idx]?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(editSelectedImages[idx]?.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-xs text-muted-foreground">
                * Required fields
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditOpen(false);
                    editReset();
                    setEditSelectedImages([]);
                    setSelectedProduct(null);
                  }}
                  disabled={editIsSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-beige hover:opacity-90 transition-opacity" 
                  disabled={editIsSubmitting || updateProductMutation.isPending}
                >
                  {editIsSubmitting || updateProductMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Product
                    </>
                  )}
                </Button>
              </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Category</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>All Categories</DropdownMenuItem>
                <DropdownMenuItem>Dining</DropdownMenuItem>
                <DropdownMenuItem>Living</DropdownMenuItem>
                <DropdownMenuItem>Bedroom</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-beige rounded-lg overflow-hidden flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder image if main image fails to load
                              (e.target as HTMLImageElement).src = '/image/placeholder.svg';
                            }}
                          />
                        ) : (
                        <Package className="h-6 w-6 text-furniro-brown" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {product._id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">${product.price.toLocaleString()}</TableCell>
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(product._id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditProduct(product._id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteProduct(product)}
                        >
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

      {/* View Details Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-furniro-brown">Product Details</SheetTitle>
            <SheetDescription>
              View complete information about this product
            </SheetDescription>
          </SheetHeader>
          
          {selectedProduct && (
            <div className="mt-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Product Name</Label>
                    <p className="font-medium text-furniro-brown">{selectedProduct.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">SKU</Label>
                    <p className="font-mono text-sm">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <Badge variant="outline" className="mt-1">{selectedProduct.category}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge className={`mt-1 ${getStatusColor(selectedProduct.status)}`}>
                      {selectedProduct.status}
                    </Badge>
                  </div>
                  {selectedProduct.brand && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Brand</Label>
                      <p>{selectedProduct.brand}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Pricing & Inventory</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                    <p className="font-medium text-lg">${selectedProduct.price.toLocaleString()}</p>
                  </div>
                  {selectedProduct.oldPrice && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Old Price</Label>
                      <p className="font-medium text-lg text-muted-foreground line-through">${selectedProduct.oldPrice.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Stock</Label>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${selectedProduct.stock < 5 && selectedProduct.stock > 0 ? 'text-yellow-600' : selectedProduct.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedProduct.stock}
                      </span>
                      <span className="text-muted-foreground text-sm">units</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Product Details */}
              {(selectedProduct.weight || selectedProduct.dimensions || selectedProduct.material || selectedProduct.color) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Product Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedProduct.weight && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Weight</Label>
                        <p>{selectedProduct.weight} kg</p>
                      </div>
                    )}
                    {selectedProduct.dimensions && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Dimensions</Label>
                        <p>{selectedProduct.dimensions}</p>
                      </div>
                    )}
                    {selectedProduct.material && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Material</Label>
                        <p>{selectedProduct.material}</p>
                      </div>
                    )}
                    {selectedProduct.color && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Color</Label>
                        <p>{selectedProduct.color}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Product Images ({selectedProduct.images.length})</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedProduct.images.map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden bg-muted border">
                        <img 
                          src={image} 
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/image/placeholder.png';
                          }}
                        />
                        {/* Image Number Badge */}
                        <div className="absolute top-2 left-2 bg-furniro-brown text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </div>
                        {/* Image Info */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-white/90 rounded px-2 py-1">
                            <p className="text-xs font-medium text-furniro-brown">
                              Image {index + 1}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Timestamps</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                    <p>{new Date(selectedProduct.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Updated At</Label>
                    <p>{new Date(selectedProduct.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
