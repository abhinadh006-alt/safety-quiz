// src/pages/Result.jsx
import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function Result() {
    const location = useLocation();
    const { score = 0, total = 0 } = location.state || {};
    return (
        <div className="py-12">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow">
                <h1 className="text-2xl font-bold mb-2">Your Result</h1>
                <p className="text-gray-600 mb-6">You scored <strong>{score}</strong> out of <strong>{total}</strong></p>
                <Link to="/" className="px-4 py-2 bg-brand-500 text-white rounded-md">Back Home</Link>
            </div>
        </div>
    );
}
