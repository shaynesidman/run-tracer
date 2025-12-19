import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Feature, LineString } from "geojson";
import { type Activity } from "@/types/activity";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MiniMap({ activity }: { activity: Activity }) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [-71.1062, 42.4184], // Default center, will be changed
            zoom: 13,
            interactive: false, // No interactivity with minimap
            attributionControl: false,
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!map.current || !activity.points || activity.points.length === 0) return;

        const mapInstance = map.current;

        const addRouteToMap = () => {
            if (!mapInstance || !activity.points) return;

            // Remove existing route if present
            if (mapInstance.getSource("route")) {
                mapInstance.removeLayer("route");
                mapInstance.removeSource("route");
            }

            // Convert string points to numbers
            const coordinates = activity.points.map(([lng, lat]) => [
                parseFloat(lng),
                parseFloat(lat)
            ]);

            // Create GeoJSON for the route
            const geojson: Feature<LineString> = {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: coordinates,
                },
            };

            // Add source and layer (matching your main map style)
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
                    "line-width": 3,
                },
            });

            // Fit map to route bounds
            const bounds = getBounds(coordinates);
            if (bounds) {
                mapInstance.fitBounds(bounds, {
                    padding: 20,
                    duration: 0 // No animation for mini map
                });
            }
        }

        // Add route
        if (!mapInstance.isStyleLoaded()) {
            mapInstance.on('load', () => addRouteToMap());
        } else {
            addRouteToMap();
        }
    }, [activity.points]);

    const getBounds = (coordinates: number[][]) => {
        if (!coordinates || coordinates.length === 0) return null;
        
        let minLng = coordinates[0][0];
        let maxLng = coordinates[0][0];
        let minLat = coordinates[0][1];
        let maxLat = coordinates[0][1];

        coordinates.forEach(([lng, lat]) => {
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
        });

        return [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]];
    };

    if (!activity.points || activity.points.length === 0) {
        return (
            <div className="w-full h-full bg-[var(--bg-secondary)] rounded flex items-center justify-center text-sm">
                No route data
            </div>
        );
    }

    return (
        <div className="w-full aspect-square rounded-lg overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    );
}