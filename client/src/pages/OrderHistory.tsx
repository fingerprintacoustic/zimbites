import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Star } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-indigo-100 text-indigo-800",
  picked_up: "bg-cyan-100 text-cyan-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderHistory() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  // Get customer orders
  const { data: orders, isLoading } = trpc.order.getByCustomer.useQuery(
    undefined,
    { refetchInterval: 10000 } // Refresh order list every 10 seconds
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const filteredOrders = orders?.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return !["delivered", "cancelled"].includes(order.status);
    if (activeTab === "completed") return order.status === "delivered";
    if (activeTab === "cancelled") return order.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-gray-600 mt-1">View and manage all your orders</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        {filteredOrders && filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Order Info */}
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="font-bold text-lg">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Restaurant */}
                    <div>
                      <p className="text-sm text-gray-600">Restaurant</p>
                      <p className="font-medium">Restaurant Name</p>
                      <p className="text-xs text-gray-500 mt-1">Order placed</p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={`mt-1 ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>

                    {/* Total & Action */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-lg text-orange-600">ZWL {(order.total / 100).toFixed(2)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/order/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No orders found</p>
              <Button onClick={() => setLocation("/")}>Start Ordering</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
