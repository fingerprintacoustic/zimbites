import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Star, LogOut, User, ShoppingBag, History, LayoutDashboard, Truck, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function CustomerHome() {
  const { user, loading: authLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();

  // Get approved restaurants
  const { data: restaurants, isLoading } = trpc.restaurant.getApproved.useQuery();

  // Filter restaurants based on search
  const filteredRestaurants = (restaurants || []).filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    toast.success("Logged out successfully");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-orange-600">Zimbites</h1>
              <p className="text-sm text-gray-600">Food delivery for Zimbabwe</p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              )}
              <div className="flex gap-2">
                {user?.role === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/admin-dashboard")}
                    className="flex items-center gap-2"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                )}
                {user?.role === "restaurant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/restaurant-dashboard")}
                    className="flex items-center gap-2"
                    title="Restaurant Dashboard"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Restaurant</span>
                  </Button>
                )}
                {user?.role === "driver" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/driver-dashboard")}
                    className="flex items-center gap-2"
                    title="Driver Dashboard"
                  >
                    <Truck className="h-4 w-4" />
                    <span className="hidden sm:inline">Deliveries</span>
                  </Button>
                )}
                {user?.role === "customer" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation("/orders")}
                      className="flex items-center gap-2"
                      title="Order History"
                    >
                      <History className="h-4 w-4" />
                      <span className="hidden sm:inline">Orders</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation("/profile")}
                      className="flex items-center gap-2"
                      title="Profile"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No restaurants found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/restaurant/${restaurant.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{restaurant.name}</CardTitle>
                      <CardDescription>{restaurant.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      <Star className="h-3 w-3 mr-1" />
                      4.5
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{restaurant.address || "Harare"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      <span>Min: ZWL {restaurant.minOrderAmount || 500}</span>
                    </div>
                    <Button
                      className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/restaurant/${restaurant.id}`);
                      }}
                    >
                      View Menu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
