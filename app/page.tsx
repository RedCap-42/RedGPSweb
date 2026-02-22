"use client";

import { useState, useRef, useEffect } from "react";
import { Navigation, Radar, StopCircle, RadioReceiver, Activity, Globe } from "lucide-react";

export default function Home() {
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    const watchId = useRef<number | null>(null);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setIsTracking(true);
        setError(null);

        watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setLocation({ lat: latitude, lng: longitude, accuracy });
                setLastUpdate(new Date().toLocaleTimeString());

                // Send to our API
                try {
                    await fetch('/api/location', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            lat: latitude,
                            lng: longitude,
                            accuracy: accuracy,
                            timestamp: position.timestamp
                        })
                    });
                } catch (err) {
                    console.error("Failed to send location to server", err);
                }
            },
            (err) => {
                setError(promptError(err.code));
                setIsTracking(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const stopTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setIsTracking(false);
    };

    const promptError = (code: number) => {
        switch (code) {
            case 1: return "Permission denied. Please allow location access in your settings.";
            case 2: return "Position unavailable. Make sure your GPS is turned on.";
            case 3: return "Timeout. Could not get your location in time.";
            default: return "An unknown error occurred.";
        }
    };

    useEffect(() => {
        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, []);

    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full z-10 space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl glass-panel mb-4">
                        <Globe className="w-8 h-8 text-neutral-300" />
                    </div>
                    <h1 className="text-3xl font-light tracking-tight text-white">RedGPS<span className="font-semibold text-blue-500">Tracker</span></h1>
                    <p className="text-sm text-neutral-400">Real-time coordinates telemetry</p>
                </div>

                {/* Main Status Card */}
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden transition-all duration-500">
                    <div className="flex flex-col items-center justify-center space-y-6">

                        {/* Radar / Status Animation */}
                        <div className="relative flex items-center justify-center w-32 h-32">
                            <div className={`absolute w-full h-full rounded-full border border-neutral-800 transition-all duration-700 ${isTracking ? 'border-red-500/30' : 'border-blue-500/30'}`} />
                            {isTracking && (
                                <>
                                    <div className="absolute w-full h-full rounded-full bg-red-500/10 pulse-dot" />
                                    <div className="absolute w-2 h-2 rounded-full bg-red-500" />
                                </>
                            )}
                            {!isTracking && (
                                <div className="absolute w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                            )}
                            {isTracking ? <Radar className="w-10 h-10 text-red-500 animate-spin-slow" style={{ animationDuration: '3s' }} /> : <RadioReceiver className="w-10 h-10 text-blue-500 opacity-80" />}
                        </div>

                        <div className="text-center">
                            <h2 className="text-xl font-medium tracking-wide">
                                {isTracking ? "Transmitting..." : "Standby Mode"}
                            </h2>
                            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">
                                {isTracking ? "Live Connection" : "Awaiting activation"}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                                <p className="text-xs text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Data Grid */}
                        <div className={`w-full grid grid-cols-2 gap-4 transition-opacity duration-500 ${location ? 'opacity-100' : 'opacity-30'}`}>
                            <div className="bg-neutral-900/50 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">Latitude</span>
                                <span className="font-mono text-sm tracking-tight text-neutral-200">{location ? location.lat.toFixed(6) : "0.000000"}</span>
                            </div>
                            <div className="bg-neutral-900/50 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">Longitude</span>
                                <span className="font-mono text-sm tracking-tight text-neutral-200">{location ? location.lng.toFixed(6) : "0.000000"}</span>
                            </div>
                            <div className="bg-neutral-900/50 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">Accuracy</span>
                                <span className="font-mono text-sm tracking-tight text-neutral-200">{location ? `± ${Math.round(location.accuracy)}m` : "--"}</span>
                            </div>
                            <div className="bg-neutral-900/50 rounded-2xl p-4 flex flex-col justify-between">
                                <span className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">Last Sync</span>
                                <span className="font-mono text-sm tracking-tight text-neutral-200">{lastUpdate || "--:--:--"}</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={isTracking ? stopTracking : startTracking}
                    className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-medium transition-all duration-300 ${isTracking ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 glow-btn-active' : 'bg-blue-600 text-white hover:bg-blue-500 glow-btn-inactive'}`}
                >
                    {isTracking ? <StopCircle className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
                    <span>{isTracking ? "Stop Transmission" : "Start Tracking"}</span>
                </button>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-600 uppercase tracking-widest mt-8">
                    <Activity className="w-3 h-3" />
                    <span>Vercel Edge Network</span>
                </div>

            </div>
        </main>
    );
}
