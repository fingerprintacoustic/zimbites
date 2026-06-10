import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Phone, MapPin, Clock, DollarSign, CheckCircle, Navigation } from "lucide-react";
import { toast } from "sonner";

export default function DriverDeliveryDashboard() {
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("available");

  // Mock deliveries data
  const deliveries = [
    {
      id: 1,
      orderNumber: "ORD-001",
      restaurant: "Burger Palace",
      customer: "John Doe",
      customerPhone: "+263771234567",
      pickupAddress: "123 Main St, Harare",
      deliveryAddress: "456 Oak Ave, Harare",
      distance: 5.2,
      estimatedTime: 25,
      status: "available",
      total: 4000,
      tip: 500,
    },
    {
      id: 2,
      orderNumber: "ORD-002",
      restaurant: "Pizza Place",
      customer: "Jane Smith",
      customerPhone: "+263771234568",
      pickupAddress: "789 Pine Rd, Harare",
      deliveryAddress: "321 Elm St, Harare",
      distance: 3.8,
      estimatedTime: 20,
      status: "available",
      total: 2500,
      tip: 300,
    },
    {
      id: 3,
      orderNumber: "ORD-003",
      restaurant: "Burger Palace",
      customer: "Bob Johnson",
      customerPhone: "+263771234569",
      pickupAddress: "123 Main St, Harare",
      deliveryAddress: "654 Maple Dr, Harare",
      distance: 7.1,
      estimatedTime: 35,
      status: "accepted",
      total: 3200,
      tip: 400,
    },
    {
      id: 4,
      orderNumber: "ORD-004",
      restaurant: "Pizza Place",
      customer: "Alice Brown",
      customerPhone: "+263771234570",
      pickupAddress: "789 Pine Rd, Harare",
      deliveryAddress: "987 Birch Ln, Harare",
      distance: 4.5,
      estimatedTime: 22,
      status: "in_transit",
      total: 2800,
      tip: 350,
    },
  ];

  const availableDeliveries = deliveries.filter(d => d.status === "available");
  const acceptedDeliveries = deliveries.filter(d => d.status === "accepted");
  const inTransitDeliveries = deliveries.filter(d => d.status === "in_transit");

  const handleAcceptDelivery = (deliveryId: number) => {
    toast.success("Delivery accepted! Navigate to pickup location.");
    setSelectedDelivery({ ...selectedDelivery, status: "accepted" });
  };

  const handleStartDelivery = (deliveryId: number) => {
    toast.success("Delivery started! Heading to customer.");
  };

  const handleCompleteDelivery = (deliveryId: number) => {
    toast.success("Delivery completed! Payment processed.");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const DeliveryCard = ({ delivery }: { delivery: any }) => (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow mb-4"
      onClick={() => setSelectedDelivery(delivery)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{delivery.orderNumber}</h3>
            <p className="text-sm text-gray-600">{delivery.restaurant}</p>
          </div>
          <Badge className={getStatusColor(delivery.status)}>
            {delivery.status === "in_transit" ? "In Transit" : delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{delivery.distance} km away</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{delivery.estimatedTime} mins</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <span className="font-bold text-orange-600">ZWL {(delivery.total / 100).toFixed(2)}</span>
          <span className="text-sm text-green-600 font-semibold">+ZWL {(delivery.tip / 100).toFixed(2)} tip</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Delivery Dashboard</h1>
          <p className="text-gray-600">Manage your deliveries and earn money</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-3xl font-bold">{availableDeliveries.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-3xl font-bold">{acceptedDeliveries.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-3xl font-bold">{inTransitDeliveries.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Today's Earnings</p>
              <p className="text-3xl font-bold text-green-600">ZWL 2,450</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deliveries List */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="available">
                  Available ({availableDeliveries.length})
                </TabsTrigger>
                <TabsTrigger value="accepted">
                  Accepted ({acceptedDeliveries.length})
                </TabsTrigger>
                <TabsTrigger value="in_transit">
                  In Transit ({inTransitDeliveries.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="mt-4">
                {availableDeliveries.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No available deliveries</p>
                ) : (
                  availableDeliveries.map(delivery => <DeliveryCard key={delivery.id} delivery={delivery} />)
                )}
              </TabsContent>

              <TabsContent value="accepted" className="mt-4">
                {acceptedDeliveries.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No accepted deliveries</p>
                ) : (
                  acceptedDeliveries.map(delivery => <DeliveryCard key={delivery.id} delivery={delivery} />)
                )}
              </TabsContent>

              <TabsContent value="in_transit" className="mt-4">
                {inTransitDeliveries.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No deliveries in transit</p>
                ) : (
                  inTransitDeliveries.map(delivery => <DeliveryCard key={delivery.id} delivery={delivery} />)
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Delivery Details */}
          <div>
            {selectedDelivery ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedDelivery.orderNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{selectedDelivery.customer}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full flex items-center gap-2"
                      onClick={() => window.open(`tel:${selectedDelivery.customerPhone}`)}
                    >
                      <Phone className="h-4 w-4" />
                      Call Customer
                    </Button>
                  </div>

                  {/* Pickup Location */}
                  <div>
                    <p className="text-sm text-gray-600">Pickup</p>
                    <p className="text-sm font-medium">{selectedDelivery.restaurant}</p>
                    <p className="text-xs text-gray-600">{selectedDelivery.pickupAddress}</p>
                  </div>

                  {/* Delivery Location */}
                  <div>
                    <p className="text-sm text-gray-600">Delivery</p>
                    <p className="text-sm font-medium">{selectedDelivery.customer}</p>
                    <p className="text-xs text-gray-600">{selectedDelivery.deliveryAddress}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Navigate
                    </Button>
                  </div>

                  {/* Distance & Time */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-xs text-gray-600">Distance</p>
                      <p className="font-semibold">{selectedDelivery.distance} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Est. Time</p>
                      <p className="font-semibold">{selectedDelivery.estimatedTime} mins</p>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Delivery Fee</span>
                      <span className="font-semibold">ZWL {(selectedDelivery.total / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span className="text-sm text-gray-600">Tip</span>
                      <span className="font-semibold text-green-600">ZWL {(selectedDelivery.tip / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b">
                      <span className="text-sm font-semibold">Total Earning</span>
                      <span className="text-lg font-bold text-green-600">
                        ZWL {((selectedDelivery.total + selectedDelivery.tip) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {selectedDelivery.status === "available" && (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptDelivery(selectedDelivery.id)}
                      >
                        Accept Delivery
                      </Button>
                    )}
                    {selectedDelivery.status === "accepted" && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStartDelivery(selectedDelivery.id)}
                      >
                        Start Delivery
                      </Button>
                    )}
                    {selectedDelivery.status === "in_transit" && (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                        onClick={() => handleCompleteDelivery(selectedDelivery.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Complete Delivery
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Select a delivery to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
