import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { BarChart3, Users, Store, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useContext();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Get platform settings
  const { data: settings, isLoading: settingsLoading } = trpc.admin.getPlatformSettings.useQuery();
  
  // Get platform stats
  const { data: statsData, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  
  // Get users
  const { data: usersData = [] } = trpc.admin.getUsers.useQuery();
  
  // Get restaurants
  const { data: restaurantsData = [] } = trpc.admin.getRestaurants.useQuery({ includeUnapproved: true });
  
  // Get drivers
  const { data: driversData = [] } = trpc.admin.getDrivers.useQuery({ includeUnapproved: true });
  
  // Get orders
  const { data: ordersData = [] } = trpc.admin.getOrders.useQuery();

  const approveRestaurant = trpc.admin.approveRestaurant.useMutation({
    onSuccess: () => {
      utils.admin.getRestaurants.invalidate();
    }
  });

  const approveDriver = trpc.admin.approveDriver.useMutation({
    onSuccess: () => {
      utils.admin.getDrivers.invalidate();
    }
  });

  const rejectRestaurant = trpc.admin.rejectRestaurant.useMutation({
    onSuccess: () => {
      utils.admin.getRestaurants.invalidate();
    }
  });

  const rejectDriver = trpc.admin.rejectDriver.useMutation({
    onSuccess: () => {
      utils.admin.getDrivers.invalidate();
    }
  });

  if (settingsLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Platform management and analytics</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold">{statsData?.monthOrders || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Commission</p>
                  <p className="text-3xl font-bold">ZWL {((statsData?.orderStats?.totalCommission || 0) / 100).toFixed(2)}</p>
                </div>
                <Store className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivery Fees</p>
                  <p className="text-3xl font-bold">ZWL {((statsData?.orderStats?.totalDeliveryFees || 0) / 100).toFixed(2)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold">ZWL {((statsData?.monthRevenue || 0) / 100).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(ordersData || []).slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">ZWL {(order.total / 100).toFixed(2)}</p>
                      </div>
                      <Badge variant="outline">
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Platform Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">System Uptime</span>
                    <span className="font-bold">99.9%</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">API Response Time</span>
                    <span className="font-bold">145ms</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Database Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Restaurant Management</CardTitle>
                  <Button>Add Restaurant</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(restaurantsData || []).map((restaurant: any) => (
                    <div key={restaurant.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-sm text-gray-600">Owner: {restaurant.ownerName} ({restaurant.ownerEmail})</p>
                      </div>
                      <div className="flex gap-2">
                        {restaurant.isApproved ? (
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => approveRestaurant.mutate({ restaurantId: restaurant.id })} className="bg-green-600 hover:bg-green-700">Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectRestaurant.mutate({ restaurantId: restaurant.id })}>Reject</Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Driver Management</CardTitle>
                  <Button>Add Driver</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(driversData || []).map((driver: any) => (
                    <div key={driver.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-gray-600">Rating: {driver.averageRating}/5 • {driver.totalDeliveries} deliveries</p>
                      </div>
                      <div className="flex gap-2">
                        {driver.isApproved ? (
                          <Badge className="bg-green-100 text-green-800">Approved</Badge>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => approveDriver.mutate({ driverId: driver.id })} className="bg-green-600 hover:bg-green-700">Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectDriver.mutate({ driverId: driver.id })}>Reject</Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(ordersData || []).map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">Total: ZWL {(order.total / 100).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {order.status.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => setLocation(`/order/${order.id}`)}>Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform Commission (%)</label>
                  <input
                    type="number"
                    placeholder="10"
                    defaultValue="10"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Order Amount (ZWL)</label>
                  <input
                    type="number"
                    placeholder="500"
                    defaultValue="500"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Default Delivery Radius (km)</label>
                  <input
                    type="number"
                    placeholder="15"
                    defaultValue="15"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Base Delivery Fee (ZWL)</label>
                  <input
                    type="number"
                    placeholder="200"
                    defaultValue="200"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
