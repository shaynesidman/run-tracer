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

export default function WeeklyActivityGraph() {
    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Fetch and process data
    useEffect(() => {
        const fetchAndProcessData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch("/api/fetch/allRuns", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const allRuns = await handleAPIResponse<{ data: Activity[] }>(res);

                // Process data into weekly buckets
                const weeklyMap = new Map<string, number>();
                const now = new Date();
                const twelveWeeksAgo = new Date(now);
                twelveWeeksAgo.setDate(now.getDate() - (12 * 7));

                // Initialize all 12 weeks with 0's for distance
                for (let i = 0; i < 12; i++) {
                    const weekStart = new Date(twelveWeeksAgo);
                    weekStart.setDate(twelveWeeksAgo.getDate() + (i * 7));
                    weekStart.setHours(0, 0, 0, 0);
                    const weekKey = weekStart.toISOString().split('T')[0];
                    weeklyMap.set(weekKey, 0);
                }

                // Add activity distances to their respective weeks
                allRuns.data.forEach((activity) => {
                    const activityDate = new Date(activity.time);
                    if (activityDate >= twelveWeeksAgo) {
                        const daysSinceStart = Math.floor(
                            (activityDate.getTime() - twelveWeeksAgo.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const weekIndex = Math.floor(daysSinceStart / 7);
                        const weekStart = new Date(twelveWeeksAgo);
                        weekStart.setDate(twelveWeeksAgo.getDate() + (weekIndex * 7));
                        weekStart.setHours(0, 0, 0, 0);
                        const weekKey = weekStart.toISOString().split('T')[0];

                        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + activity.distance);
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
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndProcessData();
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

            // Axes
            const xAxis = d3
                .axisBottom(xScale)
                .ticks(6)
                .tickFormat((d) => d3.timeFormat("%b %d")(d as Date));

            const yAxis = d3.axisLeft(yScale).ticks(5);

            g.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

            g.append("g").call(yAxis);

            // Axis labels
            g.append("text")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 5)
                .style("text-anchor", "middle")
                .text("Week");

            g.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -margin.left + 15)
                .style("text-anchor", "middle")
                .text("Distance (mi)");

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
                .attr("stroke", "#4f46e5")
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
                .attr("fill", "#4f46e5")
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
                style={{
                    position: "absolute",
                    opacity: 0,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "8px",
                    pointerEvents: "none",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontSize: "14px",
                    transition: "opacity 0.2s",
                }}
            />
        </div>
    );
}