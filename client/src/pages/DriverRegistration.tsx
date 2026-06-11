import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Truck, Phone, DollarSign } from "lucide-react";

export default function DriverRegistration() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"personal" | "vehicle" | "bank" | "review">("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    licenseNumber: "",
    vehicleType: "motorcycle" as "motorcycle" | "car" | "van",
    licensePlate: "",
    vehicleColor: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    bankBranch: "",
    withdrawalMethod: "bank_transfer" as "bank_transfer" | "mobile_money" | "cash",
  });

  const createDriver = trpc.driver.register.useMutation({
    onSuccess: () => {
      toast.success("Driver application submitted! Awaiting admin approval.");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(`Registration failed: ${error.message}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createDriver.mutateAsync({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        licenseNumber: formData.licenseNumber,
        vehicleType: formData.vehicleType,
        licensePlate: formData.licensePlate,
        vehicleColor: formData.vehicleColor,
        bankAccountName: formData.bankAccountName,
        bankAccountNumber: formData.bankAccountNumber,
        bankName: formData.bankName,
        bankBranch: formData.bankBranch,
        withdrawalMethod: formData.withdrawalMethod,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case "personal":
        return formData.name && formData.phoneNumber && formData.licenseNumber;
      case "vehicle":
        return formData.vehicleType && formData.licensePlate && formData.vehicleColor;
      case "bank":
        return formData.bankAccountName && formData.bankAccountNumber && formData.bankName;
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Become a Driver</h1>
          </div>
          <p className="text-gray-600">Join Zimbites and start earning</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {["personal", "vehicle", "bank", "review"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step === s
                    ? "bg-blue-600 text-white"
                    : ["personal", "vehicle", "bank", "review"].indexOf(step) > i
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
              {step === "personal" && "Personal Information"}
              {step === "vehicle" && "Vehicle Details"}
              {step === "bank" && "Bank Account"}
              {step === "review" && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {step === "personal" && "Tell us about yourself"}
              {step === "vehicle" && "Describe your vehicle"}
              {step === "bank" && "Configure payment details"}
              {step === "review" && "Review your information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              {step === "personal" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Driver License Number</label>
                    <Input
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      placeholder="License number"
                      required
                    />
                  </div>
                </>
              )}

              {/* Vehicle Details */}
              {step === "vehicle" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="motorcycle">Motorcycle</option>
                      <option value="car">Car</option>
                      <option value="van">Van</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">License Plate</label>
                    <Input
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC 123 ZW"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehicle Color</label>
                    <Input
                      name="vehicleColor"
                      value={formData.vehicleColor}
                      onChange={handleInputChange}
                      placeholder="e.g., Red"
                      required
                    />
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Withdrawal Method</label>
                    <select
                      name="withdrawalMethod"
                      value={formData.withdrawalMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </>
              )}

              {/* Review */}
              {step === "review" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                    <p><strong>License:</strong> {formData.licenseNumber}</p>
                    <p><strong>Vehicle:</strong> {formData.vehicleColor} {formData.vehicleType} ({formData.licensePlate})</p>
                    <p><strong>Bank:</strong> {formData.bankName} - {formData.bankBranch}</p>
                    <p><strong>Withdrawal:</strong> {formData.withdrawalMethod}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ Your application will be reviewed by our team
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
                    const steps = ["personal", "vehicle", "bank", "review"];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex > 0) {
                      setStep(steps[currentIndex - 1] as any);
                    } else {
                      setLocation("/");
                    }
                  }}
                  className="flex-1"
                >
                  {step === "personal" ? "Cancel" : "Back"}
                </Button>
                {step !== "review" && (
                  <Button
                    type="button"
                    onClick={() => {
                      const steps = ["personal", "vehicle", "bank", "review"];
                      const currentIndex = steps.indexOf(step);
                      if (isStepValid()) {
                        setStep(steps[currentIndex + 1] as any);
                      } else {
                        toast.error("Please fill in all required fields");
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                )}
                {step === "review" && (
                  <Button
                    type="submit"
                    disabled={isSubmitting || createDriver.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting || createDriver.isPending ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
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
