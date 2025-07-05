"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Feature, LineString } from 'geojson';
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
    const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
    const isGeneratingRouteRef = useRef(false);
    const [targetDistance, setTargetDistance] = useState(1); // in miles

    useEffect(() => {
        if (map.current || !mapContainer.current) return;
    
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [-71.1062, 42.4184],
            zoom: 13,
        });
    
        map.current.on("click", async (e) => {
            const start: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    
            if (isGeneratingRouteRef.current) {
                try {
                    const route = await fetchLoopRoute(start, targetDistance);
                    if (route) {
                        const coords = route.geometry.coordinates as [number, number][];
                        setPoints(coords);
                    }
                } catch (err) {
                    console.error("Error fetching route:", err);
                } finally {
                    setIsGeneratingRoute(false);
                }
            } else {
                setPoints((prev) => [...prev, start]);
            }
        });
    }, []);    

    useEffect(() => {
        isGeneratingRouteRef.current = isGeneratingRoute;
    }, [isGeneratingRoute]);
    

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

        map.current.on("click", async (e) => {
            const start: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        
            if (isGeneratingRoute) {
                try {
                    const route = await fetchLoopRoute(start, targetDistance);
                    if (route) {
                        const coords = route.geometry.coordinates as [number, number][];
                        setPoints(coords);
                    }
                } catch (err) {
                    console.error("Error fetching route:", err);
                } finally {
                    setIsGeneratingRoute(false);
                }
            } else {
                setPoints((prev) => [...prev, start]);
            }
        });
    }, [points]);   
    
    async function fetchLoopRoute(start: [number, number], miles: number) {
        const startPoint = turfPoint(start);
    
        // Compute a midpoint X miles away in a random direction
        const bearing = Math.random() * 360; // 0–360°
        const midPoint = destination(startPoint, miles / 2, bearing, { units: "miles" }).geometry.coordinates;
    
        const coords = [
            start.join(","),
            midPoint.join(","),
            start.join(","),
        ].join(";");

        console.log(coords)
    
        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
    
        const res = await fetch(url);
        const data = await res.json();
    
        if (!data.routes || data.routes.length === 0) {
            console.warn("No routes found");
            return null;
        }

        console.log(data.routes)
    
        return data.routes[0]; // returns GeoJSON route
    }

    return (
        <div className="w-full h-full relative">
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded shadow text-sm font-semibold z-10 space-y-2">
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
                <button
                    onClick={() => setIsGeneratingRoute(!isGeneratingRoute)}
                    className="mt-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                >
                    Generate Route on Click
                </button>
                {isGeneratingRoute && <div>Generating route</div>}
                <div>Total Distance: {totalDistance.toFixed(2)} mi</div>
            </div>
        </div>
    );
    
}
