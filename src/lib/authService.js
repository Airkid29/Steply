import { handleGoogleSuccess } from './googleAuthService';

// Custom authentication service
const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : email);

class AuthService {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
  }

  findUserByEmail(email) {
    const normalized = normalizeEmail(email);
    if (!normalized) return null;
    if (this.users[normalized]) return this.users[normalized];
    return Object.values(this.users).find((user) => normalizeEmail(user.email) === normalized) || null;
  }

  // Load users from localStorage
  loadUsers() {
    try {
      const users = localStorage.getItem('steply_users');
      return users ? JSON.parse(users) : {};
    } catch {
      return {};
    }
  }

  // Save users
  saveUsers() {
    localStorage.setItem('steply_users', JSON.stringify(this.users));
  }

  // Load current user
  loadCurrentUser() {
    try {
      const user = localStorage.getItem('steply_current_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  // Save current user
  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem('steply_current_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('steply_current_user');
    }
  }

  // Google login
  async loginWithGoogle(credentialResponse) {
    try {
      const userInfo = handleGoogleSuccess(credentialResponse);
      const email = normalizeEmail(userInfo.email);

      // Check if user already exists
      let user = this.findUserByEmail(email);

      if (!user) {
        // Create a new user
        user = {
          id: userInfo.id,
          email,
          full_name: userInfo.full_name,
          picture: userInfo.picture,
          auth_provider: 'google',
          role: userInfo.email === 'admin@steply.com' ? 'admin' : 'user',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          is_active: true
        };
        this.users[userInfo.email] = user;
        this.saveUsers();
      } else {
        // Update last login
        user.last_login = new Date().toISOString();
        if (user.email !== email) {
          user.email = email;
          this.users[email] = user;
        }
        this.saveUsers();
      }

      this.currentUser = user;
      this.saveCurrentUser();

      return {
        user,
        needsOnboarding: !this.hasProfile(user.email)
      };
    } catch (error) {
      throw new Error('Google login failed: ' + error.message);
    }
  }

  // Register by email
  async registerWithEmail(email, password, userData = {}) {
    const normalizedEmail = normalizeEmail(email);
    if (this.findUserByEmail(normalizedEmail)) {
      throw new Error('An account already exists with this email');
    }

    const user = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: normalizedEmail,
      full_name: userData.full_name || email.split('@')[0],
      auth_provider: 'email',
      role: email === 'admin@steply.com' ? 'admin' : 'user',
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

  // Login by email
  async loginWithEmail(email, password) {
    const normalizedEmail = normalizeEmail(email);
    const user = this.findUserByEmail(normalizedEmail);

    if (!user || user.auth_provider !== 'email') {
      throw new Error('Incorrect email or password');
    }

    // Verify password (use bcrypt.compare in production)
    if (!(await this.verifyPassword(password, user.password))) {
      throw new Error('Incorrect email or password');
    }

    user.last_login = new Date().toISOString();
    if (user.email !== normalizedEmail) {
      user.email = normalizedEmail;
      this.users[normalizedEmail] = user;
    }
    this.saveUsers();

    this.currentUser = user;
    this.saveCurrentUser();

    return {
      user,
      needsOnboarding: !this.hasProfile(user.email)
    };
  }

  // Logout
  logout() {
    this.currentUser = null;
    this.saveCurrentUser();
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Check if user has a profile
  hasProfile(email) {
    const normalizedEmail = normalizeEmail(email);
    const profiles = this.loadProfiles();
    return !!profiles[normalizedEmail];
  }

  // Load profiles
  loadProfiles() {
    try {
      const profiles = localStorage.getItem('steply_profiles');
      return profiles ? JSON.parse(profiles) : {};
    } catch {
      return {};
    }
  }

  // Save a profile
  saveProfile(email, profile) {
    const normalizedEmail = normalizeEmail(email);
    const profiles = this.loadProfiles();
    profiles[normalizedEmail] = {
      ...profile,
      email: normalizedEmail,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('steply_profiles', JSON.stringify(profiles));
  }

  // Get a user's profile
  getProfile(email) {
    const normalizedEmail = normalizeEmail(email);
    const profiles = this.loadProfiles();
    return profiles[normalizedEmail] || null;
  }

  // Get all registered user accounts
  listUsers() {
    return Object.values(this.users);
  }

  // Simple password hash (use a real hash in production)
  async hashPassword(password) {
    // Simulation de hash - en production, utiliser une vraie fonction de hash
    return btoa(password + 'salt_steply');
  }

  // Verify password
  async verifyPassword(password, hash) {
    return await this.hashPassword(password) === hash;
  }
}

// Instance singleton
export const authService = new AuthService();