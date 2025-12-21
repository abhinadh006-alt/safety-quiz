import React from "react";

export default function IconButton({ children, title, ...props }) {
    return (
        <button title={title} className="p-2 rounded-md hover:bg-gray-100" {...props}>
            {children}
        </button>
    );
}
