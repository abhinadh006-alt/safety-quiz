import React from "react";

export default function Blocked() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow max-w-md text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                    Access Expired
                </h1>
                <p className="text-gray-600">
                    This quiz link is no longer valid.
                    <br />
                    Please open today’s link from the official WhatsApp group.
                </p>
            </div>
        </div>
    );
}
