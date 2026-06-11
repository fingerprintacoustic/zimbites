import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ChefHat, MapPin, Phone, DollarSign, Building2 } from "lucide-react";

export default function RestaurantRegistration() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"basic" | "location" | "bank" | "review">("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phoneNumber: "",
    address: "",
    latitude: "",
    longitude: "",
    deliveryRadius: "15",
    minOrderAmount: "500",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    bankBranch: "",
    currency: "ZWL" as "USD" | "ZWL",
  });

  const createRestaurant = trpc.restaurant.create.useMutation({
    onSuccess: () => {
      toast.success("Restaurant registered successfully! Awaiting admin approval.");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(`Registration failed: ${error.message}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createRestaurant.mutateAsync({
        name: formData.name,
        description: formData.description,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        deliveryRadius: parseInt(formData.deliveryRadius),
        minOrderAmount: parseInt(formData.minOrderAmount) * 100, // Convert to cents
        bankAccountName: formData.bankAccountName,
        bankAccountNumber: formData.bankAccountNumber,
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case "basic":
        return formData.name && formData.description && formData.phoneNumber;
      case "location":
        return formData.address && formData.latitude && formData.longitude;
      case "bank":
        return formData.bankAccountName && formData.bankAccountNumber && formData.bankName;
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Register Your Restaurant</h1>
          </div>
          <p className="text-gray-600">Join Zimbites and start delivering to customers</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {["basic", "location", "bank", "review"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === s
                    ? "bg-orange-600 text-white"
                    : ["basic", "location", "bank", "review"].indexOf(step) > i
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && <div className="w-12 h-1 bg-gray-300 mx-2" />}
            </div>
          ))}
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === "basic" && "Basic Information"}
              {step === "location" && "Location & Delivery"}
              {step === "bank" && "Bank Account"}
              {step === "review" && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === "basic" && "Tell us about your restaurant"}
              {step === "location" && "Set your delivery area"}
              {step === "bank" && "Configure payment details"}
              {step === "review" && "Review your information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              {step === "basic" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Spice Garden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your restaurant, cuisine type, specialties..."
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+263..."
                      required
                    />
                  </div>
                </>
              )}

              {/* Location & Delivery */}
              {step === "location" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Latitude</label>
                      <Input
                        name="latitude"
                        type="number"
                        step="0.000001"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="-17.8252"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Longitude</label>
                      <Input
                        name="longitude"
                        type="number"
                        step="0.000001"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="31.0335"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Delivery Radius (km)</label>
                      <Input
                        name="deliveryRadius"
                        type="number"
                        value={formData.deliveryRadius}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Min Order Amount (ZWL)</label>
                      <Input
                        name="minOrderAmount"
                        type="number"
                        value={formData.minOrderAmount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Bank Account */}
              {step === "bank" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                    <Input
                      name="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={handleInputChange}
                      placeholder="Name on bank account"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <Input
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleInputChange}
                      placeholder="Bank account number"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Bank Name</label>
                      <Input
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        placeholder="e.g., ZB Bank"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Branch</label>
                      <Input
                        name="bankBranch"
                        value={formData.bankBranch}
                        onChange={handleInputChange}
                        placeholder="Branch name"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Review */}
              {step === "review" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Restaurant:</strong> {formData.name}</p>
                    <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                    <p><strong>Address:</strong> {formData.address}</p>
                    <p><strong>Delivery Radius:</strong> {formData.deliveryRadius} km</p>
                    <p><strong>Min Order:</strong> ZWL {formData.minOrderAmount}</p>
                    <p><strong>Bank:</strong> {formData.bankName} - {formData.bankBranch}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ Your restaurant will be pending admin approval before going live
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const steps = ["basic", "location", "bank", "review"];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex > 0) {
                      setStep(steps[currentIndex - 1] as any);
                    } else {
                      setLocation("/");
                    }
                  }}
                  className="flex-1"
                >
                  {step === "basic" ? "Cancel" : "Back"}
                </Button>
                {step !== "review" && (
                  <Button
                    type="button"
                    onClick={() => {
                      const steps = ["basic", "location", "bank", "review"];
                      const currentIndex = steps.indexOf(step);
                      if (isStepValid()) {
                        setStep(steps[currentIndex + 1] as any);
                      } else {
                        toast.error("Please fill in all required fields");
                      }
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Next
                  </Button>
                )}
                {step === "review" && (
                  <Button
                    type="submit"
                    disabled={isSubmitting || createRestaurant.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting || createRestaurant.isPending ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Registering...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
