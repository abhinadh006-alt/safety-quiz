// src/pages/Result.jsx
import React from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function Result() {
    const [params] = useSearchParams();
    const certificateId = params.get("id");

    if (!certificateId) {
        return (
            <div className="py-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow text-center">
                    <h1 className="text-xl font-bold mb-4">Result Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        No result information is available.
                    </p>
                    <Link
                        to="/"
                        className="px-4 py-2 bg-brand-500 text-white rounded-md"
                    >
                        Back Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-md shadow text-center">
                <h1 className="text-2xl font-bold mb-3">Quiz Completed 🎉</h1>

                <p className="text-gray-600 mb-6">
                    Your quiz has been successfully submitted.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to={`/certificate?id=${encodeURIComponent(certificateId)}`}
                        className="px-5 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
                    >
                        View Certificate
                    </Link>

                    <Link
                        to="/"
                        className="px-5 py-3 border rounded-md hover:bg-gray-50 transition"
                    >
                        Back Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
