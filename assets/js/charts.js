// Reusable Chart.js components and demo init
function createLineChart(ctx, data, options){
  return new Chart(ctx, { type: 'line', data: data, options: options || {} });
}

function createBarChart(ctx, data, options){
  return new Chart(ctx, { type: 'bar', data: data, options: options || {} });
}

function createDoughnutChart(ctx, data, options){
  return new Chart(ctx, { type: 'doughnut', data: data, options: options || {} });
}

function createPieChart(ctx, data, options){
  return new Chart(ctx, { type: 'pie', data: data, options: options || {} });
}

function createAreaChart(ctx, data, options){
  return new Chart(ctx, { type: 'line', data: data, options: { ...options, elements: { line: { tension: 0.4 }, point: { radius: 0 } } } });
}

function createGaugeChart(ctx, data, options){
  return new Chart(ctx, { type: 'doughnut', data: data, options: { ...options, rotation: -90, circumference: 180 } });
}

// Demo initializer
function initDefaultCharts(){
  const hourlyCtx = document.getElementById('hourlySalesChart')?.getContext('2d');
  if(hourlyCtx){
    const labels = ['8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM'];
    const data = { labels: labels, datasets: [{ label: 'Sales', data: [120,200,150,300,250,400,350,300,450,500], backgroundColor: 'rgba(214,40,40,0.2)', borderColor: 'rgba(214,40,40,1)', tension:0.3, fill:true }] };
    createLineChart(hourlyCtx, data, { responsive:true, plugins:{legend:{display:false}} });
  }
}
