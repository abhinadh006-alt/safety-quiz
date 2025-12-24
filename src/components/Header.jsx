import React from "react";
import { Link } from "react-router-dom";

import safetyCrewLogo from "../assets/logos/safety-crew-india.png";
import visaWayLogo from "../assets/logos/visa-way-global.png";

export default function Header() {
    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* LEFT BRAND */}
                <div className="flex items-center gap-4">
                    <img
                        src={safetyCrewLogo}
                        alt="Safety Crew India"
                        className="h-14 md:h-16 w-auto object-contain"
                    />

                    <div>
                        <div className="text-lg font-semibold text-gray-900">
                            Safety Crew India
                        </div>
                        <div className="text-sm text-gray-500">
                            Official Safety Training Program
                        </div>
                    </div>
                </div>

                {/* RIGHT BRAND */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 hidden sm:block">
                        Powered by
                    </span>

                    <img
                        src={visaWayLogo}
                        alt="Visa Way Global"
                        className="h-18 md:h-20 w-auto object-contain opacity-90"
                    />

                </div>

            </div>
        </header>
    );
}
