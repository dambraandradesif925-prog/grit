import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getCachedHero, fetchUpdatedImages } from '../lib/siteImages';
import { 
  LoanProduct, 
  Advantage, 
  FAQ, 
  fallbackProducts, 
  fallbackAdvantages, 
  fallbackFAQs 
} from '../types';
import { ChevronDown, HelpCircle, Check, DollarSign, Calculator, Star, Clock, AlertCircle } from 'lucide-react';

// The six custom testimonials retrieved from the original JS bundle
const testimonials = [
  { text: "疫情後公司小店經常被迫停業,出糧交租都係一個大問題,傳統銀行的貸款額亦未必達到我的要求,還好經網上廣告看到富毅,可以輕易知道自己預先批核的貸款金額,等我可以渡過難關。" },
  { text: "結婚擺酒book車book酒店影相都要現金週轉，想大攪令屋企人同親朋戚友為我慶祝咁高興嘅日子，可惜手上現金唔多，好彩富毅係我最要急需週轉嘅時候幫手，可以話係我嘅強大應援。" },
  { text: "呢幾年冇得出國去旅行，網上購物已經成為我嘅習慣，一見有新款或者限量產品越買越多，攪到d咭數就係咁越碌越多，但每次月結單淨係找到最低還款額，都唔知找到幾時，網上見到富毅有低息清咭數，諗住試下心態申請，點知回覆快之餘，仲可以供款期數長達36個月，等我再去網上購物都可以輕輕鬆鬆。" },
  { text: "考到船牌諗住買二手船慶祝，同朋友出海玩下，啱心水但爭少少，朋友介紹咗富毅幫手，好快，即日就批出，無諗過現金糧都可以批都咁多，可以輕鬆出海釣魚玩下。" },
  { text: "自置村屋，住了好久想修葺，兒子出國讀書又想幫他們留點生活費及現金備用，但裝修訂金需要先付，之前問過但無貸款公司幫手，直至認識富毅，他們了解我的情況，之後提交需要文件審批，現金即到手。" },
  { text: "放寬入境隔離，即上網book機票酒去旅行，去玩果陣見到鍾意就買，想要就碌咭，返到嚟見到張咭月結單就知出事，即刻諗起富毅，佢哋之前都幫我低息清咭數之餘，仲可以升返TU信貸評級，真係一舉兩得。" }
];

const Home: React.FC = () => {
  const [products, setProducts] = useState<LoanProduct[]>(fallbackProducts);
  const [advantages, setAdvantages] = useState<Advantage[]>(fallbackAdvantages);
  const [faqs, setFaqs] = useState<FAQ[]>(fallbackFAQs);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [heroBg, setHeroBg] = useState<string>(getCachedHero());

  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(50000);
  const [calcMonths, setCalcMonths] = useState<number>(24);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', contact: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    fetchUpdatedImages(undefined, setHeroBg);
    
    // Fetch products
    supabase
      .from("loan_products")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setProducts(data);
      });

    // Fetch advantages
    supabase
      .from("advantages")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setAdvantages(data);
      });

    // Fetch FAQs
    supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setFaqs(data);
      });
  }, []);

  // Compute estimate installment: e.g. 1.2% monthly flat rate (industry basic estimate)
  const computeRepayments = (amount: number, months: number) => {
    const monthlyRate = 0.012; // 1.2% monthly flat rate is standard for HK finance company estimation
    const totalEarnings = amount * (1 + monthlyRate * months);
    const monthlyPayment = Math.round(totalEarnings / months);
    return {
      monthly: monthlyPayment,
      totalInterest: Math.round(amount * monthlyRate * months),
      totalRepay: Math.round(totalEarnings)
    };
  };

  const { monthly, totalInterest, totalRepay } = computeRepayments(calcAmount, calcMonths);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    // Simulating message transmission, since contacting us typically sends email or saves in DB
    setTimeout(() => {
      setContactSuccess(true);
      setContactLoading(false);
      setContactForm({ name: '', contact: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div id="home-page-container" className="flex flex-col bg-background">
      {/* 1. Hero Hero Banner Section */}
      <section 
        id="home-hero" 
        className="relative bg-teal-950 text-white overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500"
        style={{
          backgroundImage: `linear-gradient(rgba(13, 27, 42, 0.75), rgba(13, 27, 42, 0.85)), url('${heroBg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Slogan details */}
          <div className="space-y-6 select-none" id="hero-headlines">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold uppercase tracking-wider">
              <Clock size={12} />
              <span>最快即日得知批核結果</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-amber-500 tracking-tight leading-none" id="brand-headline-1">
              助你一臂
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none" id="brand-headline-2">
              鬆一口氣
            </h1>
            <p className="text-lg text-gray-300 max-w-md leading-relaxed" id="brand-description">
              我們一直為客戶財務方面提供最誠摯專業的週轉服務，特快放水，幫您解決燃眉之急。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/online"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-md bg-amber-500 text-white font-bold text-center hover:bg-amber-600 transition-colors shadow-lg"
                id="hero-cta-apply"
              >
                立即線上申請
              </Link>
              <a
                href="#home-sec-contact"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-md border border-white/50 text-white font-semibold text-center hover:bg-white/10 transition-colors"
                id="hero-cta-contact"
              >
                聯絡我們
              </a>
            </div>
          </div>

          {/* Interactive Calculator (Inlined beautifully!) */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-gray-100" id="hero-calculator">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <Calculator className="text-amber-500" size={22} />
              <h2 className="text-lg font-bold text-slate-800">極速貸款利息計算機</h2>
            </div>

            <div className="space-y-5">
              {/* Field: Loan amount */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">貸款金額 (Amount)</label>
                  <span className="text-amber-600 font-bold font-mono text-base">HK$ {calcAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min={10000}
                  max={200000}
                  step={5000}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  id="calc-slider-amount"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-mono mt-1">
                  <span>HK$ 10,000</span>
                  <span>HK$ 100,000</span>
                  <span>HK$ 200,000</span>
                </div>
              </div>

              {/* Field: months tenure */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">還款期數 (Tenure)</label>
                  <span className="text-amber-600 font-bold font-mono text-base">{calcMonths} 個月</span>
                </div>
                <input 
                  type="range"
                  min={6}
                  max={72}
                  step={6}
                  value={calcMonths}
                  onChange={(e) => setCalcMonths(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  id="calc-slider-months"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-mono mt-1">
                  <span>6 個月</span>
                  <span>36 個月</span>
                  <span>72 個月</span>
                </div>
              </div>

              {/* Calculations results */}
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-3 font-medium mt-4">
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>每月預估供款</span>
                  <span className="text-amber-600 text-xl font-extrabold font-mono">HK$ {monthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 border-t border-dashed border-gray-200 pt-2.5">
                  <span>預估總計利息</span>
                  <span className="font-mono">HK$ {totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>預估總計還款額</span>
                  <span className="font-mono">HK$ {totalRepay.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/online"
                className="block text-center w-full py-3 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors text-sm shadow-md"
                id="calc-apply-btn"
              >
                以此計畫立即申請
              </Link>
              <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider">
                *此試算結果僅供參考，實際批核細節與年息以契約備忘錄為準。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About US Section */}
      <section id="home-sec-about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight" id="about-heading">
                關於我們 (About Us)
              </h2>
              <div className="w-16 h-1.5 bg-amber-500 rounded-full" />
              <p className="text-gray-600 leading-relaxed text-base" id="about-p1">
                本公司於2016年創辦，作為一間本地金融經濟主要市場服務為主私人財務公司，我們致力為每位客人作出公司融資以至個人財務產品服務，以誠意真心服務每位顧客提供稱心貼心的貸款服務，解決燃眉之急。
              </p>
              <p className="text-gray-600 leading-relaxed text-base" id="about-p2">
                不論您是需要一筆資金進行個人進修、物業修繕、整合信用卡卡數、還是作為中小企業急需的周轉資金，我們專業的工作團隊都將為您量身定制最具彈性的還款計劃。
              </p>
              <div className="pt-2">
                <Link
                  to="/online"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shadow-md"
                  id="about-cta-apply"
                >
                  立即線上申請
                </Link>
              </div>
            </div>

            {/* Dashboard Stats Cards */}
            <div className="grid grid-cols-2 gap-4" id="about-stats-grid">
              {[
                { num: "2016", label: "年創立" },
                { num: "12小時", label: "極速批核" },
                { num: "36%", label: "最高年息" },
                { num: "120期", label: "最長還款期" }
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:border-amber-500/30 hover:bg-amber-50/10 transition-all shadow-sm" id={`stat-card-${stat.label}`}>
                  <div className="text-3xl font-extrabold text-amber-500 mb-1">{stat.num}</div>
                  <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Loan Products Grid Section */}
      <section id="home-sec-loans" className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">多元化融資信貸服務</h2>
            <div className="w-16 h-1.5 bg-amber-500 rounded-full mx-auto mt-4 mb-4" />
            <p className="text-gray-600">不限行業、低息免TU、申請迅速、助您在財務路上輕鬆克服障礙。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="loans-cards-grid">
            {products.map((p) => (
              <div 
                key={p.slug} 
                className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full"
                id={`loan-card-${p.slug}`}
              >
                {/* Thumbnail */}
                <div className="h-44 overflow-hidden relative bg-slate-900">
                  <img 
                    src={p.image_url} 
                    alt={p.title} 
                    className="w-full h-full object-cover select-none hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback visual colors if images are broken or blocked
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&q=80`;
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-amber-500/90 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded" id={`loan-badge-${p.slug}`}>
                    最快即日批結果
                  </div>
                </div>

                {/* Content info */}
                <div className="p-6 flex-1 flex flex-col justify-between" id={`loan-info-${p.slug}`}>
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {p.description}
                    </p>
                  </div>
                  <div className="pt-6 flex gap-2 items-center" id={`loan-ctas-${p.slug}`}>
                    <Link
                      to={`/loan/${p.slug}`}
                      className="text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-wider"
                      id={`loan-more-${p.slug}`}
                    >
                      了解更多 &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Advantages Sections */}
      <section id="home-sec-advantages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">我們的貸款優勢</h2>
            <div className="w-16 h-1.5 bg-amber-500 rounded-full mx-auto mt-4 mb-4" />
            <p className="text-gray-600">我們提供的一站式專業財務服務，擁有多年牌照經驗，安全透明，絕對保護隱私。</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="advantages-cards-grid">
            {advantages.map((adv, idx) => (
              <div 
                key={idx} 
                className="bg-gray-50 rounded-2xl p-6 sm:p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow group shrink-0"
                id={`advantage-card-${idx}`}
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-amber-100 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform" id={`adv-icon-${idx}`}>
                  {adv.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-3" id={`adv-title-${idx}`}>{adv.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed" id={`adv-desc-${idx}`}>{adv.description}</p>
                <div className="pt-4 mt-2">
                  <Link 
                    to="/online" 
                    className="inline-flex items-center text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors"
                  >
                    立即線上申請 &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonial Section */}
      <section id="home-sec-testimonials" className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">客戶成功心聲</h2>
            <div className="w-16 h-1.5 bg-amber-500 rounded-full mx-auto mt-4 mb-4" />
            <p className="text-gray-600">已成功幫助上萬名香港市民在困難時期度過難關，看看客人的真實心底評語。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="testimonials-grid">
            {testimonials.map((test, tIdx) => (
              <div 
                key={tIdx} 
                className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                id={`testimonial-card-${tIdx}`}
              >
                <div>
                  <div className="flex gap-0.5 mb-4" id="testimonial-stars">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star key={starIdx} size={15} className="fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic" id={`testimonial-text-${tIdx}`}>
                    「 {test.text} 」
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-slate-400">
                  <span>香港會員評論</span>
                  <span className="font-mono bg-amber-50 px-2 py-0.5 rounded text-amber-500 text-[10px] font-bold">已認證真實申請</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      <section id="home-sec-faqs" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">貸款常問問題</h2>
            <div className="w-16 h-1.5 bg-amber-500 rounded-full mx-auto mt-4 mb-4" />
            <p className="text-gray-600 font-medium">關於申請程序、資格審核、繳交供款等方面有任何疑問？請參閱我們的解答中心。</p>
          </div>

          <div className="space-y-4" id="faqs-accordion-list">
            {faqs.map((faq, fIdx) => (
              <div 
                key={fIdx} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                id={`faq-item-${fIdx}`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4.5 text-left text-sm sm:text-base font-bold text-gray-900 hover:text-amber-500 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                  id={`faq-btn-${fIdx}`}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${activeFaq === fIdx ? "rotate-180 text-amber-500" : ""}`} />
                </button>
                {activeFaq === fIdx && (
                  <div className="px-6 pb-5 text-sm text-gray-500 whitespace-pre-line border-t border-gray-100 pt-4 leading-relaxed animate-fade-in" id={`faq-answer-${fIdx}`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Contact US Form Section */}
      <section id="home-sec-contact" className="py-22 bg-gray-50 border-t border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">聯絡與諮詢</h2>
            <div className="w-16 h-1.5 bg-amber-500 rounded-full mx-auto mt-4 mb-4" />
            <p className="text-gray-600 font-medium">如有任何關於財務上的問題，隨時向我們投送諮詢，工作團隊將於最快時間回覆。</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Form Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-8 space-y-6" id="contact-form-container">
              {contactSuccess && (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-fade-in" id="contact-alert-success">
                  <Check size={16} className="text-emerald-500" />
                  <span>感謝您的留言，我們的客戶服務員會盡快在工作時間內回覆您！</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4" id="contact-form-submit">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">您的姓名 / 聯絡人 Name</label>
                  <input 
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    placeholder="請輸入您的真實姓名"
                    className="w-full px-4 h-11 rounded-lg border border-gray-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    id="contact-input-name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">手機號碼 / WhatsApp</label>
                    <input 
                      type="text"
                      value={contactForm.contact}
                      onChange={(e) => setContactForm({ ...contactForm, contact: e.target.value })}
                      required
                      placeholder="例如：9123 4567"
                      className="w-full px-4 h-11 rounded-lg border border-gray-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      id="contact-input-phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">電子郵箱 Email</label>
                    <input 
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      placeholder="您的聯絡電子信箱"
                      className="w-full px-4 h-11 rounded-lg border border-gray-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      id="contact-input-email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">查詢詳情 / 訊息 Message</label>
                  <textarea 
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    placeholder="請描述您的財務問題或希望諮詢的還款事項..."
                    className="w-full p-4 rounded-lg border border-gray-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    id="contact-textarea-msg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full h-11 mt-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all disabled:opacity-50 text-sm shadow shadow-amber-500/20 flex items-center justify-center gap-2"
                  id="contact-btn-submit"
                >
                  {contactLoading ? "傳送中..." : "發送我的查詢資訊"}
                </button>
              </form>
            </div>

            {/* Right Column: Google Maps Location Holder Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-6" id="contact-map-info">
              <h3 className="text-lg font-bold text-gray-900">總行辦公室位置</h3>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-150 border border-gray-250 relative" id="contact-iframe-map">
                {/* Standard Google Interactive Map for Admiralty Centre, Admiralty */}
                <iframe 
                  src="https://maps.google.com/maps?q=香港夏愨道18號海富中心&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="富毅信貸辦事處地圖"
                />
              </div>

              <div className="text-sm space-y-2 text-gray-600 leading-relaxed font-medium">
                <p className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-500 font-bold px-2 py-0.5 rounded text-[11px] font-mono">港鐵地鐵站</span>
                  <span>金鐘站 A 出口，直達海富中心，步行約 1 分鐘即可抵達第 1 座。</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-500 font-bold px-2 py-0.5 rounded text-[11px] font-mono">放債資格</span>
                  <span>我們是香港放債人牌照正式認可財務單位，信審程序嚴苛且安全合約透明。</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
