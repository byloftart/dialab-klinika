import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/admin/Dashboard";
import Laboratory from "./pages/admin/Laboratory";
import Diagnostics from "./pages/admin/Diagnostics";
import Doctors from "./pages/admin/Doctors";
import Gallery from "./pages/admin/Gallery";
import Appointments from "./pages/admin/Appointments";
import Feedback from "./pages/admin/Feedback";
import SiteSettings from "./pages/admin/SiteSettings";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={Home} />

      {/* Admin routes */}
      <Route path={"/admin"} component={Dashboard} />
      <Route path={"/admin/laboratory"} component={Laboratory} />
      <Route path={"/admin/diagnostics"} component={Diagnostics} />
      <Route path={"/admin/doctors"} component={Doctors} />
      <Route path={"/admin/gallery"} component={Gallery} />
      <Route path={"/admin/appointments"} component={Appointments} />
      <Route path={"/admin/feedback"} component={Feedback} />
      <Route path={"/admin/settings"} component={SiteSettings} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
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
