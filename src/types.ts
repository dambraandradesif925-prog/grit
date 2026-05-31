export interface LoanProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  sort_order: number;
  image_url: string;
}

export interface Advantage {
  id?: string;
  icon: string;
  title: string;
  description: string;
  sort_order?: number;
}

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  sort_order?: number;
}

export interface SiteSetting {
  key: string;
  value: string;
}

// Fallback datasets for extreme absolute reliability
export const fallbackProducts: LoanProduct[] = [
  {
    "id": "03c1aa73-5610-4939-b29f-438bd410d736",
    "slug": "personal-loan",
    "title": "私人貸款",
    "description": "靈活運用資金，滿足您的不同需要。",
    "content": "## 私人貸款\n\n### 適合人士\n適合在職人士、專業人士、公務員及物業持有人，無論用於個人進修、家居裝修、婚禮開支或其他個人用途。\n\n### 產品特點\n- **貸款額靈活**：根據您的需要及還款能力，提供合適的貸款方案\n- **還款期彈性**：多種還款期可供選擇，配合您的財務狀況\n- **手續簡便**：只需提供基本文件，申請程序簡單快捷\n- **即日批核**：最快即日得知申請結果\n\n### 申請條件\n- 年滿18歲之香港居民\n- 持有有效香港身份證\n- 有穩定收入來源\n\n如有查詢，歡迎隨時聯絡我們的客戶服務團隊。",
    "sort_order": 2,
    "image_url": "https://www.image2url.com/r2/default/images/1776428271714-f17f8def-12d8-4606-a8df-b717e466f07b.jpg"
  },
  {
    "id": "4cef9974-2a36-4594-9b62-4c69640657f9",
    "slug": "secured-loan",
    "title": "抵押品貸款",
    "description": "以資產作抵押，享受更優惠的貸款條件。",
    "content": "## 抵押品貸款\n\n### 適合人士\n適合持有資產（如汽車、珠寶、名錶等）的人士，願意以資產作為抵押品以獲取更佳貸款條件。\n\n### 產品特點\n- **更高貸款額**：以抵押品價值為基礎，提供更高的貸款額度\n- **更低利率**：有抵押品支持，可享受更具競爭力的利率\n- **多種抵押品接受**：汽車、珠寶、名錶等均可作為抵押品\n- **快速估價批核**：專業估價團隊，即時為您的資產進行評估\n\n### 申請條件\n- 年滿18歲之香港居民\n- 持有有效香港身份證\n- 提供合資格的抵押品\n\n如有查詢，歡迎隨時聯絡我們的客戶服務團隊。",
    "sort_order": 3,
    "image_url": "https://www.image2url.com/r2/default/images/1776428399020-217f14d9-ace1-4f72-b7ce-18ebc7147148.jpg"
  },
  {
    "id": "0977e382-d178-41d7-b25c-65df9febc779",
    "slug": "property-loan",
    "title": "物業貸款",
    "description": "以物業作擔保，釋放物業價值。",
    "content": "## 物業貸款\n\n### 適合人士\n適合物業持有人，希望透過物業的價值獲取資金，用於投資、裝修、周轉或其他用途。\n\n### 產品特點\n- **高額貸款**：根據物業估值提供高額貸款\n- **超低利率**：物業作擔保，享受市場最優惠利率\n- **長還款期**：最長還款期可達數年，每月供款更輕鬆\n- **免提前還款罰息**：可隨時提前還款，無額外收費\n\n### 申請條件\n- 年滿18歲之香港居民\n- 持有香港物業\n- 物業業權清晰\n\n如有查詢，歡迎隨時聯絡我們的客戶服務團隊。",
    "sort_order": 4,
    "image_url": "https://www.image2url.com/r2/default/images/1776427007638-849b6f50-a68c-48a8-9bb5-6033de099323.jpg"
  },
  {
    "id": "218c93f6-fc20-45cc-9a3b-2b9bcdf05330",
    "slug": "debt-consolidation",
    "title": "一筆清，舒緩易",
    "description": "整合多項債務，一筆過清還，減輕每月還款壓力。",
    "content": "## 一筆清，舒緩易\n\n### 適合人士\n適合有多項貸款或信用卡結欠的人士，希望整合債務以降低每月還款額及利息支出。\n\n### 產品特點\n- **整合所有債務**：將多項貸款及信用卡結欠合而為一，只需每月繳付一筆還款\n- **降低利率**：享受更優惠的利率，減少利息支出\n- **靈活還款期**：可選擇最適合您的還款期，減輕每月負擔\n- **快速批核**：最快即日批核，助您儘快解決債務問題\n\n### 申請條件\n- 年滿18歲之香港居民\n- 持有有效香港身份證\n- 有穩定收入來源\n\n如有查詢，歡迎隨時聯絡我們的客戶服務團隊。",
    "sort_order": 1,
    "image_url": "https://www.image2url.com/r2/default/images/1776428303294-3fa997b2-3fb8-4ef2-a10c-eece342a64f7.jpg"
  }
];

export const fallbackAdvantages: Advantage[] = [
  {
    "icon": "💰",
    "title": "貸款額高達月薪21倍",
    "description": "根據您的收入及信貸狀況，提供高達月薪21倍的貸款額度。"
  },
  {
    "icon": "📅",
    "title": "還款期長達72個月",
    "description": "靈活的還款期選擇，每月供款輕鬆自在。"
  },
  {
    "icon": "📉",
    "title": "特低利息",
    "description": "HK$10,000貸款每日利息只需約HK$1.05。"
  },
  {
    "icon": "⚡",
    "title": "即場得知申請結果",
    "description": "專業的批核團隊為您即場處理申請。"
  }
];

export const fallbackFAQs: FAQ[] = [
  {
    "question": "1. 申請需時多久?",
    "answer": "申請後一至三個工作天可知結果"
  },
  {
    "question": "2. 申請需要什麼資格?",
    "answer": "· 香港永久性居民\n· 18歲或以上"
  },
  {
    "question": "3. 申請貸款有何步驟？",
    "answer": "· 步驟一︰ 網上遞交申請表 / 電話申請\n· 步驟二︰ 進行貸款評估\n· 步驟三︰ 貸款批核結果通知\n· 步驟四︰ 簽署貸款合約然後獲取現金"
  },
  {
    "question": "4. 富毅信貸有限公司提供什麼類型的貸款服務？",
    "answer": "富毅信貸有限公司提供無抵押私人貸款、公務員貸款、樓宇按揭、業主貸款、清卡數貸款等各類貸款服務。"
  },
  {
    "question": "5. 申請人可透過什麼途徑申請貸款？",
    "answer": "富毅信貸有限公司提供多種簡單快捷的申請途徑，客戶可自由選擇方便自己的方法。\n· 網上申請\n· 電話申請"
  },
  {
    "question": "6. 申請貸款時，一般需遞交什麼文件？",
    "answer": "· 香港永久性居民身份證\n· 最近3個月之入息證明（例如: 糧單, 稅單, 銀行月結單,僱傭合約,員工證等）\n· 最近3個月之住址證明（例如: 銀行月結單, 水費單, 電費單, 煤氣單, 電話費單）"
  },
  {
    "question": "7. 貸款人可選擇哪些還款方式？",
    "answer": "恒生銀行，中國銀行或渣打銀行繳交供款"
  },
  {
    "question": "8. 是否可以不用親臨本公司作貸款申請？",
    "answer": "是的。客戶可以隨時隨地透過網上申請或電話申請貸款，而可以不用親臨本公司。"
  },
  {
    "question": "9. 如有其他疑問，可於哪裡查詢？",
    "answer": "客戶可於辦公時間內Whatsapp 96396851本公司查詢"
  }
];

export const defaultWhatsAppNumber = "85291440242";
export const defaultThankYouMsg = "請留意你填寫的電郵以及電話，客戶服務主任會盡快聯絡你。";
export const defaultLicenseNumber = "1841/2025";
export const defaultCompanyAddress = "香港夏愨道18號海富中心座1201室";
export const defaultComplaintHotline = "96396851";
