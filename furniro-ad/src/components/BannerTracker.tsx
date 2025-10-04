"use client";

import { useEffect } from 'react';
import { bannerService } from '@/services/bannerService';

interface BannerTrackerProps {
  bannerId: string;
  children: React.ReactNode;
  trackImpressions?: boolean;
  trackClicks?: boolean;
}

export function BannerTracker({ 
  bannerId, 
  children, 
  trackImpressions = true, 
  trackClicks = true 
}: BannerTrackerProps) {
  
  // Track impression when component mounts
  useEffect(() => {
    if (trackImpressions) {
      trackBannerEvent('impression');
    }
  }, [bannerId, trackImpressions]);

  const trackBannerEvent = async (type: 'click' | 'impression') => {
    try {
      await bannerService.trackBanner(bannerId, type);
    } catch (error) {
      console.error(`Failed to track banner ${type}:`, error);
    }
  };

  const handleClick = () => {
    if (trackClicks) {
      trackBannerEvent('click');
    }
  };

  return (
    <div onClick={handleClick} style={{ cursor: trackClicks ? 'pointer' : 'default' }}>
      {children}
    </div>
  );
}

// Hook for manual tracking
export function useBannerTracking() {
  const trackBannerEvent = async (bannerId: string, type: 'click' | 'impression') => {
    try {
      await bannerService.trackBanner(bannerId, type);
    } catch (error) {
      console.error(`Failed to track banner ${type}:`, error);
    }
  };

  return { trackBannerEvent };
}
