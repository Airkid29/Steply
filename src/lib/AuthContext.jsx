import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from './authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthError({
        type: 'auth_check_failed',
        message: 'Erreur lors de la vérification de l\'authentification'
      });
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loginWithGoogle = async (credentialResponse) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const result = await authService.loginWithGoogle(credentialResponse);

      setUser(result.user);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);

      return result;
    } catch (error) {
      console.error('Google login failed:', error);
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Échec de la connexion Google'
      });
      setIsLoadingAuth(false);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const result = await authService.loginWithEmail(email, password);

      setUser(result.user);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);

      return result;
    } catch (error) {
      console.error('Email login failed:', error);
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Échec de la connexion'
      });
      setIsLoadingAuth(false);
      throw error;
    }
  };

  const registerWithEmail = async (email, password, userData = {}) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const result = await authService.registerWithEmail(email, password, userData);

      setUser(result.user);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);

      return result;
    } catch (error) {
      console.error('Email registration failed:', error);
      setAuthError({
        type: 'registration_failed',
        message: error.message || 'Échec de l\'inscription'
      });
      setIsLoadingAuth(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const saveProfile = (profile) => {
    if (user) {
      authService.saveProfile(user.email, profile);
    }
  };

  const getProfile = () => {
    if (user) {
      return authService.getProfile(user.email);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      saveProfile,
      getProfile,
      checkAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
