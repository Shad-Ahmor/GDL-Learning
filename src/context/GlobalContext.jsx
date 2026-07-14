import React, { createContext, useState, useEffect, useContext } from 'react';

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  // Load initial settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gdl_settings');
    const tenantSchoolName = localStorage.getItem('gdl_school_name');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (tenantSchoolName) {
        parsed.schoolName = tenantSchoolName;
      }
      return parsed;
    }
    return {
      theme: 'light', // Default to clean day mode
      themeColor: 'blue', // Default accent color
      schoolName: tenantSchoolName || 'GDL International School',
      schoolTitle: 'Excellence in Education',
      schoolLocation: 'New Delhi, India',
      schoolLogo: null, // Can hold a base64 string
    };
  });

  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    fetch('http://localhost:1422/api/setup/school')
      .then(res => res.json())
      .then(data => {
        if (data && data.schoolName) {
          setSettings(prev => ({ ...prev, schoolName: data.schoolName, themeColor: data.themeColor || prev.themeColor }));
          localStorage.setItem('gdl_school_name', data.schoolName);
        }
      })
      .catch(err => console.error("Error fetching school config in GlobalContext:", err));

    fetch('http://localhost:1422/api/setup/sessions')
      .then(res => res.json())
      .then(data => {
        const active = data.find(s => s.isActive);
        if (active) setActiveSession(active);
      })
      .catch(err => console.error("Error fetching sessions in GlobalContext:", err));
  }, []);

  // Whenever settings change, save to localStorage
  useEffect(() => {
    localStorage.setItem('gdl_settings', JSON.stringify(settings));
  }, [settings]);

  // Apply theme class and highlight accent colors dynamically
  useEffect(() => {
    const root = document.documentElement;
    const isDark = settings.theme === 'dark';
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const accent = settings.themeColor || 'blue';
    const colors = {
      blue: {
        light: { primary: '221.2 83.2% 53.3%', foreground: '210 40% 98%', ring: '221.2 83.2% 53.3%' },
        dark: { primary: '217.2 91.2% 59.8%', foreground: '222.2 47.4% 11.2%', ring: '212.7 26.8% 83.9%' }
      },
      orange: {
        light: { primary: '24.6 95% 53.1%', foreground: '60 9.1% 97.8%', ring: '24.6 95% 53.1%' },
        dark: { primary: '20.5 90.2% 48.2%', foreground: '60 9.1% 97.8%', ring: '20.5 90.2% 48.2%' }
      },
      emerald: {
        light: { primary: '142.1 76.2% 36.3%', foreground: '355.6 100% 99%', ring: '142.1 76.2% 36.3%' },
        dark: { primary: '142.1 70.6% 45.3%', foreground: '144.4 61.5% 9.2%', ring: '142.1 70.6% 45.3%' }
      },
      purple: {
        light: { primary: '262.1 83.3% 57.8%', foreground: '210 40% 98%', ring: '262.1 83.3% 57.8%' },
        dark: { primary: '263.4 70% 50.4%', foreground: '210 40% 98%', ring: '263.4 70% 50.4%' }
      },
      rose: {
        light: { primary: '349.7 89.2% 60.2%', foreground: '0 0% 100%', ring: '349.7 89.2% 60.2%' },
        dark: { primary: '351.3 90% 50%', foreground: '0 0% 100%', ring: '351.3 90% 50%' }
      }
    };

    const config = (colors[accent] || colors.blue)[isDark ? 'dark' : 'light'];

    root.style.setProperty('--primary', config.primary);
    root.style.setProperty('--primary-foreground', config.foreground);
    root.style.setProperty('--ring', config.ring);
  }, [settings.theme, settings.themeColor]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <GlobalContext.Provider value={{ settings, updateSetting, activeSession }}>
      {children}
    </GlobalContext.Provider>
  );
};
