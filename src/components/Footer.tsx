import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  defaultWhatsAppNumber, 
  defaultCompanyAddress, 
  defaultLicenseNumber, 
  defaultComplaintHotline 
} from '../types';

const Footer: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState(defaultWhatsAppNumber);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp_number")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setWhatsappNumber(data.value);
        }
      });
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=你好，我想查詢貸款內容`;

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Company Profile */}
          <div className="space-y-4" id="footer-col-about">
            <h3 className="text-white text-base font-bold tracking-tight">富毅信貸有限公司</h3>
            <p className="text-xs font-mono text-gray-400 tracking-wider">GRIT CREDIT LIMITED</p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              本公司於2016年創辦，作為一間本地合規私人財務融資服務機構，致力為每位顧客提供高質稱心、快速省心的融資及個人信貸解決方案。
            </p>
            <div className="pt-2 flex items-center gap-2" id="footer-licensing">
              <Shield size={16} className="text-amber-500" />
              <span className="text-xs text-gray-400">放債人牌照號碼：{defaultLicenseNumber}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4" id="footer-col-links">
            <h3 className="text-white text-base font-bold tracking-tight">快速連結</h3>
            <ul className="space-y-2.5 text-sm" id="footer-quick-links-list">
              <li>
                <Link to="/" className="hover:text-amber-500 transition-colors">首頁</Link>
              </li>
              <li>
                <Link to="/PrivacyPolicy" className="hover:text-amber-500 transition-colors">私隱政策與個人資料聲明</Link>
              </li>
              <li>
                <Link to="/Termsofuse" className="hover:text-amber-500 transition-colors">使用條款與免責聲明</Link>
              </li>
              <li>
                <Link to="/MoneyLendersOrdinance" className="hover:text-amber-500 transition-colors">《放債人條例》說明摘要</Link>
              </li>
              <li>
                <Link to="/online" className="hover:text-amber-500 transition-colors">線上貸款申請</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Complaint */}
          <div className="space-y-4" id="footer-col-contact">
            <h3 className="text-white text-base font-bold tracking-tight">聯絡與投訴</h3>
            <ul className="space-y-3 text-sm text-gray-400" id="footer-contact-details">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>地址：{defaultCompanyAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-amber-500 shrink-0" />
                <span>投訴及查詢熱線：{defaultComplaintHotline}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle size={16} className="text-amber-500 shrink-0" />
                <span>WhatsApp：{whatsappNumber}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower Banner: Regulatory Disclaimers */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center space-y-4" id="footer-disclaimer-banner">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm font-semibold" id="footer-warning-advisory">
            <AlertTriangle size={16} />
            <span>忠告：借錢梗要還，咪俾錢中介。</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            版權所有 © {new Date().getFullYear()} 富毅信貸有限公司 (GRIT CREDIT LIMITED)。系統開發與託管服務。
          </p>
        </div>
      </div>

      {/* Persistent Floating WhatsApp badge on bottom-right */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer referrerPolicy=no-referrer"
        className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
        title="WhatsApp 諮詢"
        id="footer-floating-whatsapp"
      >
        <MessageCircle size={28} className="fill-current" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap text-sm font-semibold pl-0 group-hover:pl-2">
          WhatsApp 查詢
        </span>
      </a>
    </footer>
  );
};

export default Footer;
