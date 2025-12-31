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
import { toast } from "sonner";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    const [points, setPoints] = useState<[number, number][]>([]);
    const [totalDistance, setTotalDistance] = useState(0);
    const [targetDistance, setTargetDistance] = useState(1); // in miles
    const [activityType, setActivityType] = useState("Run");
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [mode, setMode] = useState<"click" | "route" | "draw">("click");
    const modeRef = useRef<"click" | "route" | "draw">("click");
    const targetDistanceRef = useRef(1); // in miles

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
            mapInstance.doubleClickZoom.disable();
            mapInstance.dragPan.disable();
            mapInstance.dragRotate.disable();
        } else {
            mapInstance.doubleClickZoom.enable();
            mapInstance.dragPan.enable();
            mapInstance.dragRotate.enable();
        }
    }, [mode]);

    useEffect(() => {
        targetDistanceRef.current = targetDistance;
    }, [targetDistance]);

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
                    const route = await fetchLoopRoute(start, targetDistanceRef.current);
                    if (route) {
                        const coords = route.geometry.coordinates as [number, number][];
                        setPoints(coords);
                    }
                } catch (e) {
                    toast.error("Error fetching route: " + e);
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
            setPoints((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
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

            // Only draw with single touch - multi-touch is for pinch/zoom
            if (e.originalEvent && e.originalEvent.touches.length > 1) {
                // If we were drawing, remove the point that was just added by the first finger
                if (isDrawingRef.current) {
                    setPoints((prev) => prev.slice(0, -1));
                }
                isDrawingRef.current = false;
                return;
            }

            if (e.originalEvent) {
                e.originalEvent.preventDefault();
                e.originalEvent.stopPropagation();
            }

            isDrawingRef.current = true;

            const lngLat = e.lngLat;
            setPoints((prev) => [...prev, [lngLat.lng, lngLat.lat]]);
        };

        // Mobile drawing handler for draw mode
        const handleTouchMove = (e: mapboxgl.MapTouchEvent) => {
            if (modeRef.current !== "draw" || !isDrawingRef.current) return;

            // Stop drawing if multi-touch detected (user is pinching to zoom)
            if (e.originalEvent && e.originalEvent.touches.length > 1) {
                isDrawingRef.current = false;

                // Remove the last point that was added just before the second finger touched
                setPoints((prev) => prev.slice(0, -1));
                return;
            }

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
        const startTime = Date.now();
        const TIMEOUT_MS = 10000; // Timeout after 10 seconds
        const TOLERANCE = 0.1; // Route can be +/-10% of desired mileage
        const MIN_DISTANCE = miles * (1 - TOLERANCE);
        const MAX_DISTANCE = miles * (1 + TOLERANCE);

        // Generate waypoints in a circle pattern around start point
        const generateWaypoints = (radiusMiles: number, numPoints: number = 6): [number, number][] => {
            const waypoints: [number, number][] = [];
            const startPoint = turfPoint(start);

            // Add random rotation up to 60 deg so routes vary each time
            const rotationOffset = Math.random() * 60;
            for (let i = 0; i < numPoints; i++) {
                const bearing = (360 / numPoints) * i + rotationOffset;
                const point = destination(startPoint, radiusMiles, bearing, {
                    units: "miles",
                });
                waypoints.push(point.geometry.coordinates as [number, number]);
            }

            return waypoints;
        };

        // Request a route from mapbox from start through all waypoints and back to start
        const requestRoute = async (waypoints: [number, number][]) => {
            const coords = [start, ...waypoints, start]
                .map(coord => coord.join(","))
                .join(";");

            const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

            try {
                const res = await fetch(url);
                const data = await res.json();

                if (!data.routes || data.routes.length === 0) {
                    return null;
                }

                return data.routes[0];
            } catch (e) {
                toast.error("Error fetching route: " + e);
                return null;
            }
        };

        // Try to find a loop route by iteratively adjusting the radius
        // Start with theoretical radius for a circular loop: r = circumference / (2π)
        let radiusMiles = miles / (2 * Math.PI);
        let attempts = 0;
        const MAX_ATTEMPTS = 20;

        console.log(`Searching for ${miles}mi loop route...`);

        while (Date.now() - startTime < TIMEOUT_MS && attempts < MAX_ATTEMPTS) {
            attempts++;

            // Generate waypoints at current radius
            const waypoints = generateWaypoints(radiusMiles);

            // Request route through these waypoints
            const route = await requestRoute(waypoints);

            if (!route) {
                console.log(`Attempt ${attempts}: No route found, increasing radius`);
                radiusMiles *= 1.2; // Increase radius and try again
                continue;
            }

            // Mapbox returns distance in meters, convert to miles
            const actualDistanceMiles = route.distance / 1609.34;

            console.log(
                `Attempt ${attempts}: Target=${miles.toFixed(2)}mi, ` +
                `Actual=${actualDistanceMiles.toFixed(2)}mi, ` +
                `Radius=${radiusMiles.toFixed(2)}mi`
            );

            // If within desired distance, return the route
            if (actualDistanceMiles >= MIN_DISTANCE && actualDistanceMiles <= MAX_DISTANCE) {
                console.log(`✓ Found acceptable loop route in ${attempts} attempts!`);
                return route;
            }

            // Adjust radius based on how far off we are
            if (actualDistanceMiles < MIN_DISTANCE) {
                // Route too short, increase radius
                radiusMiles *= 1.3;
            } else {
                // Route too long, decrease radius
                radiusMiles *= 0.7;
            }
        }

        // Fallback: Create an out-and-back route (go down one path, and return on same path)
        console.log(
            `Could not find loop route after ${attempts} attempts (${(Date.now() - startTime) / 1000}s). ` +
            `Falling back to out-and-back route.`
        );

        const fallbackBearing = Math.random() * 360;
        const outPoint = destination(turfPoint(start), miles / 2, fallbackBearing, {
            units: "miles",
        });

        const fallbackCoords = [
            start.join(","),
            outPoint.geometry.coordinates.join(","),
            start.join(",")
        ].join(";");

        const fallbackUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${fallbackCoords}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

        try {
            const res = await fetch(fallbackUrl);
            const data = await res.json();

            if (!data.routes || data.routes.length === 0) {
                toast.error("No fallback route found");
                return null;
            }

            console.log("Fallback out-and-back route generated");
            return data.routes[0];
        } catch (e) {
            toast.error("Error fetching route: " + e);
            return null;
        }
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
            const res = await fetch("/api/store", { 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ 
                    points, 
                    totalDistance, 
                    start: points[0], 
                    activityType: chosenActivityType, 
                }), 
            }); 

            if (!res.ok) {
                toast.error("Error storing route");
            } else {
                clearPoints(); // Remove saved route
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }

        } catch (e) {
            toast.error("Error: " + e);
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
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 border border-[var(--bg-secondary)] bg-[var(--bg-primary)] text-center p-2 rounded-lg">
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
                            className="w-16 px-2 py-1 rounded border border-[var(--bg-tertiary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-0"
                        />
                        <span className="ml-1">mi</span>
                    </div>
                )}

                <div>Total Distance: {totalDistance.toFixed(2)} mi</div>
                <div className="flex gap-2 items-center">
                    <span>Activity Type:</span>
                    <input
                        className="w-32 px-2 rounded focus:outline-none focus:ring-0 bg-[var(--bg-primary)] border-1 border-[var(--bg-tertiary)]"
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