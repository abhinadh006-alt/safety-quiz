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

                    <div className="flex items-center gap-4">

                        {/* Powered By */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Powered by</span>
                            <img
                                src={visaWayLogo}
                                alt="Visa Way Global"
                                className="h-16 w-auto opacity-90"
                            />
                        </div>

                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/YOURNUMBER"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 text-white"
                            title="Join WhatsApp"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.601 2.326A7.854 7.854 0 0 0 8.04 0C3.61 0 .02 3.59.02 8.02c0 1.41.37 2.79 1.07 4.01L0 16l4.11-1.08a8.02 8.02 0 0 0 3.93 1c4.43 0 8.02-3.59 8.02-8.02a7.96 7.96 0 0 0-2.46-5.574z" />
                            </svg>
                        </a>

                        {/* Instagram */}
                        <a
                            href="https://instagram.com/YOURPAGE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-600 text-white"
                            title="Follow Instagram"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C5.8 0 5.55.01 4.67.05 3.79.09 3.19.23 2.67.42a4.92 4.92 0 0 0-1.78 1.16A4.92 4.92 0 0 0 .42 3.36c-.19.52-.33 1.12-.37 2C.01 6.24 0 6.49 0 8s.01 1.76.05 2.64c.04.88.18 1.48.37 2a4.92 4.92 0 0 0 1.16 1.78 4.92 4.92 0 0 0 1.78 1.16c.52.19 1.12.33 2 .37.88.04 1.13.05 2.64.05s1.76-.01 2.64-.05c.88-.04 1.48-.18 2-.37a4.92 4.92 0 0 0 1.78-1.16 4.92 4.92 0 0 0 1.16-1.78c.19-.52.33-1.12.37-2 .04-.88.05-1.13.05-2.64s-.01-1.76-.05-2.64c-.04-.88-.18-1.48-.37-2a4.92 4.92 0 0 0-1.16-1.78A4.92 4.92 0 0 0 13.33.42c-.52-.19-1.12-.33-2-.37C9.76.01 9.51 0 8 0z" />
                            </svg>
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
