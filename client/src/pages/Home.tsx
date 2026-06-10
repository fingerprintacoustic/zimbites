import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Utensils, MapPin, Zap, Shield } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to customer home
  if (isAuthenticated && user?.role === "customer") {
    setLocation("/home");
    return null;
  }

  if (isAuthenticated && user?.role === "restaurant") {
    setLocation("/restaurant-dashboard");
    return null;
  }

  if (isAuthenticated && user?.role === "driver") {
    setLocation("/driver-dashboard");
    return null;
  }

  if (isAuthenticated && user?.role === "admin") {
    setLocation("/admin-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Utensils className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">Zimbites</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = getLoginUrl()}>
              Sign In
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => window.location.href = getLoginUrl()}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Food Delivery Made Simple in Zimbabwe
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Order from your favorite restaurants and get delicious food delivered to your doorstep. Fast, reliable, and supporting local businesses.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Order Now
              </Button>
              <Button
                size="lg"
                variant="outline"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center text-white">
              <Utensils className="h-24 w-24 mx-auto mb-4 opacity-80" />
              <p className="text-2xl font-semibold">Fast & Fresh Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Zimbites?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Get your food in 30-45 minutes or less</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Coverage</h3>
              <p className="text-gray-600">Serving Harare and surrounding areas</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">Secure payments powered by 263Pay</p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Restaurants</h3>
              <p className="text-gray-600">Hundreds of restaurants to choose from</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Payment Methods We Accept</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "EcoCash", icon: "💳" },
              { name: "InnBucks", icon: "🏦" },
              { name: "OneMoney", icon: "💰" },
              { name: "Omari", icon: "📱" },
              { name: "Bank Transfer", icon: "🏧" },
              { name: "Cash on Delivery", icon: "💵" },
            ].map((method) => (
              <div key={method.name} className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-4xl mb-2">{method.icon}</div>
                <p className="font-semibold text-gray-900">{method.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Order?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of happy customers enjoying delicious food delivered fast
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In to Order
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Zimbites</h3>
              <p className="text-sm">Fast food delivery service in Zimbabwe</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/fingerprintacoustic/zimbites" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Zimbites. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
