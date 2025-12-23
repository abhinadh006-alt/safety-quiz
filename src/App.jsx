// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

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

export default function App() {
  return (
    <div className="app-root min-h-screen bg-gray-50">
      <Header />

      <main className="pt-6">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/blocked" element={<Blocked />} />

          {/* Quiz flow (OPEN for now) */}
          <Route path="/quiz/select-category" element={<SelectCategory />} />
          <Route path="/quiz/select-level" element={<SelectLevel />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
          <Route path="/certificate" element={<Certificate />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
}
