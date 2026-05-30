import React, { useState, useEffect } from 'react';
import './App.css';

import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  Title, Tooltip, Legend, ArcElement, PointElement 
} from 'chart.js';
import { Bar, Doughnut, Bubble } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement);

function App() {
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard | finance | inventory | marketing | trends
  
  // Data utama dari API
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [trends, setTrends] = useState([]);

  // States untuk Form Keuangan
  const [txType, setTxType] = useState('INCOME');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [editFinanceId, setEditFinanceId] = useState(null);

  // States untuk Form Inventaris
  const [prodName, setProdName] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [editInventoryId, setEditInventoryId] = useState(null);

  // States untuk Form Analisis Tren Pasar Baru
  const [trendKeyword, setTrendKeyword] = useState('');
  const [trendGrowth, setTrendGrowth] = useState('');
  const [trendVolume, setTrendVolume] = useState('');

  // States untuk AI Marketing
  const [marketProdName, setMarketProdName] = useState('');
  const [marketFeatures, setMarketFeatures] = useState('');
  const [marketTone, setMarketTone] = useState('PROFESIONAL');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fungsi Fetch Global
  const fetchFinanceData = () => {
    fetch('http://localhost:8080/api/finance').then(res => res.json()).then(data => setTransactions(data || []));
  };
  const fetchInventoryData = () => {
    fetch('http://localhost:8080/api/inventory').then(res => res.json()).then(data => setProducts(data || []));
  };
  const fetchTrendData = () => {
    fetch('http://localhost:8080/api/dashboard/trends').then(res => res.json()).then(data => setTrends(data || []));
  };

  useEffect(() => {
    fetchFinanceData();
    fetchInventoryData();
    fetchTrendData();
  }, [viewMode]);

  // =========================================
  // CONFIG CHART UNTUK DASHBOARD OVERVIEW
  // =========================================
  const totalIncome = transactions.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + tx.amount, 0);

  const financeChartData = {
    labels: ['Pemasukan (Income)', 'Pengeluaran (Expense)'],
    datasets: [{
      label: 'Nominal Arus Kas (Rp)',
      data: [totalIncome, totalExpense],
      backgroundColor: ['rgba(57, 255, 20, 0.25)', 'rgba(255, 0, 85, 0.25)'],
      borderColor: ['#39ff14', '#ff0055'],
      borderWidth: 2,
    }]
  };

  const inventoryChartData = {
    labels: products.map(p => p.name),
    datasets: [{
      label: 'Jumlah Stok Unit',
      data: products.map(p => p.stock),
      backgroundColor: ['rgba(0, 240, 255, 0.25)', 'rgba(255, 170, 0, 0.25)', 'rgba(168, 85, 247, 0.25)', 'rgba(236, 72, 153, 0.25)'],
      borderColor: ['#00f0ff', '#ffaa00', '#a855f7', '#ec4899'],
      borderWidth: 1.5,
    }]
  };

  // FORMAT DATA UNTUK BUBBLE CHART (TREN PASAR)
  const bubbleChartData = {
    datasets: trends.map((t) => ({
      label: t.keyword,
      data: [{
        x: t.volume,
        y: t.growth_pct,
        r: Math.min(Math.max(t.volume / 100, 8), 30)
      }],
      backgroundColor: t.growth_pct >= 0 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 85, 0.4)',
      borderColor: t.growth_pct >= 0 ? '#00f0ff' : '#ff0055',
    }))
  };

  const baseChartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e2e8f0', font: { family: 'monospace', size: 11 } } },
      tooltip: { backgroundColor: '#060913', titleFont: { family: 'monospace' }, bodyFont: { family: 'monospace' } }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b', font: { family: 'monospace' } } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b', font: { family: 'monospace' } } }
    }
  };

  // =========================================
  // LOGIK CRUD: MARKET TRENDS
  // =========================================
  const handleTrendSubmit = async (e) => {
    e.preventDefault();
    const payload = { keyword: trendKeyword, growth_pct: parseFloat(trendGrowth), volume: parseInt(trendVolume) };
    
    await fetch('http://localhost:8080/api/dashboard/trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setTrendKeyword(''); setTrendGrowth(''); setTrendVolume('');
    fetchTrendData();
  };

  const handleDeleteTrend = async (id) => {
    if (window.confirm("[WARNING] Hapus keyword ini dari pemantauan tren radar?")) {
      await fetch(`http://localhost:8080/api/dashboard/trends/${id}`, { method: 'DELETE' });
      fetchTrendData();
    }
  };

  // =========================================
  // LOGIK CRUD: FINANCE & INVENTORY
  // =========================================
  const handleFinanceSubmit = async (e) => {
    e.preventDefault();
    const payload = { type: txType, amount: parseFloat(txAmount), description: txDesc };
    const url = editFinanceId ? `http://localhost:8080/api/finance/${editFinanceId}` : 'http://localhost:8080/api/finance';
    await fetch(url, { method: editFinanceId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setTxAmount(''); setTxDesc(''); setTxType('INCOME'); setEditFinanceId(null);
    fetchFinanceData();
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    const payload = { name: prodName, stock: parseInt(prodStock), price: parseFloat(prodPrice) };
    const url = editInventoryId ? `http://localhost:8080/api/inventory/${editInventoryId}` : 'http://localhost:8080/api/inventory';
    await fetch(url, { method: editInventoryId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setProdName(''); setProdStock(''); setProdPrice(''); setEditInventoryId(null);
    fetchInventoryData();
  };

  // =========================================
  // LOGIK AI MARKETING GENERATOR
  // =========================================
  const handleGenerateContent = (e) => {
    e.preventDefault(); setIsGenerating(true); setGeneratedContent('');
    setTimeout(() => {
      let promptBase = ``;
      if (marketTone === 'SANTAI') {
        promptBase = `🔥 *RACUN BARU BUAT KAMU!* 🔥\n\nNih, kenalin **${marketProdName.toUpperCase()}**. \n\nKeunggulan utamanya:\n✅ ${marketFeatures.replace(/,/g, '\n✅ ')} \n\nYuk buruan di-check out sekarang!`;
      } else if (marketTone === 'SCIFI') {
        promptBase = `⚡ *SYSTEM UPGRADE INITIATED* ⚡\n\nEquip dirimu dengan: **${marketProdName.toUpperCase()}**. \n\nSpesifikasi:\n> ${marketFeatures.replace(/,/g, '\n> ')} \n\n[ AKSES DIBUKA ] Amankan unit sekarang.`;
      } else {
        promptBase = `✨ *PENAWARAN EKSKLUSIF* ✨\n\nTingkatkan kualitas keseharian Anda dengan **${marketProdName.toUpperCase()}**. \n\nFitur istimewa:\n- ${marketFeatures.replace(/,/g, '\n- ')} \n\nPesan sekarang juga dari kami.`;
      }
      const combinedNameTag = '#' + marketProdName.replace(/[^a-zA-Z0-9]/g, '');
      setGeneratedContent(promptBase + `\n\n🎯 Tags: ${combinedNameTag} #UMKMIndonesia #ProdukLokal`);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="app-container">
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <header className="cyber-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand" style={{ flex: '1' }}>
          <span className="cyber-badge">UMKM GROWTH WEBSITE</span>
          <h1>MBG<span>UMKM</span></h1>
        </div>
        
        <div className="system-nav" style={{ flex: '2', display: 'flex', justifyContent: 'center' }}>
          <button className={viewMode === 'dashboard' ? 'active' : ''} onClick={() => setViewMode('dashboard')}>[OVERVIEW]</button>
          <button className={viewMode === 'finance' ? 'active' : ''} onClick={() => setViewMode('finance')}>[FINANCE]</button>
          <button className={viewMode === 'inventory' ? 'active' : ''} onClick={() => setViewMode('inventory')}>[INVENTORY]</button>
          <button className={viewMode === 'marketing' ? 'active' : ''} onClick={() => setViewMode('marketing')}>[MARKETING]</button>
          <button className={viewMode === 'trends' ? 'active' : ''} onClick={() => setViewMode('trends')}>[TRENDS]</button>
        </div>
        <div className="system-status" style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}><span className="pulse-dot"></span> RADAR ONLINE</div>
      </header>

      <div className="main-layout single-column">
        
        {/* VIEW: DASHBOARD OVERVIEW */}
        {viewMode === 'dashboard' && (
          <div className="dashboard-layout">
            <section className="focus-banner">
              <div className="corner-bracket tl"></div><div className="corner-bracket tr"></div>
              <div className="corner-bracket bl"></div><div className="corner-bracket br"></div>
              <p className="subtitle">METRICS OVERVIEW MATRIX</p>
              <h2>Panel Utama Kendali UMKM. Data arus kas, kepadatan gudang, dan pergerakan tren pasar disinkronkan secara *real-time*.</h2>
            </section>

            <div className="cyber-panel full-width-panel" style={{marginBottom: '20px'}}>
              <h3 className="neon-title"> RADAR MAP TREN PASAR (GROWTH VS SEARCH VOLUME)</h3>
              <div className="chart-wrapper" style={{minHeight: '280px'}}>
                {trends.length > 0 ? (
                  <Bubble 
                    data={bubbleChartData} 
                    options={{
                      ...baseChartOptions,
                      scales: {
                        x: { title: { display: true, text: 'Volume Pencarian Bulanan', color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } },
                        y: { title: { display: true, text: 'Pertumbuhan (%)', color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } }
                      }
                    }} 
                  />
                ) : (
                  <div className="text-center text-muted placeholder-chart-text">Belum ada data tren di radar map. Harap input di menu [ TRENDS ].</div>
                )}
              </div>
            </div>

            <div className="chart-grid">
              <div className="cyber-panel chart-panel">
                <h3 className="neon-title"> ANALISIS ARUS KAS (FINANCIAL MATRIX)</h3>
                <div className="chart-wrapper">
                  {transactions.length > 0 ? <Bar data={financeChartData} options={baseChartOptions} /> : <div className="text-center text-muted placeholder-chart-text">Menunggu parameter data keuangan...</div>}
                </div>
              </div>

              <div className="cyber-panel chart-panel">
                <h3 className="neon-title"> MONITORING SEBARAN STOK (INVENTORY DENSITY)</h3>
                <div className="chart-wrapper doughnut-wrapper">
                  {products.length > 0 ? <Doughnut data={inventoryChartData} options={{...baseChartOptions, scales: {}}} /> : <div className="text-center text-muted placeholder-chart-text">Menunggu data inventaris produk...</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: NEW MARKET TRENDS MANAGEMENT */}
        {viewMode === 'trends' && (
          <div className="module-container">
            <div className="cyber-panel form-panel">
              <h3 className="neon-title"> INJEKSI KATA KUNCI RADAR TREN</h3>
              <form onSubmit={handleTrendSubmit} className="cyber-form">
                <input type="text" required placeholder="Kata Kunci / Niche Tren (Cth: Baju Oversize)" className="cyber-input" value={trendKeyword} onChange={(e) => setTrendKeyword(e.target.value)} />
                <input type="number" step="0.1" required placeholder="Pertumbuhan Tren ( % Contoh: 35.5 atau -10.2)" className="cyber-input" value={trendGrowth} onChange={(e) => setTrendGrowth(e.target.value)} />
                <input type="number" required placeholder="Volume Pencarian Bulanan (Cth: 1500)" className="cyber-input" value={trendVolume} onChange={(e) => setTrendVolume(e.target.value)} />
                <button type="submit" className="cyber-btn">KUNCI TARGET TREN</button>
              </form>
            </div>

            <div className="cyber-panel">
              <h3 className="neon-title"> RADAR TELEMETRY DATABANK</h3>
              <table className="cyber-table">
                <thead>
                  <tr><th>KATA KUNCI</th><th>PERTUMBUHAN BULANAN</th><th>VOLUME MARKET</th><th className="text-center">AKSI</th></tr>
                </thead>
                <tbody>
                  {trends.map(t => (
                    <tr key={t.id}>
                      <td className="text-cyan font-mono">#{t.keyword}</td>
                      <td className={t.growth_pct >= 0 ? 'text-green' : 'text-red'}>
                        {t.growth_pct >= 0 ? `+${t.growth_pct}` : t.growth_pct}%
                      </td>
                      <td>{t.volume.toLocaleString('id-ID')} Hits/Bulan</td>
                      <td className="text-center">
                        <button className="table-action-btn delete-txt" onClick={() => handleDeleteTrend(t.id)}>[ELIMINASI]</button>
                      </td>
                    </tr>
                  ))}
                  {trends.length === 0 && <tr><td colSpan="4" className="text-center text-muted">Belum ada target tren pasar terekam.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: FINANCE CORE */}
        {viewMode === 'finance' && (
           <div className="module-container">
             <div className="cyber-panel form-panel">
               <h3 className="neon-title"> {editFinanceId ? 'PEMBARUAN TRANSAKSI' : 'INPUT TRANSAKSI BARU'}</h3>
               <form onSubmit={handleFinanceSubmit} className="cyber-form">
                 <select className="cyber-input" value={txType} onChange={(e) => setTxType(e.target.value)}>
                   <option value="INCOME">PEMASUKAN (INCOME)</option>
                   <option value="EXPENSE">PENGELUARAN (EXPENSE)</option>
                 </select>
                 <input type="number" required placeholder="Nominal (Rp)" className="cyber-input" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
                 <input type="text" required placeholder="Keterangan" className="cyber-input" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} />
                 <button type="submit" className={`cyber-btn ${editFinanceId ? 'warn-btn' : ''}`}>{editFinanceId ? 'PERBARUI' : 'EKSEKUSI'}</button>
               </form>
             </div>
             <div className="cyber-panel">
               <h3 className="neon-title"> BUKU BESAR DIGITAL (LEDGER)</h3>
               <table className="cyber-table">
                 <thead><tr><th>TANGGAL</th><th>TIPE</th><th>KETERANGAN</th><th>NOMINAL</th></tr></thead>
                 <tbody>{transactions.map(tx => (<tr key={tx.id}><td>{tx.date || 'Baru'}</td><td className={tx.type === 'INCOME' ? 'text-green' : 'text-red'}>{tx.type}</td><td>{tx.description}</td><td>Rp {(tx.amount || 0).toLocaleString('id-ID')}</td></tr>))}</tbody>
               </table>
             </div>
           </div>
        )}

        {/* VIEW: INVENTORY SYS */}
        {viewMode === 'inventory' && (
          <div className="module-container">
            <div className="cyber-panel form-panel">
              <h3 className="neon-title"> REGISTRASI BARANG</h3>
              <form onSubmit={handleInventorySubmit} className="cyber-form grid-form">
                <input type="text" required placeholder="Nama Produk" className="cyber-input col-span-2" value={prodName} onChange={(e) => setProdName(e.target.value)} />
                <input type="number" required placeholder="Stok" className="cyber-input" value={prodStock} onChange={(e) => setProdStock(e.target.value)} />
                <input type="number" required placeholder="Harga" className="cyber-input" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
                <button type="submit" className="cyber-btn col-span-2">SIMPAN</button>
              </form>
            </div>
            <div className="cyber-panel">
              <h3 className="neon-title"> INVENTORY MATRIX</h3>
              <table className="cyber-table">
                <thead><tr><th>NAMA</th><th>SISA STOK</th><th>HARGA</th></tr></thead>
                <tbody>{products.map(p => (<tr key={p.id}><td>{p.name}</td><td className="text-cyan">{p.stock} Unit</td><td>Rp {(p.price || 0).toLocaleString('id-ID')}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW: MARKETING / AI CONTENT (INI YANG KEMARIN TERPOTONG, SEKARANG SUDAH KEMBALI FULL) */}
        {viewMode === 'marketing' && (
          <div className="module-container">
            <div className="cyber-panel form-panel">
              <h3 className="neon-title"> NEURAL COPYWRITER ENGINE</h3>
              <form onSubmit={handleGenerateContent} className="cyber-form">
                <input type="text" required placeholder="Nama Produk" className="cyber-input" value={marketProdName} onChange={(e) => setMarketProdName(e.target.value)} />
                <textarea required placeholder="Fitur Produk (Pisahkan dengan koma)" className="cyber-input textarea-input" rows="3" value={marketFeatures} onChange={(e) => setMarketFeatures(e.target.value)}></textarea>
                <select className="cyber-input" value={marketTone} onChange={(e) => setMarketTone(e.target.value)}>
                  <option value="PROFESIONAL">GAYA: PROFESIONAL</option>
                  <option value="SANTAI">GAYA: SANTAI</option>
                  <option value="SCIFI">GAYA: CYBERPUNK</option>
                </select>
                <button type="submit" className="cyber-btn ai-btn" disabled={isGenerating}>
                  {isGenerating ? '[ GENERATING... ]' : 'GENERATE COPYWRITING'}
                </button>
              </form>
            </div>
            
            <div className="cyber-panel">
              <h3 className="neon-title"> OUTPUT TERMINAL</h3>
              <div className="ai-terminal">
                {isGenerating ? <span className="blinking-text">Compiling datasets & tokens...</span> : generatedContent ? <p className="typewriter-text">{generatedContent}</p> : <span className="text-muted">AWAITING PARAMETERS...</span>}
              </div>
              {generatedContent && !isGenerating && (
                <button className="cyber-btn copy-btn" onClick={() => navigator.clipboard.writeText(generatedContent)}>[ COPY TO CLIPBOARD ]</button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;