"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchedulingStats {
  statusCounts: Record<string, number>;
  upcomingBanners: number;
  expiringBanners: number;
  expiredBanners: number;
}

interface AttentionBanners {
  expiringSoon: Array<{
    _id: string;
    title: string;
    endDate: string;
    status: string;
  }>;
  expired: Array<{
    _id: string;
    title: string;
    endDate: string;
    status: string;
  }>;
  startingSoon: Array<{
    _id: string;
    title: string;
    startDate: string;
    status: string;
  }>;
}

export function BannerSchedulingDashboard() {
  const [stats, setStats] = useState<SchedulingStats | null>(null);
  const [attentionBanners, setAttentionBanners] = useState<AttentionBanners | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchSchedulingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banners/schedule');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
        setAttentionBanners(data.data.attentionBanners);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch scheduling data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBannerStatuses = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/banners/schedule', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        // Refresh data
        await fetchSchedulingData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update banner statuses",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchSchedulingData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading scheduling data...</div>
      </div>
    );
  }

  if (!stats || !attentionBanners) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">Failed to load scheduling data</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header with Update Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-furniro-brown">Banner Scheduling</h2>
          <p className="text-muted-foreground">Manage banner activation and expiration</p>
        </div>
        <Button
          onClick={updateBannerStatuses}
          disabled={updating}
          className="bg-gradient-beige hover:opacity-90"
        >
          {updating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Statuses
            </>
          )}
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.statusCounts.Active || 0}</p>
                <p className="text-sm text-gray-600">Active Banners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.statusCounts.Scheduled || 0}</p>
                <p className="text-sm text-gray-600">Scheduled Banners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.statusCounts.Inactive || 0}</p>
                <p className="text-sm text-gray-600">Inactive Banners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.upcomingBanners}</p>
                <p className="text-sm text-gray-600">Starting Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        {stats.expiredBanners > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>{stats.expiredBanners} banner(s)</strong> have expired and need to be deactivated.
            </AlertDescription>
          </Alert>
        )}

        {stats.expiringBanners > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>{stats.expiringBanners} banner(s)</strong> will expire within the next 7 days.
            </AlertDescription>
          </Alert>
        )}

        {stats.upcomingBanners > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>{stats.upcomingBanners} banner(s)</strong> are scheduled to start soon.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Banners Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring Soon */}
        {attentionBanners.expiringSoon.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attentionBanners.expiringSoon.map((banner) => (
                  <div key={banner._id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium text-orange-900">{banner.title}</p>
                    <p className="text-sm text-orange-700">
                      Expires in {getDaysUntil(banner.endDate)} days
                    </p>
                    <p className="text-xs text-orange-600">
                      {new Date(banner.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expired */}
        {attentionBanners.expired.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attentionBanners.expired.map((banner) => (
                  <div key={banner._id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-red-900">{banner.title}</p>
                    <p className="text-sm text-red-700">
                      Expired {Math.abs(getDaysUntil(banner.endDate))} days ago
                    </p>
                    <p className="text-xs text-red-600">
                      {new Date(banner.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Starting Soon */}
        {attentionBanners.startingSoon.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="h-5 w-5" />
                Starting Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attentionBanners.startingSoon.map((banner) => (
                  <div key={banner._id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900">{banner.title}</p>
                    <p className="text-sm text-blue-700">
                      Starts in {getDaysUntil(banner.startDate)} days
                    </p>
                    <p className="text-xs text-blue-600">
                      {new Date(banner.startDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No Attention Needed */}
      {attentionBanners.expiringSoon.length === 0 && 
       attentionBanners.expired.length === 0 && 
       attentionBanners.startingSoon.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">All Good!</h3>
            <p className="text-green-700">No banners need immediate attention.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
