// Banner service for API calls and data management
export interface Banner {
  _id: string;
  title: string;
  type: 'Hero Banner' | 'Promotional' | 'Sale Banner' | 'Seasonal' | 'Category Banner';
  position: 'Homepage Top' | 'Homepage Middle' | 'Homepage Bottom' | 'Category Page' | 'Product Page';
  status: 'Active' | 'Inactive' | 'Scheduled' | 'Draft';
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
  isActive: boolean;
  priority: number;
  targetAudience?: string;
  createdAt: string;
  updatedAt: string;
  clickThroughRate?: number;
  isCurrentlyActive?: boolean;
  daysRemaining?: number;
}

export interface CreateBannerData {
  title: string;
  type: string;
  position: string;
  status?: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  priority?: number;
  targetAudience?: string;
}

export interface UpdateBannerData {
  title?: string;
  type?: string;
  position?: string;
  status?: string;
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  priority?: number;
  targetAudience?: string;
}

export interface BannerFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  position?: string;
  search?: string;
}

export interface BannerResponse {
  success: boolean;
  data: Banner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SingleBannerResponse {
  success: boolean;
  data: Banner;
}

export interface BannerCreateResponse {
  success: boolean;
  data: Banner;
  message: string;
}

export interface BannerUpdateResponse {
  success: boolean;
  data: Banner;
  message: string;
}

export interface BannerDeleteResponse {
  success: boolean;
  message: string;
}

export interface TrackResponse {
  success: boolean;
  data: {
    bannerId: string;
    type: 'click' | 'impression';
    clicks: number;
    impressions: number;
    clickThroughRate: number;
  };
  message: string;
}

class BannerService {
  private baseUrl = '/api/banners';

  // Get all banners with optional filtering
  async getBanners(filters: BannerFilters = {}): Promise<BannerResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.position && filters.position !== 'all') params.append('position', filters.position);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.statusText}`);
    }

    return response.json();
  }

  // Get single banner by ID
  async getBanner(id: string): Promise<SingleBannerResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch banner: ${response.statusText}`);
    }

    return response.json();
  }

  // Create new banner
  async createBanner(data: CreateBannerData): Promise<BannerCreateResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create banner: ${response.statusText}`);
    }

    return response.json();
  }

  // Update banner
  async updateBanner(id: string, data: UpdateBannerData): Promise<BannerUpdateResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update banner: ${response.statusText}`);
    }

    return response.json();
  }

  // Delete banner
  async deleteBanner(id: string): Promise<BannerDeleteResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete banner: ${response.statusText}`);
    }

    return response.json();
  }

  // Track banner performance (click or impression)
  async trackBanner(id: string, type: 'click' | 'impression'): Promise<TrackResponse> {
    const response = await fetch(`${this.baseUrl}/${id}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to track banner: ${response.statusText}`);
    }

    return response.json();
  }

  // Get active banners for a specific position (for frontend display)
  async getActiveBanners(position?: string): Promise<BannerResponse> {
    const filters: BannerFilters = {
      status: 'Active',
      limit: 10
    };
    
    if (position) {
      filters.position = position;
    }

    return this.getBanners(filters);
  }

  // Get banner statistics
  async getBannerStats(): Promise<{
    total: number;
    active: number;
    scheduled: number;
    inactive: number;
    totalClicks: number;
    totalImpressions: number;
  }> {
    const [allBanners, activeBanners, scheduledBanners, inactiveBanners] = await Promise.all([
      this.getBanners({ limit: 1000 }),
      this.getBanners({ status: 'Active', limit: 1000 }),
      this.getBanners({ status: 'Scheduled', limit: 1000 }),
      this.getBanners({ status: 'Inactive', limit: 1000 })
    ]);

    const totalClicks = allBanners.data.reduce((sum, banner) => sum + banner.clicks, 0);
    const totalImpressions = allBanners.data.reduce((sum, banner) => sum + banner.impressions, 0);

    return {
      total: allBanners.pagination.total,
      active: activeBanners.pagination.total,
      scheduled: scheduledBanners.pagination.total,
      inactive: inactiveBanners.pagination.total,
      totalClicks,
      totalImpressions
    };
  }
}

// Export singleton instance
export const bannerService = new BannerService();
export default bannerService;
