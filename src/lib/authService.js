import { handleGoogleSuccess } from './googleAuthService';

// Service d'authentification personnalisé
class AuthService {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
  }

  // Charger les utilisateurs depuis localStorage
  loadUsers() {
    try {
      const users = localStorage.getItem('opportunai_users');
      return users ? JSON.parse(users) : {};
    } catch {
      return {};
    }
  }

  // Sauvegarder les utilisateurs
  saveUsers() {
    localStorage.setItem('opportunai_users', JSON.stringify(this.users));
  }

  // Charger l'utilisateur actuel
  loadCurrentUser() {
    try {
      const user = localStorage.getItem('opportunai_current_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  // Sauvegarder l'utilisateur actuel
  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem('opportunai_current_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('opportunai_current_user');
    }
  }

  // Connexion avec Google
  async loginWithGoogle(credentialResponse) {
    try {
      const userInfo = handleGoogleSuccess(credentialResponse);

      // Vérifier si l'utilisateur existe déjà
      let user = this.users[userInfo.email];

      if (!user) {
        // Créer un nouvel utilisateur
        user = {
          id: userInfo.id,
          email: userInfo.email,
          full_name: userInfo.full_name,
          picture: userInfo.picture,
          auth_provider: 'google',
          role: userInfo.email === 'admin@opportunai.com' ? 'admin' : 'user',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          is_active: true
        };
        this.users[userInfo.email] = user;
        this.saveUsers();
      } else {
        // Mettre à jour la dernière connexion
        user.last_login = new Date().toISOString();
        this.saveUsers();
      }

      this.currentUser = user;
      this.saveCurrentUser();

      return {
        user,
        needsOnboarding: !this.hasProfile(user.email)
      };
    } catch (error) {
      throw new Error('Échec de la connexion Google: ' + error.message);
    }
  }

  // Inscription par email
  async registerWithEmail(email, password, userData = {}) {
    if (this.users[email]) {
      throw new Error('Un compte existe déjà avec cet email');
    }

    const user = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      full_name: userData.full_name || email.split('@')[0],
      auth_provider: 'email',
      role: email === 'admin@opportunai.com' ? 'admin' : 'user',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      is_active: true,
      password: await this.hashPassword(password) // En production, utiliser bcrypt
    };

    this.users[email] = user;
    this.saveUsers();

    this.currentUser = user;
    this.saveCurrentUser();

    return {
      user,
      needsOnboarding: true
    };
  }

  // Connexion par email
  async loginWithEmail(email, password) {
    const user = this.users[email];

    if (!user || user.auth_provider !== 'email') {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe (en production, utiliser bcrypt.compare)
    if (!(await this.verifyPassword(password, user.password))) {
      throw new Error('Email ou mot de passe incorrect');
    }

    user.last_login = new Date().toISOString();
    this.saveUsers();

    this.currentUser = user;
    this.saveCurrentUser();

    return {
      user,
      needsOnboarding: !this.hasProfile(user.email)
    };
  }

  // Déconnexion
  logout() {
    this.currentUser = null;
    this.saveCurrentUser();
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    return this.currentUser;
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Vérifier si l'utilisateur a un profil
  hasProfile(email) {
    const profiles = this.loadProfiles();
    return !!profiles[email];
  }

  // Charger les profils
  loadProfiles() {
    try {
      const profiles = localStorage.getItem('opportunai_profiles');
      return profiles ? JSON.parse(profiles) : {};
    } catch {
      return {};
    }
  }

  // Sauvegarder un profil
  saveProfile(email, profile) {
    const profiles = this.loadProfiles();
    profiles[email] = {
      ...profile,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('opportunai_profiles', JSON.stringify(profiles));
  }

  // Obtenir le profil d'un utilisateur
  getProfile(email) {
    const profiles = this.loadProfiles();
    return profiles[email] || null;
  }

  // Obtenir tous les comptes utilisateurs enregistrés
  listUsers() {
    return Object.values(this.users);
  }

  // Hash simple du mot de passe (en production, utiliser bcrypt)
  async hashPassword(password) {
    // Simulation de hash - en production, utiliser une vraie fonction de hash
    return btoa(password + 'salt_opportunai');
  }

  // Vérification du mot de passe
  async verifyPassword(password, hash) {
    return await this.hashPassword(password) === hash;
  }
}

// Instance singleton
export const authService = new AuthService();