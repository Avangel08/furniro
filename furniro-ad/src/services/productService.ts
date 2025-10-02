import { IProduct } from '@/models/Product';

export interface CreateProductData {
  name: string;
  sku: string;
  category: 'Dining' | 'Living' | 'Bedroom';
  brand?: string;
  description: string;
  price: string;
  stock: string;
  status: 'Active' | 'Inactive' | 'Draft';
  weight?: string;
  dimensions?: string;
  material?: string;
  color?: string;
  tags?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductResponse {
  success: boolean;
  data?: IProduct | IProduct[];
  error?: string;
  details?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ProductService {
  private baseUrl = '/api/products';

  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<ProductResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.category) searchParams.append('category', params.category);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);

      const url = `${this.baseUrl}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      };
    }
  }

  async getProduct(id: string): Promise<ProductResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product');
      }

      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product'
      };
    }
  }

  async createProduct(productData: CreateProductData): Promise<ProductResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product'
      };
    }
  }

  async updateProduct(id: string, productData: UpdateProductData): Promise<ProductResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product'
      };
    }
  }

  async deleteProduct(id: string): Promise<ProductResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      return data;
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product'
      };
    }
  }
}

export const productService = new ProductService();
