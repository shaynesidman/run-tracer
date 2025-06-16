"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Feature, LineString } from 'geojson';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_REACT_APP_MAPBOX_TOKEN!;

export default function Map() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [points, setPoints] = useState<[number, number][]>([]);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [-71.1062, 42.4184],
            zoom: 13,
        });

        map.current.on("click", (e) => {
            const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setPoints((prev) => [...prev, lngLat]);
        });
    }, []);

    useEffect(() => {
        if (!map.current) return;

        const mapInstance = map.current;

        if (mapInstance.getSource("route")) {
            mapInstance.removeLayer("route");
            mapInstance.removeSource("route");
        }

        if (points.length < 2) return;

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

    return <div ref={mapContainer} className="w-full h-full" />;
}
