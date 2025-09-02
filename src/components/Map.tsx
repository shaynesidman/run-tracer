"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Feature, LineString } from "geojson";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import destination from "@turf/destination";
import { point as turfPoint } from "@turf/helpers";
import { useUser } from "@clerk/nextjs";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_REACT_APP_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    const [points, setPoints] = useState<[number, number][]>([]);
    const [totalDistance, setTotalDistance] = useState(0);
    const [targetDistance, setTargetDistance] = useState(1); // miles
    const [activityType, setActivityType] = useState("Run");
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [mode, setMode] = useState<"click" | "route" | "draw">("click");

    const isDrawingRef = useRef(false);

    const { user } = useUser();

    // useEffects

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (map.current || !mapContainer.current) return;
    
            const coords: number[] = await getCoordinates();
    
            const mapInstance = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/dark-v11",
                center: coords as [number, number],
                zoom: 13,
            });
    
            map.current = mapInstance;
    
            setupMapListeners(mapInstance);
        };
    
        fetchCoordinates();
    }, [mode]);

    useEffect(() => {
        if (!map.current) return;
        setupMapListeners(map.current);
    }, [mode]);

    const setupMapListeners = (mapInstance: mapboxgl.Map) => {
        if (!mapInstance) return;
    
        const handleClick = async (e: mapboxgl.MapMouseEvent) => {
            if (mode === "draw") return;
    
            const start: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            if (mode === "route") {
                try {
                    const route = await fetchLoopRoute(start, targetDistance);
                    if (route) {
                        const coords = route.geometry.coordinates as [number, number][];
                        setPoints(coords);
                    }
                } catch (err) {
                    console.error("Error fetching route:", err);
                }
            } else {
                setPoints((prev) => [...prev, start]);
            }
        };
    
        const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
            if (mode !== "draw") return;
            console.log("saljdflksdf")
            e.preventDefault();
            isDrawingRef.current = true;
            setPoints([[e.lngLat.lng, e.lngLat.lat]]);
        };
    
        let lastMove = 0;
        const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
            if (mode !== "draw" || !isDrawingRef.current) return;
    
            const now = Date.now();
            if (now - lastMove < 50) return;
            lastMove = now;
    
            setPoints((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
        };
    
        const handleMouseUp = (e: mapboxgl.MapMouseEvent) => {
            if (mode !== "draw") return;
            e.preventDefault();
            isDrawingRef.current = false;
        };
    
        const handleMouseLeave = () => {
            if (mode !== "draw") return;
            isDrawingRef.current = false;
        };
    
        // Remove existing listeners to avoid duplication
        mapInstance.off("click", handleClick);
        mapInstance.off("mousedown", handleMouseDown);
        mapInstance.off("mousemove", handleMouseMove);
        mapInstance.off("mouseup", handleMouseUp);
        mapInstance.off("mouseleave", handleMouseLeave);

        // Set up drag interactions
        if (mode === "draw") {
            mapInstance.dragPan.disable();
            mapInstance.dragRotate.disable();
        } else {
            mapInstance.dragPan.enable();
            mapInstance.dragRotate.enable();
        }

        // Attach listeners
        mapInstance.on("click", handleClick);
        mapInstance.on("mousedown", handleMouseDown);
        mapInstance.on("mousemove", handleMouseMove);
        mapInstance.on("mouseup", handleMouseUp);
        mapInstance.on("mouseleave", handleMouseLeave);
    };

    useEffect(() => {
        if (!map.current) return;

        const mapInstance = map.current;

        // Remove existing route if present
        if (mapInstance.getSource("route")) {
            mapInstance.removeLayer("route");
            mapInstance.removeSource("route");
        }

        if (points.length < 2) return;

        // Calculate total distance in miles
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const from = point(points[i]);
            const to = point(points[i + 1]);
            total += distance(from, to, { units: "miles" });
        }
        setTotalDistance(total);

        const geojson: Feature<LineString> = {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: points,
            },
        };

        mapInstance.addSource("route", {
            type: "geojson",
            data: geojson,
        });

        mapInstance.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": "#1E90FF",
                "line-width": 4,
            },
        });
    }, [points]);

    // Function defs

    const getCoordinates = (): Promise<number[]> => {
        return new Promise<number[]>((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => { 
                        resolve([position.coords.longitude, position.coords.latitude]);
                    },
                    () => { 
                        resolve([-71.1062, 42.4184]); // Default on error/denial
                    },
                    {
                        enableHighAccuracy: true,
                    }
                );
            } else {
                resolve([-71.1062, 42.4184]); // Default when not supported
            }
        });
    };

    const fetchLoopRoute = async (start: [number, number], miles: number) => {
        const startPoint = turfPoint(start);
        const bearing = Math.random() * 360;
        const midPoint = destination(startPoint, miles / 2, bearing, {
            units: "miles",
        }).geometry.coordinates;

        const coords = [start.join(","), midPoint.join(","), start.join(",")].join(";");
        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes || data.routes.length === 0) {
            console.log("No routes found");
            return null;
        }

        return data.routes[0];
    }

    const clearPoints = () => {
        setPoints([]);
        setTotalDistance(0);
    };

    const submitRoute = async () => {
        if (points.length < 2) return; // Ensure there are actually points in route
        if (!user) return; // Ensure user is logged in before sending to db
        const chosenActivityType = activityType === "" ? "run" : activityType; // Default to run

        setSubmitting(true);

        try {
            await fetch("/api/store", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    points,
                    totalDistance,
                    start: points[0],
                    activityType: chosenActivityType,
                }),
            });

            clearPoints(); // Remove saved route
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.log(error);
        }

        setSubmitting(false);
    }

    return (
        <div className="w-full h-full relative">
            <div ref={mapContainer} className="w-full h-full" />
            {submitting && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
                    <svg 
                        className="animate-spin h-8 w-8 text-white/70" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                    >
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        />
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            )}

            {showSuccess && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white font-semibold px-4 py-2 rounded shadow-lg">
                    Route submitted!
                </div>
            )}
            <div className="absolute bottom-9 left-2 flex flex-col gap-1 text-sm font-semibold space-y-2 px-6 py-4 rounded-lg bg-white/2.5 border border-white/50 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased">
                {/* Mode Selection */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setMode("click")}
                        className={`px-2 py-1 rounded-lg text-xs hover:cursor-pointer ${
                            mode === "click" ? "bg-blue-600 text-white" : "text-white bg-white/2.5 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
                        }`}
                    >
                        Click Mode
                    </button>
                    <button
                        onClick={() => setMode("route")}
                        className={`px-2 py-1 rounded-lg text-xs hover:cursor-pointer ${
                            mode === "route" ? "bg-blue-600 text-white" : "text-white bg-white/2.5 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
                        }`}
                    >
                        Route Mode
                    </button>
                    <button
                        onClick={() => setMode("draw")}
                        className={`px-2 py-1 rounded-lg text-xs hover:cursor-pointer ${
                            mode === "draw" ? "bg-blue-600 text-white" : "text-white bg-white/2.5 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
                        }`}
                    >
                        Draw Mode
                    </button>
                </div>

                {/* Route mode extra controls */}
                {mode === "route" && (
                    <div className="text-white">
                        <label className="mr-2">Target Distance:</label>
                        <input
                            type="number"
                            value={targetDistance}
                            onChange={(e) => setTargetDistance(Number(e.target.value))}
                            className="w-20 border rounded px-1 py-0.5"
                        />
                        <span className="ml-1">mi</span>
                    </div>
                )}

                <div className="text-white">Total Distance: {totalDistance.toFixed(2)} mi</div>
                <div className="text-white flex gap-4 items-center">
                    <span>Activity Type:</span> 
                    <input 
                        className="w-37 px-2 border rounded text-white"
                        placeholder="Run"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setActivityType(e.target.value);
                        }}
                    />
                </div>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={clearPoints}
                        className="hover:cursor-pointer text-white rounded-lg px-2 py-1 bg-white/2.5 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
                    >
                        Clear Route
                    </button>
                    <button
                        className="hover:cursor-pointer text-white rounded-lg px-2 py-1 bg-white/2.5 backdrop-blur-sm shadow-[inset_0_1px_0px_rgba(255,255,255,0.75),0_0_9px_rgba(0,0,0,0.2),0_3px_8px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/60 before:via-transparent before:to-transparent before:opacity-70 before:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-tl after:from-white/30 after:via-transparent after:to-transparent after:opacity-50 after:pointer-events-none transition antialiased"
                        onClick={submitRoute}
                    >
                        Submit Route
                    </button>
                </div>
            </div>
        </div>
    );
}