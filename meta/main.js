import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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

function processCommits(data) {
  return d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
    const first = lines[0];
    const { author, date, time, timezone, datetime } = first;
    const commitInfo = {
      id: commit,
      url: `https://github.com/vis-society/lab-7/commit/${commit}`,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length
    };

    Object.defineProperty(commitInfo, 'lines', {
      value: lines,
      writable: false,
      enumerable: false
    });

    return commitInfo;
  });
}

function renderCommitInfo(data, commits) {
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

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

async function main() {
  const data = await loadData();
  const commits = processCommits(data);
  renderCommitInfo(data, commits);
}

main();
