import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { MapPin, Wallet, Star, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("available");
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Get driver profile
  const { data: driver, isLoading: driverLoading } = trpc.driver.getProfile?.useQuery?.() || { data: null, isLoading: false };

  // Get assigned deliveries
  const utils = trpc.useContext();
  const { data: deliveries = [], isLoading: deliveriesLoading } = trpc.driver.getAssignedDeliveries?.useQuery?.(
    undefined,
    { refetchInterval: 5000 }
  ) || { data: [], isLoading: false };

  // Get available orders
  const { data: availableOrders = [] } = trpc.driver.getAvailableOrders?.useQuery?.(
    undefined,
    { refetchInterval: 5000 }
  ) || { data: [] };

  const acceptDelivery = trpc.driver.acceptDelivery.useMutation({
    onSuccess: () => {
      utils.driver.getAssignedDeliveries.invalidate();
      utils.driver.getAvailableOrders.invalidate();
    }
  });

  const confirmDelivery = trpc.order.confirmDelivery.useMutation({
    onSuccess: () => {
      utils.driver.getAssignedDeliveries.invalidate();
    }
  });

  const confirmPickup = trpc.order.confirmPickup.useMutation({
    onSuccess: () => {
      utils.driver.getAssignedDeliveries.invalidate();
      utils.driver.getAvailableOrders.invalidate();
    }
  });

  // Get wallet
  const { data: wallet } = trpc.driver.getWallet?.useQuery?.() || { data: null };

  if (driverLoading || deliveriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Filter deliveries by driverAssignment status (pending, accepted, picked_up, completed)
  const activeDeliveries = deliveries.filter((d) => !["completed", "cancelled"].includes(d.status as string));
  const completedDeliveries = deliveries.filter((d) => d.status === "completed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Driver Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your deliveries and earnings</p>
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
                  <p className="text-sm text-gray-600">Active Deliveries</p>
                  <p className="text-3xl font-bold">{activeDeliveries.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today Earnings</p>
                  <p className="text-3xl font-bold">ZWL {((wallet?.availableBalance || 0) / 100).toFixed(2)}</p>
                </div>
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-3xl font-bold">{deliveries.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-3xl font-bold">{driver?.averageRating ? parseFloat(String(driver.averageRating)).toFixed(1) : 'N/A'}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="active">Active ({activeDeliveries.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Available Tab */}
          <TabsContent value="available">
            <Card>
              <CardHeader>
                <CardTitle>Available Deliveries</CardTitle>
                <CardDescription>Nearby orders waiting for a driver</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableOrders.length > 0 ? (
                    availableOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.restaurantName || 'Restaurant'}</p>
                          </div>
                          <Badge>ZWL {(order.deliveryFee / 100).toFixed(2)}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">📍 {order.deliveryAddress}</p>
                        <Button 
                          className="w-full" 
                          onClick={() => acceptDelivery.mutate({ orderId: order.id })}
                          disabled={acceptDelivery.isPending}
                        >
                          {acceptDelivery.isPending ? "Accepting..." : "Accept Delivery"}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-500">No available orders at the moment</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active">
            <div className="space-y-4">
              {activeDeliveries.length > 0 ? (
                activeDeliveries.map((delivery) => (
                  <Card key={delivery.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Order</p>
                          <p className="font-bold text-lg">{delivery.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge className="mt-1 bg-blue-100 text-blue-800">
                            {delivery.status.replace(/_/g, ` `).toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-end gap-2">
                          {(delivery.status as string === "accepted" || delivery.status as string === "driver_assigned") && (
                            <Button onClick={() => confirmPickup.mutate({ orderId: delivery.orderId })}>
                              Pick Up
                            </Button>
                          )}
                          {(delivery.status as string === "picked_up" || delivery.status as string === "out_for_delivery") && (
                            <Button onClick={() => confirmDelivery.mutate({ orderId: delivery.orderId })}>
                              Mark Delivered
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => setSelectedDelivery(delivery.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-gray-600">No active deliveries</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedDeliveries.slice(0, 5).map((delivery) => (
                    <div key={delivery.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{delivery.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(delivery.deliveredAt || delivery.assignedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
