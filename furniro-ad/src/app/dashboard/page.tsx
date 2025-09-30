import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Image, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

const stats = [
  {
    title: "Total Customers",
    value: "2,847",
    change: "+12.5%",
    icon: Users,
    trend: "up"
  },
  {
    title: "Products",
    value: "486",
    change: "+8.2%", 
    icon: Package,
    trend: "up"
  },
  {
    title: "Revenue",
    value: "$84,521",
    change: "+23.1%",
    icon: DollarSign,
    trend: "up"
  },
  {
    title: "Orders",
    value: "1,234",
    change: "-2.4%",
    icon: ShoppingCart,
    trend: "down"
  }
];

const recentActivity = [
  { action: "New customer registration", user: "Sarah Johnson", time: "2 minutes ago" },
  { action: "Product added", user: "Admin", time: "15 minutes ago" },
  { action: "Order completed", user: "Michael Brown", time: "1 hour ago" },
  { action: "Banner updated", user: "Admin", time: "3 hours ago" },
  { action: "Customer updated profile", user: "Emily Davis", time: "5 hours ago" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-furniro-brown">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your furniture store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft hover:shadow-warm transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-furniro-brown">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className={`h-3 w-3 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across your admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common admin tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-beige hover:opacity-90 transition-smooth text-left">
              <Package className="h-5 w-5" />
              <span className="font-medium">Add New Product</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-muted hover:bg-muted/70 transition-smooth text-left">
              <Users className="h-5 w-5" />
              <span className="font-medium">View Customers</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 rounded-lg bg-muted hover:bg-muted/70 transition-smooth text-left">
              <Image className="h-5 w-5" />
              <span className="font-medium">Manage Banners</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
