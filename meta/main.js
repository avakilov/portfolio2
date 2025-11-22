import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// ------------------------------------
// COLOR SCALE FOR FILE TYPES
// ------------------------------------
const colors = d3.scaleOrdinal(d3.schemeTableau10);

// Extract file extension ("html", "js", "svelte", etc.)
function getFileType(fileName) {
  const ext = fileName.split('.').pop();
  return ext;
}

// ------------------------------------
// LOAD RAW LOC DATA
// ------------------------------------
async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime)
  }));
  return data;
}

// ------------------------------------
// PROCESS INTO COMMIT OBJECTS
// ------------------------------------
function processCommits(data) {
  const commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
    const first = lines[0];
    return {
      id: commit,
      datetime: first.datetime,
      author: first.author,
      totalLines: lines.length,
      hourFrac: first.datetime.getHours() + first.datetime.getMinutes() / 60,
      lines
    };
  });

  commits.sort((a, b) => a.datetime - b.datetime);
  return commits;
}

// ------------------------------------
// SUMMARY STATS
// ------------------------------------
function renderCommitInfo(data, commits) {
  const stats = d3.select('#stats');
  stats.html("");

  const dl = stats.append('dl').attr('class', 'stats');

  dl.append('dt').html('COMMITS');
  dl.append('dd').text(commits.length);

  dl.append('dt').html('FILES');
  dl.append('dd').text(new Set(data.map((d) => d.file)).size);

  dl.append('dt').html('TOTAL <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').html('MAX DEPTH');
  dl.append('dd').text(d3.max(data, (d) => d.depth));

  dl.append('dt').html('LONGEST LINE');
  dl.append('dd').text(d3.max(data, (d) => d.length));

  dl.append('dt').html('MAX LINES');
  dl.append('dd').text(
    d3.max(
      Array.from(d3.group(data, (d) => d.file), ([, v]) => v.length)
    )
  );
}

// ------------------------------------
// FILES UNIT VISUALIZATION (DOTS)
// ------------------------------------
function renderFilesUnitViz(filteredData) {
  const filesContainer = d3.select("#files");
  filesContainer.html("");

  const files = d3.groups(filteredData, d => d.file)
    .map(([file, lines]) => ({ file, lines }))
    .sort((a, b) => b.lines.length - a.lines.length);

  const dl = filesContainer.append("dl").attr("class", "files");

  const fileRows = dl.selectAll("div.file-row")
    .data(files)
    .join("div")
    .attr("class", "file-row");

  // Label
  fileRows.append("dt")
    .html(d => `
      <code>${d.file}</code>
      <small>${d.lines.length} lines</small>
    `);

  // Dots
  fileRows.append("dd")
    .each(function(d) {
      d3.select(this)
        .selectAll("div")
        .data(d.lines)
        .join("div")
        .attr("class", "loc")
        .style("--color", () => colors(getFileType(d.file)));  // COLOR APPLIED HERE
    });
}

// ------------------------------------
// BUBBLE CHART
// ------------------------------------
function renderCommitChart(commits) {
  d3.select("#commit-chart").html("");

  const margin = { top: 40, right: 20, bottom: 50, left: 70 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select("#commit-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  const r = d3.scaleSqrt()
    .domain([0, d3.max(commits, (d) => d.totalLines)])
    .range([3, 25]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat("%a %d")));

  svg.append("g")
    .call(d3.axisLeft(y).ticks(12).tickFormat(d => `${String(d).padStart(2, "0")}:00`));

  svg.selectAll("circle")
    .data(commits)
    .join("circle")
    .attr("cx", (d) => x(d.datetime))
    .attr("cy", (d) => y(d.hourFrac))
    .attr("r", (d) => r(d.totalLines))
    .style("fill", "steelblue")
    .style("opacity", 0.5);

  svg.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .attr("font-size", "22px")
    .attr("font-weight", "bold")
    .text("Commits by time of day");
}

// ------------------------------------
// SLIDER LOGIC
// ------------------------------------
function attachSlider(allCommits, rawData) {
  const slider = document.getElementById("commit-slider");
  const dateText = document.getElementById("slider-date");

  slider.max = allCommits.length - 1;
  slider.value = allCommits.length - 1;

  function update() {
    const index = +slider.value;
    const selectedCommits = allCommits.slice(0, index + 1);
    const lastDate = selectedCommits[selectedCommits.length - 1].datetime;

    dateText.textContent =
      d3.timeFormat("%B %d, %Y at %-I:%M %p")(lastDate);

    const filteredRawData = rawData.filter(d => d.datetime <= lastDate);

    // Update all visuals
    renderFilesUnitViz(filteredRawData);
    renderCommitInfo(filteredRawData, selectedCommits);
    renderCommitChart(selectedCommits);
  }

  slider.addEventListener("input", update);
  update();
}

// ------------------------------------
// MAIN ENTRY
// ------------------------------------
async function main() {
  const data = await loadData();
  const commits = processCommits(data);
  attachSlider(commits, data);
}

main();
