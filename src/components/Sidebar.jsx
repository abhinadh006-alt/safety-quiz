import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white shadow-sm p-4 h-full">
            <nav className="flex flex-col gap-2">
                <Link to="/" className="p-2 rounded hover:bg-gray-50">Home</Link>
                <Link to="/quiz" className="p-2 rounded hover:bg-gray-50">Take Quiz</Link>
                <Link to="/result" className="p-2 rounded hover:bg-gray-50">Results</Link>
            </nav>
        </aside>
    );
}
