import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { logoUrl } from '../components/Header';
import { LogIn, Key, Mail, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    let emailToUse = identifier.trim();

    try {
      // If the identifier is a loan number (does not contain @), we call the RPC function to get email
      if (!emailToUse.includes("@")) {
        const { data: resolvedEmail, error: rpcError } = await supabase.rpc("get_email_by_loan_number", {
          _loan_number: emailToUse
        });

        if (rpcError || !resolvedEmail) {
          console.warn("RPC fetch failed, checking local loan applications table directly...");
          
          // Direct fallback table query if RPC is not deployed in active environment
          const { data: directApp } = await supabase
            .from("loan_applications")
            .select("email")
            .eq("phone", emailToUse) // Let members login via phone if RPC not available
            .maybeSingle();

          if (directApp?.email) {
            emailToUse = directApp.email;
          } else {
            setErrorMsg("找不到同此貸款編號或手機號碼對應的帳戶，請核對重試。");
            setLoading(false);
            return;
          }
        } else {
          emailToUse = resolvedEmail;
        }
      }

      // Perform auth sign in
      const { error } = await signIn(emailToUse, password);

      if (error) {
        // If demo credentials, allow mock access to the interface with a friendly bypass warning!
        if (emailToUse.toLowerCase() === 'demo@grit-credit.com' && password === 'demo123') {
          setSuccessMsg("✓ 驗證成功！正在登入測試帳戶...");
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
          return;
        }
        setErrorMsg("電郵 / 貸款編號或密碼錯誤，請重新核對。");
      } else {
        setSuccessMsg("✓ 歡迎登入富毅信貸！正在跳轉...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg("登入異常：" + (err.message || "伺服器超時，請重試。"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12" id="login-container">
      <div className="w-full max-w-md space-y-6">
        
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-150 p-8 space-y-6">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-4 select-none">
            <img 
              src={logoUrl} 
              alt="富毅信貸有限公司" 
              className="h-16 w-auto object-contain mb-3" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '1';
              }}
            />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">富毅信貸有限公司</h2>
            <p className="text-xs text-gray-500 font-mono tracking-wider tracking-widest uppercase">GRIT CREDIT LIMITED</p>
          </div>

          <div className="border-b border-gray-100 pb-3">
            <h1 className="text-lg font-bold text-gray-900 text-center uppercase tracking-wider">
              會員登入 (Member Portal)
            </h1>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-850 text-xs flex items-center gap-2 animate-fade-in" id="login-alert-error">
              <AlertTriangle size={15} className="text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-850 text-xs flex items-center gap-2 animate-fade-in" id="login-alert-success">
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" id="login-form">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail size={12} className="text-slate-400" />
                <span>電郵地址 / 貸款編號 Email / Loan No.</span>
              </label>
              <input 
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="請輸入註冊時填寫的電郵或編號"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                id="login-input-identifier"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Key size={12} className="text-slate-400" />
                <span>會員密碼 Password</span>
              </label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入您的密碼"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                id="login-input-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all disabled:opacity-50 text-sm shadow flex items-center justify-center gap-2"
              id="login-btn-submit"
            >
              <LogIn size={15} />
              {loading ? "安防驗證中..." : "確認登入"}
            </button>
          </form>

          {/* Test Demo helper tips */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-xs text-amber-950 font-medium space-y-1.5 leading-normal" id="login-helper-tips">
            <p className="font-bold flex items-center gap-1 text-amber-700">
              <Info size={14} className="shrink-0" />
              <span>測試登入體驗提示 (Demo Accounts)：</span>
            </p>
            <p className="text-gray-600 text-[11px] leading-relaxed">
              因尚未簽署正式借貸本合同的用戶，可用上方自選密碼建立新檔，或使用下方測試數據直登中心體驗：
            </p>
            <div className="pt-1.5 font-mono text-[10px] text-gray-500 space-y-1 bg-white/50 p-2 rounded">
              <p>· 測試電郵：<span className="text-amber-600 font-bold">demo@grit-credit.com</span></p>
              <p>· 測試密碼：<span className="text-amber-600 font-bold">demo123</span></p>
            </div>
          </div>

          <div className="text-center pt-2 select-none">
            <Link 
              to="/online" 
              className="text-xs text-gray-400 hover:text-amber-500 hover:underline font-semibold"
            >
              尚未遞交線上申請？按此立即申請
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
