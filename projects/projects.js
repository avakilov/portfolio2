import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Create arc generator
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Example circle (full arc)
let arc = arcGenerator({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});
d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// Data for pie-like arcs
let data = [1, 2];
let total = d3.sum(data); // simpler than manual loop

let angle = 0;
let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}

// Generate SVG paths for each arc
let arcs = arcData.map((d) => arcGenerator(d));

// Colors for each arc
let colors = ['gold', 'purple'];

// Append each arc to the SVG with its color
arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors[idx]); // ✅ fill color applied here
});