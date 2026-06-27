import React from 'react';
import { Scale, CheckCircle, Award, BookOpen, AlertCircle } from 'lucide-react';
import { defaultLicenseNumber } from '../types';

const Ordinance: React.FC = () => {
  return (
    <div className="bg-gray-55 min-h-screen py-12 px-4 sm:px-6 lg:px-8" id="ordinance-page-container">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
        
        {/* Banner Headers */}
        <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white p-8 border-b-4 border-amber-500 select-none">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full mb-3">
            <Award size={14} />
            <span>合規核准財務機構</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            香港放債人條例摘要說明 (Summary of Ordinance)
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-normal mt-1.5 font-medium">
            根據香港《放債人條例》(香港法例第163章) 第18及19條，客戶於訂立貸款協議時所享有的保障和權益摘要。
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 space-y-8" id="ordinance-body">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-l-4 border-amber-500 pl-3">
              《放債人條例》重要條款摘要 (MLO Important Sections)
            </h2>
            <p className="text-xs text-gray-400">
              放債人牌照號碼：{defaultLicenseNumber}
            </p>
            <div className="w-12 h-1 bg-amber-500 rounded-full" />
          </section>

          <article className="space-y-6 text-sm text-gray-650 leading-relaxed font-semibold" id="mlo-rules">
            
            {/* Rule 1 */}
            <div className="bg-gray-50 hover:bg-gray-100/50 border border-gray-100 rounded-xl p-5 space-y-2 transition-colors">
              <h3 className="text-gray-900 font-bold text-base flex items-center gap-2">
                <CheckCircle size={16} className="text-amber-500 shrink-0" />
                <span>一、 貸款合約必須書面訂立 (Note of Agreement)</span>
              </h3>
              <p className="pl-6 text-gray-500 text-xs">
                根據條例第18條規定，放債人所作出的貸款協議必須由借貸雙方於訂立合約時，親自親筆簽署書面備忘錄或協議合約書，並必須於合約訂立後七天內向借款人提供一份一模一樣的合約複本，否則貸款協議將不獲法律執行。
              </p>
            </div>

            {/* Rule 2 */}
            <div className="bg-gray-50 hover:bg-gray-100/50 border border-gray-100 rounded-xl p-5 space-y-2 transition-colors">
              <h3 className="text-gray-900 font-bold text-base flex items-center gap-2">
                <CheckCircle size={16} className="text-amber-500 shrink-0" />
                <span>二、 限制最高法定貸款年利率 (Maximum Interest Rate)</span>
              </h3>
              <p className="pl-6 text-gray-500 text-xs">
                根據《放債人條例》第24條規定，任何放債人就其放債安排而收取的實際年利率 (APR)，法定期限上限最高不得超過年息 36%（原定為60%，香港法例已於2022年底修訂為最高36%）。任何超出法定上限部分的合同約定，將不獲法律保障且放債人可能面臨刑事檢控。
              </p>
            </div>

            {/* Rule 3 */}
            <div className="bg-gray-50 hover:bg-gray-100/50 border border-gray-100 rounded-xl p-5 space-y-2 transition-colors">
              <h3 className="text-gray-900 font-bold text-base flex items-center gap-2">
                <CheckCircle size={16} className="text-amber-500 shrink-0" />
                <span>三、 借款人享有隨時提前還款權 (Early Repayment Right)</span>
              </h3>
              <p className="pl-6 text-gray-500 text-xs">
                借款人在向放債人發出書面通知並繳清截至該還款日所應繳納的所有本金利息之後，享有在任何還款期前，隨時提前清還全部或部分結欠貸款本金的絕對權利。放債人絕不得為此徵收任何額外罰息或違約金，除非合約另有訂明之法定豁免項目。
              </p>
            </div>

            {/* Rule 4 */}
            <div className="bg-gray-50 hover:bg-gray-100/50 border border-gray-100 rounded-xl p-5 space-y-2 transition-colors">
              <h3 className="text-gray-900 font-bold text-base flex items-center gap-2">
                <CheckCircle size={16} className="text-amber-500 shrink-0" />
                <span>四、 嚴禁收取任何前期中介費用 (Advisory Middleware fee ban)</span>
              </h3>
              <p className="pl-6 text-gray-500 text-xs">
                放債人、其職員、受委託之中介代理，在審批、經手、介紹、發放貸款的各個步驟環節中，均被嚴格禁止向借貸申請人索取、收取任何形式的前期手續合約費用、中介代理諮詢佣金或其他任何名目的行政雜費。
              </p>
            </div>

          </article>

          {/* WARNING advisory */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-800 text-xs leading-relaxed flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <p className="font-bold">借貸安全提醒：借錢梗要還，咪俾錢中介。</p>
              <p className="text-[10px]">
                借貸屬於合規民商事契約行為。如遭到任何人或聲稱為我司之中介代理机构索要前期費用、介紹佣金、履約保證金，請立即致電我司諮詢電話進行舉報投訴，避免財產蒙受損害。
              </p>
            </div>
          </div>

          <footer className="border-t border-gray-150 pt-6 flex justify-between items-center text-xs text-gray-400" id="ordinance-footer">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-500" />
              <span>本摘要節選自香港立法院官方編印之《放債人條例》說明。</span>
            </span>
            <span className="font-semibold text-[10px]">MLO PARAMOUNT CREDIT</span>
          </footer>
        </div>

      </div>
    </div>
  );
};

export default Ordinance;
