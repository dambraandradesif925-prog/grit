import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  collection, getDocs, getDoc, query, orderBy, where, limit, 
  doc, setDoc, addDoc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { 
  defaultWhatsAppNumber, 
  defaultThankYouMsg,
  defaultCompanyAddress,
  defaultLicenseNumber,
  defaultComplaintHotline,
  fallbackProducts
} from '../types';
import { 
  User, CheckCircle, Clock, AlertTriangle, Play, Save, 
  RefreshCw, KanbanSquare, Pencil, Sparkles, BookOpen, 
  Search, Trash2, Edit3, Settings, ShieldAlert, ArrowRight, DollarSign, X, Key,
  Image as ImageIcon
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Common loading states
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [tab, setTab] = useState<'applications' | 'accounts' | 'settings' | 'faqs' | 'images'>('applications');

  // Client states
  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [clientApplications, setClientApplications] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState('');

  // Admin states
  const [adminApplications, setAdminApplications] = useState<any[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Site settings state (Admin editable)
  const [settingsForm, setSettingsForm] = useState({
    whatsapp: defaultWhatsAppNumber,
    thankYouMsg: defaultThankYouMsg,
    license: defaultLicenseNumber,
    address: defaultCompanyAddress,
    hotline: defaultComplaintHotline
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Site images state (Admin editable)
  const [logoInput, setLogoInput] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [savingImages, setSavingImages] = useState(false);
  const [productsImages, setProductsImages] = useState<{ id: string, slug: string, title: string, image_url: string }[]>([]);
  const [savingProductImgSlug, setSavingProductImgSlug] = useState<string | null>(null);

  // Client member custom application states
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [memberApplyAmount, setMemberApplyAmount] = useState('');
  const [memberSalary, setMemberSalary] = useState('');
  const [memberOccupation, setMemberOccupation] = useState('');
  const [memberHkid, setMemberHkid] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberNotes, setMemberNotes] = useState('');
  const [submittingMemberApply, setSubmittingMemberApply] = useState(false);

  // Admin approval modal states
  const [approvingApp, setApprovingApp] = useState<any | null>(null);
  const [approvedLoanAmount, setApprovedLoanAmount] = useState('');
  const [outstandingPrincipal, setOutstandingPrincipal] = useState('');
  const [totalBalance, setTotalBalance] = useState('');
  const [remainingPeriods, setRemainingPeriods] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [apr, setApr] = useState('');
  const [loanDate, setLoanDate] = useState('');
  const [loanDueDate, setLoanDueDate] = useState('');
  const [repaymentBank, setRepaymentBank] = useState('');
  const [repaymentAccount, setRepaymentAccount] = useState('');
  const [repaymentDay, setRepaymentDay] = useState('');
  const [loanNumber, setLoanNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCustomPassword, setClientCustomPassword] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('已批准');
  const [savingApproval, setSavingApproval] = useState(false);

  // Manual Add Application states
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [addAppName, setAddAppName] = useState('');
  const [addAppGender, setAddAppGender] = useState('男');
  const [addAppHkid, setAddAppHkid] = useState('');
  const [addAppPhone, setAddAppPhone] = useState('');
  const [addAppEmail, setAddAppEmail] = useState('');
  const [addAppLoanAmount, setAddAppLoanAmount] = useState('');
  const [addAppOccupation, setAddAppOccupation] = useState('');
  const [addAppSalary, setAddAppSalary] = useState('');
  const [addAppAddress, setAddAppAddress] = useState('');
  const [addAppPropertyType, setAddAppPropertyType] = useState('私人住宅');
  const [addAppPaymentMethod, setAddAppPaymentMethod] = useState('銀行自動轉賬');
  const [savingNewApp, setSavingNewApp] = useState(false);

  // User Profile and transaction modal states
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [adminTransactions, setAdminTransactions] = useState<any[]>([]);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [repayFps, setRepayFps] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submittingTx, setSubmittingTx] = useState(false);

  // Admin Profile Edit states
  const [editingProfile, setEditingProfile] = useState<any | null>(null);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileBalance, setEditProfileBalance] = useState('');
  const [editProfileBankName, setEditProfileBankName] = useState('');
  const [editProfileBankNumber, setEditProfileBankNumber] = useState('');
  const [editProfilePhone, setEditProfilePhone] = useState('');
  const [editProfileEmail, setEditProfileEmail] = useState('');
  const [editProfilePassword, setEditProfilePassword] = useState('');
  const [savingProfileEdit, setSavingProfileEdit] = useState(false);

  // Helper to parse serialized approved metadata
  const parseApprovalMetadata = (prevAppsStr: string) => {
    if (prevAppsStr && prevAppsStr.startsWith("APPROVED_METADATA:")) {
      try {
        const jsonStr = prevAppsStr.substring("APPROVED_METADATA:".length);
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Load dashboard dataset
  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (isAdmin) {
        // --- Admin Dashboard Load ---
        try {
          const appsSnap = await getDocs(query(collection(db, "loan_applications")));
          const accsSnap = await getDocs(query(collection(db, "loan_accounts")));
          const profilesSnap = await getDocs(collection(db, "profiles"));
          const txsSnap = await getDocs(collection(db, "transactions"));

          const appsList = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const accsList = accsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const profilesList = profilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const txsList = txsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Client-side sort by created_at desc to avoid index requirements or missing field crashes
          appsList.sort((a: any, b: any) => {
            const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tB - tA;
          });

          accsList.sort((a: any, b: any) => {
            const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tB - tA;
          });

          txsList.sort((a: any, b: any) => {
            const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tB - tA;
          });

          setAdminApplications(appsList);
          setAdminAccounts(accsList);
          setAdminUsers(profilesList);
          setAdminTransactions(txsList);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.LIST, "admin_load");
        }

        // Fetch current active site settings for editing
        try {
          const settingsSnap = await getDocs(collection(db, "site_settings"));
          const settingsData = settingsSnap.docs.map(doc => doc.data());
          if (settingsData && settingsData.length > 0) {
            const w = settingsData.find(s => s.key === "whatsapp_number")?.value || defaultWhatsAppNumber;
            const t = settingsData.find(s => s.key === "registration_thank_you")?.value || defaultThankYouMsg;
            const l = settingsData.find(s => s.key === "license_number")?.value || defaultLicenseNumber;
            const a = settingsData.find(s => s.key === "company_address")?.value || defaultCompanyAddress;
            const h = settingsData.find(s => s.key === "complaint_hotline")?.value || defaultComplaintHotline;
            
            setSettingsForm({
              whatsapp: w,
              thankYouMsg: t,
              license: l,
              address: a,
              hotline: h
            });

            // Logo & Hero Images
            const logoVal = settingsData.find(s => s.key === "logo_url")?.value || "https://grit-credit.com/assets/logo-D_TUe9TF.jpg";
            const heroVal = settingsData.find(s => s.key === "hero_background_url")?.value || "https://www.image2url.com/r2/default/images/1776426806509-5b7fb5f2-959c-4fdf-97c7-c7ba8d67a14e.jpg";
            setLogoInput(logoVal);
            setHeroInput(heroVal);
          }
        } catch (dbErr) {
          console.error("Error loading site settings in dashboard", dbErr);
        }

        // Fetch products
        try {
          const productsSnap = await getDocs(query(collection(db, "loan_products"), orderBy("sort_order", "asc")));
          if (!productsSnap.empty) {
            setProductsImages(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
          } else {
            setProductsImages(fallbackProducts.map(p => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              image_url: p.image_url
            })));
          }
        } catch (dbErr) {
          console.error("Error loading products in dashboard", dbErr);
          setProductsImages(fallbackProducts.map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            image_url: p.image_url
          })));
        }
      } else {
        // --- Client Member Dashboard Load ---
        try {
          const [accsRes, appsByUidRes, appsByEmailRes, profileRes] = await Promise.all([
            getDocs(query(collection(db, "loan_accounts"), where("user_id", "==", user.uid))),
            getDocs(query(collection(db, "loan_applications"), where("user_id", "==", user.uid))),
            getDocs(query(collection(db, "loan_applications"), where("email", "==", user.email || ""))),
            getDoc(doc(db, "profiles", user.uid))
          ]);

          const accsList = accsRes.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Merge and deduplicate applications by document ID
          const appsMap = new Map();
          appsByUidRes.forEach(doc => appsMap.set(doc.id, { id: doc.id, ...doc.data() }));
          appsByEmailRes.forEach(doc => appsMap.set(doc.id, { id: doc.id, ...doc.data() }));
          
          const appsList = Array.from(appsMap.values());

          // Sort arrays client side desc
          appsList.sort((a: any, b: any) => {
            const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tB - tA;
          });

          accsList.sort((a: any, b: any) => {
            const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tB - tA;
          });

          setClientAccounts(accsList);
          setClientApplications(appsList);
          
          const profileData = profileRes.exists() ? profileRes.data() : null;
          const clientName = profileData?.display_name || (appsList.length > 0 ? appsList[0].name_chinese : "尊敬的會員");
          setDisplayName(clientName);
          
          if (profileData) {
            setUserProfile(profileData);
          } else {
            setUserProfile({
              display_name: clientName,
              balance: "0",
              bank_name: "未設定",
              bank_number: "未設定"
            });
          }
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.LIST, "client_load");
        }
      }
    } catch (err) {
      console.error("Dashboard Loading Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, isAdmin, authLoading]);

  // Admin action: updates registration application status
  const updateApplicationStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "loan_applications", id), { status: newStatus });
      setToastMessage("✓ 申請狀態更新成功！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("狀態更新失敗: " + err.message);
    }
  };

  // Admin action: change pre-approved credit amount
  const handleUpdateAmount = async (id: string, newAmount: number) => {
    try {
      await updateDoc(doc(db, "loan_applications", id), { pre_approved_amount: newAmount });
      setToastMessage("✓ 預審信用額度更新成功！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("額度調整失敗: " + err.message);
    }
  };

  // Admin action: delete historical application record
  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm("確認要永久刪除此客戶的貸款申請歷史紀錄嗎？此動作不可撤銷。")) return;
    try {
      await deleteDoc(doc(db, "loan_applications", id));
      setToastMessage("✓ 紀錄已永久刪除！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("刪除失敗: " + err.message);
    }
  };

  // Admin action: open the approval form for a specific application
  const openApprovalModal = async (app: any) => {
    setApprovingApp(app);
    setClientCustomPassword(''); // Reset first
    
    if (app.email) {
      try {
        const q = query(collection(db, "profiles"), where("email", "==", app.email.toLowerCase().trim()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          setClientCustomPassword(querySnap.docs[0].data().custom_password || '');
        }
      } catch (err: any) {
        console.warn("Could not load client profile password:", err.message);
      }
    }

    const meta = parseApprovalMetadata(app.previous_applications) || {};
    
    setClientName(meta.client_name || app.name_chinese || '');
    setLoanNumber(meta.loan_number || `GRIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setApprovedLoanAmount(meta.approved_amount || app.loan_amount || '');
    setOutstandingPrincipal(meta.outstanding_principal || app.loan_amount || '');
    setTotalBalance(meta.total_balance || (app.loan_amount * 1.1).toFixed(0) || '');
    setRemainingPeriods(meta.remaining_periods || '12期');
    setMonthlyPayment(meta.monthly_payment || (app.loan_amount / 12 * 1.05).toFixed(0) || '');
    setApr(meta.apr || '12%');
    
    const todayStr = new Date().toISOString().substring(0, 10);
    setLoanDate(meta.loan_date || todayStr);
    
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().substring(0, 10);
    setLoanDueDate(meta.loan_due_date || nextYearStr);
    
    setRepaymentBank(meta.repayment_bank || '恒生銀行 (Hang Seng Bank)');
    setRepaymentAccount(meta.repayment_account || '852-1234-567890-001');
    setRepaymentDay(meta.repayment_day || '每月中15日');
    setApplicationStatus(app.status || '已批准');
  };

  const handleSaveApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingApp) return;
    setSavingApproval(true);
    try {
      const metaObj = {
        client_name: clientName,
        loan_number: loanNumber,
        approved_amount: Number(approvedLoanAmount),
        outstanding_principal: Number(outstandingPrincipal),
        total_balance: Number(totalBalance),
        remaining_periods: remainingPeriods,
        monthly_payment: Number(monthlyPayment),
        apr: apr,
        loan_date: loanDate,
        loan_due_date: loanDueDate,
        repayment_bank: repaymentBank,
        repayment_account: repaymentAccount,
        repayment_day: repaymentDay,
        status: applicationStatus
      };

      const serializedMetadata = "APPROVED_METADATA:" + JSON.stringify(metaObj);

      // 1. Update status and previous_applications metadata inside the loan_applications table
      try {
        await updateDoc(doc(db, "loan_applications", approvingApp.id), {
          status: applicationStatus,
          previous_applications: serializedMetadata, // store in existing column to avoid schema limits
          pre_approved_amount: Number(approvedLoanAmount)
        });
      } catch (appError: any) {
        throw new Error("更新申請狀態失敗: " + appError.message);
      }

      // 1.5 Sync/Update custom password in profiles collection in Firestore if provided
      if (approvingApp.email) {
        try {
          const appEmail = approvingApp.email.toLowerCase().trim();
          const qProfile = query(collection(db, "profiles"), where("email", "==", appEmail));
          const snapProfile = await getDocs(qProfile);
          
          if (!snapProfile.empty) {
            const profileId = snapProfile.docs[0].id;
            await setDoc(doc(db, "profiles", profileId), {
              custom_password: clientCustomPassword.trim()
            }, { merge: true });
          } else if (clientCustomPassword.trim()) {
            // Auto generate a profile for them since password was supplied but profile doesn't exist
            const newUserId = approvingApp.user_id || `user_${Math.floor(100000 + Math.random() * 900000)}`;
            await setDoc(doc(db, "profiles", newUserId), {
              user_id: newUserId,
              email: appEmail,
              display_name: clientName || approvingApp.name_chinese || '未命名',
              phone: approvingApp.phone || '',
              custom_password: clientCustomPassword.trim(),
              balance: '0'
            }, { merge: true });
            
            await setDoc(doc(db, "user_roles", newUserId), {
              user_id: newUserId,
              role: "member"
            }, { merge: true });

            await updateDoc(doc(db, "loan_applications", approvingApp.id), {
              user_id: newUserId
            });
          }
        } catch (pwdErr: any) {
          console.warn("Could not sync profile password during approval:", pwdErr.message);
        }
      }

      // 2. Insert record in loan_accounts if approved
      if (applicationStatus === '已批准') {
        try {
          await addDoc(collection(db, "loan_accounts"), {
            user_id: approvingApp.user_id || null,
            loan_number: loanNumber,
            outstanding_balance: Number(totalBalance),
            next_payment_due: loanDueDate,
            created_at: new Date().toISOString()
          });
        } catch (accError: any) {
          throw new Error("建立還款帳戶失敗: " + accError.message);
        }
      }

      setToastMessage("✓ 申請審批及貸款約據簽存成功！");
      setTimeout(() => setToastMessage(''), 3500);
      setApprovingApp(null);
      loadDashboardData();
    } catch (err: any) {
      alert("審批存檔失敗：" + err.message);
    } finally {
      setSavingApproval(false);
    }
  };

  const handleCreateManualApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAppName.trim() || !addAppPhone.trim() || !addAppLoanAmount.trim()) {
      alert("請填寫最基本必備的客戶姓名、電話、申請金額！");
      return;
    }
    setSavingNewApp(true);
    try {
      await addDoc(collection(db, "loan_applications"), {
        user_id: null,
        name_chinese: addAppName.trim(),
        name_english: '',
        hkid: addAppHkid.trim() || '未填寫',
        dob: '1990-01-01',
        gender: addAppGender,
        marital_status: '未婚',
        children: 0,
        phone: addAppPhone.trim(),
        email: addAppEmail.toLowerCase().trim() || `${addAppPhone.trim()}@temp-hk.com`,
        address: addAppAddress.trim() || '由管理員代錄入',
        property_type: addAppPropertyType,
        cohabitants: 1,
        occupation: addAppOccupation.trim() || '自由職業',
        monthly_salary: Number(addAppSalary) || 0,
        payment_method: addAppPaymentMethod,
        loan_amount: Number(addAppLoanAmount) || 0,
        previous_applications: '沒有申請',
        referral_source: '管理員代辦',
        status: '審批中',
        created_at: new Date().toISOString()
      });

      setToastMessage("✓ 成功錄入新客戶資料與申請案件！");
      setTimeout(() => setToastMessage(''), 3000);
      
      // Clean states
      setAddAppName('');
      setAddAppHkid('');
      setAddAppPhone('');
      setAddAppEmail('');
      setAddAppLoanAmount('');
      setAddAppOccupation('');
      setAddAppSalary('');
      setAddAppAddress('');
      setShowAddAppModal(false);
      
      loadDashboardData();
    } catch (err: any) {
      alert("錄入客戶資料失敗: " + err.message);
    } finally {
      setSavingNewApp(false);
    }
  };

  const handleMemberApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberApplyAmount || !memberSalary || !memberOccupation || !memberHkid || !memberPhone) {
      alert("請填寫所有必選星號 (*) 欄位！");
      return;
    }
    setSubmittingMemberApply(true);
    try {
      try {
        await addDoc(collection(db, "loan_applications"), {
          user_id: user?.uid || null, // Associate user ID in member portal
          name_chinese: displayName || "會員用戶",
          name_english: "",
          hkid: memberHkid.trim(),
          dob: "1990-01-01",
          gender: "未知",
          marital_status: "未婚",
          children: 0,
          phone: memberPhone.trim(),
          email: user?.email?.trim() || "",
          address: "顧客提供",
          property_type: "私人住宅",
          cohabitants: 1,
          occupation: memberOccupation.trim(),
          monthly_salary: Number(memberSalary) || 0,
          payment_method: "銀行轉賬",
          loan_amount: Number(memberApplyAmount) || 0,
          previous_applications: "沒有申請",
          referral_source: "會員中心",
          status: "審批中",
          created_at: new Date().toISOString()
        });
      } catch (insertError: any) {
        handleFirestoreError(insertError, OperationType.CREATE, "loan_applications");
      }

      setToastMessage("✓ 貸款額度申請提交成功！我們的客戶團隊正在加緊為您核批！");
      setTimeout(() => setToastMessage(''), 4000);

      // Reset states
      setMemberApplyAmount('');
      setMemberSalary('');
      setMemberOccupation('');
      setMemberHkid('');
      setMemberPhone('');
      setMemberNotes('');
      setShowApplyForm(false);
      loadDashboardData();
    } catch (err: any) {
      alert("提交申請失敗：" + err.message);
    } finally {
      setSubmittingMemberApply(false);
    }
  };

  // User submissions: Buyout / Repay / Withdraw
  const handleSubmitRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayFps.trim() || !repayAmount.trim()) {
      alert("請填寫所有欄位！");
      return;
    }
    setSubmittingTx(true);
    try {
      await addDoc(collection(db, "transactions"), {
        user_id: user?.uid || null,
        client_name: userProfile?.display_name || displayName,
        type: "還款",
        fps_account: repayFps.trim(),
        amount: Number(repayAmount),
        status: "處理中",
        created_at: new Date().toISOString()
      });

      setToastMessage("✓ 還款申請提交成功！我們將盡快查實入款。");
      setTimeout(() => setToastMessage(''), 3500);
      setRepayFps('');
      setRepayAmount('');
      setShowRepayModal(false);
      loadDashboardData();
    } catch (err: any) {
      alert("提交還款失敗: " + err.message);
    } finally {
      setSubmittingTx(false);
    }
  };

  const handleSubmitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount.trim()) {
      alert("請輸入提款金額！");
      return;
    }
    setSubmittingTx(true);
    try {
      await addDoc(collection(db, "transactions"), {
        user_id: user?.uid || null,
        client_name: userProfile?.display_name || displayName,
        type: "提款",
        bank_name: userProfile?.bank_name || "未設定",
        bank_number: userProfile?.bank_number || "未設定",
        amount: Number(withdrawAmount),
        status: "處理中",
        created_at: new Date().toISOString()
      });

      setToastMessage("✓ 提款申請提交成功！核數後將會手續特快放款至您指定的戶口。");
      setTimeout(() => setToastMessage(''), 3500);
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      loadDashboardData();
    } catch (err: any) {
      alert("提交提款失敗: " + err.message);
    } finally {
      setSubmittingTx(false);
    }
  };

  const handleSaveProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    setSavingProfileEdit(true);
    try {
      await setDoc(doc(db, "profiles", editingProfile.id), {
        user_id: editingProfile.id,
        display_name: editProfileName.trim(),
        balance: editProfileBalance.trim() || '0',
        bank_name: editProfileBankName.trim() || '未設定',
        bank_number: editProfileBankNumber.trim() || '未設定',
        phone: editProfilePhone.trim(),
        email: editProfileEmail.trim(),
        custom_password: editProfilePassword.trim(),
        updated_at: new Date().toISOString()
      }, { merge: true });

      setToastMessage("✓ 客戶授信額度與餘額設定保存成功！");
      setTimeout(() => setToastMessage(''), 3500);
      setEditingProfile(null);
      loadDashboardData();
    } catch (err: any) {
      alert("更新失敗: " + err.message);
    } finally {
      setSavingProfileEdit(false);
    }
  };

  const handleMarkTxProcessed = async (txId: string) => {
    try {
      await updateDoc(doc(db, "transactions", txId), {
        status: "已處理"
      });
      setToastMessage("✓ 已標記申請為已完成處理。");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("更新狀態失敗: " + err.message);
    }
  };

  const handleOpenEditProfile = (profile: any) => {
    setEditingProfile(profile);
    setEditProfileName(profile.display_name || '');
    setEditProfileBalance(profile.balance || '0');
    setEditProfileBankName(profile.bank_name || '未設定');
    setEditProfileBankNumber(profile.bank_number || '未設定');
    setEditProfilePhone(profile.phone || '');
    setEditProfileEmail(profile.email || '');
    setEditProfilePassword(profile.custom_password || '');
  };

  // Admin action: save updated settings in tables
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const operations = [
        { key: "whatsapp_number", value: settingsForm.whatsapp },
        { key: "registration_thank_you", value: settingsForm.thankYouMsg },
        { key: "license_number", value: settingsForm.license },
        { key: "company_address", value: settingsForm.address },
        { key: "complaint_hotline", value: settingsForm.hotline }
      ];

      await Promise.all(operations.map(async (op) => {
        await setDoc(doc(db, "site_settings", op.key), { key: op.key, value: op.value });
      }));

      setToastMessage("✓ 網站全域參數儲存修改生效！");
      setTimeout(() => setToastMessage(''), 3500);
      loadDashboardData();
    } catch (err: any) {
      alert("參數修改失敗：" + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Admin action: save updated logo & hero images in settings
  const handleSaveLogoHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingImages(true);
    try {
      const operations = [
        { key: "logo_url", value: logoInput },
        { key: "hero_background_url", value: heroInput }
      ];

      await Promise.all(operations.map(async (op) => {
        await setDoc(doc(db, "site_settings", op.key), { key: op.key, value: op.value });
      }));

      // Cache updated values locally so they reflect instantly
      localStorage.setItem('site_logo_url', logoInput);
      localStorage.setItem('site_hero_url', heroInput);

      setToastMessage("✓ 品牌與宣傳大圖更變儲存成功！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("儲存圖片失敗：" + err.message);
    } finally {
      setSavingImages(false);
    }
  };

  // Admin action: save updated loan product image
  const handleSaveProductImage = async (slug: string, newUrl: string) => {
    setSavingProductImgSlug(slug);
    try {
      // Find the document for the product with this slug
      const q = query(collection(db, "loan_products"), where("slug", "==", slug), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, "loan_products", snap.docs[0].id), { image_url: newUrl });
      } else {
        // Create document using slug as key
        await setDoc(doc(db, "loan_products", slug), {
          slug,
          image_url: newUrl,
          title: slug === 'personal' ? '個人信用貸款' : slug === 'owner' ? '業主特快私人貸款' : '中小企融資計劃',
          sort_order: slug === 'personal' ? 1 : slug === 'owner' ? 2 : 3
        });
      }

      setToastMessage("✓ 貸款產品封面圖片更新成功！");
      setTimeout(() => setToastMessage(''), 3000);
      loadDashboardData();
    } catch (err: any) {
      alert("產品圖片儲存失敗：" + err.message);
    } finally {
      setSavingProductImgSlug(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12" id="dashboard-loading">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">正在核驗並載入安全數據庫面版...</p>
        </div>
      </div>
    );
  }

  const repaymentTxs = adminTransactions.filter((tx) => tx.type === "還款");
  const withdrawalTxs = adminTransactions.filter((tx) => tx.type === "提款");

  return (
    <div className="bg-gray-50 min-h-screen py-8 text-slate-800" id="main-dashboard-portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Toast Warning */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 animate-slide-down font-medium text-sm">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dashboard Banner Header */}
        <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border-b-4 border-amber-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 select-none">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
              {isAdmin ? "總監系統平台 (SYSTEM CONSOLE)" : "信貸帳戶面版 (CLIENT PORTAL)"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isAdmin ? "富毅信貸管理控制中心" : `您好，${displayName}`}
            </h1>
            <p className="text-xs text-gray-300">
              安全管理身分登入會話：{user?.email} · 在線受加密保障
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              title="重新載入"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold text-xs tracking-wider transition-colors"
            >
              登出會話
            </button>
          </div>
        </div>

        {isAdmin ? (
          // ==================== ADMIN SYSTEM VIEW ====================
          <div className="space-y-8" id="admin-view">
            {/* Summary statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="admin-stats">
              <div className="bg-white rounded-xl p-5 border border-gray-150 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  累計遞交申請單
                </div>
                <div className="text-2xl font-black text-amber-500 font-mono">
                  {adminApplications.length} 件
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-150 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  審批中待處理
                </div>
                <div className="text-2xl font-black text-blue-500 font-mono">
                  {adminApplications.filter(a => a.status === "審批中").length} 件
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-150 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  已有核准合同
                </div>
                <div className="text-2xl font-black text-emerald-500 font-mono">
                  {adminApplications.filter(a => a.status === "已批准").length} 件
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-150 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  總貸款帳號數
                </div>
                <div className="text-2xl font-black text-slate-700 font-mono">
                  {adminAccounts.length} 戶
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-px" id="admin-tabs">
              <button
                onClick={() => setTab('applications')}
                className={`px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'applications' 
                    ? "border-amber-500 text-amber-500" 
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                線上申請件核定 ({adminApplications.length})
              </button>
              <button
                onClick={() => setTab('accounts')}
                className={`px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'accounts' 
                    ? "border-amber-500 text-amber-500" 
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
                id="tab-btn-accounts"
              >
                客戶餘額與帳戶設定 ({adminUsers.length})
              </button>
              <button
                onClick={() => setTab('settings')}
                className={`px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'settings' 
                    ? "border-amber-500 text-amber-500" 
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                網站全域核心設定
              </button>
              <button
                onClick={() => setTab('images')}
                className={`px-4 py-2.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all ${
                  tab === 'images' 
                    ? "border-amber-500 text-amber-500" 
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
                id="tab-btn-images"
              >
                網站所有圖片管理
              </button>
            </div>

            {/* Tab: Applications Table panel */}
            {tab === 'applications' && (
              <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm" id="admin-apps-tab">
                <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50 select-none">
                  <h2 className="text-sm font-bold text-gray-900 tracking-wider flex items-center gap-1.5">
                    <Search size={16} className="text-slate-400" />
                    <span>線上特快申請名錄 (Applications Record)</span>
                  </h2>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowAddAppModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-sm transition-all border border-emerald-500 hover:border-emerald-600 active:scale-95"
                      id="btn-add-client-manual"
                    >
                      <span>+ 手動錄入新客戶資料</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">過濾狀態:</span>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-2.5 py-1 text-xs border border-gray-200 rounded bg-white text-slate-700 focus:outline-none"
                      >
                        <option value="all">顯示全部</option>
                        <option value="審批中">審批中</option>
                        <option value="已批准">已核准</option>
                        <option value="未批准">已拒绝</option>
                      </select>
                    </div>
                  </div>
                </div>

                {adminApplications.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    目前合約庫尚無任何遞交的線上申請表紀錄。
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider select-none">
                          <th className="px-6 py-4.5">客戶姓名 & 資訊</th>
                          <th className="px-6 py-4.5">申請金額</th>
                          <th className="px-6 py-4.5">工作與月收</th>
                          <th className="px-6 py-4.5">信用宣告</th>
                          <th className="px-6 py-4.5">預核信用額度 / 修改狀態</th>
                          <th className="px-6 py-4.5 text-center">歷史處置</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-600">
                        {adminApplications
                          .filter(a => filterStatus === 'all' || a.status === filterStatus)
                          .map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4.5">
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-gray-900">
                                    {app.name_chinese} <span className="text-[10px] text-gray-400 font-normal">({app.gender})</span>
                                  </div>
                                  <div className="font-mono text-[11px] text-gray-500">
                                    {app.name_english} · ID: {app.hkid}
                                  </div>
                                  <div className="text-[10px] text-gray-400 leading-normal">
                                    Tel: {app.phone} | {app.email}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    住址: {app.address} ({app.property_type})
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <span className="font-bold font-mono text-gray-900 text-sm">
                                  HK$ {(app.loan_amount || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="space-y-1">
                                  <div>職：{app.occupation}</div>
                                  <div className="font-mono text-amber-600">
                                    薪：HK$ {(app.monthly_salary || app.salary || 0).toLocaleString()} ({app.payment_method || app.salary_method || '未知'})
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                {app.previous_applications && app.previous_applications.startsWith("APPROVED_METADATA:") ? (
                                  <div className="space-y-1">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                      已批准 (正式信貸約據)
                                    </span>
                                    {(() => {
                                      const meta = parseApprovalMetadata(app.previous_applications);
                                      return meta ? (
                                        <div className="text-[10px] font-mono text-gray-500 leading-tight">
                                          編號: <span className="font-bold text-slate-800">{meta.loan_number}</span><br />
                                          額度: <span className="font-bold text-slate-800">HK$ {Number(meta.approved_amount).toLocaleString()}</span><br />
                                          供款: <span className="font-bold text-red-600">HK$ {Number(meta.monthly_payment).toLocaleString()}</span> ({meta.remaining_periods})
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>
                                ) : (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    app.previous_applications === "沒有申請" 
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                      : "bg-red-50 text-red-600 border border-red-100"
                                  }`}>
                                    {app.previous_applications || "無資料"}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="space-y-2 max-w-xs">
                                  {/* Inline Amount Editor */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-extrabold text-gray-400">預核HKD:</span>
                                    <input
                                      type="number"
                                      defaultValue={app.pre_approved_amount || 0}
                                      onBlur={(e) => handleUpdateAmount(app.id, Number(e.target.value) || 0)}
                                      className="w-24 h-7 text-xs px-2 border border-gray-200 rounded bg-white text-slate-800"
                                    />
                                  </div>

                                  {/* Action button to open detailed Approval form */}
                                  <button
                                    onClick={() => openApprovalModal(app)}
                                    className="px-2 h-7 text-[10px] font-bold rounded bg-slate-900 hover:bg-slate-800 uppercase text-white flex items-center gap-1 shadow-sm w-full justify-center transition-colors border border-slate-700 font-sans tracking-wide"
                                  >
                                    <Edit3 size={11} />
                                    <span>輸入審批/修改狀態</span>
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-center">
                                <button
                                  onClick={() => handleDeleteApplication(app.id)}
                                  className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 hover:text-red-700 transition-colors"
                                  title="刪除"
                                  id={`delete-btn-${app.id}`}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'accounts' && (
              <div className="space-y-8 animate-fade-in" id="panel-accounts-admin">
                  {/* 1a. Repayment Transactions Table */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4" id="admin-repayments-panel">
                    <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-teal-600" size={20} />
                        <h3 className="text-base font-bold text-gray-900 font-sans">客戶還款記錄清單 (Repayments Register)</h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                        總計 {repaymentTxs.length} 筆
                      </span>
                    </div>

                    {repaymentTxs.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400 font-medium">
                        暫無最新客戶還款紀錄。
                      </div>
                    ) : (
                      <div className="relative overflow-x-auto rounded-xl border border-gray-150">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-gray-150 text-slate-500 font-bold uppercase tracking-wider">
                              <th className="px-5 py-3">還款金額</th>
                              <th className="px-5 py-3">日期</th>
                              <th className="px-5 py-3">時間</th>
                              <th className="px-5 py-3">客戶名稱</th>
                              <th className="px-5 py-3">客戶還款付款資訊 (FPS ID / 手機號碼)</th>
                              <th className="px-5 py-3 text-center">狀態</th>
                              <th className="px-5 py-3 text-center">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150 text-slate-700 font-medium">
                            {repaymentTxs.map((tx) => {
                              const txDate = tx.created_at ? new Date(tx.created_at) : null;
                              const dStr = txDate ? txDate.toLocaleDateString('zh-HK') : '---';
                              const tStr = txDate ? txDate.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '---';
                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/50">
                                  <td className="px-5 py-3.5 font-extrabold text-teal-600 text-sm font-mono">
                                    HK$ {Number(tx.amount).toLocaleString()}
                                  </td>
                                  <td className="px-5 py-3.5 font-mono">{dStr}</td>
                                  <td className="px-5 py-3.5 font-mono">{tStr}</td>
                                  <td className="px-5 py-3.5 font-bold text-slate-900">{tx.client_name}</td>
                                  <td className="px-5 py-3.5 font-mono text-slate-600">
                                    <span className="bg-teal-50 px-2 py-0.5 rounded text-[10px] border border-teal-100">{tx.fps_account || "---"}</span>
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      tx.status === "已處理"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800 animate-pulse"
                                    }`}>
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {tx.status === "處理中" ? (
                                      <button
                                        onClick={() => handleMarkTxProcessed(tx.id)}
                                        className="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
                                      >
                                        ✔ 標記為內部已入數
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-gray-400 font-mono">已核對完成</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* 1b. Withdrawal Transactions Table */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4" id="admin-withdrawals-panel">
                    <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="text-amber-500" size={20} />
                        <h3 className="text-base font-bold text-gray-900 font-sans">客戶提款登記清單 (Withdrawals Register)</h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        總計 {withdrawalTxs.length} 筆
                      </span>
                    </div>

                    {withdrawalTxs.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400 font-medium">
                        暫無最新客戶提款紀錄。
                      </div>
                    ) : (
                      <div className="relative overflow-x-auto rounded-xl border border-gray-150">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-gray-150 text-slate-500 font-bold uppercase tracking-wider">
                              <th className="px-5 py-3">提款金額</th>
                              <th className="px-5 py-3">日期</th>
                              <th className="px-5 py-3">時間</th>
                              <th className="px-5 py-3">客戶名稱</th>
                              <th className="px-5 py-3">提款指定銀行預設戶口</th>
                              <th className="px-5 py-3 text-center">狀態</th>
                              <th className="px-5 py-3 text-center">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-150 text-slate-700 font-medium">
                            {withdrawalTxs.map((tx) => {
                              const txDate = tx.created_at ? new Date(tx.created_at) : null;
                              const dStr = txDate ? txDate.toLocaleDateString('zh-HK') : '---';
                              const tStr = txDate ? txDate.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '---';
                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/50">
                                  <td className="px-5 py-3.5 font-extrabold text-amber-600 text-sm font-mono">
                                    HK$ {Number(tx.amount).toLocaleString()}
                                  </td>
                                  <td className="px-5 py-3.5 font-mono">{dStr}</td>
                                  <td className="px-5 py-3.5 font-mono">{tStr}</td>
                                  <td className="px-5 py-3.5 font-bold text-slate-900">{tx.client_name}</td>
                                  <td className="px-5 py-3.5">
                                    <div className="font-semibold text-slate-800">{tx.bank_name || "---"}</div>
                                    <div className="text-[10px] text-gray-400 font-mono">{tx.bank_number || ""}</div>
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      tx.status === "已處理"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800 animate-pulse"
                                    }`}>
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-center">
                                    {tx.status === "處理中" ? (
                                      <button
                                        onClick={() => handleMarkTxProcessed(tx.id)}
                                        className="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-sm"
                                      >
                                        ✔ 標記為特快已放款
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-gray-400 font-mono">已放清/已完成</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* 2. Client Profile Balance & Accounts Master details list */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-4" id="admin-users-balances-panel">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <User size={20} className="text-amber-500" />
                        <h3 className="text-base font-bold text-gray-900 font-sans">註冊會員戶口與可用餘額 (Member Accounts & Credit Balances)</h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      管理全網站已註冊會員的 **可用餘額 (餘額)** 、預設收款和還款銀行賬戶資料。可用餘額可由管理人員在下方任意編輯、增刪或授信修改。
                    </p>

                    <div className="relative overflow-x-auto rounded-xl border border-gray-150">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-gray-150 text-slate-500 font-bold uppercase tracking-wider">
                            <th className="px-5 py-3">會員姓名</th>
                            <th className="px-5 py-3">聯絡電話/電郵</th>
                            <th className="px-5 py-3">當前餘額 (可任意修改)</th>
                            <th className="px-5 py-3">預設收款銀行 (提款預設)</th>
                            <th className="px-5 py-3 border-r border-gray-100">銀行戶口號碼</th>
                            <th className="px-5 py-3 text-center">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 text-slate-700 font-medium">
                          {adminUsers.map((profile) => (
                            <tr key={profile.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                                {profile.display_name || "未設定"}
                              </td>
                              <td className="px-5 py-3.5 text-slate-600 space-y-0.5">
                                {profile.phone && <div className="font-mono">📞 {profile.phone}</div>}
                                {profile.email && <div className="font-mono text-gray-400">{profile.email}</div>}
                                {!profile.phone && !profile.email && <span className="text-gray-400">---</span>}
                              </td>
                              <td className="px-5 py-3.5 text-slate-900 font-extrabold text-sm font-mono text-amber-600">
                                HK$ {profile.balance || "0"}
                              </td>
                              <td className="px-5 py-3.5">
                                {profile.bank_name || "未設定"}
                              </td>
                              <td className="px-5 py-3.5 font-mono border-r border-gray-100">
                                {profile.bank_number || "未設定"}
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  onClick={() => handleOpenEditProfile(profile)}
                                  className="px-3 py-1 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1 mx-auto transition-colors"
                                >
                                  <Pencil size={11} />
                                  <span>編輯餘額及帳戶</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            }

            {/* Tab: Config Settings Page */}
            {tab === 'settings' && (
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm max-w-3xl" id="admin-settings-tab">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                  <Settings size={20} className="text-amber-500" />
                  <h2 className="text-base font-extrabold text-slate-800">全域核心配置設定</h2>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5" id="settings-admin-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        飄浮 WhatsApp 聯絡官號 (例如: 85291440242)
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.whatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                        id="setting-whatsapp"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        投訴及諮詢官方熱線
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.hotline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                        id="setting-hotline"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      線上表格提交成功後的「感謝回覆訊息」官網公告文本
                    </label>
                    <textarea 
                      rows={3}
                      value={settingsForm.thankYouMsg}
                      onChange={(e) => setSettingsForm({ ...settingsForm, thankYouMsg: e.target.value })}
                      required
                      className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                      id="setting-thank-you"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        備案放債人執照/牌照號碼
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.license}
                        onChange={(e) => setSettingsForm({ ...settingsForm, license: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                        id="setting-license"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        總行實體執照大廈辦事處地址
                      </label>
                      <input 
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        required
                        className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800"
                        id="setting-address"
                      />
                    </div>
                  </div>

                                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                      id="save-settings-btn"
                    >
                      <Save size={14} />
                      {savingSettings ? "儲存更新中..." : "保存全域參數變更"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tab === 'images' && (
              <div className="space-y-6 animate-fade-in" id="panel-images">
                {/* 1. Global site brand & hero banner background images */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                    <ImageIcon className="text-amber-500" size={18} />
                    <h3 className="text-base font-bold text-gray-900">官方品牌與網站核心圖庫設定</h3>
                  </div>

                  <form onSubmit={handleSaveLogoHero} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Logo URL */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          傳載官方品牌標誌 (Website Logo URL)
                        </label>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                            {logoInput ? (
                              <img src={logoInput} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = 'https://grit-credit.com/assets/logo-D_TUe9TF.jpg'; }} />
                            ) : (
                              <span className="text-xs text-gray-400">無預覽</span>
                            )}
                          </div>
                          <div className="flex-1 col-span-1">
                            <input
                              type="text"
                              value={logoInput}
                              onChange={(e) => setLogoInput(e.target.value)}
                              placeholder="貼上新的 Logo 圖片 URL"
                              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800 mb-1"
                            />
                            <p className="text-[10px] text-gray-400">當前支持任何網路公開圖片連結位址</p>
                          </div>
                        </div>
                      </div>

                      {/* Hero Image */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          首頁主板大背景圖 (Hero Background URL)
                        </label>
                        <div className="flex gap-4">
                          <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                            {heroInput ? (
                              <img src={heroInput} alt="Hero" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.image2url.com/r2/default/images/1776426806509-5b7fb5f2-959c-4fdf-97c7-c7ba8d67a14e.jpg'; }} />
                            ) : (
                              <span className="text-xs text-gray-400">無預覽</span>
                            )}
                          </div>
                          <div className="flex-1 col-span-1">
                            <input
                              type="text"
                              value={heroInput}
                              onChange={(e) => setHeroInput(e.target.value)}
                              placeholder="貼上主板大景大宣傳圖片 URL"
                              className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 text-slate-800 mb-1"
                            />
                            <p className="text-[10px] text-gray-400">用於首頁頂部歡迎版塊做全螢幕大圖展示</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={savingImages}
                        className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Save size={14} />
                        {savingImages ? "更新首頁圖片中..." : "保存核心宣傳圖變更"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Loan product cards covers list */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2 select-none">
                    <ImageIcon className="text-amber-500" size={18} />
                    <h3 className="text-base font-bold text-gray-900">官方貸款融資產品封面照片設定</h3>
                  </div>

                  <p className="text-xs text-gray-400">
                    設定貸款產品的大圖或列表形象封面（將同步渲染在官網主頁的借支項目特色卡片中）。
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {productsImages.map((prod) => (
                      <ProductImageRow 
                        key={prod.id} 
                        product={prod} 
                        onSave={handleSaveProductImage}
                        isSaving={savingProductImgSlug === prod.slug}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          // ==================== CLIENT MEMBER VIEW ====================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="client-view">
            
            {/* Left 2 cols: current credit status & application forms */}
            <div className="lg:col-span-2 space-y-8" id="client-left-col">
              
              {/* MEMBER PROFILE BALANCE & ACTIONS CARD */}
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in" id="client-balance-card">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 text-left uppercase tracking-widest font-sans flex items-center gap-1.5">
                    <DollarSign size={15} className="text-amber-500 animate-pulse shrink-0" />
                    <span>戶口可用餘額 (Account Credit Balance)</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-400 mr-0.5">HK$</span>
                    {userProfile?.balance || "0"}
                  </div>
                  {userProfile?.bank_name && userProfile?.bank_name !== "未設定" && (
                     <div className="text-xs text-gray-400 flex items-center gap-1.5 font-sans mt-2 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg w-fit">
                       <span>預設收款：</span>
                       <span className="font-semibold text-slate-600">{userProfile.bank_name}</span>
                       <span className="font-mono bg-slate-200/50 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{userProfile.bank_number}</span>
                     </div>
                  )}
                </div>

                <div className="flex gap-3 w-full md:w-auto shrink-0" id="client-actions-buttons">
                  <button
                    onClick={() => {
                      setRepayFps('');
                      setRepayAmount('');
                      setShowRepayModal(true);
                    }}
                    type="button"
                    className="flex-1 md:flex-none inline-flex items-center justify-center px-5 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-white font-extrabold text-xs tracking-wider transition-all shadow-sm active:scale-95"
                    id="btn-repay-trigger"
                  >
                    🤝 立即還款 (Repay)
                  </button>
                  <button
                    onClick={() => {
                      setWithdrawAmount('');
                      setShowWithdrawModal(true);
                    }}
                    type="button"
                    className="flex-1 md:flex-none inline-flex items-center justify-center px-5 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 border border-amber-400 text-white font-extrabold text-xs tracking-wider transition-all shadow-sm active:scale-95 text-center"
                    id="btn-withdraw-trigger"
                  >
                    💰 提款申請 (Withdraw)
                  </button>
                </div>
              </div>

              {/* MEMBER LOAN APPLICATION ACTION BLOCK */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-100" />
                    <span>特快會員專屬信用借支通道</span>
                  </h3>
                  <p className="text-xs text-amber-50 leading-relaxed max-w-lg font-medium">
                    作為認證會員，您可直接線上申請新的貸款額度，免除繁瑣流程，我們會在 15 分鐘內為您提供線上預核！
                  </p>
                </div>
                <button
                  onClick={() => setShowApplyForm(!showApplyForm)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-xs tracking-wider transition-all shadow-md self-start sm:self-auto shrink-0"
                >
                  {showApplyForm ? "✕ 關閉申請表單" : "✍️ 立即申請貸款"}
                </button>
              </div>

              {/* LOAN APPLICATION FORM */}
              {showApplyForm && (
                <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 sm:p-8 space-y-6 shadow-md animate-fade-in" id="member-direct-apply-form">
                  <div className="border-b border-gray-100 pb-3 flex items-center gap-2 select-none">
                    <Edit3 className="text-amber-500" size={18} />
                    <h3 className="text-base font-extrabold text-slate-800">遞交特快融資額度申請</h3>
                  </div>

                  <form onSubmit={handleMemberApplySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          申請貸款金額 (HK$) *
                        </label>
                        <input
                          type="number"
                          required
                          value={memberApplyAmount}
                          onChange={(e) => setMemberApplyAmount(e.target.value)}
                          placeholder="例如: 20000"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          香港身份證號碼 (HKID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={memberHkid}
                          onChange={(e) => setMemberHkid(e.target.value)}
                          placeholder="例如: A123456(7)"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          聯絡手機號碼 *
                        </label>
                        <input
                          type="text"
                          required
                          value={memberPhone}
                          onChange={(e) => setMemberPhone(e.target.value)}
                          placeholder="例如: 91440242"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          當前月收入 (HK$) *
                        </label>
                        <input
                          type="number"
                          required
                          value={memberSalary}
                          onChange={(e) => setMemberSalary(e.target.value)}
                          placeholder="例如: 18000"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          當前工作職業 *
                        </label>
                        <input
                          type="text"
                          required
                          value={memberOccupation}
                          onChange={(e) => setMemberOccupation(e.target.value)}
                          placeholder="例如: 經理 / 技術員 / 文員"
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        特殊備註或加急說明 (選填)
                      </label>
                      <textarea
                        rows={2}
                        value={memberNotes}
                        onChange={(e) => setMemberNotes(e.target.value)}
                        placeholder="如有其他收入流水或特別借調需求，請在此說明"
                        className="w-full p-4  rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowApplyForm(false)}
                        className="px-4 py-2.5 rounded-lg border border-gray-200 text-slate-500 text-xs font-extrabold uppercase tracking-wide hover:bg-gray-50"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={submittingMemberApply}
                        className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-widest shadow-md transition-colors"
                      >
                        {submittingMemberApply ? "申請傳送中..." : "✔ 核准並送出申請"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Account Status summaries cards */}
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-6 shadow-sm" id="client-accounts-card">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-base font-bold text-gray-900 tracking-wider">
                    我的還款與貸款賬戶 (My Loan Accounts)
                  </h2>
                </div>

                {clientAccounts.length === 0 ? (
                  <div className="bg-amber-50/50 border border-amber-500/10 rounded-xl p-5 text-center text-xs text-slate-500 font-medium leading-relaxed">
                    您目前名下暫無生效中的還信貸帳簿合同紀錄。一經面簽發放放水後，融資科目與付款日賬單將同步展示在本處。
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientAccounts.map((acc, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50/10 transition-colors grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-sm leading-normal">
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase font-sans">貸款合約編號</div>
                          <div className="font-bold text-gray-900">{acc.loan_number || `GRIT-${acc.id.substring(0, 6)}`}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase font-sans">未還清結欠餘額</div>
                          <div className="font-bold text-red-600">HK$ {(acc.outstanding_balance || 0).toLocaleString()}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] text-gray-400 font-bold uppercase font-sans">下期賬單還款日</div>
                          <div className="font-bold text-amber-600">
                            {acc.next_payment_due ? new Date(acc.next_payment_due).toLocaleDateString('zh-HK') : '無期數'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Online applications review history */}
              <div className="bg-white rounded-2xl border border-gray-150 p-6 sm:p-8 space-y-6 shadow-sm" id="client-applications-history">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-base font-bold text-gray-900 tracking-wider">
                    我的線上申請歷史紀錄 (Applications History)
                  </h2>
                </div>

                {clientApplications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                    目前暫無歷史線上申請表紀錄。
                  </div>
                ) : (
                  <div className="divide-y divide-gray-150 font-medium text-sm text-gray-650">
                    {clientApplications.map((app) => {
                      const meta = parseApprovalMetadata(app.previous_applications);
                      const isApproved = app.status === '已批准' && meta !== null;

                      if (isApproved && meta) {
                        return (
                          <div key={app.id} className="py-6 space-y-4" id={`approved-contract-card-${app.id}`}>
                            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl select-none">
                              <div className="space-y-0.5">
                                <div className="text-xs text-emerald-800 font-bold tracking-wider uppercase">🎉 恭喜！您申請的特快融資項目已批準簽署</div>
                                <div className="text-[11px] text-emerald-600 font-mono">貸款合約編號：{meta.loan_number}</div>
                              </div>
                              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-700 text-white tracking-widest leading-none">
                                已核准
                              </span>
                            </div>

                            {/* Grid of approved 14 characteristics */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4.5 bg-slate-50 border border-gray-150 p-5 rounded-2xl text-xs font-semibold text-slate-700 leading-normal shadow-inner animate-fade-in">
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">客戶名稱</div>
                                <div className="text-sm font-black text-slate-900">{meta.client_name || app.name_chinese}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">貸款合約編號</div>
                                <div className="text-xs font-black font-mono text-slate-950">{meta.loan_number}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">實批貸款額</div>
                                <div className="text-sm font-black font-mono text-amber-600">HK$ {Number(meta.approved_amount || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">其後未尚還本金</div>
                                <div className="text-sm font-black font-mono text-slate-800">HK$ {Number(meta.outstanding_principal || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">合約總結欠 (Total Arrears)</div>
                                <div className="text-sm font-black font-mono text-red-600">HK$ {Number(meta.total_balance || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">餘下還款期數</div>
                                <div className="text-sm font-black text-slate-800">{meta.remaining_periods}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">每月應供款額</div>
                                <div className="text-sm font-black font-mono text-slate-900">HK$ {Number(meta.monthly_payment || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">實際年利率 (APR)</div>
                                <div className="text-sm font-black font-mono text-emerald-600">{meta.apr}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">出款貸款生效日</div>
                                <div className="text-sm font-black font-mono text-slate-700">{meta.loan_date}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">終期貸款到期日</div>
                                <div className="text-sm font-black font-mono text-slate-700">{meta.loan_due_date}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">約定還款銀行</div>
                                <div className="text-sm font-black text-slate-800">{meta.repayment_bank}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">約定還款帳號</div>
                                <div className="text-sm font-black font-mono text-slate-800">{meta.repayment_account}</div>
                              </div>
                              <div className="space-y-1 font-sans col-span-2 md:col-span-3">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">約定還款日說明</div>
                                <div className="text-sm font-black text-amber-500">{meta.repayment_day}</div>
                              </div>
                              <div className="space-y-1 font-sans">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">申請狀態</div>
                                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 tracking-wider">
                                  {app.status}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Pre-approved state (Pending)
                      return (
                        <div key={app.id} className="py-4.5 flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 last:border-0" id={`pending-contract-card-${app.id}`}>
                          <div className="space-y-1 leading-normal">
                            <div className="text-gray-900 font-bold text-sm">
                              申請融資金額：<span className="font-mono text-amber-600">HK$ {(app.loan_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="font-mono text-xs text-gray-450 leading-loose">
                              遞約日期: {new Date(app.created_at).toLocaleDateString('zh-HK')}
                            </div>
                            <div className="text-xs text-blue-600 font-bold bg-blue-50/50 border border-blue-100 rounded px-2.5 py-1 inline-block mt-1">
                              🌟 預批信用額度：HK$ {(app.pre_approved_amount || 0).toLocaleString()}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${
                              app.status === '未批准'
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`} id={`status-badge-${app.id}`}>
                              {app.status || '審批中'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>



          


            {/* Right sidebar details */}
            <div className="space-y-6" id="client-right-col">
              <div className="bg-gradient-to-br from-teal-950 to-slate-900 text-white rounded-2xl p-6 border border-gray-850 shadow-md space-y-4">
                <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest border-b border-white/10 pb-3">
                  線上專人快捷融資通道
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                  由於您的有些信貸項目可能需要線上面簽、提供薪酬流水原件或證件正本。如需催辦進度或有任何還款期數微調需求，請直接點擊下方：
                </p>
                <div className="pt-2">
                  <a
                    href="https://wa.me/85291440242?text=你好，我是富毅信貸會員，我想加速審批我的特快信貸申請表"
                    target="_blank"
                    rel="noopener noreferrer referrerPolicy=no-referrer"
                    className="flex items-center justify-center gap-1.5 w-full py-3 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors text-xs uppercase tracking-wider shadow"
                  >
                    WhatsApp 加急審核
                  </a>
                </div>
              </div>

              {/* Secure notification */}
              <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-3 font-semibold">
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                  會員安全保障
                </h4>
                <div className="text-xs text-gray-500 space-y-1.5 leading-normal font-medium">
                  <p>1. 切勿隨意洩漏您的登密碼，以防止敏感信貸歷史遭冒名盗查。</p>
                  <p>2. 富毅信貸絕對不會在未經書面授權下，洩漏您的資料與 TU 信評軌跡給無關三方。</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 1. 審批貸款 & 合約詳情條款登錄 Modal */}
      {approvingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" style={{ contentVisibility: 'auto' }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-8" id="approval-core-modal">
            {/* Modal Title */}
            <div className="bg-slate-950 px-6 py-4.5 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="text-amber-500" size={18} />
                <h3 className="font-extrabold text-sm tracking-wider">審批客戶信貸申請 & 約據條款詳細登錄</h3>
              </div>
              <button
                type="button"
                onClick={() => setApprovingApp(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                id="btn-close-approve-modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveApproval} className="p-6 space-y-5">
              {/* Client Summary card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-700 leading-relaxed font-semibold">
                <div>
                  <span className="text-gray-400 font-bold block mb-0.5">客戶官方姓名</span>
                  <p className="text-sm font-black text-slate-900">{approvingApp.name_chinese || '無 (手動指定)'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-0.5">客戶申報金額</span>
                  <p className="text-sm font-black text-slate-900">HK$ {(approvingApp.loan_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-0.5">HKID 身份證明 · 手機</span>
                  <p className="text-slate-800">{approvingApp.hkid || '無'} · {approvingApp.phone || '無'}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block mb-0.5">申報工作月薪</span>
                  <p className="text-slate-800">{(approvingApp.occupation || '自由職業')} · HK$ {(approvingApp.monthly_salary || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Status & Contract serial info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                    決策審批狀態 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={applicationStatus}
                    onChange={(e) => setApplicationStatus(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs focus:ring-2 bg-white text-slate-800 font-bold font-sans"
                  >
                    <option value="審批中">🕒 審批中 (Pending Audit)</option>
                    <option value="已批准">✓ 已批准 (Approved - Generate Contract)</option>
                    <option value="被拒絕">✗ 被拒絕 (Rejected / Denied)</option>
                    <option value="需要補件">⚠ 需要補件 (Pending Documents)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                    核准信貸合約編號 (系統還款唯一鍵) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={loanNumber}
                    onChange={(e) => setLoanNumber(e.target.value)}
                    required
                    placeholder="例如：GRIT-2026-9876"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs focus:ring-2 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Specific terms panel - collapsible logically */}
              <div className="border-t border-dashed border-gray-150 pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>簽署約據核心信貸指標 & 還款銀行設定</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">合約姓名</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">放款本金 (HKD)</label>
                    <input
                      type="number"
                      value={approvedLoanAmount}
                      onChange={(e) => setApprovedLoanAmount(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">未還本金 (HKD)</label>
                    <input
                      type="number"
                      value={outstandingPrincipal}
                      onChange={(e) => setOutstandingPrincipal(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 font-mono bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">總還款餘額 (HKD)</label>
                    <input
                      type="number"
                      value={totalBalance}
                      onChange={(e) => setTotalBalance(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">還款期數</label>
                    <input
                      type="text"
                      value={remainingPeriods}
                      onChange={(e) => setRemainingPeriods(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">每期還款金額 (HKD)</label>
                    <input
                      type="number"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 font-mono bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">實際年利率 (APR)</label>
                    <input
                      type="text"
                      value={apr}
                      onChange={(e) => setApr(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">簽約放款日期</label>
                    <input
                      type="date"
                      value={loanDate}
                      onChange={(e) => setLoanDate(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">合約截止日期</label>
                    <input
                      type="date"
                      value={loanDueDate}
                      onChange={(e) => setLoanDueDate(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">約定還款銀行</label>
                    <input
                      type="text"
                      value={repaymentBank}
                      onChange={(e) => setRepaymentBank(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">官方指定專收帳戶</label>
                    <input
                      type="text"
                      value={repaymentAccount}
                      onChange={(e) => setRepaymentAccount(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">約定還款日說明</label>
                    <input
                      type="text"
                      value={repaymentDay}
                      onChange={(e) => setRepaymentDay(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-gray-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="border-t border-amber-200/40 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold mb-3">
                    <Key size={13} />
                    <span>🔑 客戶登入帳戶密碼設定 (Client Credentials)</span>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-800 mb-1.5">
                        設定/變更客戶之會員登入密碼:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={clientCustomPassword}
                          onChange={(e) => setClientCustomPassword(e.target.value)}
                          placeholder="請設定該客戶登入系統之密碼（至少 6 位字元）"
                          className="flex-1 h-9 px-2.5 rounded-lg border border-amber-200 text-xs text-slate-800 font-mono bg-white focus:ring-1 focus:ring-amber-400"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!clientCustomPassword.trim()) {
                              alert("請輸入要設定的新密碼！");
                              return;
                            }
                            if (clientCustomPassword.trim().length < 6) {
                              alert("密碼長度必須至少有 6 個字元！");
                              return;
                            }
                            try {
                              const appEmail = approvingApp.email?.toLowerCase().trim();
                              if (!appEmail) {
                                alert("客戶未有登記電郵位址，無法設定密碼。");
                                return;
                              }
                              
                              // Query profile in Firestore
                              const qProfile = query(collection(db, "profiles"), where("email", "==", appEmail));
                              const snapProfile = await getDocs(qProfile);
                              
                              if (!snapProfile.empty) {
                                const profileId = snapProfile.docs[0].id;
                                await setDoc(doc(db, "profiles", profileId), {
                                  custom_password: clientCustomPassword.trim()
                                }, { merge: true });
                                alert("✓ 密碼已成功即時修改！客戶隨時可以使用此新密碼登入。");
                              } else {
                                // Auto generate profile
                                const newUserId = approvingApp.user_id || `user_${Math.floor(100000 + Math.random() * 900000)}`;
                                await setDoc(doc(db, "profiles", newUserId), {
                                  user_id: newUserId,
                                  email: appEmail,
                                  display_name: clientName || approvingApp.name_chinese || '未命名',
                                  phone: approvingApp.phone || '',
                                  custom_password: clientCustomPassword.trim(),
                                  balance: '0'
                                }, { merge: true });
                                
                                await setDoc(doc(db, "user_roles", newUserId), {
                                  user_id: newUserId,
                                  role: "member"
                                }, { merge: true });

                                await updateDoc(doc(db, "loan_applications", approvingApp.id), {
                                  user_id: newUserId
                                });
                                alert("✓ 客戶登入帳戶已成功建立，並且登入密碼設定為：" + clientCustomPassword.trim());
                              }
                            } catch (err: any) {
                              alert("修改密碼發生錯誤: " + err.message);
                            }
                          }}
                          className="px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1 active:scale-95 shadow-xs"
                        >
                          <CheckCircle size={12} />
                          <span>即時儲存變更</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-600 mt-1.5 font-sans leading-relaxed">
                        您可隨時在此對密碼進行修更，變更將直接、即時適用於該客戶的登入帳戶。（密碼長度最少為 6 位）
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit panel */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setApprovingApp(null)}
                  className="px-4 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={savingApproval}
                  className="px-6 h-10 rounded-xl bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:bg-slate-300"
                >
                  <Save size={13} />
                  {savingApproval ? "審批存檔中..." : "確認核定存檔 & 發布合約"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. 手動錄入新客戶資料 & 授信申請表登錄 Modal */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden my-8" id="manual-add-app-modal">
            {/* Modal Title */}
            <div className="bg-emerald-950 px-6 py-4.5 flex items-center justify-between text-white border-b border-emerald-900">
              <div className="flex items-center gap-2">
                <User className="text-emerald-400" size={18} />
                <h3 className="font-extrabold text-sm tracking-wider">為客戶手動錄入新的信貸申請件</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAppModal(false)}
                className="p-1 rounded-lg hover:bg-emerald-900 text-emerald-300 hover:text-white transition-colors"
                id="btn-close-manual-add"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateManualApplication} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    顧客中文姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addAppName}
                    onChange={(e) => setAddAppName(e.target.value)}
                    required
                    placeholder="例如：陳大文"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs focus:ring-2 text-slate-800 bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    性別
                  </label>
                  <select
                    value={addAppGender}
                    onChange={(e) => setAddAppGender(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs focus:ring-2 text-slate-800 bg-white"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    HKID 身份證明號碼
                  </label>
                  <input
                    type="text"
                    value={addAppHkid}
                    onChange={(e) => setAddAppHkid(e.target.value)}
                    placeholder="例如：A123456(7)"
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    顧客手提電話號碼 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={addAppPhone}
                    onChange={(e) => setAddAppPhone(e.target.value)}
                    required
                    placeholder="例如：91234567"
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    電郵地址 (登入帳號對應)
                  </label>
                  <input
                    type="email"
                    value={addAppEmail}
                    onChange={(e) => setAddAppEmail(e.target.value)}
                    placeholder="不填則自動按手機產生存根"
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    申請額度金額 (HKD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={addAppLoanAmount}
                    onChange={(e) => setAddAppLoanAmount(e.target.value)}
                    required
                    placeholder="例如：50000"
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    職業名稱
                  </label>
                  <input
                    type="text"
                    value={addAppOccupation}
                    onChange={(e) => setAddAppOccupation(e.target.value)}
                    placeholder="例如：文員 / 地盤經理"
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    申報月收入 (HKD)
                  </label>
                  <input
                    type="number"
                    value={addAppSalary}
                    onChange={(e) => setAddAppSalary(e.target.value)}
                    placeholder="例如：22000"
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    居住物業類型
                  </label>
                  <select
                    value={addAppPropertyType}
                    onChange={(e) => setAddAppPropertyType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white"
                  >
                    <option value="私人住宅">私人住宅</option>
                    <option value="政府公屋">政府公屋</option>
                    <option value="居屋">居屋</option>
                    <option value="租用住宅">租用住宅</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-850 mb-1">
                    常規薪酬發放方式
                  </label>
                  <select
                    value={addAppPaymentMethod}
                    onChange={(e) => setAddAppPaymentMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white"
                  >
                    <option value="銀行自動轉賬">銀行自動轉賬</option>
                    <option value="現金發放">現金發放</option>
                    <option value="支票領取">支票領取</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-850 mb-1">
                  通訊居住地址
                </label>
                <input
                  type="text"
                  value={addAppAddress}
                  onChange={(e) => setAddAppAddress(e.target.value)}
                  placeholder="居住地址 (街道/大廈/樓層)"
                  className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs focus:ring-2 text-slate-800 bg-white"
                />
              </div>

              {/* Submit panel */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="px-4 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={savingNewApp}
                  className="px-6 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:bg-emerald-300"
                >
                  <Save size={13} />
                  {savingNewApp ? "正在保存錄入..." : "錄入新案 & 重整名錄"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Repayment Modal (還款) */}
      {showRepayModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-repay-wrapper">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-150 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 font-sans">
                <span>🤝 特快線上還款登記 (Repayment Portal)</span>
              </h3>
              <button 
                onClick={() => setShowRepayModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                id="btn-close-repay"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRepay} className="space-y-5" id="form-repay">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider text-left">
                  我們的收款轉數快帳戶 (FPS Account):
                </label>
                <div className="bg-amber-500/10 text-amber-900 px-4 py-3 rounded-xl border border-amber-500/20 text-xs font-extrabold font-mono tracking-wider flex items-center justify-between">
                  <span>FPS ID: 96396851</span>
                  <span className="bg-amber-500 text-white font-sans text-[10px] px-2 py-0.5 rounded uppercase">收款專用</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider text-left">
                  請填寫您轉賬的客人在用 FPS 帳戶 / 付款流水號:
                </label>
                <input 
                  type="text"
                  required
                  placeholder="請輸入您的 FPS 付款帳戶號碼或登記電話"
                  value={repayFps}
                  onChange={(e) => setRepayFps(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-255 text-sm focus:ring-2 text-slate-800 bg-white"
                  id="repay-fps-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider text-left">
                  還款金額 (HK$):
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  placeholder="請輸入您本次還款的實際金額"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-255 text-sm focus:ring-2 text-slate-800 bg-white"
                  id="repay-amount-input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRepayModal(false)}
                  className="px-4 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submittingTx}
                  className="px-6 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:bg-gray-400"
                >
                  {submittingTx ? "提交核對中..." : "確認遞交還款"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Withdrawal Modal (提款) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-withdraw-wrapper">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-150 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5 font-sans">
                <span>💰 特快提款放款申請 (Withdrawal Portal)</span>
              </h3>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                id="btn-close-withdraw"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitWithdraw} className="space-y-4" id="form-withdraw">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">
                  客人姓名 (預設個人資料)
                </label>
                <div className="w-full h-11 px-4 rounded-xl border border-gray-150 bg-gray-50 flex items-center text-sm font-bold text-slate-705">
                  {userProfile?.display_name || displayName}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">
                  預設銀行名稱 (預設個人資料)
                </label>
                <div className="w-full h-11 px-4 rounded-xl border border-gray-150 bg-gray-50 flex items-center text-sm font-bold text-slate-705">
                  {userProfile?.bank_name || "未設定 (請聯繫客服編輯預設收款行)"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-left">
                  預設銀行號碼 (預設個人資料)
                </label>
                <div className="w-full h-11 px-4 rounded-xl border border-gray-150 bg-gray-50 flex items-center text-sm font-bold text-slate-705 font-mono">
                  {userProfile?.bank_number || "未設定 (請聯繫客服編輯預設收款號)"}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-755 uppercase tracking-wider text-left">
                  提款金額 (HK$): <span className="text-red-500 font-bold">*</span>
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  placeholder="請輸入本次提款的自行填寫金額"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-255 text-sm focus:ring-2 text-slate-800 bg-white"
                  id="withdraw-amount-input"
                />
                <div className="text-[10px] text-gray-400 leading-normal text-left">
                  * 只有提款金額可以由客人自行填寫，其他資料皆隨您綁定的信用預設資料遞交。
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submittingTx}
                  className="px-6 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:bg-gray-400"
                >
                  {submittingTx ? "放款提交中..." : "確認提款申請"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Admin Edit Profile Balance & Details Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-edit-profile-wrapper">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-gray-150 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-955 flex items-center gap-1.5 font-sans">
                <Edit3 size={16} className="text-amber-500" />
                <span>編輯會員餘額與託管商戶資訊</span>
              </h3>
              <button 
                onClick={() => setEditingProfile(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                id="btn-close-edit-profile"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit} className="space-y-4" id="form-edit-profile">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 text-left">會員姓名:</label>
                <input 
                  type="text"
                  required
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs text-slate-800 bg-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-705 text-left">帳戶可用餘額 (HK$):</label>
                  <span className="text-[10px] text-amber-600 font-bold font-sans">後台任意修改 ✓</span>
                </div>
                <input 
                  type="text"
                  required
                  value={editProfileBalance}
                  onChange={(e) => setEditProfileBalance(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs text-slate-800 bg-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 text-left">預設收款銀行 (恆生/中銀/FPS等):</label>
                <input 
                  type="text"
                  value={editProfileBankName}
                  onChange={(e) => setEditProfileBankName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs text-slate-800 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 text-left">預設收款銀行戶口號碼 / 帳戶:</label>
                <input 
                  type="text"
                  value={editProfileBankNumber}
                  onChange={(e) => setEditProfileBankNumber(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs text-slate-800 bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 text-left">電話號碼:</label>
                  <input 
                    type="text"
                    value={editProfilePhone}
                    onChange={(e) => setEditProfilePhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs text-slate-800 bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 text-left">登記電郵:</label>
                  <input 
                    type="email"
                    value={editProfileEmail}
                    onChange={(e) => setEditProfileEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-250 text-xs text-slate-800 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-amber-600 text-left">🔑 變更會員登入密碼 (Login Password):</label>
                <input 
                  type="text"
                  value={editProfilePassword}
                  onChange={(e) => setEditProfilePassword(e.target.value)}
                  placeholder="請設定該會員之登入密碼"
                  className="w-full h-10 px-3 rounded-lg border border-amber-200 text-xs text-slate-800 bg-amber-500/5 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-600 text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={savingProfileEdit}
                  className="px-6 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  {savingProfileEdit ? "保存中..." : "保存帳資設定"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductImageRowProps {
  product: { id: string, slug: string, title: string, image_url: string };
  onSave: (slug: string, newUrl: string) => Promise<void>;
  isSaving: boolean;
}

const ProductImageRow: React.FC<ProductImageRowProps> = ({ product, onSave, isSaving }) => {
  const [url, setUrl] = useState(product.image_url);

  return (
    <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col sm:flex-row gap-4" id={`prod-img-row-${product.slug}`}>
      <div className="w-full sm:w-28 h-20 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-inner">
        {url ? (
          <img 
            src={url} 
            alt={product.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://www.image2url.com/r2/default/images/1776426806509-5b7fb5f2-959c-4fdf-97c7-c7ba8d67a14e.jpg';
            }}
          />
        ) : (
          <span className="text-xs text-gray-400">無預覽</span>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h4 className="text-xs font-extrabold text-slate-800 mb-1">{product.title} ({product.slug})</h4>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="貼上貸款產品封面圖 URL"
            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:ring-2 text-slate-800"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => onSave(product.slug, url)}
            disabled={isSaving || url === product.image_url}
            className="px-3 h-8 rounded-md bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 shadow-sm"
          >
            <Save size={10} />
            {isSaving ? "更新中..." : "保存項目圖"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
