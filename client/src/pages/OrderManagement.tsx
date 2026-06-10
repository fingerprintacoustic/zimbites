import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, ChefHat, Truck } from "lucide-react";
import { toast } from "sonner";

export default function OrderManagement() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Mock orders data
  const orders = [
    {
      id: 1,
      orderNumber: "ORD-001",
      customerName: "John Doe",
      items: [
        { name: "Chicken Burger", quantity: 2, price: 1500 },
        { name: "Coca Cola", quantity: 2, price: 500 },
      ],
      total: 4000,
      status: "pending",
      createdAt: new Date(Date.now() - 5 * 60000),
      deliveryAddress: "123 Main St, Harare",
    },
    {
      id: 2,
      orderNumber: "ORD-002",
      customerName: "Jane Smith",
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 2500 },
      ],
      total: 2500,
      status: "preparing",
      createdAt: new Date(Date.now() - 15 * 60000),
      deliveryAddress: "456 Oak Ave, Harare",
    },
    {
      id: 3,
      orderNumber: "ORD-003",
      customerName: "Bob Johnson",
      items: [
        { name: "Beef Burger", quantity: 1, price: 1800 },
        { name: "Fries", quantity: 1, price: 800 },
      ],
      total: 2600,
      status: "ready",
      createdAt: new Date(Date.now() - 30 * 60000),
      deliveryAddress: "789 Pine Rd, Harare",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "preparing":
        return <ChefHat className="h-5 w-5 text-blue-500" />;
      case "ready":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "delivered":
        return <Truck className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-200 text-green-900";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    toast.success(`Order status updated to ${newStatus}`);
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const preparingOrders = orders.filter(o => o.status === "preparing");
  const readyOrders = orders.filter(o => o.status === "ready");

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow mb-4" onClick={() => setSelectedOrder(order)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
            <p className="text-sm text-gray-600">{order.customerName}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </Badge>
        </div>

        <div className="mb-3 pb-3 border-b">
          {order.items.map((item: any, idx: number) => (
            <p key={idx} className="text-sm text-gray-700">
              {item.quantity}x {item.name} - ZWL {(item.price / 100).toFixed(2)}
            </p>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <span className="font-bold text-orange-600">ZWL {(order.total / 100).toFixed(2)}</span>
          <span className="text-xs text-gray-500">
            {Math.round((Date.now() - order.createdAt.getTime()) / 60000)} mins ago
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Order Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="preparing">
                  Preparing ({preparingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="ready">
                  Ready ({readyOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4">
                {pendingOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending orders</p>
                ) : (
                  pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
                )}
              </TabsContent>

              <TabsContent value="preparing" className="mt-4">
                {preparingOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No orders being prepared</p>
                ) : (
                  preparingOrders.map(order => <OrderCard key={order.id} order={order} />)
                )}
              </TabsContent>

              <TabsContent value="ready" className="mt-4">
                {readyOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No ready orders</p>
                ) : (
                  readyOrders.map(order => <OrderCard key={order.id} order={order} />)
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Order Details */}
          <div>
            {selectedOrder ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedOrder.orderNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{selectedOrder.customerName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <p className="text-sm">{selectedOrder.deliveryAddress}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Items</p>
                    <div className="space-y-1">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <p key={idx} className="text-sm">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-orange-600">
                      ZWL {(selectedOrder.total / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Update Status</p>
                    <div className="space-y-2">
                      {["pending", "preparing", "ready", "delivered"].map(status => (
                        <Button
                          key={status}
                          variant={selectedOrder.status === status ? "default" : "outline"}
                          className="w-full text-sm"
                          onClick={() => handleStatusChange(selectedOrder.id, status)}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Select an order to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
