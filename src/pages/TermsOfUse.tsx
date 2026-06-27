import React from 'react';
import { ShieldCheck, Scale, Info, CheckCircle2 } from 'lucide-react';
import { defaultLicenseNumber, defaultCompanyAddress } from '../types';

const TermsOfUse: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8" id="terms-page-container">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white p-8 border-b-4 border-amber-500 select-none">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full mb-3">
            <Scale size={14} />
            <span>條例及聲明</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            使用條款與免責聲明
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-normal mt-1.5 animate-fade-in">
            在使用譽高信貸(香港)有限公司 (Paramount Credit (h.k.) Limited) 本網站前，請細閱下列條款。
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 space-y-6" id="terms-body">
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5 text-sm text-amber-900 font-medium leading-relaxed">
            閣下存取本網站及其中任何網頁，即視為同意無條件接受下列各項條款约束。
          </div>

          <article className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5 pt-2">
              <CheckCircle2 size={16} className="text-amber-500" />
              <span>使用條款之修訂權</span>
            </h2>
            <p className="pl-6">
              譽高信貸(香港)有限公司 ("本公司") 保留隨時對本使用條款進行修訂、修改、增加及刪減內容的權利。任何內容修訂一經在本網網頁發佈即告即時生效。本公司強烈建議客戶不定期瀏覽及仔細翻閱此網頁，留意本公司最新公布的使用條款 updates，以確保取得最新資訊。
            </p>

            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5 pt-2">
              <CheckCircle2 size={16} className="text-amber-500" />
              <span>資訊內容承諾與免責限制</span>
            </h2>
            <p className="pl-6">
              本網站記載的各類信貸、估值及利息試算資料僅供一般參考之用，絕不宜視為特定法律或專業信貸投資意見。請翻閱此等資料的消費者人士在需要時，自行尋求適當的專業合規指導。本公司對此等資料的提供，已力求維護其準確性、完整性和及時性。
            </p>
            <p className="pl-6">
              特別是，在此等資訊及資料的有關方面，本公司並不就某一特定用途的非侵權、保安、準確性、適合性、或不含電腦病毒作出任何明示形式的擔保。倘若網站伺服器傳輸數據有誤或內容欠全，本公司恕不承擔任何直接或間接賠償責任。
            </p>

            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5 pt-2">
              <CheckCircle2 size={16} className="text-amber-500" />
              <span>合法經營及放債人牌照約定</span>
            </h2>
            <p className="pl-6">
              本網站所載各項信貸產品和融資服務，均由譽高信貸(香港)有限公司按照香港特別行政區《放債人條例》（香港法例第163章）的發牌規管，在合法註冊司法管轄區合法提供。
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-xs font-semibold pl-6 space-y-1.5">
              <p>放債人機構：譽高信貸(香港)有限公司 (Paramount Credit (h.k.) Limited)</p>
              <p>官方註冊牌照號碼：{defaultLicenseNumber}</p>
              <p>營業大廈地址：{defaultCompanyAddress}</p>
            </div>
          </article>

          <footer className="border-t border-gray-150 pt-6 flex justify-between items-center text-xs text-gray-400" id="terms-footer">
            <span className="flex items-center gap-1">
              <Info size={14} className="text-amber-500" />
              <span>本政策最後修訂日：二零二五年</span>
            </span>
            <span className="font-semibold text-[10px]">Paramount Credit (h.k.) Limited COPYRIGHTS</span>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default TermsOfUse;
