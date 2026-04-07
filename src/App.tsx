import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/store/AppContext";
import { AxiosProvider } from "@/store/AxiosContext";
import { I18nProvider } from "@/store/I18nContext";
import { Layout } from "@/components/Layout";
import { RouteGuard } from "@/components/RouteGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy-loaded route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Categories = lazy(() => import("./pages/Categories"));
const ProviderPage = lazy(() => import("./pages/ProviderPage"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BookService = lazy(() => import("./pages/BookService"));
const BecomeProvider = lazy(() => import("./pages/BecomeProvider"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ReviewBooking = lazy(() => import("./pages/ReviewBooking"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const ProviderProfilePage = lazy(() => import("./pages/provider/Profile"));
const ProviderServices = lazy(() => import("./pages/provider/Services"));
const ProviderSchedule = lazy(() => import("./pages/provider/Schedule"));
const ProviderBookings = lazy(() => import("./pages/provider/Bookings"));
const ProviderDashboard = lazy(() => import("./pages/provider/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminApplications = lazy(() => import("./pages/admin/Applications"));
const ApplicationDetail = lazy(() => import("./pages/admin/ApplicationDetail"));
const AdminProviders = lazy(() => import("./pages/admin/Providers"));
const AdminProviderDetail = lazy(() => import("./pages/admin/ProviderDetail"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminCategoryDetail = lazy(() => import("./pages/admin/CategoryDetail"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminUserDetail = lazy(() => import("./pages/admin/UserDetail"));
const About = lazy(() => import("./pages/About"));
const Admin = lazy(() => import("./pages/Admin"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Unauthorized401 = lazy(() => import("./pages/Unauthorized401"));
const Forbidden403 = lazy(() => import("./pages/Forbidden403"));
const InternalServerError500 = lazy(() => import("./pages/InternalServerError500"));
const SimulateServerError = lazy(() => import("./pages/SimulateServerError"));

const queryClient = new QueryClient();

// Loading fallback component
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <AxiosProvider>
            <AppProvider>
              <I18nProvider>
                <BrowserRouter>
                  <Layout>
                    <Suspense fallback={<RouteLoader />}>
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
                        <Route
                          path="/notifications"
                          element={
                            <RouteGuard roles={["USER", "PROVIDER", "ADMIN"]}>
                              <Notifications />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <RouteGuard roles={["USER", "PROVIDER", "ADMIN"]}>
                              <SettingsPage />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/dashboard"
                          element={
                            <RouteGuard roles={["USER", "PROVIDER"]}>
                              <Dashboard />
                            </RouteGuard>
                          }
                        />
                        <Route path="/book/:providerId/:serviceId" element={<BookService />} />
                        <Route
                          path="/review/:bookingId"
                          element={
                            <RouteGuard roles={["USER", "PROVIDER"]}>
                              <ReviewBooking />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/provider/dashboard"
                          element={
                            <RouteGuard roles={["PROVIDER"]}>
                              <ProviderDashboard />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/provider/profile"
                          element={
                            <RouteGuard roles={["PROVIDER"]}>
                              <ProviderProfilePage />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/provider/services"
                          element={
                            <RouteGuard roles={["PROVIDER"]}>
                              <ProviderServices />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/provider/schedule"
                          element={
                            <RouteGuard roles={["PROVIDER"]}>
                              <ProviderSchedule />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/provider/bookings"
                          element={
                            <RouteGuard roles={["PROVIDER"]}>
                              <ProviderBookings />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/dashboard"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <AdminDashboard />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/applications"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <AdminApplications />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/applications/:applicationId"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <ApplicationDetail />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/providers"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <AdminProviders />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/providers/:providerId"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <AdminProviderDetail />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/categories"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <AdminCategories />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/categories/:categoryId"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <AdminCategoryDetail />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <AdminUsers />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin/users/:userId"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <AdminUserDetail />
                            </RouteGuard>
                          }
                        />
                        <Route
                          path="/admin"
                          element={
                            <RouteGuard roles={["ADMIN"]}>
                              <Admin />
                            </RouteGuard>
                          }
                        />
                        <Route path="/about" element={<About />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </BrowserRouter>
              </I18nProvider>
            </AppProvider>
          </AxiosProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
