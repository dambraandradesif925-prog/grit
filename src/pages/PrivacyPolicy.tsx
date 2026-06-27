import React from 'react';
import { Shield, Eye, Lock, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8" id="privacy-page-container">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white p-8 border-b-4 border-amber-500 select-none">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full mb-3">
            <Shield size={14} />
            <span>私隱保障協定</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            私隱政策與個人資料聲明
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-normal mt-1.5">
            譽高信貸(香港)有限公司 (Paramount Credit (h.k.) Limited) 致力在提供服務時保障每位尊貴客戶的個人私隱與敏感信貸檔案數據。
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 space-y-8" id="privacy-body">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              有關個人資料（私隱）條例致客戶通知 (Notice to Customers)
            </h2>
            <div className="w-12 h-1 bg-amber-500 rounded-full" />
            <p className="text-sm font-semibold text-gray-700">
              有關個人資料（私隱）條例致客戶通知 (下稱「本條例」)
            </p>
          </section>

          <section className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 space-y-5" id="privacy-points-list">
              <p>
                1. 客戶在申請開立戶口，延續戶口及建立或延續財務信貸便利或要求譽高信貸(香港)有限公司（以下簡稱「譽高」）提供信貸服務時，需要不時向譽高提供有關的資料。
              </p>
              <p>
                2. 客戶若未能提供有關資料將導致譽高無法開立或延續戶口或建立或延續財務信貸便利或提供信貸服務。
              </p>
              <p>
                3. 在客戶與譽高的正常業務往來過程中，譽高亦會收集客戶資料，例如在客戶以信貸交易時。
              </p>
              <p>
                4. 有關客戶資料將可作以下用途：
              </p>
              <ul className="pl-6 space-y-2 list-none">
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">I.</span>
                  <span>日常業務運作及為客戶提供信貸備用額；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">II.</span>
                  <span>作信貸查核（包括但不局限於申請個人信貸及定期覆核信貸）；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">III.</span>
                  <span>建立及維持個人信貸評分模式；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">IV.</span>
                  <span>協助其他財務機構作信貸查核及債務追收；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">V.</span>
                  <span>確保客戶的信用維持良好；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">VI.</span>
                  <span>為客戶設計財務服務或有關產品；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">VII.</span>
                  <span>推廣財務服務或有關產品；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">VIII.</span>
                  <span>確定譽高對客戶或客戶對譽高的債務；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">IX.</span>
                  <span>向客戶及為客戶提供擔保或抵押的人士追收欠款；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">X.</span>
                  <span>評估及分析任何保險索償及協助其他保險公司進行保險索償查核；</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <span className="text-amber-500 font-bold">XI.</span>
                  <span>根據譽高或其分行須遵守的條例要求作出披露；</span>
                </li>
              </ul>
              
              <p className="border-t border-gray-150 pt-4" id="privacy-transunion">
                9. 個人信貸機構查詢：譽高信貸可定期要求自合法信貸資訊庫（如 TransUnion）提取客戶之信貸評分報告。如客戶欲存取或修改其報告，請聯絡：
              </p>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4 text-xs space-y-1 text-gray-700 font-bold pl-6">
                <p>I. 環聯資訊有限公司 (TransUnion Limited)</p>
                <p>香港尖沙咀廣東道9號港威大廈6座1001室</p>
                <p>聯絡電話：2577 1816</p>
              </div>

              <p>
                10. 本聲明通知書之約定，決不妨礙客戶在個人資料（私隱）條例（香港法例第486章）下所享有的各項權利。
              </p>
              <p>
                11. 上列譯文如與英文原文有任何語法歧異，概以中文原文為標準。
              </p>
            </div>
          </section>

          <footer className="border-t border-gray-150 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4" id="privacy-footer">
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="text-amber-500" />
              <span>本通知不會限制客戶在私隱條例下享有之各項基本權利。</span>
            </div>
            <div className="text-right sm:text-right uppercase tracking-wider font-semibold text-[10px]">
              資料保護主任書面通知發布 · 二零二五年
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
