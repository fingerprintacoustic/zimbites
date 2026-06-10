import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Star, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RateOrder() {
  const params = useParams();
  const orderId = parseInt(params.id as string);
  const [, setLocation] = useLocation();

  const [restaurantRating, setRestaurantRating] = useState(5);
  const [driverRating, setDriverRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: order, isLoading } = trpc.order.getById.useQuery({ id: orderId });

  const handleSubmitRating = async () => {
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit restaurant rating
      // await trpc.rating.create.mutate({
      //   orderId,
      //   rating: restaurantRating,
      //   comment,
      //   type: 'restaurant'
      // });

      // Submit driver rating if applicable
      // if (order?.driverId) {
      //   await trpc.rating.create.mutate({
      //     orderId,
      //     rating: driverRating,
      //     comment,
      //     type: 'driver'
      //   });
      // }

      toast.success("Thank you for your feedback!");
      setLocation("/orders");
    } catch (error) {
      toast.error("Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => setLocation(`/order/${orderId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Rate Your Order</CardTitle>
            <CardDescription>Help us improve by sharing your feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Restaurant Rating */}
            <div>
              <h3 className="font-medium mb-4">How was the food quality?</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRestaurantRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= restaurantRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {restaurantRating === 1 && "Poor"}
                {restaurantRating === 2 && "Fair"}
                {restaurantRating === 3 && "Good"}
                {restaurantRating === 4 && "Very Good"}
                {restaurantRating === 5 && "Excellent"}
              </p>
            </div>

            {/* Driver Rating */}
            {order.driverId && (
              <div className="border-t pt-8">
                <h3 className="font-medium mb-4">How was the delivery service?</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setDriverRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= driverRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {driverRating === 1 && "Poor"}
                  {driverRating === 2 && "Fair"}
                  {driverRating === 3 && "Good"}
                  {driverRating === 4 && "Very Good"}
                  {driverRating === 5 && "Excellent"}
                </p>
              </div>
            )}

            {/* Comment */}
            <div className="border-t pt-8">
              <label className="font-medium block mb-2">Additional Comments (Optional)</label>
              <Textarea
                placeholder="Tell us more about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Tip Option */}
            <div className="border-t pt-8 bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Would you like to add a tip?</h3>
              <div className="grid grid-cols-4 gap-2">
                {[0, 100, 200, 500].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    className="h-12"
                    onClick={() => toast.success(`Tip of ZWL ${(amount / 100).toFixed(2)} added`)}
                  >
                    {amount === 0 ? "No Tip" : `ZWL ${(amount / 100).toFixed(2)}`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/orders")}
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
