import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, Users, ShoppingBag, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState } from "react";
import { Link } from "wouter";

const ORDER_STATUSES = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  picked_up: "bg-cyan-100 text-cyan-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [acceptingOrderId, setAcceptingOrderId] = useState<number | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Get user's restaurant
  const { data: restaurants = [] } = trpc.restaurant.getByOwner.useQuery();
  const restaurantId = restaurants?.[0]?.id;

  // Get restaurant orders
  const utils = trpc.useContext();
  const { data: orders = [], isLoading } = trpc.order.getByRestaurant.useQuery(
    { restaurantId: restaurantId as number },
    { 
      enabled: !!restaurantId,
      refetchInterval: false // Only refetch on mutation or manual refresh
    }
  );

  const acceptOrder = trpc.order.accept.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.order.getByRestaurant.cancel();
      
      // Snapshot the previous value
      const previousOrders = utils.order.getByRestaurant.getData({ restaurantId });
      
      // Optimistically update to the new value
      if (previousOrders) {
        utils.order.getByRestaurant.setData(
          { restaurantId },
          previousOrders.map((order: any) =>
            order.id === variables.orderId
              ? { ...order, status: 'confirmed' }
              : order
          )
        );
      }
      
      return { previousOrders };
    },
    onSuccess: (data, variables) => {
      console.log(`Order ${variables.orderId} accepted successfully`);
      setAcceptingOrderId(null);
      setAcceptError(null);
      // Refetch orders after successful acceptance
      utils.order.getByRestaurant.invalidate({ restaurantId });
    },
    onError: (error, variables, context) => {
      console.error(`Error accepting order ${variables.orderId}:`, error);
      // Revert on error
      if (context?.previousOrders) {
        utils.order.getByRestaurant.setData(
          { restaurantId },
          context.previousOrders
        );
      }
      setAcceptingOrderId(null);
      setAcceptError(`Failed to accept order ${variables.orderId}: ${error.message}`);
      // Show error for 5 seconds then clear
      setTimeout(() => setAcceptError(null), 5000);
    }
  });

  const handleAcceptOrder = (orderId: number) => {
    setAcceptingOrderId(orderId);
    setAcceptError(null);
    acceptOrder.mutate({ orderId });
  };

  const rejectOrder = trpc.order.reject.useMutation({
    onSuccess: () => {
      utils.order.getByRestaurant.invalidate({ restaurantId });
    },
    onError: (error) => {
      console.error("Reject order error:", error);
      alert(`Error rejecting order: ${error.message}`);
    }
  });

  const startPreparing = trpc.order.startPreparing.useMutation({
    onSuccess: () => {
      utils.order.getByRestaurant.invalidate({ restaurantId });
    },
    onError: (error) => {
      console.error("Start preparing error:", error);
      alert(`Error starting preparation: ${error.message}`);
    }
  });

  const markReady = trpc.order.markReady.useMutation({
    onSuccess: () => {
      utils.order.getByRestaurant.invalidate({ restaurantId });
    },
    onError: (error) => {
      console.error("Mark ready error:", error);
      alert(`Error marking ready: ${error.message}`);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const pendingOrders = (orders || []).filter((o: any) => o.status === "pending");
  const acceptedOrders = (orders || []).filter((o: any) => o.status === "confirmed");
  const preparingOrders = (orders || []).filter((o: any) => o.status === "preparing");
  const readyOrders = (orders || []).filter((o: any) => o.status === "ready");

  const todayOrders = (orders || []).filter((o: any) => {
    const orderDate = new Date(o.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant and orders</p>
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
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-3xl font-bold">{pendingOrders.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Preparing</p>
                  <p className="text-3xl font-bold">{preparingOrders.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready for Pickup</p>
                  <p className="text-3xl font-bold">{readyOrders.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-3xl font-bold">ZWL {(todayRevenue / 100).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
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
                  {(orders || []).slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className={ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders (Today)</span>
                    <span className="font-bold">{todayOrders.length}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Avg. Preparation Time</span>
                    <span className="font-bold">18 mins</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Customer Rating</span>
                    <span className="font-bold">4.8/5 ⭐</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="space-y-4">
              {/* Pending Orders */}
              {acceptError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {acceptError}
                </div>
              )}
              {pendingOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => rejectOrder.mutate({ orderId: order.id, reason: "Restaurant unavailable" })} disabled={rejectOrder.isPending || acceptingOrderId === order.id}>Reject</Button>
                            <Button size="sm" onClick={() => handleAcceptOrder(order.id)} disabled={acceptingOrderId === order.id || acceptOrder.isPending}>{acceptingOrderId === order.id ? "Processing..." : "Accept & Prepare"}</Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Total: ZWL {(order.total / 100).toFixed(2)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Preparing Orders */}
              {preparingOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preparing Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {preparingOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold">{order.orderNumber}</p>
                            <Badge className="bg-purple-100 text-purple-800 mt-1">Preparing</Badge>
                          </div>
                          <Button size="sm" onClick={() => markReady.mutate({ orderId: order.id })} disabled={markReady.isPending}>{markReady.isPending ? "Processing..." : "Mark Ready"}</Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Ready Orders */}
              {readyOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ready for Pickup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {readyOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{order.orderNumber}</p>
                            <Badge className="bg-green-100 text-green-800 mt-1">Ready</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Menu Management</CardTitle>
                  <Link href="/restaurant-dashboard/menu">
                    <Button>Go to Menu Management</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage your restaurant's menu items and categories.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                  <input
                    type="text"
                    placeholder="Your Restaurant Name"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Describe your restaurant"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Delivery Radius (km)</label>
                  <input
                    type="number"
                    placeholder="15"
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
