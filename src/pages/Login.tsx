import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { getCachedLogo, fetchUpdatedImages } from '../lib/siteImages';
import { LogIn, Key, Mail, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [logo, setLogo] = useState(getCachedLogo());
  
  useEffect(() => {
    fetchUpdatedImages(setLogo);
  }, []);
  
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
    if (emailToUse.includes("@")) {
      emailToUse = emailToUse.toLowerCase();
    }

    try {
      // If the identifier is a loan number or phone (does not contain @), search Firestore
      if (!emailToUse.includes("@")) {
        console.log("Checking Firestore for phone match...");
        // Check if there's a loan application with this phone number
        const qPhone = query(collection(db, "loan_applications"), where("phone", "==", emailToUse), limit(1));
        const snapPhone = await getDocs(qPhone);

        if (!snapPhone.empty) {
          emailToUse = snapPhone.docs[0].data().email;
        } else {
          console.log("Checking Firestore for loan number match...");
          // Check if there's a loan account with this loan number
          const qLoan = query(collection(db, "loan_accounts"), where("loan_number", "==", emailToUse), limit(1));
          const snapLoan = await getDocs(qLoan);

          if (!snapLoan.empty) {
            const uid = snapLoan.docs[0].data().user_id;
            // Lookup application with this user_id to find email
            const qUid = query(collection(db, "loan_applications"), where("user_id", "==", uid), limit(1));
            const snapUid = await getDocs(qUid);
            if (!snapUid.empty) {
              emailToUse = snapUid.docs[0].data().email;
            } else {
              setErrorMsg("找不到與此貸款編號或手機號碼對應的帳戶，請核對重試。");
              setLoading(false);
              return;
            }
          } else {
            setErrorMsg("找不到與此貸款編號或手機號碼對應的帳戶，請核對重試。");
            setLoading(false);
            return;
          }
        }
      }

      // Perform auth sign in
      const { error } = await signIn(emailToUse, password);

      if (error) {
        const errorDetail = error.code ? `[${error.code}] ${error.message}` : (error.message || String(error));
        setErrorMsg(`電郵 / 貸款編號或密碼錯誤，請重新核對。（錯誤詳情: ${errorDetail}）`);
      } else {
        setSuccessMsg("✓ 歡迎登入譽高信貸！正在跳轉...");
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
              src={logo} 
              alt="譽高信貸(香港)有限公司" 
              className="h-16 w-auto object-contain mb-3" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '1';
              }}
            />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">譽高信貸(香港)有限公司</h2>
            <p className="text-xs text-gray-500 font-mono tracking-wider tracking-widest uppercase">Paramount Credit (h.k.) Limited</p>
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
