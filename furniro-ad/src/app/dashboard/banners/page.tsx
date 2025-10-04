"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Image, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { bannerService, Banner, BannerFilters, CreateBannerData } from "@/services/bannerService";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BannerAnalytics } from "@/components/BannerAnalytics";
import { BannerSchedulingDashboard } from "@/components/BannerSchedulingDashboard";

// Form validation schema
const createBannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  type: z.enum(['Hero Banner', 'Promotional', 'Sale Banner', 'Seasonal', 'Category Banner']),
  position: z.enum(['Homepage Top', 'Homepage Middle', 'Homepage Bottom', 'Category Page', 'Product Page']),
  status: z.enum(['Active', 'Inactive', 'Scheduled', 'Draft']).default('Draft'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  linkUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  altText: z.string().max(255, 'Alt text too long').optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  priority: z.number().min(1).max(10).default(1),
  targetAudience: z.string().max(500, 'Target audience too long').optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CreateBannerForm = z.infer<typeof createBannerSchema>;

export default function Banners() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'management' | 'scheduling'>('management');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup for Add Banner
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateBannerForm>({
    resolver: zodResolver(createBannerSchema),
    defaultValues: {
      status: 'Draft',
      priority: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  // Form setup for Edit Banner
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    control: editControl,
    reset: editReset,
    setValue: editSetValue,
    watch: editWatch,
    formState: { errors: editErrors, isSubmitting: editIsSubmitting }
  } = useForm<CreateBannerForm>({
    resolver: zodResolver(createBannerSchema),
    defaultValues: {
      status: 'Draft',
      priority: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  });

  // Fetch banners from API
  const { 
    data: bannersResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['banners', searchQuery, currentPage, itemsPerPage, typeFilter, statusFilter, positionFilter],
    queryFn: () => bannerService.getBanners({
      search: searchQuery || undefined,
      page: currentPage,
      limit: itemsPerPage,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      position: positionFilter !== 'all' ? positionFilter : undefined
    }),
  });

  const banners = bannersResponse?.data || [];
  const totalBanners = bannersResponse?.pagination?.total || 0;
  const totalPages = bannersResponse?.pagination?.pages || 1;

  // Create banner mutation
  const createBannerMutation = useMutation({
    mutationFn: (data: CreateBannerData) => bannerService.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Success",
        description: "Banner created successfully",
      });
      setIsAddModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create banner",
        variant: "destructive",
      });
    },
  });

  // Update banner mutation
  const updateBannerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBannerData }) => 
      bannerService.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
      setIsEditModalOpen(false);
      setSelectedBanner(null);
      editReset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update banner",
        variant: "destructive",
      });
    },
  });

  // Delete banner mutation
  const deleteBannerMutation = useMutation({
    mutationFn: (id: string) => bannerService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({
        title: "Success",
        description: "Banner deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete banner",
        variant: "destructive",
      });
    },
  });

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePositionFilterChange = (value: string) => {
    setPositionFilter(value);
    setCurrentPage(1);
  };

  // Handle delete banner
  const handleDeleteBanner = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      deleteBannerMutation.mutate(id);
    }
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Handle form submission for Add Banner
  const onSubmit = async (data: CreateBannerForm) => {
    try {
      const bannerData: CreateBannerData = {
        title: data.title,
        type: data.type,
        position: data.position,
        status: data.status,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || undefined,
        altText: data.altText || undefined,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority,
        targetAudience: data.targetAudience || undefined,
      };

      createBannerMutation.mutate(bannerData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Handle form submission for Edit Banner
  const onEditSubmit = async (data: CreateBannerForm) => {
    if (!selectedBanner) return;
    
    try {
      const bannerData: CreateBannerData = {
        title: data.title,
        type: data.type,
        position: data.position,
        status: data.status,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || undefined,
        altText: data.altText || undefined,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority,
        targetAudience: data.targetAudience || undefined,
      };

      updateBannerMutation.mutate({ id: selectedBanner._id, data: bannerData });
    } catch (error) {
      console.error('Edit form submission error:', error);
    }
  };

  // Handle edit banner
  const handleEditBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    
    // Populate form with existing data
    editSetValue('title', banner.title);
    editSetValue('type', banner.type);
    editSetValue('position', banner.position);
    editSetValue('status', banner.status);
    editSetValue('imageUrl', banner.imageUrl);
    editSetValue('linkUrl', banner.linkUrl || '');
    editSetValue('altText', banner.altText || '');
    editSetValue('startDate', banner.startDate.split('T')[0]);
    editSetValue('endDate', banner.endDate.split('T')[0]);
    editSetValue('priority', banner.priority);
    editSetValue('targetAudience', banner.targetAudience || '');
    
    setIsEditModalOpen(true);
  };

  // Handle view banner details
  const handleViewBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsViewModalOpen(true);
  };

  // Handle image upload for Add Banner
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingImage(true);
      
      const formData = new FormData();
      formData.append('files', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        setValue('imageUrl', result.data[0]);
        toast({
          title: "Image uploaded",
          description: "Banner image uploaded successfully",
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle image upload for Edit Banner
  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingImage(true);
      
      const formData = new FormData();
      formData.append('files', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        editSetValue('imageUrl', result.data[0]);
        toast({
          title: "Image uploaded",
          description: "Banner image uploaded successfully",
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-furniro-brown">Banners</h1>
          <p className="text-muted-foreground mt-1">
            Manage promotional banners and marketing campaigns
          </p>
        </div>
        {activeTab === 'management' && (
          <Button 
            className="bg-gradient-beige hover:opacity-90 transition-smooth"
            onClick={() => setIsAddModalOpen(true)}
          >
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'management' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('management')}
          className={activeTab === 'management' ? 'bg-white shadow-sm' : ''}
        >
          Banner Management
        </Button>
        <Button
          variant={activeTab === 'scheduling' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('scheduling')}
          className={activeTab === 'scheduling' ? 'bg-white shadow-sm' : ''}
        >
          Scheduling Dashboard
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'management' ? (
        <>
      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search banners by title, type, or position..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Hero Banner">Hero Banner</SelectItem>
                <SelectItem value="Promotional">Promotional</SelectItem>
                <SelectItem value="Sale Banner">Sale Banner</SelectItem>
                <SelectItem value="Seasonal">Seasonal</SelectItem>
                <SelectItem value="Category Banner">Category Banner</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={handlePositionFilterChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="Homepage Top">Homepage Top</SelectItem>
                <SelectItem value="Homepage Middle">Homepage Middle</SelectItem>
                <SelectItem value="Homepage Bottom">Homepage Bottom</SelectItem>
                <SelectItem value="Category Page">Category Page</SelectItem>
                <SelectItem value="Product Page">Product Page</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Banners Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Banner Management</span>
            <Badge variant="secondary" className="text-sm">
              {totalBanners} {totalBanners === 1 ? 'banner' : 'banners'}
            </Badge>
            {typeFilter !== 'all' && (
              <Badge variant="outline" className="text-xs">
                {typeFilter} only
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="outline" className="text-xs">
                {statusFilter} only
              </Badge>
            )}
            {positionFilter !== 'all' && (
              <Badge variant="outline" className="text-xs">
                {positionFilter} only
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading banners...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">Failed to load banners</div>
            </div>
          ) : banners.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No banners found</div>
            </div>
          ) : (
            <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner._id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gradient-beige rounded-lg flex items-center justify-center overflow-hidden">
                            {banner.imageUrl ? (
                              <img 
                                src={banner.imageUrl} 
                                alt={banner.altText || banner.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                        <Image className="h-6 w-6 text-furniro-brown" />
                            )}
                      </div>
                      <div>
                        <div className="font-medium">{banner.title}</div>
                            <div className="text-sm text-muted-foreground">ID: {banner._id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{banner.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{banner.position}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={getStatusColor(banner.status)}
                    >
                      {banner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(banner.startDate).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">to {new Date(banner.endDate).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{banner.clicks} clicks</div>
                      <div className="text-muted-foreground">{banner.impressions.toLocaleString()} views</div>
                          {banner.clickThroughRate !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              {banner.clickThroughRate}% CTR
                            </div>
                          )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewBanner(banner)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBanner(banner)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Banner
                        </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteBanner(banner._id)}
                              disabled={deleteBannerMutation.isPending}
                            >
                          <Trash2 className="h-4 w-4 mr-2" />
                              {deleteBannerMutation.isPending ? 'Deleting...' : 'Delete Banner'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalBanners)} of {totalBanners} banners
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageClick(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Banner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-furniro-brown">Add New Banner</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddModalOpen(false);
                  reset();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter banner title"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} {i === 0 ? '(Highest)' : i === 9 ? '(Lowest)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.priority && (
                      <p className="text-sm text-red-600">{errors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select banner type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hero Banner">Hero Banner</SelectItem>
                            <SelectItem value="Promotional">Promotional</SelectItem>
                            <SelectItem value="Sale Banner">Sale Banner</SelectItem>
                            <SelectItem value="Seasonal">Seasonal</SelectItem>
                            <SelectItem value="Category Banner">Category Banner</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && (
                      <p className="text-sm text-red-600">{errors.type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Controller
                      name="position"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select banner position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Homepage Top">Homepage Top</SelectItem>
                            <SelectItem value="Homepage Middle">Homepage Middle</SelectItem>
                            <SelectItem value="Homepage Bottom">Homepage Bottom</SelectItem>
                            <SelectItem value="Category Page">Category Page</SelectItem>
                            <SelectItem value="Product Page">Product Page</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.position && (
                      <p className="text-sm text-red-600">{errors.position.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select banner status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Banner Image</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUpload">Upload Image *</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="flex-1"
                    />
                    {isUploadingImage && (
                      <div className="text-sm text-muted-foreground">Uploading...</div>
                    )}
                  </div>
                  
                  {watch('imageUrl') && (
                    <div className="mt-2">
                      <img
                        src={watch('imageUrl')}
                        alt="Banner preview"
                        className="h-32 w-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  <Input
                    placeholder="Or enter image URL directly"
                    {...register('imageUrl')}
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-600">{errors.imageUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altText">Alt Text</Label>
                  <Input
                    id="altText"
                    placeholder="Describe the image for accessibility"
                    {...register('altText')}
                  />
                  {errors.altText && (
                    <p className="text-sm text-red-600">{errors.altText.message}</p>
                  )}
                </div>
              </div>

              {/* Link & Target */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Link & Target</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    placeholder="https://example.com"
                    {...register('linkUrl')}
                  />
                  {errors.linkUrl && (
                    <p className="text-sm text-red-600">{errors.linkUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="Describe the target audience for this banner"
                    {...register('targetAudience')}
                    rows={3}
                  />
                  {errors.targetAudience && (
                    <p className="text-sm text-red-600">{errors.targetAudience.message}</p>
                  )}
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Scheduling</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-600">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-600">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || createBannerMutation.isPending}
                  className="bg-gradient-beige hover:opacity-90"
                >
                  {isSubmitting || createBannerMutation.isPending ? 'Creating...' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {isEditModalOpen && selectedBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-furniro-brown">Edit Banner</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedBanner(null);
                  editReset();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={editHandleSubmit(onEditSubmit)} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      placeholder="Enter banner title"
                      {...editRegister('title')}
                    />
                    {editErrors.title && (
                      <p className="text-sm text-red-600">{editErrors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Controller
                      name="priority"
                      control={editControl}
                      render={({ field }) => (
                        <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} {i === 0 ? '(Highest)' : i === 9 ? '(Lowest)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {editErrors.priority && (
                      <p className="text-sm text-red-600">{editErrors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Type *</Label>
                    <Controller
                      name="type"
                      control={editControl}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select banner type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hero Banner">Hero Banner</SelectItem>
                            <SelectItem value="Promotional">Promotional</SelectItem>
                            <SelectItem value="Sale Banner">Sale Banner</SelectItem>
                            <SelectItem value="Seasonal">Seasonal</SelectItem>
                            <SelectItem value="Category Banner">Category Banner</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {editErrors.type && (
                      <p className="text-sm text-red-600">{editErrors.type.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-position">Position *</Label>
                    <Controller
                      name="position"
                      control={editControl}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select banner position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Homepage Top">Homepage Top</SelectItem>
                            <SelectItem value="Homepage Middle">Homepage Middle</SelectItem>
                            <SelectItem value="Homepage Bottom">Homepage Bottom</SelectItem>
                            <SelectItem value="Category Page">Category Page</SelectItem>
                            <SelectItem value="Product Page">Product Page</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {editErrors.position && (
                      <p className="text-sm text-red-600">{editErrors.position.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Controller
                    name="status"
                    control={editControl}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select banner status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {editErrors.status && (
                    <p className="text-sm text-red-600">{editErrors.status.message}</p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Banner Image</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-imageUpload">Upload Image *</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="edit-imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      disabled={isUploadingImage}
                      className="flex-1"
                    />
                    {isUploadingImage && (
                      <div className="text-sm text-muted-foreground">Uploading...</div>
                    )}
                  </div>
                  
                  {editWatch('imageUrl') && (
                    <div className="mt-2">
                      <img
                        src={editWatch('imageUrl')}
                        alt="Banner preview"
                        className="h-32 w-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  <Input
                    placeholder="Or enter image URL directly"
                    {...editRegister('imageUrl')}
                  />
                  {editErrors.imageUrl && (
                    <p className="text-sm text-red-600">{editErrors.imageUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-altText">Alt Text</Label>
                  <Input
                    id="edit-altText"
                    placeholder="Describe the image for accessibility"
                    {...editRegister('altText')}
                  />
                  {editErrors.altText && (
                    <p className="text-sm text-red-600">{editErrors.altText.message}</p>
                  )}
                </div>
              </div>

              {/* Link & Target */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Link & Target</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-linkUrl">Link URL</Label>
                  <Input
                    id="edit-linkUrl"
                    placeholder="https://example.com"
                    {...editRegister('linkUrl')}
                  />
                  {editErrors.linkUrl && (
                    <p className="text-sm text-red-600">{editErrors.linkUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-targetAudience">Target Audience</Label>
                  <Textarea
                    id="edit-targetAudience"
                    placeholder="Describe the target audience for this banner"
                    {...editRegister('targetAudience')}
                    rows={3}
                  />
                  {editErrors.targetAudience && (
                    <p className="text-sm text-red-600">{editErrors.targetAudience.message}</p>
                  )}
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Scheduling</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-startDate">Start Date *</Label>
                    <Input
                      id="edit-startDate"
                      type="date"
                      {...editRegister('startDate')}
                    />
                    {editErrors.startDate && (
                      <p className="text-sm text-red-600">{editErrors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate">End Date *</Label>
                    <Input
                      id="edit-endDate"
                      type="date"
                      {...editRegister('endDate')}
                    />
                    {editErrors.endDate && (
                      <p className="text-sm text-red-600">{editErrors.endDate.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedBanner(null);
                    editReset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editIsSubmitting || updateBannerMutation.isPending}
                  className="bg-gradient-beige hover:opacity-90"
                >
                  {editIsSubmitting || updateBannerMutation.isPending ? 'Updating...' : 'Update Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Banner Details Modal */}
      {isViewModalOpen && selectedBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-furniro-brown">Banner Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedBanner(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Banner Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Banner Image</h3>
                <div className="flex justify-center">
                  <img
                    src={selectedBanner.imageUrl}
                    alt={selectedBanner.altText || selectedBanner.title}
                    className="max-h-64 w-auto rounded-lg border shadow-sm"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Title</Label>
                      <p className="text-lg font-semibold text-gray-900">{selectedBanner.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <Badge variant="outline" className="ml-2">{selectedBanner.type}</Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Position</Label>
                      <p className="text-gray-900">{selectedBanner.position}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge 
                        variant="secondary"
                        className={`ml-2 ${getStatusColor(selectedBanner.status)}`}
                      >
                        {selectedBanner.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Priority</Label>
                      <p className="text-gray-900">{selectedBanner.priority}/10</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Banner ID</Label>
                      <p className="text-sm text-gray-500 font-mono">{selectedBanner._id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created</Label>
                      <p className="text-gray-900">{new Date(selectedBanner.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                      <p className="text-gray-900">{new Date(selectedBanner.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Scheduling</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                    <p className="text-gray-900">{new Date(selectedBanner.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">End Date</Label>
                    <p className="text-gray-900">{new Date(selectedBanner.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Duration</Label>
                  <p className="text-gray-900">
                    {Math.ceil((new Date(selectedBanner.endDate).getTime() - new Date(selectedBanner.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>

              {/* Link & Target */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Link & Target</h3>
                <div className="space-y-3">
                  {selectedBanner.linkUrl && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Link URL</Label>
                      <p className="text-blue-600 hover:text-blue-800">
                        <a href={selectedBanner.linkUrl} target="_blank" rel="noopener noreferrer">
                          {selectedBanner.linkUrl}
                        </a>
                      </p>
                    </div>
                  )}
                  {selectedBanner.altText && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Alt Text</Label>
                      <p className="text-gray-900">{selectedBanner.altText}</p>
                    </div>
                  )}
                  {selectedBanner.targetAudience && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Target Audience</Label>
                      <p className="text-gray-900">{selectedBanner.targetAudience}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Analytics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-furniro-brown border-b pb-2">Performance Analytics</h3>
                <BannerAnalytics banner={selectedBanner} />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedBanner(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditBanner(selectedBanner);
                  }}
                  className="bg-gradient-beige hover:opacity-90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Banner
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        <BannerSchedulingDashboard />
      )}
    </div>
  );
}
