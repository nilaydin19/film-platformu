import React, { useState, useRef, useEffect } from 'react';
import { Home, Film, Tv, ListPlus, Shield, LogOut, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout, user, toggleMockRoleAndSubscription } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const menuItems = [
    { id: 'home', labelKey: 'home', icon: Home },
    { id: 'movies', labelKey: 'movies', icon: Film },
    { id: 'series', labelKey: 'series', icon: Tv },
    { id: 'mylist', labelKey: 'curator_rooms', icon: ListPlus },
  ];

  const languages = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLanguageName = languages.find(l => l.code === language)?.name || 'Türkçe';

  return (
    <>
      {/* Masaüstü Sol Menü */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[#070708] border-r border-white/5 p-6 z-40 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => setActiveTab('home')}>
            <span className="text-2xl font-black tracking-wider text-purple-500 font-sans">KINOIA</span>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">MAX</span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-purple-600/10 text-purple-400 border-l-4 border-purple-500 pl-3' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t(item.labelKey)}
                </button>
              );
            })}

            {/* Sadece Adminlere Özel Sekme */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-purple-400 border border-purple-500/30 transition-all ${
                  activeTab === 'admin' ? 'bg-purple-600/20 text-white' : 'hover:bg-purple-600/10'
                }`}
              >
                <Shield className="w-5 h-5" />
                {t('admin_panel')}
              </button>
            )}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#111113] rounded-xl border border-white/5 text-xs text-gray-400">
            <p className="font-bold text-gray-200 truncate">{user?.email}</p>
            <p className="mt-1 text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('role')}: {user?.role}</p>
            
            <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-white/5">
              <span className={`px-2 py-0.5 rounded text-center w-full font-bold ${user?.subscriptionStatus === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {user?.subscriptionStatus === 'active' ? t('active_subscriber') : t('inactive_member')}
              </span>
              <button 
                onClick={() => toggleMockRoleAndSubscription(
                  user?.role === 'admin' ? 'user' : 'admin', 
                  user?.subscriptionStatus === 'active' ? 'inactive' : 'active'
                )}
                className="text-[10px] text-purple-400 underline hover:text-purple-300 text-center"
              >
                {t('mock_switch')}
              </button>
            </div>
          </div>

          {/* Premium Dil Seçici Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>{currentLanguageName}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {langDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111113]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 py-1.5 animate-fade-in">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-left text-xs transition-all cursor-pointer ${
                      language === lang.code 
                        ? 'text-purple-400 font-extrabold bg-purple-600/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10"
          >
            {t('profile_change')}
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobil Alt Menü */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#070708]/90 backdrop-blur-md border-t border-white/5 flex justify-around py-3 z-50">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === item.id ? 'text-purple-400' : 'text-gray-400'}`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === 'admin' ? 'text-white' : 'text-purple-400'}`}
          >
            <Shield className="w-5 h-5" />
            <span>{t('admin_panel')}</span>
          </button>
        )}
      </nav>
    </>
  );
}

