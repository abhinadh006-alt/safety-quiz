import React from "react";

export default function Toast({ children }) {
    return (
        <div className="fixed right-6 bottom-6 bg-black/90 text-white px-4 py-2 rounded shadow">
            {children}
        </div>
    );
}
