import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, MapPin, Phone, Star, ShoppingCart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantDetails() {
  const params = useParams();
  const restaurantId = parseInt(params.id as string);
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Get restaurant details
  const { data: restaurant, isLoading: restaurantLoading } = trpc.restaurant.getById.useQuery({
    id: restaurantId,
  });

  // Get menu categories
  const { data: categories, isLoading: categoriesLoading } = trpc.menu.getCategories.useQuery({
    restaurantId,
  });

  const handleAddToCart = (menuItemId: number, name: string, price: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItemId);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItemId, name, price, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (menuItemId: number) => {
    setCart((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleUpdateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(menuItemId);
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (restaurantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Restaurant not found</p>
          <Button onClick={() => setLocation("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-xl font-bold">{restaurant.name}</h1>
          <Button
            onClick={() => setShowCart(true)}
            className="relative"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({cartCount})
          </Button>
        </div>
      </header>

      {/* Restaurant Hero */}
      <div className="bg-gradient-to-br from-orange-200 to-red-200 h-64 flex items-center justify-center">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-8xl">🍽️</div>
        )}
      </div>

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-lg font-bold">4.5/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Delivery Range</p>
                  <p className="text-lg font-bold">{restaurant.deliveryRadius} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="text-lg font-bold">{restaurant.phoneNumber || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu */}
        {categoriesLoading ? (
          <Spinner />
        ) : (
          <Tabs defaultValue={categories?.[0]?.id.toString()} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories?.map((category) => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories?.map((category) => (
              <TabsContent key={category.id} value={category.id.toString()} className="mt-6">
                <MenuCategoryItems
                  categoryId={category.id}
                  onAddToCart={handleAddToCart}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full md:w-96 rounded-t-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Your Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-600 py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.menuItemId} className="flex items-center justify-between border-b pb-4">
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            ZWL {(item.price / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.menuItemId, item.quantity - 1)
                            }
                            className="px-2 py-1 border rounded hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.menuItemId, item.quantity + 1)
                            }
                            className="px-2 py-1 border rounded hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>ZWL {(cartTotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>ZWL 5.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>ZWL {((cartTotal + 500) / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      sessionStorage.setItem('cart', JSON.stringify({
                        restaurantId: restaurantId,
                        items: cart,
                      }));
                      setLocation("/checkout");
                      setShowCart(false);
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuCategoryItems({
  categoryId,
  onAddToCart,
}: {
  categoryId: number;
  onAddToCart: (menuItemId: number, name: string, price: number) => void;
}) {
  const { data: items, isLoading } = trpc.menu.getItems.useQuery({ categoryId });

  if (isLoading) return <Spinner />;

  if (!items || items.length === 0) {
    return <p className="text-center text-gray-600 py-8">No items in this category</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-5xl">🍲</div>
            )}
          </div>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {item.description}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-lg font-bold text-orange-600">
                ZWL {(item.price / 100).toFixed(2)}
              </span>
              <Button
                size="sm"
                onClick={() => onAddToCart(item.id, item.name, item.price)}
              >
                Add
              </Button>
            </div>

            {item.preparationTime && (
              <p className="text-xs text-gray-600 mt-2">
                ⏱️ {item.preparationTime} mins
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
