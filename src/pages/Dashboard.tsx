import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  defaultWhatsAppNumber, 
  defaultThankYouMsg,
  defaultCompanyAddress,
  defaultLicenseNumber,
  defaultComplaintHotline
} from '../types';
import { 
  User, CheckCircle, Clock, AlertTriangle, Play, Save, 
  RefreshCw, KanbanSquare, Pencil, Sparkles, BookOpen, 
  Search, Trash2, Edit3, Settings, ShieldAlert, ArrowRight, DollarSign
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Common loading states
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [tab, setTab] = useState<'applications' | 'accounts' | 'settings' | 'faqs'>('applications');

  // Client states
  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [clientApplications, setClientApplications] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState('');

  // Admin states
  const [adminApplications, setAdminApplications] = useState<any[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Site settings state (Admin editable)
  const [settingsForm, setSettingsForm] = useState({
    whatsapp: defaultWhatsAppNumber,
    thankYouMsg: defaultThankYouMsg,
    license: defaultLicenseNumber,
    address: defaultCompanyAddress,
    hotline: defaultComplaintHotline
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Load dashboard dataset
  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (isAdmin) {
        // --- Admin Dashboard Load ---
        const [appsRes, accsRes, profilesRes] = await Promise.all([
          supabase.from("loan_applications").select("*").order("created_at", { ascending: false }),
          supabase.from("loan_accounts").select("*").order("created_at", { ascending: false }),
          supabase.from("profiles").select("*")
        ]);

        if (appsRes.data) setAdminApplications(appsRes.data);
        if (accsRes.data) setAdminAccounts(accsRes.data);
        if (profilesRes.data) setAdminUsers(profilesRes.data);

        // Fetch current active site settings for editing
        const { data: settingsData } = await supabase.from("site_settings").select("*");
        if (settingsData) {
          const w = settingsData.find(s => s.key === "whatsapp_number")?.value || defaultWhatsAppNumber;
          const t = settingsData.find(s => s.key === "registration_thank_you")?.value || defaultThankYouMsg;
          const l = settingsData.find(s => s.key === "license_number")?.value || defaultLicenseNumber;
          const a = settingsData.find(s => s.key === "company_address")?.value || defaultCompanyAddress;
          const h = settingsData.find(s => s.key === "complaint_hotline")?.value || defaultComplaintHotline;
          
          setSettingsForm({
            whatsapp: w,
            thankYouMsg: t,
            license: l,
            address: a,
            hotline: h
          });
        }
      } else {
        // --- Client Member Dashboard Load ---
        const [accsRes, appsRes, profileRes] = await Promise.all([
          supabase.from("loan_accounts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("loan_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
        ]);

        setClientAccounts(accsRes.data ?? []);
        setClientApplications(appsRes.data ?? []);
        
        const clientName = profileRes.data?.display_name || (appsRes.data && appsRes.data.length > 0 ? appsRes.data[0].name_chinese : "尊敬的會員");
        setDisplayName(clientName);
      }
    } catch (err) {
      console.error("Dashboard Loading Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, isAdmin, authLoading]);

  // Admin action: updates registration application status
  const updateApplicationStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("loan_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setToastMessage("✓ 申請狀態更新成功！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("狀態更新失敗: " + err.message);
    }
  };

  // Admin action: change pre-approved credit amount
  const handleUpdateAmount = async (id: string, newAmount: number) => {
    try {
      const { error } = await supabase
        .from("loan_applications")
        .update({ pre_approved_amount: newAmount })
        .eq("id", id);

      if (error) throw error;
      setToastMessage("✓ 預審信用額度更新成功！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("額度調整失敗: " + err.message);
    }
  };

  // Admin action: delete historical application record
  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm("確認要永久刪除此客戶的貸款申請歷史紀錄嗎？此動作不可撤銷。")) return;
    try {
      const { error } = await supabase
        .from("loan_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setToastMessage("✓ 紀錄已永久刪除！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("刪除失敗: " + err.message);
    }
  };

  // Admin action: save updated settings in tables
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const operations = [
        { key: "whatsapp_number", value: settingsForm.whatsapp },
        { key: "registration_thank_you", value: settingsForm.thankYouMsg },
        { key: "license_number", value: settingsForm.license },
        { key: "company_address", value: settingsForm.address },
        { key: "complaint_hotline", value: settingsForm.hotline }
      ];

      await Promise.all(operations.map(async (op) => {
        const { data } = await supabase.from("site_settings").select("id").eq("key", op.key).maybeSingle();
        if (data) {
          await supabase.from("site_settings").update({ value: op.value }).eq("key", op.key);
        } else {
          await supabase.from("site_settings").insert({ key: op.key, value: op.value });
        }
      }));

      setToastMessage("✓ 網站全域參數儲存修改生效！");
      setTimeout(() => setToastMessage(''), 3500);
      loadDashboardData();
    } catch (err: any) {
      alert("參數修改失敗：" + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12" id="dashboard-loading">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">正在核驗並載入安全數據庫面版...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 text-slate-800" id="main-dashboard-portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Toast Warning */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 animate-slide-down font-medium text-sm">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dashboard Banner Header */}
        <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border-b-4 border-amber-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 select-none">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
              {isAdmin ? "總監系統平台 (SYSTEM CONSOLE)" : "信貸帳戶面版 (CLIENT PORTAL)"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isAdmin ? "富毅信貸管理控制中心" : `您好，${displayName}`}
            </h1>
            <p className="text-xs text-gray-300">
              安全管理身分登入會話：{user?.email} · 在線受加密保障
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              title="重新載入"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold text-xs tracking-wider transition-colors"
            >
              登出會話
            </button>
          </div>
        </div>

        {isAdmin ? (
          // ==================== ADMIN SYSTEM VIEW ====================
          <div className="space-y-8" id="admin-view">
            {/* Summary statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="admin-stats">
              <div className="bg-white rounded-xl p-5 border border-gray-150 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  累計遞交申請單
                </div>
                <div className="text-2xl font-black text-amber-500 font-mono">
                  {adminApplications.length} 件
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-150 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  審批中待處理
                </div>
                <div className="text-2xl font-black text-blue-500 font-mono">
                  {adminApplications.filter(a => a.status === "審批中").length} 件
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-150 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  已有核准合同
                </div>
                <div className="text-2xl font-black text-emerald-500 font-mono">
                  {adminApplications.filter(a => a.status === "已批准").length} 件
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-150 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  總貸款帳號數
                </div>
                <div className="text-2xl font-black text-slate-700 font-mono">
                  {adminAccounts.length} 戶
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-px" id="admin-tabs">
              <button
                onClick={() => setTab('applications')}
                className={`px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'applications' 
                    ? "border-amber-500 text-amber-500" 
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                線上申請件核定 ({adminApplications.length})
              </button>
              <button
                onClick={() => setTab('settings')}
                className={`px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'settings' 
                    ? "border-amber-500 text-amber-500" 
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                網站全域核心設定
              </button>
            </div>

            {/* Tab: Applications Table panel */}
            {tab === 'applications' && (
              <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm" id="admin-apps-tab">
                <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50 select-none">
                  <h2 className="text-sm font-bold text-gray-900 tracking-wider flex items-center gap-1.5">
                    <Search size={16} className="text-slate-400" />
                    <span>線上特快申請名錄 (Applications Record)</span>
                  </h2>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">過濾狀態:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2.5 py-1 text-xs border border-gray-200 rounded bg-white text-slate-700 focus:outline-none"
                    >
                      <option value="all">顯示全部</option>
                      <option value="審批中">審批中</option>
                      <option value="已批准">已核准</option>
                      <option value="未批准">已拒绝</option>
                    </select>
                  </div>
                </div>

                {adminApplications.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    目前合約庫尚無任何遞交的線上申請表紀錄。
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider select-none">
                          <th className="px-6 py-4.5">客戶姓名 & 資訊</th>
                          <th className="px-6 py-4.5">申請金額</th>
                          <th className="px-6 py-4.5">工作與月收</th>
                          <th className="px-6 py-4.5">信用宣告</th>
                          <th className="px-6 py-4.5">預核信用額度 / 修改狀態</th>
                          <th className="px-6 py-4.5 text-center">歷史處置</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                        {adminApplications
                          .filter(a => filterStatus === 'all' || a.status === filterStatus)
                          .map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4.5">
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-gray-900">
                                    {app.name_chinese} <span className="text-[10px] text-gray-400 font-normal">({app.gender})</span>
                                  </div>
                                  <div className="font-mono text-[11px] text-gray-500">
                                    {app.name_english} · ID: {app.hkid}
                                  </div>
                                  <div className="text-[10px] text-gray-400 leading-normal">
                                    Tel: {app.phone} | {app.email}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    住址: {app.address} ({app.property_type})
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className="font-bold font-mono text-gray-900 text-sm">
                                  HK$ {(app.loan_amount || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="space-y-1">
                                  <div>職：{app.occupation}</div>
                                  <div className="font-mono text-amber-600">
                                    薪：HK$ {(app.salary || 0).toLocaleString()} ({app.salary_method})
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  app.previous_applications === "沒有申請" 
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                    : "bg-red-50 text-red-600 border border-red-100"
                                }`}>
                                  {app.previous_applications || "無資料"}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="space-y-2 max-w-xs">
                                  {/* Inline Amount Editor */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-extrabold text-gray-400">預核HKD:</span>
                                    <input
                                      type="number"
                                      defaultValue={app.pre_approved_amount || 0}
                                      onBlur={(e) => handleUpdateAmount(app.id, Number(e.target.value) || 0)}
                                      className="w-24 h-7 text-xs px-2 border border-gray-200 rounded bg-white text-slate-800"
                                    />
                                  </div>

                                  {/* Action dropdown for setting status */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-extrabold text-gray-400">定狀態:</span>
                                    <select
                                      value={app.status || '審批中'}
                                      onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                                      className={`px-2 py-0.5 text-[11px] rounded font-bold border ${
                                        app.status === '已批准'
                                          ? "bg-emerald-50 text-emerald-600 border-emerald-250"
                                          : app.status === '未批准'
                                          ? "bg-red-50 text-red-600 border-red-100"
                                          : "bg-blue-50 text-blue-600 border-blue-200"
                                      }`}
                                    >
                                      <option value="審批中">審批中</option>
                                      <option value="已批准">已核備 (Approved)</option>
                                      <option value="未批准">拒核退 (Rejected)</option>
                                    </select>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-center">
                                <button
                                  onClick={() => handleDeleteApplication(app.id)}
                                  className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 hover:text-red-700 transition-colors"
                                  title="刪除"
                                  id={`delete-btn-${app.id}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Config Settings Page */}
            {tab === 'settings' && (
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm max-w-3xl" id="admin-settings-tab">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                  <Settings size={20} className="text-amber-500" />
                  <h2 className="text-base font-extrabold text-slate-800">全域核心配置設定</h2>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5" id="settings-admin-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        飄浮 WhatsApp 聯絡官號 (例如: 85291440242)
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                        id="setting-whatsapp"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        投訴及諮詢官方熱線
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.hotline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                        id="setting-hotline"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      線上表格提交成功後的「感謝回覆訊息」官網公告文本
                    </label>
                    <textarea 
                      rows={3}
                      value={settingsForm.thankYouMsg}
                      onChange={(e) => setSettingsForm({ ...settingsForm, thankYouMsg: e.target.value })}
                      required
                      className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                      id="setting-thank-you"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        備案放債人執照/牌照號碼
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.license}
                        onChange={(e) => setSettingsForm({ ...settingsForm, license: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                        id="setting-license"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        總行實體執照大廈辦事處地址
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                        id="setting-address"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                      id="save-settings-btn"
                    >
                      <Save size={14} />
                      {savingSettings ? "儲存更新中..." : "保存全域參數變更"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          // ==================== CLIENT MEMBER VIEW ====================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="client-view">
            
            {/* Left 2 cols: current credit status */}
            <div className="lg:col-span-2 space-y-8" id="client-left-col">
              
              {/* Account Status summaries cards */}
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-6 shadow-sm" id="client-accounts-card">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-base font-bold text-gray-900 tracking-wider">
                    我的還款與貸款賬戶 (My Loan Accounts)
                  </h2>
                </div>

                {clientAccounts.length === 0 ? (
                  <div className="bg-amber-50/50 border border-amber-500/10 rounded-xl p-5 text-center text-xs text-slate-500 font-medium">
                    您目前名下暫無生效中的還信貸帳簿合同紀錄。一經面簽發放放水後，融資科目與付款日賬單將同步展示在本處。
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientAccounts.map((acc, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50/10 transition-colors grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-sm">
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase">貸款合約編號</div>
                          <div className="font-bold text-gray-900">{acc.loan_number || `GRIT-${acc.id.slice(0, 6)}`}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase">未還清結欠餘額</div>
                          <div className="font-bold text-red-600">HK$ {(acc.outstanding_balance || 0).toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase">下期賬單還款日</div>
                          <div className="font-bold text-amber-600">
                            {acc.next_payment_due ? new Date(acc.next_payment_due).toLocaleDateString('zh-HK') : '無期數'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Online applications review history */}
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-6 shadow-sm" id="client-applications-history">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-base font-bold text-gray-900 tracking-wider">
                    我的線上申請歷史紀錄 (Applications History)
                  </h2>
                </div>

                {clientApplications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    目前暫無歷史線上申請表紀錄。
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 font-medium text-sm text-gray-600">
                    {clientApplications.map((app) => (
                      <div key={app.id} className="py-4.5 flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-1">
                          <div className="text-gray-900 font-bold text-sm">
                            申請：HK$ {(app.loan_amount || 0).toLocaleString()}
                          </div>
                          <div className="font-mono text-xs text-gray-400">
                            申請日期: {new Date(app.created_at).toLocaleDateString('zh-HK')}
                          </div>
                          {app.pre_approved_amount > 0 && (
                            <div className="text-xs text-emerald-600 font-bold">
                              ✓ 預核核備額度: HK$ {app.pre_approved_amount.toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                            app.status === '已批准'
                              ? "bg-emerald-100 text-emerald-700"
                              : app.status === '未批准'
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`} id={`status-badge-${app.id}`}>
                            {app.status || '審批中'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Right sidebar details */}
            <div className="space-y-6" id="client-right-col">
              <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white rounded-2xl p-6 border border-gray-850 shadow-md space-y-4">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-white/10 pb-3">
                  線上專人快捷融資通道
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                  由於您的有些信貸項目可能需要線上面簽、提供薪酬流水原件或證件正本。如需催辦進度或有任何還款期數微調需求，請直接點擊下方：
                </p>
                <div className="pt-2">
                  <a
                    href="https://wa.me/85291440242?text=你好，我是富毅信貸會員，我想加速審批我的特快信貸申請表"
                    target="_blank"
                    rel="noopener noreferrer referrerPolicy=no-referrer"
                    className="flex items-center justify-center gap-1.5 w-full py-3 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors text-xs uppercase tracking-wider shadow"
                  >
                    WhatsApp 加急審核
                  </a>
                </div>
              </div>

              {/* Secure notification */}
              <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-3 font-semibold">
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                  會員安全保障
                </h4>
                <div className="text-xs text-gray-500 space-y-1.5 leading-normal font-medium">
                  <p>1. 切勿隨意洩漏您的登密碼，以防止敏感信貸歷史遭冒名盗查。</p>
                  <p>2. 富毅信貸絕對不會在未經書面授權下，洩漏您的資料與 TU 信評軌跡給無關三方。</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
