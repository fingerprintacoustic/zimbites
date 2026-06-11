import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DevLogin from "./pages/DevLogin";
import CustomerHome from "./pages/CustomerHome";
import RestaurantDetails from "./pages/RestaurantDetails";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import RateOrder from "./pages/RateOrder";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import MenuManagement from "./pages/MenuManagement";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RestaurantRegistration from "./pages/RestaurantRegistration";
import DriverRegistration from "./pages/DriverRegistration";
// Removed MenuManagement (mock)
// Removed OrderManagement (mock)
// Removed DriverDeliveryDashboard (mock)
// Removed AdminPlatformDashboard (mock)

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={DevLogin} />
      <Route path={"/home"} component={CustomerHome} />
      <Route path={"/restaurant/:id"} component={RestaurantDetails} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/order/:id"} component={OrderTracking} />
      <Route path={"/orders"} component={OrderHistory} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/rate-order/:id"} component={RateOrder} />
      <Route path={"/restaurant-dashboard"} component={RestaurantDashboard} />
      <Route path={"/restaurant-dashboard/menu"} component={MenuManagement} />
      <Route path={"/driver-dashboard"} component={DriverDashboard} />
      <Route path={"/admin-dashboard"} component={AdminDashboard} />
      <Route path={"/register-restaurant"} component={RestaurantRegistration} />
      <Route path={"/register-driver"} component={DriverRegistration} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
