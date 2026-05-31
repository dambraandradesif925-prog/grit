import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { LoanProduct } from '../types';

// The navigation menu definition from the scraped bundle
const navItems = [
  { label: "首頁", href: "/", hash: "" },
  { label: "關於我們", href: "/", hash: "about" },
  { label: "貸款優勢", href: "/", hash: "advantages" },
  { label: "私隱政策", href: "/PrivacyPolicy", hash: "" },
  { label: "使用條款", href: "/Termsofuse", hash: "" },
  { label: "放債人條例", href: "/MoneyLendersOrdinance", hash: "" },
  { label: "聯絡我們", href: "/", hash: "contact" }
];

export const logoUrl = "https://grit-credit.com/assets/logo-D_TUe9TF.jpg";

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [products, setProducts] = useState<Pick<LoanProduct, 'slug' | 'title'>[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    supabase
      .from("loan_products")
      .select("slug, title")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setProducts(data);
        }
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProductsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    let element = document.getElementById(id);
    if (!element) {
      element = document.getElementById(`home-sec-${id}`);
    }
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[number]) => {
    if (item.hash) {
      e.preventDefault();
      setMobileMenuOpen(false);
      if (location.pathname === "/") {
        scrollToSection(item.hash);
      } else {
        navigate("/");
        setTimeout(() => scrollToSection(item.hash), 150);
      }
    } else {
      setMobileMenuOpen(false);
    }
  };

  const handleLoansClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setProductsMenuOpen(false);
    if (location.pathname === "/") {
      scrollToSection("loans");
    } else {
      navigate("/");
      setTimeout(() => scrollToSection("loans"), 150);
    }
  };

  const handleLogoutClick = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-150 shadow-sm" id="main-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0" id="nav-logo-link">
            <img 
              src={logoUrl} 
              alt="富毅信貸有限公司" 
              className="h-10 w-auto object-contain" 
              id="nav-logo-img"
              onError={(e) => {
                // If remote logo fails, show a clean elegant fallback design
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col select-none" id="nav-brand-text">
              <span className="text-sm font-bold text-gray-900 tracking-tight">富毅信貸有限公司</span>
              <span className="text-[9px] text-gray-500 font-mono tracking-wider">GRIT CREDIT LIMITED</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1" id="nav-links-desktop">
            {navItems.slice(0, 2).map(item => (
              <Link
                key={item.label}
                to={item.hash ? `/#${item.hash}` : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`px-3 py-2 text-sm rounded-md transition-colors hover:text-amber-500 ${
                  !item.hash && location.pathname === item.href 
                    ? "text-amber-500 font-semibold" 
                    : "text-gray-700 font-medium"
                }`}
                id={`nav-item-${item.label}`}
              >
                {item.label}
              </Link>
            ))}

            {/* Products Dropdown menu */}
            <div ref={dropdownRef} className="relative" id="nav-dropdown-products">
              <button
                onMouseEnter={() => setProductsMenuOpen(true)}
                onClick={handleLoansClick}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 rounded-md transition-colors hover:text-amber-500 cursor-pointer"
                id="nav-btn-products"
              >
                貸款項目
                <ChevronDown size={14} className={`transition-transform duration-200 ${productsMenuOpen ? "rotate-180" : ""}`} />
              </button>
              
              {productsMenuOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-150 rounded-lg shadow-lg py-1 z-50 animate-fade-in"
                  onMouseEnter={() => setProductsMenuOpen(true)}
                  onMouseLeave={() => setProductsMenuOpen(false)}
                  id="nav-dropdown-menu"
                >
                  {/* Option to view/scroll to all products in home page */}
                  <button
                    onClick={handleLoansClick}
                    className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-amber-500 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    所有貸款項目 &raquo;
                  </button>
                  {products.length > 0 ? (
                    products.map(p => (
                      <Link
                        key={p.slug}
                        to={`/loan/${p.slug}`}
                        onClick={() => setProductsMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition-colors"
                        id={`nav-loan-${p.slug}`}
                      >
                        {p.title}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2.5 text-xs text-gray-400">載入中...</div>
                  )}
                </div>
              )}
            </div>

            {navItems.slice(2).map(item => (
              <Link
                key={item.label}
                to={item.hash ? `/#${item.hash}` : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`px-3 py-2 text-sm rounded-md transition-colors hover:text-amber-500 ${
                  !item.hash && location.pathname === item.href 
                    ? "text-amber-500 font-semibold" 
                    : "text-gray-700 font-medium"
                }`}
                id={`nav-item-${item.label}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right CTA / Auth (Desktop) */}
          <div className="hidden md:flex items-center gap-2" id="nav-cta-desktop">
            {user ? (
              <>
                <Link 
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-amber-500 transition-colors"
                  id="nav-btn-dashboard"
                >
                  <UserIcon size={14} />
                  {isAdmin ? "管理員面板" : "我的帳戶"}
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-900 transition-colors"
                  id="nav-btn-logout"
                >
                  <LogOut size={14} />
                  登出
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-amber-500 text-amber-500 text-sm font-semibold hover:bg-amber-50/50 transition-colors"
                id="nav-btn-login"
              >
                <UserIcon size={14} />
                登入
              </Link>
            )}
            
            <Link
              to="/online"
              className="inline-flex items-center px-5 py-2 rounded-md bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
              id="nav-btn-apply-cta"
            >
              立即申請
            </Link>
          </div>

          {/* Hamburguer icon */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            id="nav-toggle-mobile"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-150 animate-slide-down" id="nav-mobile-container">
          <div className="px-4 py-3 space-y-1">
            {navItems.slice(0, 2).map(item => (
              <Link
                key={item.label}
                to={item.hash ? `/#${item.hash}` : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition-colors"
                id={`nav-mobile-${item.label}`}
              >
                {item.label}
              </Link>
            ))}

            {/* Sub-menu on mobile */}
            <div>
              <button
                onClick={() => setProductsMenuOpen(!productsMenuOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition-colors"
                id="nav-mobile-btn-products"
              >
                <span>貸款項目</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${productsMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {productsMenuOpen && (
                <div className="pl-6 space-y-1 mt-1 bg-gray-50 rounded-md py-1" id="nav-mobile-products-list">
                  <button
                    onClick={handleLoansClick}
                    className="block w-full text-left px-3 py-2 text-sm font-semibold text-amber-500 hover:text-amber-600"
                    id="nav-mobile-loan-all"
                  >
                    所有貸款項目 &raquo;
                  </button>
                  {products.map(p => (
                    <Link
                      key={p.slug}
                      to={`/loan/${p.slug}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setProductsMenuOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-amber-500"
                      id={`nav-mobile-loan-${p.slug}`}
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navItems.slice(2).map(item => (
              <Link
                key={item.label}
                to={item.hash ? `/#${item.hash}` : item.href}
                onClick={(e) => handleNavClick(e, item)}
                className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition-colors"
                id={`nav-mobile-${item.label}`}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-100 space-y-2" id="nav-mobile-cta-section">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                    id="nav-mobile-btn-dashboard"
                  >
                    <UserIcon size={14} />
                    {isAdmin ? "管理員面板" : "我的帳戶"}
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center gap-1.5 w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:bg-gray-50"
                    id="nav-mobile-btn-logout"
                  >
                    <LogOut size={14} />
                    登出
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border border-amber-500 text-amber-500 hover:bg-amber-50"
                  id="nav-mobile-btn-login"
                >
                  <UserIcon size={14} />
                  登入
                </Link>
              )}
              
              <Link
                to="/online"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-4 py-2 rounded-md bg-amber-500 text-white text-sm font-semibold text-center hover:bg-amber-600 shadow-sm"
                id="nav-mobile-btn-apply-cta"
              >
                立即申請
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
