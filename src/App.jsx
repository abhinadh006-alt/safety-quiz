// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

// layout
import Header from "./components/Header";

// pages
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Certificate from "./pages/Certificate";
import Leaderboard from "./pages/Leaderboard";
import SelectCategory from "./pages/SelectCategory";
import SelectLevel from "./pages/SelectLevel";
import Blocked from "./pages/Blocked";

/* ---------------------------------------
   ACCESS GATE (STEP 4)
--------------------------------------- */
function AccessGate({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");

    // No access token in URL → block
    if (!access) {
      navigate("/blocked");
      return;
    }

    // Validate token with backend
    fetch("/api/access/validate", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid access");
      })
      .catch(() => {
        navigate("/blocked");
      });
  }, [navigate]);

  return children;
}

/* ---------------------------------------
   APP ROUTES
--------------------------------------- */
export default function App() {
  return (
    <div className="app-root min-h-screen bg-gray-50">
      <Header />

      <main className="pt-6">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/blocked" element={<Blocked />} />

          {/* Protected quiz flow */}
          <Route
            path="/quiz/select-category"
            element={
              <AccessGate>
                <SelectCategory />
              </AccessGate>
            }
          />

          <Route
            path="/quiz/select-level"
            element={
              <AccessGate>
                <SelectLevel />
              </AccessGate>
            }
          />

          <Route
            path="/quiz"
            element={
              <AccessGate>
                <Quiz />
              </AccessGate>
            }
          />

          <Route
            path="/result"
            element={
              <AccessGate>
                <Result />
              </AccessGate>
            }
          />

          <Route
            path="/certificate"
            element={
              <AccessGate>
                <Certificate />
              </AccessGate>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <AccessGate>
                <Leaderboard />
              </AccessGate>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
