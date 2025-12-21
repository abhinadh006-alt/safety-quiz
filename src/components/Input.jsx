import React from "react";

export default function Input({ label, className = "", ...props }) {
    return (
        <label className="block text-sm">
            {label && <div className="text-sm mb-1 text-gray-700">{label}</div>}
            <input className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-brand-200 ${className}`} {...props} />
        </label>
    );
}
