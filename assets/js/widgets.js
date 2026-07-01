// Widget registry and creator
const WidgetRegistry = (function(){
  const types = {};
  function register(type, factory){ types[type] = factory; }
  function create(type, opts){
    if(types[type]) return types[type](opts);
    console.warn('Unknown widget type', type); return null;
  }
  return { register, create };
})();

WidgetRegistry.register('kpi', function(opts){
  opts = opts || {};
  const wrapper = document.createElement('div');
  wrapper.className = 'col-lg-3 col-md-6';
  const tpl = `
    <div class="widget-card card p-3">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <small class="text-muted widget-title">${opts.title||'KPI'}</small>
          <h3 class="widget-value mb-0">${opts.value||'--'}</h3>
        </div>
        <div class="widget-icon bg-${opts.color||'danger'} text-white rounded-circle p-2"><i class="fa ${opts.icon||'fa-chart-line'}"></i></div>
      </div>
    </div>
  `;
  wrapper.innerHTML = tpl;
  return wrapper;
});

WidgetRegistry.register('chart', function(opts){
  opts = opts || {};
  const wrapper = document.createElement('div');
  wrapper.className = (opts.colClass) || 'col-lg-6 col-md-12';
  wrapper.innerHTML = `
    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="mb-0">${opts.title||'Chart'}</h6>
        <small class="text-muted">${opts.subtitle||''}</small>
      </div>
      <div class="mt-3">
        <canvas class="widget-chart" id="${opts.canvasId || 'widgetChart_'+Math.random().toString(36).substring(2,9)}"></canvas>
      </div>
    </div>
  `;

  setTimeout(()=>{
    const canvas = wrapper.querySelector('canvas');
    if(canvas && opts.data){
      const ctx = canvas.getContext('2d');
      const chartType = opts.chartType || 'line';
      if(chartType === 'bar') createBarChart(ctx, opts.data, opts.options);
      else if(chartType === 'doughnut') createDoughnutChart(ctx, opts.data, opts.options);
      else if(chartType === 'pie') createPieChart(ctx, opts.data, opts.options);
      else if(chartType === 'area') createAreaChart(ctx, opts.data, opts.options);
      else if(chartType === 'gauge') createGaugeChart(ctx, opts.data, opts.options);
      else createLineChart(ctx, opts.data, opts.options);
    }
  }, 20);

  return wrapper;
});

async function renderDashboardWidgets(){
  const container = document.getElementById('widgets');
  if(!container) return;

  let data = {};
  try {
    const response = await fetch('assets/data/dashboard-data.json');
    data = await response.json();
  } catch (error) {
    console.warn('Could not load dashboard data, using fallback values.', error);
  }

  const savedLayout = JSON.parse(localStorage.getItem('azko_widget_layout') || 'null');
  const defaultLayout = [
    { type: 'kpi', title: 'Sales Today', value: formatCurrency(data.salesToday || 0), color: 'danger', icon: 'fa-shopping-cart' },
    { type: 'kpi', title: 'MTD Sales', value: formatCurrency(data.mtdSales || 0), color: 'warning', icon: 'fa-chart-line' },
    { type: 'kpi', title: 'Conversion', value: `${(data.conversionRate || 0).toFixed(1)}%`, color: 'success', icon: 'fa-percentage' },
    { type: 'kpi', title: 'Store Traffic', value: (data.storeTraffic || 0).toLocaleString(), color: 'info', icon: 'fa-users' },
    { type: 'chart', title: 'Hourly Sales', chartType: 'line', colClass: 'col-lg-8 col-md-12', data: { labels: ['8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM'], datasets:[{ label:'Sales', data: data.hourlySales || [120,200,150,300,250,400,350,300,450,500], backgroundColor:'rgba(214,40,40,0.15)', borderColor:'rgba(214,40,40,1)', tension:0.3, fill:true }] } },
    { type: 'chart', title: 'Category Mix', chartType: 'doughnut', colClass: 'col-lg-4 col-md-12', data: { labels:['Apparel','Electronics','Grocery','Lifestyle'], datasets:[{ data: data.categoryMix || [35,25,20,20], backgroundColor:['#d62828','#ef4444','#f97316','#facc15'] }] } },
    { type: 'chart', title: 'Weekly Sales', chartType: 'bar', colClass: 'col-lg-7 col-md-12', data: { labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets:[{ label:'Revenue', data: data.weeklySales || [220,260,340,310,420,480,560], backgroundColor:'rgba(214,40,40,0.75)'}] } },
    { type: 'chart', title: 'Achievement %', chartType: 'gauge', colClass: 'col-lg-5 col-md-12', data: { labels:['Achievement'], datasets:[{ data:[data.achievementPercent || 82, 100 - (data.achievementPercent || 82)], backgroundColor:['#d62828','#f4b6b6'] }] } }
  ];

  const layout = savedLayout || defaultLayout;
  container.innerHTML = '';
  layout.forEach(item => container.appendChild(WidgetRegistry.create(item.type, item)));
}

function formatCurrency(value){
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function saveWidgetLayout(layout){
  localStorage.setItem('azko_widget_layout', JSON.stringify(layout));
}

function initDefaultWidgets(){
  renderDashboardWidgets();
}

document.addEventListener('DOMContentLoaded', function(){
  const link = document.createElement('link'); link.rel='stylesheet'; link.href='assets/css/widgets.css'; document.head.appendChild(link);
  setTimeout(()=>{
    if(typeof initDefaultWidgets === 'function') initDefaultWidgets();
  }, 300);
});
