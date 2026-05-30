import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { defaultThankYouMsg } from '../types';
import { CheckCircle2, ShieldCheck, HelpCircle, Send, AlertCircle, FileText } from 'lucide-react';

const OnlineApply: React.FC = () => {
  const [formData, setFormData] = useState({
    nameChinese: '',
    nameEnglish: '',
    hkid: '',
    dob: '',
    gender: '請選擇',
    maritalStatus: '請選擇',
    children: '0',
    phone: '',
    email: '',
    address: '',
    propertyType: '請選擇',
    cohabitants: '1',
    occupation: '',
    salary: '',
    salaryMethod: '請選擇',
    loanAmount: '',
    previousApplications: '',
    referralSource: '',
    agreed: false,
    password: '' // Allow password setting for member login setup
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [thankYouMsg, setThankYouMsg] = useState(defaultThankYouMsg);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "registration_thank_you")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setThankYouMsg(data.value);
        }
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreed) {
      setErrorMsg('請先勾選閱讀並確認同意上述聲明及隱私條款。');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Create a member account in Supabase Authentication to enable fully-functional client dashboards
      let userId: string | null = null;
      if (formData.password.trim().length >= 6) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password.trim(),
          options: {
            data: {
              display_name: formData.nameChinese.trim()
            }
          }
        });

        if (signUpError) {
          console.warn("SignUp Warning:", signUpError.message);
          // If auth fails or user already exists, we will still record their application below
        } else if (signUpData?.user) {
          userId = signUpData.user.id;
          
          // Try inserting into profiles & roles tables
          await supabase.from("profiles").insert({
            user_id: userId,
            display_name: formData.nameChinese.trim()
          });

          await supabase.from("user_roles").insert({
            user_id: userId,
            role: "member"
          });
        }
      }

      // 2. Insert the actual loan application record
      const { error: insertError } = await supabase.from("loan_applications").insert([{
        user_id: userId,
        name_chinese: formData.nameChinese.trim(),
        name_english: formData.nameEnglish.trim(),
        hkid: formData.hkid.trim(),
        dob: formData.dob,
        gender: formData.gender,
        marital_status: formData.maritalStatus,
        children: Number(formData.children) || 0,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        property_type: formData.propertyType,
        cohabitants: Number(formData.cohabitants) || 1,
        occupation: formData.occupation.trim(),
        salary: Number(formData.salary) || 0,
        salary_method: formData.salaryMethod,
        loan_amount: Number(formData.loanAmount) || 0,
        previous_applications: formData.previousApplications,
        referral_source: formData.referralSource,
        status: "審批中"
      }]);

      if (insertError) {
        throw new Error(insertError.message || '表格提交失敗，請檢查資料重試。');
      }

      // Automatically sign out because the signup log will be auto-processed
      await supabase.auth.signOut();

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '提交失敗，請確認欄位是否填寫正確。');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4" id="apply-success-container">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-150 p-8 text-center space-y-6">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto animate-bounce" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            貸款申請提交成功！
          </h1>
          <div className="w-16 h-1 bg-emerald-500 rounded-full mx-auto" />
          
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-emerald-800 text-sm leading-relaxed text-left space-y-3 font-medium">
            <p className="font-bold border-b border-emerald-200 pb-2">
              ✓ 親愛的客戶，您好：富毅信貸工作團隊已收到您的線上信貸審批申請表。
            </p>
            <p className="whitespace-pre-line text-xs leading-normal">
              {thankYouMsg}
            </p>
          </div>

          <div className="text-xs text-gray-400 leading-normal max-w-md mx-auto">
            我們將在 12 小時內完成初步信資格審批，並致電 / 傳送 Email 通知您核准的額度和接下來的面談手續。如有急需，亦可在工作時間內聯絡我們的客服人員，提供您的姓名以行催辦。
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm transition-colors"
            >
              返回首頁
            </a>
            <a
              href="https://wa.me/85291440242?text=你好，我剛剛提交了線上申請表，我的名字是"
              target="_blank"
              rel="noopener noreferrer referrerPolicy=no-referrer"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-md"
            >
              WhatsApp 專人催辦
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8" id="online-apply-container">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Descriptive Headings */}
        <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white rounded-2xl p-8 shadow-md border-b-4 border-amber-500 select-none">
          <div className="inline-flex items-center gap-1 text-xs text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full mb-3">
            <ShieldCheck size={14} className="text-amber-500" />
            <span>特快即日審批通道</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            線上特快貸款申請表 (Online Application)
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-2 max-w-2xl font-medium">
            填寫以下完整細緻的工作與個人信息，讓我們能更快速、更準確地為您匹配出信貸額度與還款期。帶 <span className="text-amber-500 font-bold">*</span> 的欄位為必填項目。
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm flex items-center gap-2 animate-fade-in" id="apply-error-banner">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Application Form itself */}
        <form onSubmit={handleSubmit} className="space-y-6" id="apply-form-element">
          
          {/* Section 1: Personal Details */}
          <section className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-5 shadow-sm" id="sec-personal">
            <h2 className="text-base font-extrabold text-amber-600 border-b border-gray-100 pb-3 uppercase tracking-wider flex items-center gap-1.5">
              <span>一、 個人資料與聯繫方式</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  中文姓名 Chinese Name <span className="text-destructive">*</span>
                </label>
                <input 
                  type="text"
                  name="nameChinese"
                  value={formData.nameChinese}
                  onChange={handleChange}
                  required
                  placeholder="請輸入身份證中文姓名"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-nameChinese"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  英文姓名 English Name <span className="text-destructive">*</span>
                </label>
                <input 
                  type="text"
                  name="nameEnglish"
                  value={formData.nameEnglish}
                  onChange={handleChange}
                  required
                  placeholder="CHAN TAI MAN"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-nameEnglish"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  香港身份證號碼 HKID <span className="text-destructive">*</span>
                </label>
                <input 
                  type="text"
                  name="hkid"
                  value={formData.hkid}
                  onChange={handleChange}
                  required
                  placeholder="例如：A123456(7)"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-hkid"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  出生日期 Date of Birth <span className="text-destructive">*</span>
                </label>
                <input 
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-dob"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  性別 Gender <span className="text-destructive">*</span>
                </label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-gender"
                >
                  <option value="請選擇">請選擇</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  婚姻狀況 Marital Status <span className="text-destructive">*</span>
                </label>
                <select 
                  name="maritalStatus" 
                  value={formData.maritalStatus} 
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-marital"
                >
                  <option value="請選擇">請選擇</option>
                  <option value="未婚">未婚</option>
                  <option value="已婚">已婚</option>
                  <option value="離婚">離婚</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  子女人數 Number of Children <span className="text-destructive">*</span>
                </label>
                <input 
                  type="number"
                  name="children"
                  min={0}
                  value={formData.children}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-children"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  聯絡手機號碼 Phone <span className="text-destructive">*</span>
                </label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="例如：9123 4567"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-phone"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  電子郵址 Email <span className="text-destructive">*</span>
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-email"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  居住住址 Address <span className="text-destructive">*</span>
                </label>
                <textarea 
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="請填寫完整的香港街道及大廈詳細地址"
                  className="w-full p-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-address"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  住址類別 Property Type <span className="text-destructive">*</span>
                </label>
                <select 
                  name="propertyType" 
                  value={formData.propertyType} 
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-property"
                >
                  <option value="請選擇">請選擇</option>
                  <option value="私人物業自置">私人物業自置</option>
                  <option value="私人物業租用">私人物業租用</option>
                  <option value="政府公屋">政府公屋</option>
                  <option value="政府居屋">政府居屋</option>
                  <option value="家人同住">家人同住</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  同住人數 Cohabitants <span className="text-destructive">*</span>
                </label>
                <input 
                  type="number"
                  name="cohabitants"
                  min={1}
                  value={formData.cohabitants}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-cohabitants"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Financial Details */}
          <section className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-5 shadow-sm" id="sec-financial">
            <h2 className="text-base font-extrabold text-amber-600 border-b border-gray-100 pb-3 uppercase tracking-wider">
              二、 職業背景及本次財務貸款需求
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  現時職業 Occupation <span className="text-destructive">*</span>
                </label>
                <input 
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                  placeholder="例如：公司經理 / 建築工"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-occupation"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  每月薪酬 (HKD) Monthly Salary <span className="text-destructive">*</span>
                </label>
                <input 
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  placeholder="元 (例如：18200)"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-salary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  出糧發薪方式 Salary Method <span className="text-destructive">*</span>
                </label>
                <select 
                  name="salaryMethod" 
                  value={formData.salaryMethod} 
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-salaryMethod"
                >
                  <option value="請選擇">請選擇</option>
                  <option value="銀行自動轉賬">銀行自動轉賬</option>
                  <option value="現金發放">現金發放</option>
                  <option value="支票">支票</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  盼望貸款金額 Loan Amount (HKD) <span className="text-destructive">*</span>
                </label>
                <input 
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  required
                  placeholder="元 (例如：50000)"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-loanAmount"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  曾申請下列特別債務事項 <span className="text-destructive">*</span>
                </label>
                <select 
                  name="previousApplications" 
                  value={formData.previousApplications} 
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-previous"
                >
                  <option value="">請選擇</option>
                  <option value="沒有申請">沒有申請過債務重組等 / 信良好</option>
                  <option value="破產">破產</option>
                  <option value="債務重組">債務重組 (IVA / DRP / IDRP)</option>
                  <option value="壞賬">壞賬結清 / 信評分不足</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  從何途徑得知本公司 Referral Source <span className="text-destructive">*</span>
                </label>
                <select 
                  name="referralSource" 
                  value={formData.referralSource} 
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  id="apply-referral"
                >
                  <option value="">請選擇</option>
                  <option value="網上媒體">網上媒體廣告</option>
                  <option value="朋友介紹">朋友介紹</option>
                  <option value="推廣信">郵政實體推廣信件</option>
                  <option value="網上討論區">網上討論區 (LIHKG/Uwants等)</option>
                  <option value="免費報紙">免費分發報紙 (例如: 晴報/頭條)</option>
                  <option value="報紙">收費報紙雜誌</option>
                  <option value="廣告媒體">電視及戶外廣告燈箱</option>
                </select>
              </div>
            </div>
          </section>

          {/* Optional Login Account Creation Setup Section to verify /dashboard integration */}
          <section className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-4 shadow-sm" id="sec-account-creation">
            <h2 className="text-base font-extrabold text-amber-600 border-b border-gray-100 pb-3 uppercase tracking-wider">
              三、 建立密碼啟用會員面版 (自選填寫)
            </h2>
            <p className="text-xs text-gray-500 leading-normal font-medium">
              如設定密碼，提交申請後即可利用此 Email 與密碼登入 <Link to="/login" className="text-amber-500 underline font-semibold select-none">會員帳戶</Link>，隨時在線追蹤審批 status 進度、未還款期數、逾付款項等財務紀錄。
            </p>
            <div className="max-w-md">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                會員登入密碼 Password (最少 6 位)
              </label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="建議設置 6 位或以上防盜密碼"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                id="apply-password"
              />
            </div>
          </section>

          {/* Section 4: Full detailed legal declaration check box matching the extracted script */}
          <section className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-5 shadow-sm" id="sec-legal">
            <h2 className="text-base font-extrabold text-amber-600 border-b border-gray-100 pb-3 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={18} />
              <span>四、 條款使用及個人資料收集聲明</span>
            </h2>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-xs text-gray-500 leading-relaxed space-y-3 max-h-48 overflow-y-scroll" id="apply-legal-terms-text">
              <p>
                本人確認本人已滿十八歲，並證實本人已參閱及明白富毅信貸有限公司的私隱政策聲明及個人資料(客戶)聲明。同時，本人同意富毅信貸有限公司使用本人已填寫的個人資料聯絡本人，以跟進貸款事宜。
              </p>
              <p>
                同意富毅信貸有限公司在審批貸款申請及以後向本人之信貸狀況進行審核時，可向信貸機構（包括環聯資訊有限公司 TransUnion）提出要求索取本人之信貸報告，而此審核可定期按月進行。
              </p>
              <p>
                富毅信貸有限公司對貸款申請批核與否有絕對決定權，而毋須作任何解釋。 富毅信貸有限公司備受個人隱私保護法例監管，我們承諾絕不會透露其填寫之資料給予任何無關第三方，亦絕對不將客戶私隱數據與其他商業機構進行任何形式的交換以謀取任何商業利益。
              </p>
              <p>
                本公司保留隨時變更或終止貸款利息優惠之權益、以及對此筆借貸額度合約的最終核准與否權。
              </p>
            </div>

            <div className="flex items-start gap-3 pt-2" id="apply-legal-checkbox-row">
              <input 
                type="checkbox"
                name="agreed"
                id="agreed"
                checked={formData.agreed}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
              />
              <label htmlFor="agreed" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                本人已詳細閱讀、明瞭、並同意上述聲明各項合約約定條款且確認本人年滿18歲。 <span className="text-destructive">*</span>
              </label>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 p-4 rounded-xl">
              <div className="text-xs text-slate-400 max-w-md font-medium text-center md:text-left leading-normal">
                安全保障：本表單採用 256 位元 SSL 安全加密編碼保障，確保您的財務評估資料絕對不會外洩。
              </div>
              <button
                type="submit"
                disabled={loading || !formData.agreed}
                className="w-full md:w-auto px-10 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow flex items-center justify-center gap-2"
                id="apply-submit-btn"
              >
                <Send size={15} />
                {loading ? "正在安全提交中..." : "確認無誤，發送特快審核"}
              </button>
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};

export default OnlineApply;
