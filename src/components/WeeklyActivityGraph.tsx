"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { handleAPIResponse } from "@/lib/apiClient";
import { type Activity } from "@/types/activity";
import LoadingSpinner from "./ui/LoadingSpinner";

interface WeeklyData {
    weekStart: Date;
    totalDistance: number;
}

// Helper function to determine number of weeks based on screen width
const getWeeksToShow = (width: number): number => {
    if (width < 640) return 4;  // Mobile: 4 weeks
    if (width < 1024) return 8; // Tablet: 8 weeks
    return 12;                   // Desktop: 12 weeks
};

export default function WeeklyActivityGraph() {
    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [weeksToShow, setWeeksToShow] = useState(12);
    const [allActivities, setAllActivities] = useState<Activity[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Fetch data once
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/fetch/allRuns", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const allRuns = await handleAPIResponse<{ data: Activity[] }>(res);
                setAllActivities(allRuns.data);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivities();
    }, []);

    // Process data when activities or weeks to show changes
    useEffect(() => {
        if (allActivities.length === 0) return;

        const processData = () => {
            // Process data into weekly buckets
            const weeklyMap = new Map<string, number>();
            const now = new Date();
            const startDate = new Date(now);
            startDate.setDate(now.getDate() - (weeksToShow * 7));

            // Initialize all weeks with 0's for distance
            for (let i = 0; i < weeksToShow; i++) {
                const weekStart = new Date(startDate);
                weekStart.setDate(startDate.getDate() + (i * 7));
                weekStart.setHours(0, 0, 0, 0);
                const weekKey = weekStart.toISOString().split('T')[0];
                weeklyMap.set(weekKey, 0);
            }

            // Add activity distances to their respective weeks
            allActivities.forEach((activity) => {
                const activityDate = new Date(activity.time);
                if (activityDate >= startDate) {
                    const daysSinceStart = Math.floor(
                        (activityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const weekIndex = Math.floor(daysSinceStart / 7);
                    if (weekIndex < weeksToShow) {
                        const weekStart = new Date(startDate);
                        weekStart.setDate(startDate.getDate() + (weekIndex * 7));
                        weekStart.setHours(0, 0, 0, 0);
                        const weekKey = weekStart.toISOString().split('T')[0];

                        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + activity.distance);
                    }
                }
            });

            // Convert to array and sort by date
            const processedData: WeeklyData[] = Array.from(weeklyMap.entries())
                .map(([dateStr, distance]) => ({
                    weekStart: new Date(dateStr),
                    totalDistance: distance,
                }))
                .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

            setWeeklyData(processedData);
        };

        processData();
    }, [allActivities, weeksToShow]);

    // Update weeks to show based on window size
    useEffect(() => {
        const updateWeeksToShow = () => {
            const width = window.innerWidth;
            setWeeksToShow(getWeeksToShow(width));
        };

        // Set initial value
        updateWeeksToShow();

        // Update on resize
        window.addEventListener('resize', updateWeeksToShow);
        return () => window.removeEventListener('resize', updateWeeksToShow);
    }, []);

    // Draw D3 graph
    useEffect(() => {
        if (!svgRef.current || !containerRef.current || weeklyData.length === 0) return;

        const drawGraph = () => {
            const container = containerRef.current;
            const svg = d3.select(svgRef.current);
            const tooltip = d3.select(tooltipRef.current);

            if (!container) return;

            // Clear previous content
            svg.selectAll("*").remove();

            // Dimensions
            const containerWidth = container.offsetWidth;
            const margin = { top: 20, right: 30, bottom: 40, left: 50 };
            const width = containerWidth - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            // Create main group
            const g = svg
                .attr("width", containerWidth)
                .attr("height", 300)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Scales
            const xScale = d3
                .scaleTime()
                .domain(d3.extent(weeklyData, (d) => d.weekStart) as [Date, Date])
                .range([0, width]);

            const yScale = d3
                .scaleLinear()
                .domain([0, d3.max(weeklyData, (d) => d.totalDistance) || 10])
                .nice()
                .range([height, 0]);

            // Get background line color
            const bgSecondary = getComputedStyle(document.documentElement)
                .getPropertyValue('--bg-secondary')
                .trim();

            // Horizontal background lines
            g.append("g")
                .attr("class", "grid-lines")
                .selectAll("line")
                .data(yScale.ticks(5))
                .enter()
                .append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", (d) => yScale(d))
                .attr("y2", (d) => yScale(d))
                .style("stroke", bgSecondary)
                .style("stroke-width", 1);

            // Determine number of x-axis ticks based on container width
            const getXAxisTicks = (width: number): number => {
                if (width < 640) return 3;  // Mobile: 3 ticks
                if (width < 1024) return 4; // Tablet: 4 ticks
                return 6;                    // Desktop: 6 ticks
            };

            // Axes
            const xAxis = d3
                .axisBottom(xScale)
                .ticks(getXAxisTicks(containerWidth))
                .tickSize(0)
                .tickFormat((d) => d3.timeFormat("%b %d")(d as Date));

            const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(0).tickFormat((d) => d === 0 ? "" : d.toString());

            const fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

            g.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(xAxis)
                .call(g => g.select(".domain").remove())
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-family", fontFamily)
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

            g.append("g")
                .call(yAxis)
                .call(g => g.select(".domain").remove())
                .selectAll("text")
                .style("font-family", fontFamily);

            // Line generator
            const line = d3
                .line<WeeklyData>()
                .x((d) => xScale(d.weekStart))
                .y((d) => yScale(d.totalDistance))
                .curve(d3.curveMonotoneX);

            // Draw line with animation
            const path = g
                .append("path")
                .datum(weeklyData)
                .attr("fill", "none")
                .attr("stroke", "#1E90FF")
                .attr("stroke-width", 2.5)
                .attr("d", line);

            // Animate line drawing
            const pathLength = path.node()?.getTotalLength() || 0;
            path
                .attr("stroke-dasharray", `${pathLength} ${pathLength}`)
                .attr("stroke-dashoffset", pathLength)
                .transition()
                .duration(1500)
                .ease(d3.easeQuadInOut)
                .attr("stroke-dashoffset", 0);

            // Data points with tooltips
            g.selectAll(".dot")
                .data(weeklyData)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", (d) => xScale(d.weekStart))
                .attr("cy", (d) => yScale(d.totalDistance))
                .attr("r", 0)
                .attr("fill", "#1E90FF")
                .style("cursor", "pointer")
                .on("mouseover", function (event, d) {
                    d3.select(this).transition().duration(200).attr("r", 6);

                    tooltip
                        .style("opacity", 1)
                        .html(
                            `<div style="font-weight: bold;">${d3.timeFormat("%b %d, %Y")(d.weekStart)}</div>
                            <div>${d.totalDistance.toFixed(2)} miles</div>`
                        )
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mouseout", function () {
                    d3.select(this).transition().duration(200).attr("r", 4);
                    tooltip.style("opacity", 0);
                })
                .transition()
                .delay((_, i) => i * 100 + 1000)
                .duration(500)
                .attr("r", 4);
        };

        drawGraph();

        // Responsive resize
        const resizeObserver = new ResizeObserver(() => {
            drawGraph();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [weeklyData]);

    if (isLoading) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (weeklyData.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center border border-[var(--bg-secondary)] rounded-lg">
                <p>No activity data available</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full relative">
            <svg ref={svgRef} className="w-full" />
            <div
                ref={tooltipRef}
                className="fixed opacity-0 bg-[var(--bg-primary)] border border-[var(--bg-secondary)] rounded px-2 py-1 pointer-events-none shadow-lg text-sm z-50 transition-opacity duration-200"
            />
        </div>
    );
}