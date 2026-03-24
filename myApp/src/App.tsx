import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Home from "./pages/Home";
import ProjectSelection from "./pages/projectSelection"
import Workplace from "./pages/workspace";

// Import the publishable key from your .env file
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Check your .env file.");
}

function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <Routes>
        {/* Public Route: Anyone can see the landing page */}
        <Route path="/" element={<Home />} />

        <Route path="/select-project" element={<SignedIn><ProjectSelection /></SignedIn>} />
<Route path="/workplace/:projectId" element={<SignedIn><Workplace /></SignedIn>} />

        {/* Protected Route: Only logged-in users can see the Workplace */}
        <Route
          path="/workplace"
          element={
            <>
              <SignedIn>
                <Workplace />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}



export default function App() {
  return (
    <BrowserRouter>
      <ClerkProviderWithRoutes />
    </BrowserRouter>
  );
}