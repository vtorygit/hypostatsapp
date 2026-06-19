import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { HomePage } from "../pages/HomePage";
import { OnboardingPage } from "../pages/OnboardingPage";
import { ToolGroupPage } from "../pages/ToolGroupPage";
import { ToolPage } from "../pages/ToolPage";
import { Layout } from "../components/layout/Layout";
import { ensureDailyTokensReset, isOnboardingCompleted } from "../lib/storage";

export default function App() {
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    ensureDailyTokensReset();
    setOnboardingDone(isOnboardingCompleted());
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={onboardingDone ? <HomePage /> : <Navigate to="/onboarding" />}
        />

        <Route
          path="/onboarding"
          element={<OnboardingPage onComplete={() => setOnboardingDone(true)} />}
        />

        <Route path="/groups/:groupId" element={<ToolGroupPage />} />
        <Route path="/tools/:toolId" element={<ToolPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}