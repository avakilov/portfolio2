import { fetchJSON, renderProjects } from '../global.js';

// Load and render project data
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// Import D3
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// --- D3 PIE CHART SETUP ---

// Sample data (you can replace with dynamic data if needed)
let data = [1, 2];
let colors = ['gold', 'purple'];

// SVG setup (centered)
const width = 200;
const height = 200;
const radius = 80;

const svg = d3
  .select('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`);

// Create pie and arc generators
const pie = d3.pie();
const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

// Bind data and create slices
svg
  .selectAll('path')
  .data(pie(data))
  .join('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, i) => colors[i])
  .attr('stroke', 'white')
  .attr('stroke-width', 1);
