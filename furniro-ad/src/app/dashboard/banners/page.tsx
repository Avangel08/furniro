"use client";

import { useState } from "react";
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
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Image } from "lucide-react";

// Mock banner data
const mockBanners = [
  {
    id: "1",
    title: "Summer Collection 2024",
    type: "Hero Banner",
    status: "Active",
    position: "Homepage Top",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    clicks: 1247,
    impressions: 15420
  },
  {
    id: "2",
    title: "New Arrivals",
    type: "Promotional",
    status: "Active",
    position: "Category Page",
    startDate: "2024-07-15",
    endDate: "2024-09-15",
    clicks: 892,
    impressions: 8930
  },
  {
    id: "3",
    title: "Black Friday Sale",
    type: "Sale Banner",
    status: "Scheduled",
    position: "Homepage Middle",
    startDate: "2024-11-24",
    endDate: "2024-11-30",
    clicks: 0,
    impressions: 0
  },
  {
    id: "4",
    title: "Winter Furniture",
    type: "Seasonal",
    status: "Inactive",
    position: "Homepage Bottom",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    clicks: 2156,
    impressions: 18750
  }
];

export default function Banners() {
  const [searchQuery, setSearchQuery] = useState("");
  const [banners] = useState(mockBanners);

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banner.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button className="bg-gradient-beige hover:opacity-90 transition-smooth">
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search banners by title, type, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">Type</Button>
            <Button variant="outline">Status</Button>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Banners Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Banner Management ({filteredBanners.length})</CardTitle>
        </CardHeader>
        <CardContent>
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
              {filteredBanners.map((banner) => (
                <TableRow key={banner.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-beige rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-furniro-brown" />
                      </div>
                      <div>
                        <div className="font-medium">{banner.title}</div>
                        <div className="text-sm text-muted-foreground">ID: {banner.id}</div>
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Banner
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Banner
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
