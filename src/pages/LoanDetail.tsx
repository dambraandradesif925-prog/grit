import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LoanProduct, fallbackProducts } from '../types';
import { ArrowLeft, Send, CheckCircle, ShieldCheck, HelpCircle } from 'lucide-react';

const LoanDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<LoanProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const fetchLoan = async () => {
      try {
        const q = query(collection(db, "loan_products"), where("slug", "==", slug), limit(1));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const doc = snap.docs[0];
          setLoan({ id: doc.id, ...doc.data() } as LoanProduct);
        } else {
          const localMatch = fallbackProducts.find(p => p.slug === slug);
          setLoan(localMatch ?? null);
        }
      } catch (e) {
        const localMatch = fallbackProducts.find(p => p.slug === slug);
        setLoan(localMatch ?? null);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-20" id="detail-loading-container">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm font-medium">貸款方案載入中...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" id="detail-notfound-container">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-150 p-8 text-center space-y-4">
          <HelpCircle size={48} className="text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-950">找不到此貸款方案</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            抱歉，得不到對應所選參數的任何有效信貸商品，請檢查訪問連結。
          </p>
          <div className="pt-2">
            <Link 
              to="/" 
              className="inline-flex px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors"
            >
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Simple clean standard markdown line renderer to bypass extra complex bundle loaders
  const renderContentLines = (contentMarkdown: string) => {
    const sections = contentMarkdown.split('\n');
    return sections.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-8 mb-4 border-b border-gray-100 pb-2">{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-base sm:text-lg font-bold text-amber-600 mt-6 mb-3">{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith('- ')) {
        // Bullet list item
        return (
          <div key={idx} className="flex items-start gap-2.5 py-1 text-sm text-gray-600 leading-relaxed pl-2">
            <div className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0" />
            <span>{trimmed.slice(2)}</span>
          </div>
        );
      }
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-sm text-gray-600 leading-relaxed py-1.5">{trimmed}</p>;
    });
  };

  return (
    <div id="product-detail-container" className="bg-gray-50 min-h-screen">
      {/* Dynamic Jumbotron Cover with Image and Overlay */}
      <section 
        className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-amber-500 select-none"
        style={{
          backgroundImage: `linear-gradient(rgba(13, 27, 42, 0.72), rgba(13, 27, 42, 0.85)), url(${loan.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        id="detail-jumbotron"
      >
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white uppercase tracking-wider font-semibold group transition-all"
            id="detail-back-link"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>返回貸款首頁</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider">
            專業合规放債人
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight" id="detail-title">
            {loan.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl" id="detail-desc">
            {loan.description}
          </p>
        </div>
      </section>

      {/* Main product article */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="detail-main-article">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Article Contents */}
          <article className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-2 shadow-sm" id="detail-article-card">
            {renderContentLines(loan.content)}
          </article>

          {/* Quick Apply Panel Sidebar Card */}
          <aside className="space-y-6" id="detail-sidebar">
            <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white rounded-2xl p-6 border border-gray-850 shadow-lg space-y-5">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <ShieldCheck className="text-amber-500" size={22} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500">
                  譽高信譽保證
                </h3>
              </div>

              <ul className="space-y-3.5 text-xs text-gray-300 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>香港特別行政區正式批核放債牌照</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>最快即辦即過，免除冗長傳統信核繁複環節</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>利率明晰、絕無任何隱形前期中介佣金雜費</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>高度密保隱私數據系統防護保障</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-white/10">
                <Link
                  to="/online"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-amber-500 text-white font-bold text-sm text-center hover:bg-amber-600 transition-colors shadow-lg"
                  id="sidebar-btn-apply"
                >
                  <Send size={15} />
                  立即線上申請
                </Link>
                <Link
                  to="/"
                  className="block text-center mt-3 text-xs text-gray-400 hover:text-white transition-colors"
                  id="sidebar-btn-back"
                >
                  返回主計算機試算
                </Link>
              </div>
            </div>

            {/* Quick Hotline Support card */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm text-center space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                人工專員答疑
              </h4>
              <p className="text-sm text-gray-600 leading-normal">
                任何對於此方案的費率細折、或者所需文件不明？
              </p>
              <div className="pt-1.5 font-bold text-base text-amber-500 font-mono">
                WhatsApp: 91440242
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default LoanDetail;
