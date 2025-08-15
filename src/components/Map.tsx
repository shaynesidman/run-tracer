"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Feature, LineString } from "geojson";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import destination from "@turf/destination";
import { point as turfPoint } from "@turf/helpers";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_REACT_APP_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    const [points, setPoints] = useState<[number, number][]>([]);
    const [totalDistance, setTotalDistance] = useState(0);
    const [targetDistance, setTargetDistance] = useState(1); // miles

    const [mode, setMode] = useState<"click" | "route" | "draw">("click");

    const isDrawingRef = useRef(false);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;
    
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [-71.1062, 42.4184],
            zoom: 13,
        });
    }, []);

    useEffect(() => {
        if (!map.current) return;
        const mapInstance = map.current;

        // Enable/disable map interactions when switching modes
        if (mode === "draw") {
            mapInstance.dragPan.disable();
            mapInstance.dragRotate.disable();
        } else {
            mapInstance.dragPan.enable();
            mapInstance.dragRotate.enable();
        }

        // Click or route mode; draw/generate lines
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

        // Draw mode (hold to draw)
        const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
            if (mode !== "draw") return;
            e.preventDefault();
            isDrawingRef.current = true;
            setPoints([[e.lngLat.lng, e.lngLat.lat]]);
        };

        // Simple throttle (every 50ms)
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

        // Also handle mouse leave to stop drawing if mouse leaves the map
        const handleMouseLeave = () => {
            if (mode !== "draw") return;
            isDrawingRef.current = false;
        };

        mapInstance.on("click", handleClick);
        mapInstance.on("mousedown", handleMouseDown);
        mapInstance.on("mousemove", handleMouseMove);
        mapInstance.on("mouseup", handleMouseUp);
        mapInstance.on("mouseleave", handleMouseLeave);

        return () => {
            mapInstance.off("click", handleClick);
            mapInstance.off("mousedown", handleMouseDown);
            mapInstance.off("mousemove", handleMouseMove);
            mapInstance.off("mouseup", handleMouseUp);
            mapInstance.off("mouseleave", handleMouseLeave);
        };
    }, [mode, targetDistance]);

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
                "line-color": "#fc4c02",
                "line-width": 4,
            },
        });
    }, [points]);

    async function fetchLoopRoute(start: [number, number], miles: number) {
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
            console.warn("No routes found");
            return null;
        }

        return data.routes[0];
    }

    const clearPoints = () => {
        setPoints([]);
        setTotalDistance(0);
    };

    return (
        <div className="w-full h-full relative">
            <div ref={mapContainer} className="w-full h-full" />

            <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded shadow text-sm font-semibold z-10 space-y-2">
                {/* Mode Selection */}
                <div className="space-x-1">
                    <button
                        onClick={() => setMode("click")}
                        className={`px-2 py-1 rounded text-xs ${
                            mode === "click" ? "bg-blue-600 text-white" : "bg-gray-200"
                        }`}
                    >
                        Click Mode
                    </button>
                    <button
                        onClick={() => setMode("route")}
                        className={`px-2 py-1 rounded text-xs ${
                            mode === "route" ? "bg-blue-600 text-white" : "bg-gray-200"
                        }`}
                    >
                        Route Mode
                    </button>
                    <button
                        onClick={() => setMode("draw")}
                        className={`px-2 py-1 rounded text-xs ${
                            mode === "draw" ? "bg-blue-600 text-white" : "bg-gray-200"
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
                            className="w-20 border rounded px-1 py-0.5 text-black"
                        />
                        <span className="ml-1">mi</span>
                    </div>
                )}

                <div>Total Distance: {totalDistance.toFixed(2)} mi</div>
                
                <button
                    onClick={clearPoints}
                    className="px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600"
                >
                    Clear Route
                </button>
            </div>
        </div>
    );
}