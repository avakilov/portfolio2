import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Example data by year
const data = [
  { year: 2025, value: 2 },
  { year: 2024, value: 3 },
  { year: 2023, value: 5 },
  { year: 2022, value: 2 },
];

// Colors
const colors = d3.scaleOrdinal()
  .domain(data.map(d => d.year))
  .range(["#4472C4", "#ED7D31", "#C43B3B", "#64B6AC"]); // Blue, Orange, Red, Teal

// SVG setup
const width = 300;
const height = 300;
const radius = Math.min(width, height) / 2;

const svg = d3
  .select("#projects-pie-plot")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// Create pie and arc
const pie = d3.pie().value(d => d.value);
const arc = d3.arc().innerRadius(0).outerRadius(radius - 10);

// Draw arcs
svg
  .selectAll("path")
  .data(pie(data))
  .join("path")
  .attr("d", arc)
  .attr("fill", d => colors(d.data.year))
  .attr("stroke", "#111")
  .attr("stroke-width", 1);

// --- Legend ---
const legend = d3.select("#legend");
legend
  .selectAll(".legend-item")
  .data(data)
  .join("div")
  .attr("class", "legend-item")
  .html(
    d =>
      `<div class="legend-color" style="background:${colors(d.year)}"></div>
       <span>${d.year} (<b>${d.value}</b>)</span>`
  );