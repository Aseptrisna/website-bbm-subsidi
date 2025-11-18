import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Car, Fuel, AlertTriangle,
  TrendingUp, LogOut, Plus, Edit, Trash2,
  ChevronLeft, ChevronRight, Menu, X, User,
} from 'lucide-react';

// --- CONFIG & TYPES ---

const AUTH_API_URL = 'http://localhost:8000';
const DATA_API_URL = 'http://localhost:8000';

// interface UserData {
//   username: string;
//   token: string;
// }

interface Vehicle {
  id?: number;
  vehicle_id?: number; // Sometimes backend returns distinct ID names
  plat_nomor: string;
  nama_pemilik: string;
  jenis_kendaraan: string;
  kuota_bulanan_liter: number;
}

interface SPBU {
  id?: number;
  kode_spbu: string;
  nama_spbu: string;
  kota: string;
}

interface Transaction {
  id?: number;
  transaction_id?: number;
  vehicle_id: string;
  station_id: string;
  plat_nomor: string;
  kode_spbu: string;
  jenis_bbm: 'Pertalite' | 'Biosolar';
  volume_liter: number;
  waktu_transaksi: string;
}

interface AlertData {
  vehicle_id: number;
  plat_nomor: string;
  total_volume: number;
  kuota_bulanan_liter: number;
  over_quota: boolean;
}

interface RecommendationData {
  vehicle_id: number;
  plat_nomor: string;
  recommended_total_liter: number;
  method: string;
}

// --- COMPONENT: UI UTILS ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Button = ({
  onClick, children, variant = 'primary', className = "", type = "button", disabled = false
}: {
  onClick?: () => void, children: React.ReactNode, variant?: 'primary' | 'secondary' | 'danger' | 'outline', className?: string, type?: "button" | "submit", disabled?: boolean
}) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-95",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50"
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input
      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
      {...props}
    />
  </div>
);

const Select = ({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: { label: string, value: string | number }[] }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <select
      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
      {...props}
    >
      <option value="">-- Pilih --</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- PAGE: LOGIN ---

const LoginPage = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${AUTH_API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success || data.statusCode === 200) {
        onLogin(data.data.access_token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      // Fallback for demo purposes if API is not running
      if (username === 'admin' && password === 'admin') {
        onLogin('mock-token-123');
        alert("Mode Demo: Login Berhasil (API tidak terdeteksi)");
      } else {
        setError('Gagal terhubung ke server. Pastikan backend berjalan.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Fuel className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">BBM Subsidy Monitor</h1>
          <p className="text-slate-500">Masuk untuk mengelola data</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            placeholder="Masukkan username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

// --- DASHBOARD COMPONENTS ---

const VehiclesPage = ({ token }: { token: string }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plat_nomor: '', nama_pemilik: '', jenis_kendaraan: 'LAIN', kuota_bulanan_liter: 60
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${DATA_API_URL}/vehicles?page=${page}&size=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Handle different response structures usually found in pagination
        setVehicles(Array.isArray(data) ? data : (data.data || data.items || []));
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId
      ? `${DATA_API_URL}/vehicles/${editingId}`
      : `${DATA_API_URL}/vehicles`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchVehicles();
        setFormData({ plat_nomor: '', nama_pemilik: '', jenis_kendaraan: 'LAIN', kuota_bulanan_liter: 60 });
        setEditingId(null);
      }
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kendaraan ini?")) return;
    try {
      await fetch(`${DATA_API_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVehicles();
    } catch (err) { console.error(err); }
  };

  const openEdit = (v: Vehicle) => {
    setEditingId(v.id || v.vehicle_id || 0);
    setFormData(v);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Data Kendaraan</h2>
        <Button onClick={() => { setEditingId(null); setFormData({ plat_nomor: '', nama_pemilik: '', jenis_kendaraan: 'LAIN', kuota_bulanan_liter: 60 }); setModalOpen(true); }}>
          <Plus size={18} /> Tambah Kendaraan
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase">
                <th className="p-4">Plat Nomor</th>
                <th className="p-4">Pemilik</th>
                <th className="p-4">Jenis</th>
                <th className="p-4">Kuota (L)</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada data</td></tr>
              ) : (
                vehicles.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{v.plat_nomor}</td>
                    <td className="p-4 text-slate-600">{v.nama_pemilik}</td>
                    <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{v.jenis_kendaraan}</span></td>
                    <td className="p-4 text-slate-600">{v.kuota_bulanan_liter}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button onClick={() => openEdit(v)} className="text-yellow-600 hover:bg-yellow-50 p-2 rounded"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(v.id || v.vehicle_id || 0)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /></Button>
          <span className="flex items-center px-2 text-slate-600 font-medium">Hal {page}</span>
          <Button variant="outline" onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Kendaraan" : "Tambah Kendaraan"}>
        <form onSubmit={handleSubmit}>
          <Input label="Plat Nomor" value={formData.plat_nomor} onChange={e => setFormData({ ...formData, plat_nomor: e.target.value })} required />
          <Input label="Nama Pemilik" value={formData.nama_pemilik} onChange={e => setFormData({ ...formData, nama_pemilik: e.target.value })} required />
          <Select
            label="Jenis Kendaraan"
            options={[{ label: 'MOTOR', value: 'MOTOR' }, { label: 'MOBIL', value: 'MOBIL' }, { label: 'ANGKUTAN_UMUM', value: 'ANGKUTAN_UMUM' }, { label: 'LAIN', value: 'LAIN' }]}
            value={formData.jenis_kendaraan}
            onChange={e => setFormData({ ...formData, jenis_kendaraan: e.target.value })}
          />
          <Input label="Kuota (Liter)" type="number" value={formData.kuota_bulanan_liter} onChange={e => setFormData({ ...formData, kuota_bulanan_liter: parseInt(e.target.value) })} required />
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const SPBUPage = ({ token }: { token: string }) => {
  // Similar structure to VehiclesPage
  const [spbuList, setSpbuList] = useState<SPBU[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<SPBU>>({ kode_spbu: '', nama_spbu: '', kota: '' });
  const [loading, setLoading] = useState(false);

  const fetchSPBU = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${DATA_API_URL}/stations?page=1&size=10`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSpbuList(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSPBU(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${DATA_API_URL}/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      setModalOpen(false);
      fetchSPBU();
      setFormData({ kode_spbu: '', nama_spbu: '', kota: '' });
    } catch (e) { alert("Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Data SPBU</h2>
        <Button onClick={() => setModalOpen(true)}><Plus size={18} /> Tambah SPBU</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr><th className="p-4">Kode</th><th className="p-4">Nama SPBU</th><th className="p-4">Kota</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span>Memuat data transaksi...</span>
                  </div>
                </td>
              </tr>
            ) : spbuList.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada data transaksi</td></tr>
            ) : (spbuList.map((s, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-4 font-medium">{s.kode_spbu}</td>
                <td className="p-4">{s.nama_spbu}</td>
                <td className="p-4">{s.kota}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </Card>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tambah SPBU">
        <form onSubmit={handleSubmit}>
          <Input label="Kode SPBU" value={formData.kode_spbu} onChange={e => setFormData({ ...formData, kode_spbu: e.target.value })} required />
          <Input label="Nama SPBU" value={formData.nama_spbu} onChange={e => setFormData({ ...formData, nama_spbu: e.target.value })} required />
          <Input label="Kota" value={formData.kota} onChange={e => setFormData({ ...formData, kota: e.target.value })} required />
          <Button type="submit" className="w-full mt-4">Simpan</Button>
        </form>
      </Modal>
    </div>
  );
};

const TransactionsPage = ({ token }: { token: string }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [spbus, setSpbus] = useState<SPBU[]>([]);

  const [formData, setFormData] = useState<Partial<Transaction>>({
    plat_nomor: '', kode_spbu: '', jenis_bbm: 'Pertalite', volume_liter: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTx, resV, resS] = await Promise.all([
        fetch(`${DATA_API_URL}/transactions`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${DATA_API_URL}/vehicles`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${DATA_API_URL}/stations?page=1&size=100`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resTx.ok) setTransactions((await resTx.json()).data || []);
      if (resV.ok) setVehicles((await resV.json()).data || []);
      if (resS.ok) setSpbus((await resS.json()).data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      waktu_transaksi: new Date().toISOString()
    };
    console.log(payload)
    try {
      const res = await fetch(`${DATA_API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
      }
    } catch (e) { alert("Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Riwayat Transaksi</h2>
        <Button onClick={() => setModalOpen(true)}><Plus size={18} /> Transaksi Baru</Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-4">Waktu</th>
              <th className="p-4">Kendaraan ID</th>
              <th className="p-4">SPBU ID</th>
              <th className="p-4">BBM</th>
              <th className="p-4">Volume</th>
            </tr>
          </thead>
          <tbody>

            {
              loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span>Memuat data transaksi...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada data transaksi</td></tr>
              ) : (
                transactions.map((t, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-500">{new Date(t.waktu_transaksi).toLocaleString()}</td>
                    <td className="p-4 font-medium">{t.vehicle_id}</td>
                    <td className="p-4">{t.station_id}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${t.jenis_bbm === 'Biosolar' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{t.jenis_bbm}</span></td>
                    <td className="p-4">{t.volume_liter} L</td>
                  </tr>
                )))}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Input Transaksi">
        <form onSubmit={handleSubmit}>
          <Select
            label="Kendaraan"
            options={vehicles.map(v => ({ label: `${v.plat_nomor} - ${v.nama_pemilik}`, value: v.plat_nomor }))}
            value={formData.plat_nomor}
            onChange={e => setFormData({ ...formData, plat_nomor: e.target.value })}
            required
          />
          <Select
            label="SPBU"
            options={spbus.map(s => ({ label: `${s.nama_spbu} (${s.kota})`, value: s.kode_spbu }))}
            value={formData.kode_spbu}
            onChange={e => setFormData({ ...formData, kode_spbu: e.target.value })}
            required
          />
          <Select
            label="Jenis BBM"
            options={[{ label: 'Pertalite', value: 'Pertalite' }, { label: 'Biosolar', value: 'Solar' }]}
            value={formData.jenis_bbm}
            onChange={e => setFormData({ ...formData, jenis_bbm: e.target.value as any })}
            required
          />
          <Input label="Volume (Liter)" type="number" value={formData.volume_liter} onChange={e => setFormData({ ...formData, volume_liter: parseFloat(e.target.value) })} required />
          <Button type="submit" className="w-full mt-4">Simpan Transaksi</Button>
        </form>
      </Modal>
    </div>
  );
};

const AlertsPage = ({ token }: { token: string }) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [month, setMonth] = useState('2025-11');

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${DATA_API_URL}/transactions/alerts/over-quota?month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAlerts(json.data || []);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAlerts(); }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Peringatan Over Kuota
          </h2>
          <p className="text-slate-500">Kendaraan yang melebihi kuota bulanan</p>
        </div>
        <div className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <label className="text-sm font-medium text-slate-600">Periode:</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="outline-none bg-transparent font-semibold text-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            Tidak ada kendaraan over kuota pada periode ini.
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border-l-4 border-red-500 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertTriangle size={64} className="text-red-500" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{alert.plat_nomor}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">Over Limit</p>
                </div>
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                  {Math.round(((alert.total_volume - alert.kuota_bulanan_liter) / alert.kuota_bulanan_liter) * 100)}% Excess
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Terpakai</span>
                    <span className="font-bold text-red-600">{alert.total_volume} L</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Batas Kuota</span>
                  <span className="font-medium text-slate-800">{alert.kuota_bulanan_liter} L</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const RecommendationsPage = ({ token }: { token: string }) => {
  const [data, setData] = useState<RecommendationData[]>([]);
  const [year, setYear] = useState(2026);

  const fetchRecs = async () => {
    try {
      const res = await fetch(`${DATA_API_URL}/recommendations/predict?year=${year}&method=simple_average`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchRecs(); }, [year]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="text-blue-200" /> AI Recommendation
            </h2>
            <p className="text-blue-100 max-w-xl">
              Sistem prediksi kuota BBM berdasarkan riwayat penggunaan menggunakan metode Simple Moving Average.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
            <label className="block text-xs text-blue-200 mb-1">Tahun Prediksi</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="bg-transparent text-white font-bold text-xl w-20 outline-none"
            />
          </div>
        </div>
      </div>

      <Card>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4">Kendaraan</th>
              <th className="p-4">Metode</th>
              <th className="p-4 text-right">Rekomendasi Kuota (Tahun)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, i) => (
              <tr key={i}>
                <td className="p-4 font-bold text-slate-700">{item.plat_nomor}</td>
                <td className="p-4 text-slate-500 text-sm font-mono">{item.method}</td>
                <td className="p-4 text-right font-bold text-blue-600 text-lg">{item.recommended_total_liter.toLocaleString()} L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

// --- MAIN APP LAYOUT & ROUTING ---

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [view, setView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <TransactionsPage token={token} />; // Default to transactions as dashboard
      case 'vehicles': return <VehiclesPage token={token} />;
      case 'spbu': return <SPBUPage token={token} />;
      case 'alerts': return <AlertsPage token={token} />;
      case 'recommendations': return <RecommendationsPage token={token} />;
      default: return <TransactionsPage token={token} />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => { setView(id); if (window.innerWidth < 768) setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1
        ${view === id
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-30 w-64 bg-white border-r border-slate-200 h-full flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Fuel className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">BBM Monitor</h1>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase px-4 mb-2 tracking-wider">Menu Utama</p>
          <NavItem id="dashboard" icon={LayoutDashboard} label="Transaksi" />
          <NavItem id="vehicles" icon={Car} label="Data Kendaraan" />
          <NavItem id="spbu" icon={Fuel} label="Data SPBU" />

          <p className="text-xs font-bold text-slate-400 uppercase px-4 mb-2 mt-6 tracking-wider">Analitik</p>
          <NavItem id="alerts" icon={AlertTriangle} label="Peringatan Kuota" />
          <NavItem id="recommendations" icon={TrendingUp} label="Prediksi AI" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
              <User size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">Admin Petugas</p>
              <p className="text-xs text-slate-500">Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
            <Menu size={24} className="text-slate-600" />
          </button>
          <span className="font-bold text-slate-800">Subsidy Monitor</span>
          <div className="w-8"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;