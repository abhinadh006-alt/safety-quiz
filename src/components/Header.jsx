import React from "react";
import safetyCrewLogo from "../assets/logos/safety-crew-india.png";
import visaWayLogo from "../assets/logos/visa-way-global.png";

export default function Header() {
    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">

                {/* MOBILE HEADER */}
                <div className="flex flex-col gap-4 md:hidden">

                    <div className="flex items-center gap-3">
                        <img
                            src={safetyCrewLogo}
                            alt="Safety Crew India"
                            className="h-12 w-auto"   // ⬅️ was h-10
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900">
                                Safety Crew India
                            </div>
                            <div className="text-xs text-gray-500">
                                Official Safety Training Program
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">

                        {/* Powered by */}
                        <span className="text-sm text-gray-400">Powered by</span>
                        <img
                            src={visaWayLogo}
                            alt="Visa Way Global"
                            className="h-8 w-auto opacity-90"
                        />

                        {/* WhatsApp Button */}
                        <a
                            href="https://whatsapp.com/channel/0029Vb6E8OM6xCSGHKPkQK40"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition"
                        >
                            🟢WhatsApp
                        </a>

                        {/* Website Button */}
                        <a
                            href="https://safetycrewindia.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition"
                        >
                            🌐Website
                        </a>

                    </div>
                </div>

                {/* DESKTOP HEADER */}
                <div className="hidden md:flex items-center justify-between py-4">

                    <div className="flex items-center gap-4">
                        <img
                            src={safetyCrewLogo}
                            alt="Safety Crew India"
                            className="h-16 w-auto"   // ⬅️ was h-14
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

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Powered by</span>
                        <img
                            src={visaWayLogo}
                            alt="Visa Way Global"
                            className="h-24 w-auto opacity-90"   // ⬅️ was h-16 (≈150%)
                        />
                    </div>

                </div>
            </div>
        </header>
    );
}
