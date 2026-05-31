import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { 
  defaultWhatsAppNumber, 
  defaultThankYouMsg,
  defaultCompanyAddress,
  defaultLicenseNumber,
  defaultComplaintHotline,
  fallbackProducts
} from '../types';
import { 
  User, CheckCircle, Clock, AlertTriangle, Play, Save, 
  RefreshCw, KanbanSquare, Pencil, Sparkles, BookOpen, 
  Search, Trash2, Edit3, Settings, ShieldAlert, ArrowRight, DollarSign,
  Image as ImageIcon
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
  const [tab, setTab] = useState<'applications' | 'accounts' | 'settings' | 'faqs' | 'images'>('applications');

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

  // Site images state (Admin editable)
  const [logoInput, setLogoInput] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [savingImages, setSavingImages] = useState(false);
  const [productsImages, setProductsImages] = useState<{ id: string, slug: string, title: string, image_url: string }[]>([]);
  const [savingProductImgSlug, setSavingProductImgSlug] = useState<string | null>(null);

  // Client member custom application states
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [memberApplyAmount, setMemberApplyAmount] = useState('');
  const [memberSalary, setMemberSalary] = useState('');
  const [memberOccupation, setMemberOccupation] = useState('');
  const [memberHkid, setMemberHkid] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberNotes, setMemberNotes] = useState('');
  const [submittingMemberApply, setSubmittingMemberApply] = useState(false);

  // Admin approval modal states
  const [approvingApp, setApprovingApp] = useState<any | null>(null);
  const [approvedLoanAmount, setApprovedLoanAmount] = useState('');
  const [outstandingPrincipal, setOutstandingPrincipal] = useState('');
  const [totalBalance, setTotalBalance] = useState('');
  const [remainingPeriods, setRemainingPeriods] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [apr, setApr] = useState('');
  const [loanDate, setLoanDate] = useState('');
  const [loanDueDate, setLoanDueDate] = useState('');
  const [repaymentBank, setRepaymentBank] = useState('');
  const [repaymentAccount, setRepaymentAccount] = useState('');
  const [repaymentDay, setRepaymentDay] = useState('');
  const [loanNumber, setLoanNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('已批准');
  const [savingApproval, setSavingApproval] = useState(false);

  // Helper to parse serialized approved metadata
  const parseApprovalMetadata = (prevAppsStr: string) => {
    if (prevAppsStr && prevAppsStr.startsWith("APPROVED_METADATA:")) {
      try {
        const jsonStr = prevAppsStr.substring("APPROVED_METADATA:".length);
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

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

          // Logo & Hero Images
          const logoVal = settingsData.find(s => s.key === "logo_url")?.value || "https://grit-credit.com/assets/logo-D_TUe9TF.jpg";
          const heroVal = settingsData.find(s => s.key === "hero_background_url")?.value || "https://www.image2url.com/r2/default/images/1776426806509-5b7fb5f2-959c-4fdf-97c7-c7ba8d67a14e.jpg";
          setLogoInput(logoVal);
          setHeroInput(heroVal);
        }

        // Fetch products
        const { data: prodData } = await supabase.from("loan_products").select("id, slug, title, image_url").order("sort_order", { ascending: true });
        if (prodData && prodData.length > 0) {
          setProductsImages(prodData);
        } else {
          setProductsImages(fallbackProducts.map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            image_url: p.image_url
          })));
        }
      } else {
        // --- Client Member Dashboard Load ---
        const [accsRes, appsRes, profileRes] = await Promise.all([
          supabase.from("loan_accounts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("loan_applications").select("*").or(`user_id.eq.${user.id},email.eq.${user.email}`).order("created_at", { ascending: false }),
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

  // Admin action: open the approval form for a specific application
  const openApprovalModal = (app: any) => {
    setApprovingApp(app);
    const meta = parseApprovalMetadata(app.previous_applications) || {};
    
    setClientName(meta.client_name || app.name_chinese || '');
    setLoanNumber(meta.loan_number || `GRIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setApprovedLoanAmount(meta.approved_amount || app.loan_amount || '');
    setOutstandingPrincipal(meta.outstanding_principal || app.loan_amount || '');
    setTotalBalance(meta.total_balance || (app.loan_amount * 1.1).toFixed(0) || '');
    setRemainingPeriods(meta.remaining_periods || '12期');
    setMonthlyPayment(meta.monthly_payment || (app.loan_amount / 12 * 1.05).toFixed(0) || '');
    setApr(meta.apr || '12%');
    
    const todayStr = new Date().toISOString().substring(0, 10);
    setLoanDate(meta.loan_date || todayStr);
    
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().substring(0, 10);
    setLoanDueDate(meta.loan_due_date || nextYearStr);
    
    setRepaymentBank(meta.repayment_bank || '恒生銀行 (Hang Seng Bank)');
    setRepaymentAccount(meta.repayment_account || '852-1234-567890-001');
    setRepaymentDay(meta.repayment_day || '每月中15日');
    setApplicationStatus(app.status || '已批准');
  };

  const handleSaveApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingApp) return;
    setSavingApproval(true);
    try {
      const metaObj = {
        client_name: clientName,
        loan_number: loanNumber,
        approved_amount: Number(approvedLoanAmount),
        outstanding_principal: Number(outstandingPrincipal),
        total_balance: Number(totalBalance),
        remaining_periods: remainingPeriods,
        monthly_payment: Number(monthlyPayment),
        apr: apr,
        loan_date: loanDate,
        loan_due_date: loanDueDate,
        repayment_bank: repaymentBank,
        repayment_account: repaymentAccount,
        repayment_day: repaymentDay,
        status: applicationStatus
      };

      const serializedMetadata = "APPROVED_METADATA:" + JSON.stringify(metaObj);

      // 1. Update status and previous_applications metadata inside the loan_applications table
      const { error: appError } = await supabase
        .from("loan_applications")
        .update({
          status: applicationStatus,
          previous_applications: serializedMetadata, // store in existing column to avoid schema limits
          pre_approved_amount: Number(approvedLoanAmount)
        })
        .eq("id", approvingApp.id);

      if (appError) throw appError;

      // 2. Insert record in loan_accounts if approved
      if (applicationStatus === '已批准') {
        await supabase
          .from("loan_accounts")
          .insert([{
            user_id: approvingApp.user_id,
            loan_number: loanNumber,
            outstanding_balance: Number(totalBalance),
            next_payment_due: loanDueDate
          }]);
      }

      setToastMessage("✓ 申請審批及貸款約據簽存成功！");
      setTimeout(() => setToastMessage(''), 3500);
      setApprovingApp(null);
      loadDashboardData();
    } catch (err: any) {
      alert("審批存檔失敗：" + err.message);
    } finally {
      setSavingApproval(false);
    }
  };

  const handleMemberApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberApplyAmount || !memberSalary || !memberOccupation || !memberHkid || !memberPhone) {
      alert("請填寫所有必選星號 (*) 欄位！");
      return;
    }
    setSubmittingMemberApply(true);
    try {
      const { error } = await supabase.from("loan_applications").insert([{
        user_id: null, // Always keep null to bypass Supabase RLS restrictions for administrators
        name_chinese: displayName || "會員用戶",
        name_english: "",
        hkid: memberHkid.trim(),
        dob: "1990-01-01",
        gender: "未知",
        marital_status: "未婚",
        children: 0,
        phone: memberPhone.trim(),
        email: user?.email?.trim() || "",
        address: "顧客提供",
        property_type: "私人住宅",
        cohabitants: 1,
        occupation: memberOccupation.trim(),
        salary: Number(memberSalary) || 0,
        salary_method: "銀行轉賬",
        loan_amount: Number(memberApplyAmount) || 0,
        previous_applications: "沒有申請",
        referral_source: "會員中心",
        status: "審批中"
      }]);

      if (error) throw error;
      setToastMessage("✓ 貸款額度申請提交成功！我們的客戶團隊正在加緊為您核批！");
      setTimeout(() => setToastMessage(''), 4000);

      // Reset states
      setMemberApplyAmount('');
      setMemberSalary('');
      setMemberOccupation('');
      setMemberHkid('');
      setMemberPhone('');
      setMemberNotes('');
      setShowApplyForm(false);
      loadDashboardData();
    } catch (err: any) {
      alert("提交申請失敗：" + err.message);
    } finally {
      setSubmittingMemberApply(false);
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

  // Admin action: save updated logo & hero images in settings
  const handleSaveLogoHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingImages(true);
    try {
      const operations = [
        { key: "logo_url", value: logoInput },
        { key: "hero_background_url", value: heroInput }
      ];

      await Promise.all(operations.map(async (op) => {
        const { data } = await supabase.from("site_settings").select("id").eq("key", op.key).maybeSingle();
        if (data) {
          await supabase.from("site_settings").update({ value: op.value }).eq("key", op.key);
        } else {
          await supabase.from("site_settings").insert({ key: op.key, value: op.value });
        }
      }));

      // Cache updated values locally so they reflect instantly
      localStorage.setItem('site_logo_url', logoInput);
      localStorage.setItem('site_hero_url', heroInput);

      setToastMessage("✓ 品牌與宣傳大圖更變儲存成功！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("儲存圖片失敗：" + err.message);
    } finally {
      setSavingImages(false);
    }
  };

  // Admin action: save updated loan product image
  const handleSaveProductImage = async (slug: string, newUrl: string) => {
    setSavingProductImgSlug(slug);
    try {
      const { error } = await supabase
        .from('loan_products')
        .update({ image_url: newUrl })
        .eq('slug', slug);

      if (error) throw error;
      setToastMessage("✓ 貸款產品封面圖片更新成功！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("產品圖片儲存失敗：" + err.message);
    } finally {
      setSavingProductImgSlug(null);
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
              <button
                onClick={() => setTab('images')}
                className={`px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'images' 
                    ? "border-amber-500 text-amber-500" 
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
                id="tab-btn-images"
              >
                網站所有圖片管理
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
                                {app.previous_applications && app.previous_applications.startsWith("APPROVED_METADATA:") ? (
                                  <div className="space-y-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                      已批准 (正式信貸約據)
                                    </span>
                                    {(() => {
                                      const meta = parseApprovalMetadata(app.previous_applications);
                                      return meta ? (
                                        <div className="text-[10px] font-mono text-gray-500 leading-tight">
                                          編號: <span className="font-bold text-slate-800">{meta.loan_number}</span><br />
                                          額度: <span className="font-bold text-slate-800">HK$ {Number(meta.approved_amount).toLocaleString()}</span><br />
                                          供款: <span className="font-bold text-red-600">HK$ {Number(meta.monthly_payment).toLocaleString()}</span> ({meta.remaining_periods})
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    app.previous_applications === "沒有申請" 
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                      : "bg-red-50 text-red-600 border border-red-100"
                                  }`}>
                                    {app.previous_applications || "無資料"}
                                  </span>
                                )}
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

                                  {/* Action button to open detailed Approval form */}
                                  <button
                                    onClick={() => openApprovalModal(app)}
                                    className="px-2 h-7 text-[10px] font-bold rounded bg-slate-900 hover:bg-slate-800 uppercase text-white flex items-center gap-1 shadow-sm w-full justify-center transition-colors border border-slate-700 font-sans tracking-wide"
                                  >
                                    <Edit3 size={11} />
                                    <span>輸入審批/修改狀態</span>
                                  </button>
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

            {tab === 'images' && (
              <div className="space-y-6 animate-fade-in" id="panel-images">
                {/* 1. Global site brand & hero banner background images */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <ImageIcon className="text-amber-500" size={18} />
                    <h3 className="text-base font-bold text-gray-900">官方品牌與網站核心圖庫設定</h3>
                  </div>

                  <form onSubmit={handleSaveLogoHero} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Logo URL */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          傳載官方品牌標誌 (Website Logo URL)
                        </label>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                            {logoInput ? (
                              <img src={logoInput} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'https://grit-credit.com/assets/logo-D_TUe9TF.jpg'; }} />
                            ) : (
                              <span className="text-xs text-gray-400">無預覽</span>
                            )}
                          </div>
                          <div className="flex-1 col-span-1">
                            <input
                              type="text"
                              value={logoInput}
                              onChange={(e) => setLogoInput(e.target.value)}
                              placeholder="貼上新的 Logo 圖片 URL"
                              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800 mb-1"
                            />
                            <p className="text-[10px] text-gray-400">當前支持任何網路公開圖片連結位址</p>
                          </div>
                        </div>
                      </div>

                      {/* Hero Image */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          首頁主板大背景圖 (Hero Background URL)
                        </label>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                            {heroInput ? (
                              <img src={heroInput} alt="Hero" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.image2url.com/r2/default/images/1776426806509-5b7fb5f2-959c-4fdf-97c7-c7ba8d67a14e.jpg'; }} />
                            ) : (
                              <span className="text-xs text-gray-400">無預覽</span>
                            )}
                          </div>
                          <div className="flex-1 col-span-1">
                            <input
                              type="text"
                              value={heroInput}
                              onChange={(e) => setHeroInput(e.target.value)}
                              placeholder="貼上主板大景大宣傳圖片 URL"
                              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800 mb-1"
                            />
                            <p className="text-[10px] text-gray-400">用於首頁頂部歡迎版塊做全螢幕大圖展示</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={savingImages}
                        className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Save size={14} />
                        {savingImages ? "更新首頁圖片中..." : "保存核心宣傳圖變更"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Loan product cards covers list */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2 select-none">
                    <ImageIcon className="text-amber-500" size={18} />
                    <h3 className="text-base font-bold text-gray-900">官方貸款融資產品封面照片設定</h3>
                  </div>

                  <p className="text-xs text-gray-400">
                    設定貸款產品的大圖或列表形象封面（將同步渲染在官網主頁的借支項目特色卡片中）。
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productsImages.map((prod) => (
                      <ProductImageRow 
                        key={prod.id} 
                        product={prod} 
                        onSave={handleSaveProductImage}
                        isSaving={savingProductImgSlug === prod.slug}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          // ==================== CLIENT MEMBER VIEW ====================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="client-view">
            
            {/* Left 2 cols: current credit status & application forms */}
            <div className="lg:col-span-2 space-y-8" id="client-left-col">
              
              {/* MEMBER LOAN APPLICATION ACTION BLOCK */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-100" />
                    <span>特快會員專屬信用借支通道</span>
                  </h3>
                  <p className="text-xs text-amber-50 leading-relaxed max-w-lg font-medium">
                    作為認證會員，您可直接線上申請新的貸款額度，免除繁瑣流程，我們會在 15 分鐘內為您提供線上預核！
                  </p>
                </div>
                <button
                  onClick={() => setShowApplyForm(!showApplyForm)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs tracking-wider transition-all shadow-md self-start sm:self-auto shrink-0"
                >
                  {showApplyForm ? "✕ 關閉申請表單" : "✍️ 立即申請貸款"}
                </button>
              </div>

              {/* LOAN APPLICATION FORM */}
              {showApplyForm && (
                <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 sm:p-8 space-y-6 shadow-md animate-fade-in" id="member-direct-apply-form">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2 select-none">
                    <Edit3 className="text-amber-500" size={18} />
                    <h3 className="text-base font-extrabold text-slate-800">遞交特快融資額度申請</h3>
                  </div>

                  <form onSubmit={handleMemberApplySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          申請貸款金額 (HK$) *
                        </label>
                        <input
                          type="number"
                          required
                          value={memberApplyAmount}
                          onChange={(e) => setMemberApplyAmount(e.target.value)}
                          placeholder="例如: 20000"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          香港身份證號碼 (HKID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={memberHkid}
                          onChange={(e) => setMemberHkid(e.target.value)}
                          placeholder="例如: A123456(7)"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          聯絡手機號碼 *
                        </label>
                        <input
                          type="text"
                          required
                          value={memberPhone}
                          onChange={(e) => setMemberPhone(e.target.value)}
                          placeholder="例如: 91440242"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          當前月收入 (HK$) *
                        </label>
                        <input
                          type="number"
                          required
                          value={memberSalary}
                          onChange={(e) => setMemberSalary(e.target.value)}
                          placeholder="例如: 18000"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          當前工作職業 *
                        </label>
                        <input
                          type="text"
                          required
                          value={memberOccupation}
                          onChange={(e) => setMemberOccupation(e.target.value)}
                          placeholder="例如: 經理 / 技術員 / 文員"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        特殊備註或加急說明 (選填)
                      </label>
                      <textarea
                        rows={2}
                        value={memberNotes}
                        onChange={(e) => setMemberNotes(e.target.value)}
                        placeholder="如有其他收入流水或特別借調需求，請在此說明"
                        className="w-full p-4  rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowApplyForm(false)}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 text-slate-500 text-xs font-extrabold uppercase tracking-wide hover:bg-gray-50"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={submittingMemberApply}
                        className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-widest shadow-md transition-colors"
                      >
                        {submittingMemberApply ? "申請傳送中..." : "✔ 核准並送出申請"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Account Status summaries cards */}
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-6 shadow-sm" id="client-accounts-card">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-base font-bold text-gray-900 tracking-wider">
                    我的還款與貸款賬戶 (My Loan Accounts)
                  </h2>
                </div>

                {clientAccounts.length === 0 ? (
                  <div className="bg-amber-50/50 border border-amber-500/10 rounded-xl p-5 text-center text-xs text-slate-500 font-medium leading-relaxed">
                    您目前名下暫無生效中的還信貸帳簿合同紀錄。一經面簽發放放水後，融資科目與付款日賬單將同步展示在本處。
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientAccounts.map((acc, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50/10 transition-colors grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-sm leading-normal">
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase font-sans">貸款合約編號</div>
                          <div className="font-bold text-gray-900">{acc.loan_number || `GRIT-${acc.id.substring(0, 6)}`}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase font-sans">未還清結欠餘額</div>
                          <div className="font-bold text-red-600">HK$ {(acc.outstanding_balance || 0).toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase font-sans">下期賬單還款日</div>
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
                  <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                    目前暫無歷史線上申請表紀錄。
                  </div>
                ) : (
                  <div className="divide-y divide-gray-150 font-medium text-sm text-gray-650">
                    {clientApplications.map((app) => {
                      const meta = parseApprovalMetadata(app.previous_applications);
                      const isApproved = app.status === '已批准' && meta !== null;

                      if (isApproved && meta) {
                        return (
                          <div key={app.id} className="py-6 space-y-4" id={`approved-contract-card-${app.id}`}>
                            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl select-none">
                              <div className="space-y-0.5">
                                <div className="text-xs text-emerald-800 font-bold tracking-wider uppercase">🎉 恭喜！您申請的特快融資項目已批準簽署</div>
                                <div className="text-[11px] text-emerald-600 font-mono">貸款合約編號：{meta.loan_number}</div>
                              </div>
                              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-700 text-white tracking-widest leading-none">
                                已核准
                              </span>
                            </div>

                            {/* Grid of approved 14 characteristics */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4.5 bg-slate-50 border border-gray-150 p-5 rounded-2xl text-xs font-semibold text-slate-700 leading-normal shadow-inner animate-fade-in">
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">客戶名稱</div>
                                <div className="text-sm font-black text-slate-900">{meta.client_name || app.name_chinese}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">貸款合約編號</div>
                                <div className="text-xs font-black font-mono text-slate-950">{meta.loan_number}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">實批貸款額</div>
                                <div className="text-sm font-black font-mono text-amber-600">HK$ {Number(meta.approved_amount || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">其後未尚還本金</div>
                                <div className="text-sm font-black font-mono text-slate-800">HK$ {Number(meta.outstanding_principal || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">合約總結欠 (Total Arrears)</div>
                                <div className="text-sm font-black font-mono text-red-600">HK$ {Number(meta.total_balance || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">餘下還款期數</div>
                                <div className="text-sm font-black text-slate-800">{meta.remaining_periods}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">每月應供款額</div>
                                <div className="text-sm font-black font-mono text-slate-900">HK$ {Number(meta.monthly_payment || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">實際年利率 (APR)</div>
                                <div className="text-sm font-black font-mono text-emerald-600">{meta.apr}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">出款貸款生效日</div>
                                <div className="text-sm font-black font-mono text-slate-700">{meta.loan_date}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">終期貸款到期日</div>
                                <div className="text-sm font-black font-mono text-slate-700">{meta.loan_due_date}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">約定還款銀行</div>
                                <div className="text-sm font-black text-slate-800">{meta.repayment_bank}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">約定還款帳號</div>
                                <div className="text-sm font-black font-mono text-slate-800">{meta.repayment_account}</div>
                              </div>
                              <div className="space-y-1 font-sans col-span-2 md:col-span-3">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">約定還款日說明</div>
                                <div className="text-sm font-black text-amber-500">{meta.repayment_day}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">申請狀態</div>
                                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 tracking-wider">
                                  {app.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Pre-approved state (Pending)
                      return (
                        <div key={app.id} className="py-4.5 flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 last:border-0" id={`pending-contract-card-${app.id}`}>
                          <div className="space-y-1 leading-normal">
                            <div className="text-gray-900 font-bold text-sm">
                              申請融資金額：<span className="font-mono text-amber-600">HK$ {(app.loan_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="font-mono text-xs text-gray-450 leading-loose">
                              遞約日期: {new Date(app.created_at).toLocaleDateString('zh-HK')}
                            </div>
                            <div className="text-xs text-blue-600 font-bold bg-blue-50/50 border border-blue-100 rounded px-2.5 py-1 inline-block mt-1">
                              🌟 預批信用額度：HK$ {(app.pre_approved_amount || 0).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                              app.status === '未批准'
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`} id={`status-badge-${app.id}`}>
                              {app.status || '審批中'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
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

interface ProductImageRowProps {
  product: { id: string, slug: string, title: string, image_url: string };
  onSave: (slug: string, newUrl: string) => Promise<void>;
  isSaving: boolean;
}

const ProductImageRow: React.FC<ProductImageRowProps> = ({ product, onSave, isSaving }) => {
  const [url, setUrl] = useState(product.image_url);

  return (
    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col sm:flex-row gap-4" id={`prod-img-row-${product.slug}`}>
      <div className="w-full sm:w-28 h-20 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-inner">
        {url ? (
          <img 
            src={url} 
            alt={product.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://www.image2url.com/r2/default/images/1776426806509-5b7fb5f2-959c-4fdf-97c7-c7ba8d67a14e.jpg';
            }}
          />
        ) : (
          <span className="text-xs text-gray-400">無預覽</span>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h4 className="text-xs font-extrabold text-slate-800 mb-1">{product.title} ({product.slug})</h4>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="貼上貸款產品封面圖 URL"
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:ring-2 text-slate-800"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onSave(product.slug, url)}
            disabled={isSaving || url === product.image_url}
            className="px-3 h-8 rounded-md bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 shadow-sm"
          >
            <Save size={10} />
            {isSaving ? "更新中..." : "保存項目圖"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
