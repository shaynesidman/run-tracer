"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Feature, LineString } from 'geojson';
import distance from "@turf/distance";
import { point } from "@turf/helpers";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_REACT_APP_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [points, setPoints] = useState<[number, number][]>([]);
    const [totalDistance, setTotalDistance] = useState(0);

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

    return (
        <div className="w-full h-full relative">
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 p-2 rounded shadow text-sm font-semibold z-10">
                Total Distance: {totalDistance.toFixed(2)} mi
            </div>
        </div>
    );
    
}
