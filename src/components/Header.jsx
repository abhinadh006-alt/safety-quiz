import React from "react";
import safetyCrewLogo from "../assets/logos/safety-crew-india.png";
import visaWayLogo from "../assets/logos/visa-way-global.png";

export default function Header() {
    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-3">

                {/* MOBILE HEADER */}
                <div className="flex flex-col gap-3 md:hidden">

                    <div className="flex items-center gap-3">
                        <img
                            src={safetyCrewLogo}
                            alt="Safety Crew India"
                            className="h-10 w-auto"
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

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Powered by</span>
                        <img
                            src={visaWayLogo}
                            alt="Visa Way Global"
                            className="h-8 w-auto opacity-90"
                        />
                    </div>
                </div>

                {/* DESKTOP HEADER */}
                <div className="hidden md:flex items-center justify-between py-2">

                    <div className="flex items-center gap-4">
                        <img
                            src={safetyCrewLogo}
                            alt="Safety Crew India"
                            className="h-14 w-auto"
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

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Powered by</span>
                        <img
                            src={visaWayLogo}
                            alt="Visa Way Global"
                            className="h-16 w-auto opacity-90"
                        />
                    </div>

                </div>
            </div>
        </header>
    );
}
