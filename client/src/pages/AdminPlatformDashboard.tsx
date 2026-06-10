import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Store, Truck, TrendingUp, Settings, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminPlatformDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data
  const stats = [
    { label: "Total Orders", value: "1,234", icon: TrendingUp, color: "text-blue-600" },
    { label: "Active Restaurants", value: "45", icon: Store, color: "text-orange-600" },
    { label: "Active Drivers", value: "78", icon: Truck, color: "text-green-600" },
    { label: "Total Users", value: "3,456", icon: Users, color: "text-purple-600" },
  ];

  const revenueData = [
    { date: "Mon", revenue: 4200, orders: 24 },
    { date: "Tue", revenue: 3800, orders: 22 },
    { date: "Wed", revenue: 5200, orders: 31 },
    { date: "Thu", revenue: 4800, orders: 28 },
    { date: "Fri", revenue: 6200, orders: 35 },
    { date: "Sat", revenue: 7200, orders: 42 },
    { date: "Sun", revenue: 5800, orders: 33 },
  ];

  const restaurants = [
    { id: 1, name: "Burger Palace", owner: "John Doe", status: "approved", revenue: 45000, orders: 234 },
    { id: 2, name: "Pizza Place", owner: "Jane Smith", status: "approved", revenue: 38000, orders: 198 },
    { id: 3, name: "Chicken Express", owner: "Bob Johnson", status: "pending", revenue: 0, orders: 0 },
    { id: 4, name: "Sushi House", owner: "Alice Brown", status: "approved", revenue: 52000, orders: 267 },
  ];

  const drivers = [
    { id: 1, name: "David Wilson", phone: "+263771234567", status: "active", deliveries: 156, rating: 4.8 },
    { id: 2, name: "Michael Chen", phone: "+263771234568", status: "active", deliveries: 142, rating: 4.6 },
    { id: 3, name: "Sarah Taylor", phone: "+263771234569", status: "inactive", deliveries: 89, rating: 4.5 },
    { id: 4, name: "James Martin", phone: "+263771234570", status: "active", deliveries: 178, rating: 4.9 },
  ];

  const handleApproveRestaurant = (restaurantId: number) => {
    toast.success("Restaurant approved!");
  };

  const handleRejectRestaurant = (restaurantId: number) => {
    toast.success("Restaurant rejected!");
  };

  const handleUpdateSettings = () => {
    toast.success("Settings updated!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform management and analytics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Orders (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f97316" name="Revenue (ZWL)" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Restaurants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {restaurants.slice(0, 3).map(r => (
                      <div key={r.id} className="flex justify-between items-center pb-3 border-b">
                        <div>
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-xs text-gray-600">{r.orders} orders</p>
                        </div>
                        <span className="font-bold text-orange-600">ZWL {(r.revenue / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {drivers.slice(0, 3).map(d => (
                      <div key={d.id} className="flex justify-between items-center pb-3 border-b">
                        <div>
                          <p className="font-semibold">{d.name}</p>
                          <p className="text-xs text-gray-600">{d.deliveries} deliveries</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-600">⭐ {d.rating}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Restaurant</th>
                        <th className="text-left py-3 px-4 font-semibold">Owner</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Revenue</th>
                        <th className="text-left py-3 px-4 font-semibold">Orders</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.map(r => (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{r.name}</td>
                          <td className="py-3 px-4">{r.owner}</td>
                          <td className="py-3 px-4">
                            <Badge className={r.status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {r.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">ZWL {(r.revenue / 100).toFixed(2)}</td>
                          <td className="py-3 px-4">{r.orders}</td>
                          <td className="py-3 px-4">
                            {r.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                                  onClick={() => handleApproveRestaurant(r.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 flex items-center gap-1"
                                  onClick={() => handleRejectRestaurant(r.id)}
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {r.status === "approved" && (
                              <Button size="sm" variant="outline">View</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Deliveries</th>
                        <th className="text-left py-3 px-4 font-semibold">Rating</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map(d => (
                        <tr key={d.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold">{d.name}</td>
                          <td className="py-3 px-4">{d.phone}</td>
                          <td className="py-3 px-4">
                            <Badge className={d.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {d.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{d.deliveries}</td>
                          <td className="py-3 px-4 font-semibold">⭐ {d.rating}</td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="outline">View</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["EcoCash", "InnBucks", "OneMoney", "Omari", "Bank Transfer", "Cash on Delivery"].map(method => (
                    <div key={method} className="p-4 border rounded flex items-center justify-between">
                      <span className="font-semibold">{method}</span>
                      <input type="checkbox" defaultChecked className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Platform Commission (%)</label>
                  <Input type="number" placeholder="15" defaultValue="15" />
                </div>
                <div>
                  <label className="text-sm font-medium">Minimum Order Amount (ZWL)</label>
                  <Input type="number" placeholder="500" defaultValue="500" />
                </div>
                <div>
                  <label className="text-sm font-medium">Delivery Radius (km)</label>
                  <Input type="number" placeholder="15" defaultValue="15" />
                </div>
                <div>
                  <label className="text-sm font-medium">Driver Base Fee (ZWL)</label>
                  <Input type="number" placeholder="200" defaultValue="200" />
                </div>
                <div>
                  <label className="text-sm font-medium">Per Km Rate (ZWL)</label>
                  <Input type="number" placeholder="50" defaultValue="50" />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleUpdateSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Update Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
