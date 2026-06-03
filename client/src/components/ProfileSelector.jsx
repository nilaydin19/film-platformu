import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Check } from 'lucide-react';

export default function ProfileSelector({ onProfileSelected }) {
  const { user, switchProfile, fetchUserInfo } = useAuth();
  const { t } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIsKids, setNewProfileIsKids] = useState(false);

  const handleSwitch = async (profileId) => {
    try {
      await switchProfile(profileId);
      onProfileSelected();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName) return;
    try {
      const response = await fetch('https://film-platformu-server.vercel.app/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newProfileName, isKids: newProfileIsKids })
      });
      if (response.ok) {
        setNewProfileName('');
        setNewProfileIsKids(false);
        setShowAddForm(false);
        // Sayfa yenileme yerine kullanıcıyı dinamik olarak tazeleyelim
        await fetchUserInfo();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#070708] px-4">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-10 tracking-tight">{t('who_is_watching')}</h1>
      
      <div className="flex flex-wrap justify-center gap-8 mb-10">
        {user?.profiles.map((profile) => (
          <div 
            key={profile._id || profile.id}
            onClick={() => handleSwitch(profile._id || profile.id)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-purple-500 transition-all duration-300 shadow-lg relative">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform" />
              {String(user.activeProfileId) === String(profile._id || profile.id) && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Check className="w-8 h-8 text-purple-400" />
                </div>
              )}
              {profile.isKids && (
                <span className="absolute bottom-2 right-2 bg-emerald-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow">
                  KIDS
                </span>
              )}
            </div>
            <span className="text-sm text-gray-400 group-hover:text-white font-semibold mt-3 transition-colors">{profile.name}</span>
          </div>
        ))}

        {user?.profiles.length < 4 && (
          <div 
            onClick={() => setShowAddForm(true)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/5 border border-dashed border-white/20 group-hover:border-purple-500/50 flex items-center justify-center hover:bg-white/10 transition-all shadow-lg">
              <Plus className="w-8 h-8 text-gray-500 group-hover:text-purple-400" />
            </div>
            <span className="text-sm text-gray-500 group-hover:text-white font-semibold mt-3">{t('profile_add')}</span>
          </div>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddProfile} className="w-full max-w-sm flex flex-col gap-4 bg-[#111113] p-5 rounded-3xl border border-white/5 shadow-2xl animate-fade-in">
          <div>
            <label className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-wider">{t('profile_name')}</label>
            <input 
              type="text"
              placeholder={t('profile_name')}
              required
              value={newProfileName}
              onChange={e => setNewProfileName(e.target.value)}
              className="w-full bg-[#070708] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 font-bold hover:text-white transition-colors">
              <input 
                type="checkbox" 
                checked={newProfileIsKids} 
                onChange={e => setNewProfileIsKids(e.target.checked)} 
                className="accent-purple-600 w-4 h-4 rounded" 
              />
              <span>Çocuk Profili (Kids)</span>
            </label>
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase cursor-pointer transition-all shrink-0">{t('create')}</button>
          </div>
        </form>
      )}
    </div>
  );
}
