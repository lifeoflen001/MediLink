import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  bloodType: string;
  allergies: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface AppContextType {
  favorites: string[];
  recentSearches: string[];
  reminders: Reminder[];
  userProfile: UserProfile;
  addFavorite: (pharmacyId: string) => void;
  removeFavorite: (pharmacyId: string) => void;
  isFavorite: (pharmacyId: string) => boolean;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
  name: 'Guest User',
  bloodType: '',
  allergies: '',
  emergencyContact: '',
  emergencyPhone: '',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    (async () => {
      try {
        const [favs, searches, rems, profile] = await Promise.all([
          AsyncStorage.getItem('favorites'),
          AsyncStorage.getItem('recentSearches'),
          AsyncStorage.getItem('reminders'),
          AsyncStorage.getItem('userProfile'),
        ]);
        if (favs) setFavorites(JSON.parse(favs));
        if (searches) setRecentSearches(JSON.parse(searches));
        if (rems) setReminders(JSON.parse(rems));
        if (profile) setUserProfile(JSON.parse(profile));
      } catch {}
    })();
  }, []);

  const addFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const updated = [...prev, id];
      AsyncStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f !== id);
      AsyncStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const addRecentSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== query);
      const updated = [query, ...filtered].slice(0, 8);
      AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem('recentSearches');
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setReminders(prev => {
      const updated = [newReminder, ...prev];
      AsyncStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      AsyncStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => {
      const updated = prev.filter(r => r.id !== id);
      AsyncStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
      AsyncStorage.setItem('reminders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem('userProfile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      favorites, recentSearches, reminders, userProfile,
      addFavorite, removeFavorite, isFavorite,
      addRecentSearch, clearRecentSearches,
      addReminder, updateReminder, deleteReminder, toggleReminder,
      updateProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
