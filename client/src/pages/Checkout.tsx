import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, MapPin, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const PAYMENT_METHODS = [
  { id: "ecocash", name: "EcoCash", icon: "💳", description: "Zimbabwe's leading mobile money" },
  { id: "innbucks", name: "InnBucks", icon: "💳", description: "Quick and easy payments" },
  { id: "onemoney", name: "OneMoney", icon: "💳", description: "Fast mobile payments" },
  { id: "omari", name: "Omari", icon: "💳", description: "Digital payments" },
  { id: "bank_transfer", name: "Bank Transfer", icon: "🏦", description: "Direct bank transfer" },
  { id: "cash_on_delivery", name: "Cash on Delivery", icon: "💵", description: "Pay when delivered" },
];

const TIP_OPTIONS = [0, 100, 200, 500, null];

interface CartData {
  restaurantId: number;
  items: Array<{
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
    currency: "USD" | "ZWL";
  }>;
}

export default function Checkout() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("ecocash");
  const [selectedTip, setSelectedTip] = useState<number | null>(0);
  const [customTip, setCustomTip] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartData, setCartData] = useState<CartData | null>(null);

  // Get platform settings
  const { data: settings, isLoading: settingsLoading } = trpc.admin.getPlatformSettings.useQuery();

  const createOrderMutation = trpc.order.create.useMutation();

  useEffect(() => {
    const stored = sessionStorage.getItem("cart");
    if (stored) {
      setCartData(JSON.parse(stored));
    }
  }, []);

  if (!cartData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Items in Cart</CardTitle>
            <CardDescription>Please add items to your cart before checking out</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/home")} className="w-full">
              Go Back to Restaurants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cartTotal = cartData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Use settings from DB or fall back to defaults
  const commissionSetting = settings?.find(s => s.settingKey === "commission_percentage");
  const deliveryFeeSetting = settings?.find(s => s.settingKey === "delivery_fee_base");
  
  let commissionPercent = 10;
  if (commissionSetting) {
    try {
      const parsed = JSON.parse(commissionSetting.settingValue);
      commissionPercent = typeof parsed === 'object' ? parsed.value : Number(commissionSetting.settingValue);
    } catch {
      commissionPercent = Number(commissionSetting.settingValue) || 10;
    }
  }
  
  let deliveryFee = 500;
  if (deliveryFeeSetting) {
    try {
      const parsed = JSON.parse(deliveryFeeSetting.settingValue);
      deliveryFee = typeof parsed === 'object' ? parsed.value : Number(deliveryFeeSetting.settingValue);
    } catch {
      deliveryFee = Number(deliveryFeeSetting.settingValue) || 500;
    }
  }

  const platformCommission = Math.round(cartTotal * (commissionPercent / 100));
  const tipAmount = selectedTip === null ? Math.round(parseFloat(customTip || "0") * 100) : selectedTip;
  const total = cartTotal + deliveryFee + platformCommission + tipAmount;

  const handleConfirmPayment = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter delivery address");
      return;
    }
    setStep("payment");
  };

  const handlePaymentSubmit = async () => {
    if (!paymentReference.trim() && selectedPaymentMethod !== "cash_on_delivery") {
      toast.error("Please enter payment reference");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createOrderMutation.mutateAsync({
        restaurantId: cartData.restaurantId,
        deliveryAddress,
        paymentMethod: selectedPaymentMethod,
        paymentReference: selectedPaymentMethod === "cash_on_delivery" ? "" : paymentReference,
        deliveryNotes: specialInstructions,
        tip: tipAmount,
        // Include cart items from sessionStorage
        cartItems: cartData.items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          currency: item.currency,
        })),
      });

      toast.success("Order placed successfully!");
      sessionStorage.removeItem("cart");
      setStep("confirm");
      
      // Redirect to order tracking after 2 seconds
      setTimeout(() => {
        setLocation(`/order/${result.orderId}`);
      }, 2000);
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (loading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in Required</CardTitle>
            <CardDescription>Please sign in to proceed with checkout</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setLocation("/home")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        {/* Steps Indicator */}
        <div className="flex gap-2 mb-8">
          {["address", "payment", "confirm"].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition ${
                step === s ? "bg-orange-500" : step > s ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Delivery Address */}
        {step === "address" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Street Address</Label>
                <Input
                  placeholder="Enter your street address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Special Instructions (Optional)</Label>
                <Input
                  placeholder="Gate code, apartment number, etc."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleConfirmPayment} className="w-full bg-orange-500 hover:bg-orange-600">
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment Method */}
        {step === "payment" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Secure payments powered by 263Pay
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {selectedPaymentMethod !== "cash_on_delivery" && (
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Payment via 263Pay</p>
                      <p>Please complete the payment in your 263Pay app and enter the reference below.</p>
                    </div>
                  </div>
                  <div>
                    <Label>Payment Reference</Label>
                    <Input
                      placeholder="Enter transaction reference or confirmation number"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <Label>Add a Tip (Optional)</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {TIP_OPTIONS.map((amount) => (
                    <Button
                      key={amount === null ? "custom" : amount}
                      variant={selectedTip === amount ? "default" : "outline"}
                      onClick={() => setSelectedTip(amount)}
                      className="text-sm"
                    >
                      {amount === null ? "Custom" : `${cartData.items[0]?.currency || "ZWL"} ${(amount / 100).toFixed(2)}`}
                    </Button>
                  ))}
                </div>
                {selectedTip === null && (
                  <Input
                    type="number"
                    placeholder="Enter custom tip amount"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setStep("address")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirm" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-green-600">Order Placed Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">Your order has been sent to the restaurant.</p>
              <p className="text-sm text-gray-500">You will be redirected to track your order shortly...</p>
              <Spinner />
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartData.items.map((item) => (
              <div key={item.menuItemId} className="flex justify-between">
                <span>
                  {item.name} x {item.quantity}
                </span>
                  <span>{item.currency} {((item.price * item.quantity) / 100).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{cartData.items[0]?.currency || "ZWL"} {(cartTotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{cartData.items[0]?.currency || "ZWL"} {(deliveryFee / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Commission</span>
                <span>{cartData.items[0]?.currency || "ZWL"} {(platformCommission / 100).toFixed(2)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tip</span>
                  <span>{cartData.items[0]?.currency || "ZWL"} {(tipAmount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{cartData.items[0]?.currency || "ZWL"} {(total / 100).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
