"use client";

import { useEffect, useState } from 'react';

interface Banner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  type: string;
  position: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface BannerDisplayProps {
  banner: Banner;
  className?: string;
}

export function BannerDisplay({ banner, className = "" }: BannerDisplayProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Track impression when banner loads
  useEffect(() => {
    if (isLoaded) {
      trackBannerEvent('impression');
    }
  }, [isLoaded]);

  const trackBannerEvent = async (type: 'click' | 'impression') => {
    try {
      const response = await fetch('/api/banners/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId: banner._id,
          type: type
        }),
      });

      if (!response.ok) {
        console.error('Failed to track banner event');
      }
    } catch (error) {
      console.error('Error tracking banner event:', error);
    }
  };

  const handleClick = () => {
    trackBannerEvent('click');
    
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Check if banner should be displayed
  const now = new Date();
  const startDate = new Date(banner.startDate);
  const endDate = new Date(banner.endDate);
  
  const isActive = banner.status === 'Active';
  const isInDateRange = now >= startDate && now <= endDate;
  
  if (!isActive || !isInDateRange) {
    return null;
  }

  return (
    <div 
      className={`banner-container ${className}`}
      onClick={handleClick}
      style={{ cursor: banner.linkUrl ? 'pointer' : 'default' }}
    >
      <img
        src={banner.imageUrl}
        alt={banner.altText || banner.title}
        onLoad={handleImageLoad}
        className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
        loading="lazy"
      />
    </div>
  );
}

// Hook for fetching active banners
export function useActiveBanners(position?: string) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('status', 'Active');
        if (position) {
          params.append('position', position);
        }

        const response = await fetch(`/api/banners?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }

        const data = await response.json();
        
        if (data.success) {
          // Filter banners by date range
          const now = new Date();
          const activeBanners = data.data.filter((banner: Banner) => {
            const startDate = new Date(banner.startDate);
            const endDate = new Date(banner.endDate);
            return now >= startDate && now <= endDate;
          });

          // Sort by priority (if available) or creation date
          activeBanners.sort((a: Banner, b: Banner) => {
            if (a.priority && b.priority) {
              return a.priority - b.priority;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          setBanners(activeBanners);
        } else {
          throw new Error(data.error || 'Failed to fetch banners');
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [position]);

  return { banners, loading, error };
}
