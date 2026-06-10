import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, MapPin, Phone, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ORDER_STATUSES = [
  { key: "pending", label: "Order Placed", icon: "📋" },
  { key: "confirmed", label: "Accepted", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready", label: "Ready for Pickup", icon: "📦" },
  { key: "picked_up", label: "Picked Up", icon: "🛍️" },
  { key: "in_transit", label: "On the Way", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

export default function OrderTracking() {
  const params = useParams();
  const orderId = parseInt(params.id as string);
  const [, setLocation] = useLocation();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Get order details
  const { data: order, isLoading, refetch } = trpc.order.getById.useQuery({ id: orderId });

  // Auto-refresh order status
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Button onClick={() => setLocation("/orders")}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = ORDER_STATUSES.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ORDER_STATUSES.map((status, index) => {
                    const isCompleted = index <= currentStatusIndex && !isCancelled;
                    const isCurrent = index === currentStatusIndex && !isCancelled;

                    return (
                      <div key={status.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${
                              isCompleted
                                ? "bg-orange-600 text-white"
                                : isCurrent
                                  ? "bg-orange-100 text-orange-600 animate-pulse"
                                  : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {status.icon}
                          </div>
                          {index < ORDER_STATUSES.length - 1 && (
                            <div
                              className={`w-1 h-12 mt-2 transition-colors ${
                                isCompleted ? "bg-orange-600" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <p
                            className={`font-medium ${
                              isCompleted ? "text-gray-900" : "text-gray-600"
                            }`}
                          >
                            {status.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-orange-600 mt-1">
                              {status.key === "in_transit"
                                ? "Driver is on the way"
                                : status.key === "preparing"
                                  ? "Restaurant is preparing your order"
                                  : "Current status"}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">ZWL {(item.price / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>ZWL {(order.subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>ZWL {(order.deliveryFee / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span>ZWL {(order.platformCommission / 100).toFixed(2)}</span>
                  </div>
                  {order.tip > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tip</span>
                      <span>ZWL {(order.tip / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-orange-600">ZWL {(order.total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">{order.deliveryAddress}</p>
                {order.deliveryNotes && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Delivery Notes:</span> {order.deliveryNotes}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Driver Info */}
            {order.driverId && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Driver Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Driver Name</p>
                      <p className="text-sm text-gray-600">Rating: 4.8/5 ⭐</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Call Driver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status Badge */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Badge
                    className={`text-lg px-4 py-2 ${
                      isDelivered
                        ? "bg-green-100 text-green-800"
                        : isCancelled
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-3">
                    {isDelivered
                      ? "Your order has been delivered"
                      : isCancelled
                        ? "Your order was cancelled"
                        : "Your order is on the way"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Estimated Time */}
            {!isDelivered && !isCancelled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Estimated Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">15-20 mins</p>
                  <p className="text-sm text-gray-600 mt-2">Estimated delivery time</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              {isDelivered && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation(`/rate-order/${order.id}`)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Rate Order
                </Button>
              )}
            </div>

            {/* Auto-refresh Toggle */}
            <Card>
              <CardContent className="pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Auto-refresh status</span>
                </label>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
