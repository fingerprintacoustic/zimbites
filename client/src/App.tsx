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
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MenuManagement from "./pages/MenuManagement";
import OrderManagement from "./pages/OrderManagement";
// Removed DriverDeliveryDashboard (mock)
import AdminPlatformDashboard from "./pages/AdminPlatformDashboard";

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
      <Route path={"/menu-management"} component={MenuManagement} />
      <Route path={"/order-management"} component={OrderManagement} />
      <Route path={"/driver-dashboard"} component={DriverDashboard} />
      {/* Removed mock driver route */}
      <Route path={"/admin-dashboard"} component={AdminDashboard} />
      <Route path={"/admin-platform-dashboard"} component={AdminPlatformDashboard} />
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
