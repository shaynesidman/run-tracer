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
import LoadingSpinner from "./ui/LoadingSpinner";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

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
    const modeRef = useRef<"click" | "route" | "draw">("click");

    const isDrawingRef = useRef(false);

    const { user } = useUser();

    // Effect hooks

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
    }, []);

    useEffect(() => {
        if (!map.current) return;

        const mapInstance = map.current;
        modeRef.current = mode;
        
        if (mode === "draw") {
            mapInstance.touchZoomRotate.disable();
            mapInstance.doubleClickZoom.disable();
            mapInstance.dragPan.disable();
            mapInstance.dragRotate.disable();
        } else {
            mapInstance.touchZoomRotate.enable();
            mapInstance.doubleClickZoom.enable();
            mapInstance.dragPan.enable();
            mapInstance.dragRotate.enable();
        }
    }, [mode]);

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

    const setupMapListeners = (mapInstance: mapboxgl.Map) => {
        if (!mapInstance) return;
        
        // Click handler for click and route mode
        const handleClick = async (e: mapboxgl.MapMouseEvent) => {
            if (modeRef.current === "draw") return;
    
            const start: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            if (modeRef.current === "route") {
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
        
        // Draw handler for draw mode
        const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
            if (modeRef.current !== "draw") return;
            e.preventDefault();
            isDrawingRef.current = true;
            setPoints([[e.lngLat.lng, e.lngLat.lat]]);
        };
    
        let lastMove = 0;
        const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
            if (modeRef.current !== "draw" || !isDrawingRef.current) return;
    
            const now = Date.now();
            if (now - lastMove < 50) return;
            lastMove = now;
    
            setPoints((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
        };
        
        // Draw release handler
        const handleMouseUp = (e: mapboxgl.MapMouseEvent) => {
            if (modeRef.current !== "draw") return;
            e.preventDefault();
            isDrawingRef.current = false;
        };
        
        // Mouse leave screen
        const handleMouseLeave = () => {
            if (modeRef.current !== "draw") return;
            isDrawingRef.current = false;
        };

        // Mobile drawing handler for starting draw mode
        const handleTouchStart = (e: mapboxgl.MapTouchEvent) => {
            if (modeRef.current !== "draw") return;
            
            if (e.originalEvent) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
            }
            
            isDrawingRef.current = true;

            const lngLat = e.lngLat;
            setPoints([[lngLat.lng, lngLat.lat]]);
        };

        // Mobile drawing handler for draw mode
        const handleTouchMove = (e: mapboxgl.MapTouchEvent) => {
            if (modeRef.current !== "draw" || !isDrawingRef.current) return;

            if (e.originalEvent) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
            }

            const now = Date.now();
            if (now - lastMove < 30) return;
            lastMove = now;

            const lngLat = e.lngLat;
            setPoints((prev) => [...prev, [lngLat.lng, lngLat.lat]]);
        };

        // Ending draw mode on mobile
        const handleTouchEnd = (e: mapboxgl.MapTouchEvent) => {
            if (modeRef.current !== "draw") return;
            
            e.preventDefault();
            if (e.originalEvent) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
            }
            
            isDrawingRef.current = false;
        };

        // Ending drwa mode on mobile
        const handleTouchCancel = (e: mapboxgl.MapTouchEvent) => {
            if (modeRef.current !== "draw") return;
            isDrawingRef.current = false;
        };

        // Remove existing listeners to avoid duplication
        mapInstance.off("click", handleClick);
        mapInstance.off("mousedown", handleMouseDown);
        mapInstance.off("mousemove", handleMouseMove);
        mapInstance.off("mouseup", handleMouseUp);
        mapInstance.off("mouseleave", handleMouseLeave);
        mapInstance.off("touchstart", handleTouchStart);
        mapInstance.off("touchmove", handleTouchMove);
        mapInstance.off("touchend", handleTouchEnd);

        // Attach listeners
        mapInstance.on("click", handleClick);
        mapInstance.on("mousedown", handleMouseDown);
        mapInstance.on("mousemove", handleMouseMove);
        mapInstance.on("mouseup", handleMouseUp);
        mapInstance.on("mouseleave", handleMouseLeave);
        mapInstance.on("touchstart", handleTouchStart);
        mapInstance.on("touchmove", handleTouchMove);
        mapInstance.on("touchend", handleTouchEnd);
        mapInstance.on("touchcancel", handleTouchCancel);
    };

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
        <div className="w-full relative" style={{ height: "100dvh" }}>
            <div 
                ref={mapContainer} 
                className="w-full h-full" 
                style={{ 
                    touchAction: mode === "draw" ? "none" : "auto"
                }}
            />
            {submitting && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}

            {showSuccess && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 border border-[var(--bg-secondary)]">
                    Route submitted!
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-9 left-2 flex flex-col gap-1 text-sm space-y-2 px-6 py-4 rounded-md bg-[var(--bg-secondary)]">
                {/* Mode Selection */}
                <div className="flex gap-1 text-xs">
                    <button
                        onClick={() => setMode("click")}
                        className={`px-2 py-1 rounded-md hover:cursor-pointer ${
                            mode === "click" ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-tertiary)]" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        }`}
                    >
                        Click Mode
                    </button>
                    <button
                        onClick={() => setMode("route")}
                        className={`px-2 py-1 rounded-md hover:cursor-pointer ${
                            mode === "route" ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-tertiary)]" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        }`}
                    >
                        Route Mode
                    </button>
                    <button
                        onClick={() => setMode("draw")}
                        className={`px-2 py-1 rounded-md hover:cursor-pointer ${
                            mode === "draw" ? "bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--bg-tertiary)]" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        }`}
                    >
                        Draw Mode
                    </button>
                </div>

                {/* Route mode extra controls */}
                {mode === "route" && (
                    <div>
                        <label className="mr-2">Target Distance:</label>
                        <input
                            type="number"
                            value={targetDistance}
                            onChange={(e) => setTargetDistance(Number(e.target.value))}
                            className="w-16 px-1 border border-[var(--bg-secondary)] focus:outline-none focus:ring-0 border rounded border-[var(--bg-tertiary)]"
                        />
                        <span className="ml-1">mi</span>
                    </div>
                )}

                <div>Total Distance: {totalDistance.toFixed(2)} mi</div>
                <div className="flex gap-2 items-center">
                    <span>Activity Type:</span>
                    <input
                        className="w-32 px-2 rounded focus:outline-none focus:ring-0 border-1 border-[var(--bg-tertiary)]"
                        placeholder="Run"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setActivityType(e.target.value);
                        }}
                    />
                </div>
                <div className="flex justify-center gap-2 text-xs">
                    <button
                        onClick={clearPoints}
                        className="hover:cursor-pointer rounded-md px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    >
                        Clear Route
                    </button>
                    <button
                        className="hover:cursor-pointer rounded-md px-2 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                        onClick={submitRoute}
                    >
                        Submit Route
                    </button>
                </div>
            </div>
        </div>
    );
}