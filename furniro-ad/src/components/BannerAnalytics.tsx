"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, MousePointer, BarChart3 } from "lucide-react";

interface BannerAnalyticsProps {
  banner: {
    _id: string;
    title: string;
    clicks: number;
    impressions: number;
    status: string;
    startDate: string;
    endDate: string;
  };
}

export function BannerAnalytics({ banner }: BannerAnalyticsProps) {
  const clickThroughRate = banner.impressions > 0 
    ? ((banner.clicks / banner.impressions) * 100).toFixed(2)
    : '0.00';

  const isActive = banner.status === 'Active';
  const isScheduled = banner.status === 'Scheduled';
  const isExpired = new Date(banner.endDate) < new Date();

  const getPerformanceColor = (ctr: number) => {
    if (ctr >= 5) return 'text-green-600';
    if (ctr >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (ctr: number) => {
    if (ctr >= 5) return 'Excellent';
    if (ctr >= 2) return 'Good';
    if (ctr >= 1) return 'Average';
    return 'Poor';
  };

  return (
    <div className="space-y-4">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MousePointer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{banner.clicks}</p>
              <p className="text-sm text-gray-600">Total Clicks</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{banner.impressions.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className={`text-2xl font-bold ${getPerformanceColor(parseFloat(clickThroughRate))}`}>
                {clickThroughRate}%
              </p>
              <p className="text-sm text-gray-600">Click-Through Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Rating:</span>
              <Badge 
                variant="secondary"
                className={getPerformanceColor(parseFloat(clickThroughRate))}
              >
                {getPerformanceLabel(parseFloat(clickThroughRate))}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Banner Status:</span>
              <Badge 
                variant="secondary"
                className={
                  isActive ? 'bg-green-100 text-green-800' :
                  isScheduled ? 'bg-yellow-100 text-yellow-800' :
                  isExpired ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {banner.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Campaign Duration:</span>
              <span className="text-sm text-gray-600">
                {Math.ceil((new Date(banner.endDate).getTime() - new Date(banner.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>

            {banner.impressions > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Daily Views:</span>
                <span className="text-sm text-gray-600">
                  {Math.round(banner.impressions / Math.ceil((new Date(banner.endDate).getTime() - new Date(banner.startDate).getTime()) / (1000 * 60 * 60 * 24)))}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {parseFloat(clickThroughRate) < 1 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <TrendingDown className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Low CTR Detected</p>
                  <p className="text-yellow-700">Consider updating the banner design, copy, or targeting to improve engagement.</p>
                </div>
              </div>
            )}
            
            {banner.impressions < 100 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Low Visibility</p>
                  <p className="text-blue-700">This banner has low impression count. Consider increasing its priority or changing its position.</p>
                </div>
              </div>
            )}

            {parseFloat(clickThroughRate) >= 5 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Excellent Performance</p>
                  <p className="text-green-700">This banner is performing very well! Consider creating similar campaigns.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
