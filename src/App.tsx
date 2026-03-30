import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/store/AppContext";
import { AxiosProvider } from "@/store/AxiosContext";
import { I18nProvider } from "@/store/I18nContext";
import { Layout } from "@/components/Layout";
import { RouteGuard } from "@/components/RouteGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Categories from "./pages/Categories";
import ProviderPage from "./pages/ProviderPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookService from "./pages/BookService";
import BecomeProvider from "./pages/BecomeProvider";
import Notifications from "./pages/Notifications";
import ReviewBooking from "./pages/ReviewBooking";
import SettingsPage from "./pages/Settings";
import ProviderProfilePage from "./pages/provider/Profile";
import ProviderServices from "./pages/provider/Services";
import ProviderSchedule from "./pages/provider/Schedule";
import ProviderBookings from "./pages/provider/Bookings";
import ProviderDashboard from "./pages/provider/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminApplications from "./pages/admin/Applications";
import ApplicationDetail from "./pages/admin/ApplicationDetail";
import AdminProviders from "./pages/admin/Providers";
import AdminProviderDetail from "./pages/admin/ProviderDetail";
import AdminCategories from "./pages/admin/Categories";
import AdminCategoryDetail from "./pages/admin/CategoryDetail";
import AdminUsers from "./pages/admin/Users";
import AdminUserDetail from "./pages/admin/UserDetail";
import About from "./pages/About";
import Admin from "./pages/Admin";
import SignUp from "./pages/SignUp";
import Unauthorized401 from "./pages/Unauthorized401";
import Forbidden403 from "./pages/Forbidden403";
import InternalServerError500 from "./pages/InternalServerError500";
import SimulateServerError from "./pages/SimulateServerError";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AxiosProvider>
            <AppProvider>
              <I18nProvider>
                <BrowserRouter>
                  <Layout>
                    <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/providers/:providerSlug" element={<ProviderPage />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/signup" element={<SignUp />} />
                    <Route path="/error/401" element={<Unauthorized401 />} />
                    <Route path="/error/403" element={<Forbidden403 />} />
                    <Route path="/error/500" element={<InternalServerError500 />} />
                    <Route path="/simulate/500" element={<SimulateServerError />} />
                    <Route path="/become-provider" element={<BecomeProvider />} />
                    <Route path="/notifications" element={
                      <RouteGuard roles={["USER", "PROVIDER", "ADMIN"]}><Notifications /></RouteGuard>
                    } />
                    <Route path="/settings" element={
                      <RouteGuard roles={["USER", "PROVIDER", "ADMIN"]}><SettingsPage /></RouteGuard>
                    } />
                    <Route path="/dashboard" element={
                      <RouteGuard roles={["USER", "PROVIDER"]}><Dashboard /></RouteGuard>
                    } />
                    <Route path="/book/:providerId/:serviceId" element={
                      <BookService />
                    } />
                    <Route path="/review/:bookingId" element={
                      <RouteGuard roles={["USER", "PROVIDER"]}><ReviewBooking /></RouteGuard>
                    } />
                    <Route path="/provider/dashboard" element={
                      <RouteGuard roles={["PROVIDER"]}><ProviderDashboard /></RouteGuard>
                    } />
                    <Route path="/provider/profile" element={
                      <RouteGuard roles={["PROVIDER"]}><ProviderProfilePage /></RouteGuard>
                    } />
                    <Route path="/provider/services" element={
                      <RouteGuard roles={["PROVIDER"]}><ProviderServices /></RouteGuard>
                    } />
                    <Route path="/provider/schedule" element={
                      <RouteGuard roles={["PROVIDER"]}><ProviderSchedule /></RouteGuard>
                    } />
                    <Route path="/provider/bookings" element={
                      <RouteGuard roles={["PROVIDER"]}><ProviderBookings /></RouteGuard>
                    } />
                    <Route path="/admin/dashboard" element={
                      <RouteGuard roles={["ADMIN"]}><AdminDashboard /></RouteGuard>
                    } />
                    <Route path="/admin/applications" element={
                      <RouteGuard roles={["ADMIN"]}><AdminApplications /></RouteGuard>
                    } />
                    <Route path="/admin/applications/:applicationId" element={
                      <RouteGuard roles={["ADMIN"]}><ApplicationDetail /></RouteGuard>
                    } />
                    <Route path="/admin/providers" element={
                      <RouteGuard roles={["ADMIN"]}><AdminProviders /></RouteGuard>
                    } />
                    <Route path="/admin/providers/:providerId" element={
                      <RouteGuard roles={["ADMIN"]}><AdminProviderDetail /></RouteGuard>
                    } />
                    <Route path="/admin/categories" element={
                      <RouteGuard roles={["ADMIN"]}><AdminCategories /></RouteGuard>
                    } />
                    <Route path="/admin/categories/:categoryId" element={
                      <RouteGuard roles={["ADMIN"]}><AdminCategoryDetail /></RouteGuard>
                    } />
                    <Route path="/admin/users" element={
                      <RouteGuard roles={["ADMIN"]}><AdminUsers /></RouteGuard>
                    } />
                    <Route path="/admin/users/:userId" element={
                      <RouteGuard roles={["ADMIN"]}><AdminUserDetail /></RouteGuard>
                    } />
                    <Route path="/admin" element={
                      <RouteGuard roles={["ADMIN"]}><Admin /></RouteGuard>
                    } />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </BrowserRouter>
              </I18nProvider>
            </AppProvider>
          </AxiosProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
);

export default App;
