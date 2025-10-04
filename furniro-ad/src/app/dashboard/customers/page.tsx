"use client";

import { useState, useEffect } from "react";
import "./customers.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Loader2, RefreshCw, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Customer interface
interface Customer {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addresses?: any[];
  totalOrders: number;
  totalSpent: number;
  isActive: boolean;
  isEmailVerified: boolean;
  acceptsMarketing?: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  defaultShippingAddress?: any;
  defaultBillingAddress?: any;
  lastOrderDate?: string;
  lastLogin?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [itemsPerPage] = useState(20);

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminAccessToken');
      if (!token) {
        setError('Please login to view customers');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching customers with token:', token.substring(0, 20) + '...');

      const statusParam = statusFilter === 'all' ? '' : `status=${statusFilter}`;
      const pageParam = `page=${currentPage}`;
      const limitParam = `limit=${itemsPerPage}`;
      
      const queryParams = [statusParam, pageParam, limitParam].filter(Boolean).join('&');
      const url = `/api/customers${queryParams ? '?' + queryParams : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('📊 Fetched customers response:', data);
      console.log('📊 Pagination data:', data.pagination);
      
      if (data.success && data.data) {
        console.log('✅ Setting customers:', data.data.length, 'customers');
        setCustomers(data.data || []);
        
        // Update pagination info
        if (data.pagination) {
          console.log('📊 Setting pagination:', {
            totalPages: data.pagination.pages || data.pagination.totalPages || 1,
            totalCustomers: data.pagination.total || 0
          });
          setTotalPages(data.pagination.pages || data.pagination.totalPages || 1);
          setTotalCustomers(data.pagination.total || 0);
        } else {
          console.log('⚠️ No pagination data received');
          // Fallback if no pagination data
          setTotalPages(1);
          setTotalCustomers(data.data.length);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch customers - Invalid response format');
      }
    } catch (error: any) {
      console.error('❌ Error fetching customers:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Load customers on component mount and when filter/page changes
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) {
      // Redirect to login if no token
      window.location.href = '/login';
      return;
    }
    fetchCustomers();
  }, [statusFilter, currentPage]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle customer actions
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete customer ${customer.email}?`)) {
      return;
    }

    try {
      setDeleteLoading(customer._id);
      const token = localStorage.getItem('adminAccessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/customers/${customer._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      // Show success message
      toast.success('Customer deleted successfully');
      
      // Refresh the customer list
      await fetchCustomers();
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      toast.error(error.message || 'Failed to delete customer');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage your customer accounts and information
          </p>
        </div>
        <Button onClick={fetchCustomers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>


      {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Customer List</span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm">
                  {totalCustomers} {totalCustomers === 1 ? 'customer' : 'customers'}
                </Badge>
                {statusFilter !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    {statusFilter === 'active' ? 'Active only' : 'Inactive only'}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
                <SelectItem value="all">All Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start space-x-2">
                <div className="text-red-600">❌</div>
                <div className="flex-1">
                  <p className="text-red-800 font-medium">Error loading customers:</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <div className="mt-2 space-x-2">
                    {error.includes('login') && (
                      <Button 
                        onClick={() => window.location.href = '/login'}
                        size="sm"
                        variant="outline"
                      >
                        Go to Login
                      </Button>
                    )}
                    <Button 
                      onClick={fetchCustomers}
                      size="sm"
                      variant="outline"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading customers...</span>
            </div>
          )}

          {/* Customers Table */}
          {!loading && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm customer-table">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700 py-4 text-center w-[60px]">#</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 text-left">Customer</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 text-left">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 text-center">Orders</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 text-right">Total Spent</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 text-center">Join Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 w-[70px] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="text-gray-400 text-4xl mb-2">👥</div>
                          <p className="text-gray-500 text-lg">
                            {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      // Generate initials for avatar
                      const initials = `${customer.firstName?.charAt(0) || ''}${customer.lastName?.charAt(0) || ''}`.toUpperCase();
                      
                      // Generate avatar background color based on name
                      const avatarColors = [
                        'bg-blue-100 text-blue-700',
                        'bg-green-100 text-green-700', 
                        'bg-purple-100 text-purple-700',
                        'bg-pink-100 text-pink-700',
                        'bg-indigo-100 text-indigo-700',
                        'bg-yellow-100 text-yellow-700',
                        'bg-red-100 text-red-700',
                        'bg-teal-100 text-teal-700'
                      ];
                      const colorIndex = customer._id.charCodeAt(0) % avatarColors.length;
                      const avatarColor = avatarColors[colorIndex];
                      
                      return (
                        <TableRow key={customer._id} className="border-b border-gray-100 customer-row">
                          {/* Serial Number Column */}
                          <TableCell className="py-4 text-center">
                            <div className="text-sm font-medium text-gray-600">
                              {((currentPage - 1) * itemsPerPage) + filteredCustomers.indexOf(customer) + 1}
                            </div>
                          </TableCell>
                          
                          {/* Customer Column */}
                          <TableCell className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center customer-avatar ${avatarColor}`}>
                                <span className="text-sm font-semibold">{initials}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {customer.firstName} {customer.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {customer._id.slice(-6)}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Contact Column */}
                          <TableCell className="py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-800">{customer.email}</div>
                              <div className="text-sm text-gray-600">{customer.phone || 'N/A'}</div>
                            </div>
                          </TableCell>

                          {/* Orders Column */}
                          <TableCell className="py-4 text-center">
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 orders-badge">
                              {customer.totalOrders || 0} orders
                            </div>
                          </TableCell>

                          {/* Total Spent Column */}
                          <TableCell className="py-4 text-right">
                            <div className="font-semibold text-gray-800">
                              ${(customer.totalSpent || 0).toLocaleString()}
                            </div>
                          </TableCell>

                          {/* Status Column */}
                          <TableCell className="py-4 text-center">
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium status-badge ${
                              customer.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {customer.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </TableCell>

                          {/* Join Date Column */}
                          <TableCell className="py-4 text-center">
                            <div className="text-sm text-gray-600">
                              {new Date(customer.createdAt).toLocaleDateString('en-GB')}
                            </div>
                          </TableCell>

                          {/* Actions Column */}
                          <TableCell className="py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 action-button">
                                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteCustomer(customer)}
                                  className="text-red-600 focus:text-red-600"
                                  disabled={deleteLoading === customer._id}
                                >
                                  {deleteLoading === customer._id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                  )}
                                  {deleteLoading === customer._id ? 'Deleting...' : 'Delete Customer'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCustomers)} of {totalCustomers} customers
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Customer Modal */}
      {viewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Customer Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg font-semibold">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-lg">{selectedCustomer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedCustomer.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Verified</label>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedCustomer.isEmailVerified 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedCustomer.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Marketing</label>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedCustomer.acceptsMarketing 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedCustomer.acceptsMarketing ? 'Opted In' : 'Opted Out'}
                    </div>
                  </div>
                </div>

                {/* Order Statistics */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Order Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders || 0}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">${(selectedCustomer.totalSpent || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedCustomer.totalOrders > 0 
                          ? `$${Math.round((selectedCustomer.totalSpent || 0) / selectedCustomer.totalOrders)}`
                          : '$0'
                        }
                      </p>
                      <p className="text-sm text-gray-600">Avg Order Value</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Important Dates</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Joined</label>
                      <p className="text-lg">{new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-lg">{new Date(selectedCustomer.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Edit Customer</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <Input 
                      defaultValue={selectedCustomer.firstName}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <Input 
                      defaultValue={selectedCustomer.lastName}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input 
                      defaultValue={selectedCustomer.email}
                      className="mt-1"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input 
                      defaultValue={selectedCustomer.phone || ''}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      defaultChecked={selectedCustomer.isActive}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      defaultChecked={selectedCustomer.isEmailVerified}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Email Verified</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      defaultChecked={selectedCustomer.acceptsMarketing}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Accepts Marketing</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      toast.success('Customer updated successfully');
                      setEditModalOpen(false);
                      fetchCustomers();
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}