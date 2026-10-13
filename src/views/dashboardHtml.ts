export function renderDashboardHtml(data: {
  metrics: any;
  recentEvents: any[];
  customers: any[];
  orders: any[];
}): string {
  const { metrics, recentEvents, customers, orders } = data;

  const formatINR = (val: number | string) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(val));

  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.amount || 0), 0);

  // Dynamic Avatar Color Generator
  const avatarGradients = [
    'from-rose-500 to-orange-400',
    'from-violet-600 to-indigo-500',
    'from-emerald-500 to-teal-400',
    'from-amber-500 to-yellow-400',
    'from-sky-500 to-blue-600',
    'from-fuchsia-500 to-pink-500',
  ];

  // Customer Rows
  const customerRows = customers
    .map((c, idx) => {
      const email = c.email || 'customer@store.in';
      const initials = email.slice(0, 2).toUpperCase();
      const gradient = avatarGradients[idx % avatarGradients.length];

      return `
      <tr class="customer-row hover:bg-slate-50/80 transition-all border-b border-slate-100">
        <td class="py-4 px-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr ${gradient} text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-100 ring-2 ring-white">
              ${initials}
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900">${email}</p>
              <p class="text-xs text-slate-400 font-mono tracking-tight">${c.crmContactId}</p>
            </div>
          </div>
        </td>
        <td class="py-4 px-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            WC #${c.wcCustomerId || 'Guest'}
          </span>
        </td>
        <td class="py-4 px-6 text-xs font-medium text-slate-500">
          ${new Date(c.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
      </tr>`;
    })
    .join('');

  // Orders / Deals Rows
  const orderRows = orders
    .map((o) => {
      const isCompleted = o.status.toLowerCase() === 'completed';
      const isProcessing = o.status.toLowerCase() === 'processing';

      const badge = isCompleted
        ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completed
           </span>`
        : isProcessing
        ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span> Processing
           </span>`
        : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> ${o.status.toUpperCase()}
           </span>`;

      return `
      <tr class="order-row hover:bg-slate-50/80 transition-all border-b border-slate-100">
        <td class="py-4 px-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-100">
              #
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900">Order #${o.wcOrderId}</p>
              <p class="text-xs text-slate-400 font-mono tracking-tight">${o.crmDealId}</p>
            </div>
          </div>
        </td>
        <td class="py-4 px-6">
          <span class="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            ${formatINR(o.amount)}
          </span>
        </td>
        <td class="py-4 px-6">${badge}</td>
        <td class="py-4 px-6 text-xs font-medium text-slate-500">
          ${new Date(o.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}, 
          ${new Date(o.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}
        </td>
      </tr>`;
    })
    .join('');

  // Webhook Logs Rows
  const webhookRows = recentEvents
    .map((event) => {
      const isProcessed = event.status === 'PROCESSED';
      const isFailed = event.status === 'FAILED';

      const badge = isProcessed
        ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> PROCESSED
           </span>`
        : isFailed
        ? `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> FAILED
           </span>`
        : `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> QUEUED
           </span>`;

      return `
      <tr class="event-row hover:bg-slate-50/80 transition-all border-b border-slate-100">
        <td class="py-3.5 px-6 font-mono text-xs text-indigo-600 font-semibold">
          ${event.deliveryId || event.id.slice(0, 8)}
        </td>
        <td class="py-3.5 px-6 text-xs font-bold text-slate-800">${event.topic}</td>
        <td class="py-3.5 px-6">${badge}</td>
        <td class="py-3.5 px-6 text-xs font-medium text-slate-500">
          ${new Date(event.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
        </td>
        <td class="py-3.5 px-6 text-right">
          <details class="inline-block text-left">
            <summary class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg border border-indigo-100 transition-colors cursor-pointer list-none">
              View JSON &darr;
            </summary>
            <div class="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4" onclick="this.parentElement.removeAttribute('open')">
              <div class="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-left" onclick="event.stopPropagation()">
                <div class="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                  <h4 class="text-sm font-bold text-slate-900">Event Payload</h4>
                  <button onclick="this.closest('details').removeAttribute('open')" class="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
                </div>
                <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-auto max-h-80 shadow-inner">${JSON.stringify(event.payload, null, 2)}</pre>
              </div>
            </div>
          </details>
        </td>
      </tr>`;
    })
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WooCommerce CRM Portal (India)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['Plus Jakarta Sans', 'sans-serif'],
              mono: ['JetBrains Mono', 'monospace'],
            }
          }
        }
      }

      function showTab(id) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('bg-white', 'text-indigo-600', 'shadow-sm', 'border-slate-200/80');
          btn.classList.add('text-slate-600', 'border-transparent');
        });
        document.getElementById(id).classList.remove('hidden');
        const activeBtn = document.getElementById('btn-' + id);
        activeBtn.classList.add('bg-white', 'text-indigo-600', 'shadow-sm', 'border-slate-200/80');
        activeBtn.classList.remove('text-slate-600', 'border-transparent');
      }

      function filterTable(inputId, rowClass) {
        const query = document.getElementById(inputId).value.toLowerCase();
        document.querySelectorAll('.' + rowClass).forEach(row => {
          row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
        });
      }

      async function triggerSimulatedOrder() {
        const btn = document.getElementById('simBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="inline-block animate-spin mr-2">&#9696;</span> Ingesting...';
        try {
          const res = await fetch('/api/test-event', { method: 'POST' });
          if (res.ok) {
            location.reload();
          } else {
            alert('Simulation failed');
          }
        } catch(e) {
          alert('Error: ' + e.message);
        } finally {
          btn.disabled = false;
          btn.innerHTML = '⚡ Simulate Order (₹)';
        }
      }
    </script>
    <style>
      body {
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .bg-radial {
        background-image: radial-gradient(at 0% 0%, rgba(224, 231, 255, 0.45) 0px, transparent 50%),
                          radial-gradient(at 100% 0%, rgba(254, 243, 199, 0.4) 0px, transparent 50%),
                          radial-gradient(at 100% 100%, rgba(204, 251, 241, 0.45) 0px, transparent 50%);
      }
    </style>
  </head>
  <body class="bg-slate-50 text-slate-800 font-sans min-h-screen bg-radial">

    <!-- Bright Gradient Top Banner -->
    <header class="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div class="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-indigo-600 p-0.5 shadow-md shadow-orange-500/20">
            <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-indigo-600 font-black text-xl">₹</span>
            </div>
          </div>
          <div>
            <h1 class="text-base font-extrabold text-slate-900 tracking-tight">WooCommerce CRM Engine</h1>
            <p class="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Pipeline &bull; INR (₹) &bull; IST
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button id="simBtn" onclick="triggerSimulatedOrder()" class="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center gap-2">
            ⚡ Simulate Order (₹)
          </button>
          <button onclick="location.reload()" class="p-2 bg-white border border-slate-200/90 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-colors" title="Refresh">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-8">

      <!-- Colorful KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <!-- Total Revenue Card -->
        <div class="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute -right-3 -bottom-3 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-600">Total Revenue</span>
            <span class="text-base p-1.5 rounded-lg bg-emerald-50 text-emerald-600">📈</span>
          </div>
          <p class="text-2xl font-black text-slate-900 mt-2 font-mono">${formatINR(totalRevenue)}</p>
          <p class="text-xs text-emerald-700 font-semibold mt-1">Processed store orders</p>
        </div>

        <!-- Mapped Customers Card -->
        <div class="bg-white p-5 rounded-2xl border border-violet-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute -right-3 -bottom-3 w-20 h-20 bg-violet-500/10 rounded-full blur-xl"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-violet-600">Mapped Customers</span>
            <span class="text-base p-1.5 rounded-lg bg-violet-50 text-violet-600">👥</span>
          </div>
          <p class="text-2xl font-black text-slate-900 mt-2 font-mono">${metrics.totalCustomers}</p>
          <p class="text-xs text-violet-700 font-semibold mt-1">Unique customer profiles</p>
        </div>

        <!-- Synced Orders Card -->
        <div class="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute -right-3 -bottom-3 w-20 h-20 bg-sky-500/10 rounded-full blur-xl"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-sky-600">Deals & Orders</span>
            <span class="text-base p-1.5 rounded-lg bg-sky-50 text-sky-600">🛍️</span>
          </div>
          <p class="text-2xl font-black text-slate-900 mt-2 font-mono">${metrics.totalOrders}</p>
          <p class="text-xs text-sky-700 font-semibold mt-1">Active pipeline deals</p>
        </div>

        <!-- Pipeline Delivery Health Card -->
        <div class="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute -right-3 -bottom-3 w-20 h-20 bg-amber-500/10 rounded-full blur-xl"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-amber-600">Delivery Health</span>
            <span class="text-base p-1.5 rounded-lg bg-amber-50 text-amber-600">⚡</span>
          </div>
          <p class="text-2xl font-black text-slate-900 mt-2 font-mono">${metrics.totalEvents > 0 ? Math.round((metrics.processedEvents / metrics.totalEvents) * 100) : 100}%</p>
          <p class="text-xs text-amber-700 font-semibold mt-1">${metrics.processedEvents} ok &bull; ${metrics.failedEvents} retry</p>
        </div>

      </div>

      <!-- Segment Toggle Bar -->
      <div class="bg-slate-200/60 p-1 rounded-2xl flex gap-1 mb-6 max-w-md border border-slate-200/80">
        <button id="btn-tab-customers" onclick="showTab('tab-customers')" class="tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-slate-600 hover:text-slate-900 border border-transparent">
          Customers (${customers.length})
        </button>
        <button id="btn-tab-orders" onclick="showTab('tab-orders')" class="tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all bg-white text-indigo-600 shadow-sm border border-slate-200/80">
          Deals (${orders.length})
        </button>
        <button id="btn-tab-events" onclick="showTab('tab-events')" class="tab-btn flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-slate-600 hover:text-slate-900 border border-transparent">
          Audit Log (${recentEvents.length})
        </button>
      </div>

      <!-- TAB 1: ORDERS & DEALS -->
      <div id="tab-orders" class="tab-content bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gradient-to-r from-white to-slate-50">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">Deals & Order Tracking</h3>
            <p class="text-xs text-slate-500">Live order progression mapped into CRM deals</p>
          </div>
          <input id="orderSearch" onkeyup="filterTable('orderSearch', 'order-row')" placeholder="Search order reference..." class="text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-60 focus:outline-indigo-500 shadow-2xs">
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th class="py-3.5 px-6">Reference</th>
                <th class="py-3.5 px-6">Deal Value (INR)</th>
                <th class="py-3.5 px-6">Pipeline Stage</th>
                <th class="py-3.5 px-6">Synced At</th>
              </tr>
            </thead>
            <tbody>
              ${orders.length > 0 ? orderRows : `<tr><td colspan="4" class="py-12 text-center text-xs text-slate-400">No deals tracked yet. Click "⚡ Simulate Order (₹)".</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: CUSTOMERS DIRECTORY -->
      <div id="tab-customers" class="tab-content hidden bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-gradient-to-r from-white to-slate-50">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">Customer Profiles</h3>
            <p class="text-xs text-slate-500">Auto-created from incoming checkout webhooks</p>
          </div>
          <input id="custSearch" onkeyup="filterTable('custSearch', 'customer-row')" placeholder="Search customer email..." class="text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2 w-full sm:w-60 focus:outline-indigo-500 shadow-2xs">
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th class="py-3.5 px-6">Customer Profile</th>
                <th class="py-3.5 px-6">WooCommerce Origin</th>
                <th class="py-3.5 px-6">Created On</th>
              </tr>
            </thead>
            <tbody>
              ${customers.length > 0 ? customerRows : `<tr><td colspan="3" class="py-12 text-center text-xs text-slate-400">No customers registered yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: AUDIT STREAM -->
      <div id="tab-events" class="tab-content hidden bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
          <h3 class="text-sm font-extrabold text-slate-900">Webhook Audit Trail</h3>
          <p class="text-xs text-slate-500">Immutable delivery and execution logs</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th class="py-3.5 px-6">Delivery ID</th>
                <th class="py-3.5 px-6">Topic</th>
                <th class="py-3.5 px-6">Status</th>
                <th class="py-3.5 px-6">Received</th>
                <th class="py-3.5 px-6 text-right">Payload</th>
              </tr>
            </thead>
            <tbody>
              ${recentEvents.length > 0 ? webhookRows : `<tr><td colspan="5" class="py-12 text-center text-xs text-slate-400">No webhook events logged yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </body>
  </html>
  `;
}