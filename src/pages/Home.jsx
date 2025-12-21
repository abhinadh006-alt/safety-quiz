import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Home() {
    const { search } = useLocation(); // contains ?access=XXXX

    return (
        <div className="py-12">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
                <h1 className="text-3xl font-extrabold mb-4">
                    Welcome to Safety Quiz
                </h1>

                <p className="text-gray-600 mb-6">
                    Take short quizzes to learn safety best practices and get a
                    completion certificate.
                </p>

                <div className="flex gap-3">
                    {/* Preserve daily access token */}
                    <Link
                        to={`/quiz/select-category${search}`}
                        className="px-4 py-2 bg-brand-500 text-white rounded-md shadow hover:shadow-lg transition"
                    >
                        Start Quiz
                    </Link>

                    <a
                        href="#"
                        className="px-4 py-2 border rounded-md hover:bg-gray-50 transition"
                    >
                        About
                    </a>
                </div>
            </div>
        </div>
    );
}
