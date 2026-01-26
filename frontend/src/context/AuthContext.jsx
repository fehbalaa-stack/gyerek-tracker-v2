import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('hu'); 

  useEffect(() => {
    const savedUser = localStorage.getItem('oooVooo_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setLanguage(parsedUser.language || 'hu');
      } catch (e) {
        localStorage.removeItem('oooVooo_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setLanguage(userData.language || 'hu');
    localStorage.setItem('oooVooo_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setLanguage('hu'); 
    localStorage.removeItem('oooVooo_user');
  };

  // 🔥 JAVÍTÁS: Konstansként definiálva a Provider-en BELÜL
  const updateGlobalLanguage = (newLang) => {
    console.log("Nyelvváltás folyamatban ide:", newLang); // Debughoz
    setLanguage(newLang); 
    
    // Frissítjük a user state-et is, hogy a Navbar 'user' objektuma is változzon
    setUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, language: newLang };
        localStorage.setItem('oooVooo_user', JSON.stringify(updated));
        return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      language,            
      updateGlobalLanguage 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);