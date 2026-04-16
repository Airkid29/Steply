// Mock client to replace Base44 SDK
// Provides authentication and entity management with mock data

import { authService } from '@/lib/authService';

const mockUsers = {
  'google:1234567890': {
    id: 'mock-user-google-1',
    email: 'demo@opportunai.com',
    full_name: 'Demo User',
    auth_provider: 'google',
  },
};

const mockGoogleUsers = {
  'test.user@gmail.com': {
    id: 'google-user-1',
    email: 'test.user@gmail.com',
    full_name: 'Test User',
    auth_provider: 'google',
  },
  'student@university.edu': {
    id: 'google-user-2',
    email: 'student@university.edu',
    full_name: 'Student User',
    auth_provider: 'google',
  },
};

const mockDatabase = {
  UserProfile: [
    {
      id: 'profile-demo-1',
      created_by: 'demo@opportunai.com',
      created_date: new Date().toISOString(),
      name: 'Demo User',
      email: 'demo@opportunai.com',
      country: 'France',
      field_of_study: 'Computer Science',
      academic_level: 'bachelor_2',
      technical_skills: ['JavaScript', 'React', 'Python', 'SQL'],
      soft_skills: ['Communication', 'Teamwork', 'Problem Solving'],
      languages: ['English', 'French'],
      goals: ['internship', 'scholarship'],
      onboarding_completed: true,
      onboarding_step: 4,
    },
  ],
  Application: [],
  Opportunity: [
    // Tech & IT
    {
      id: 'opp-1',
      title: 'Senior React Developer',
      organizer: 'TechCorp',
      description: 'Experienced React developer for web platform',
      type: 'junior_job',
      country: 'Remote',
      deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      domains: ['Computer Science', 'Software Engineering'],
      skills_needed: ['React', 'JavaScript', 'Problem Solving'],
      level: 'bachelor',
      is_remote: true,
      created_date: new Date().toISOString(),
    },
    {
      id: 'opp-2',
      title: 'Data Science Hackathon 2024',
      organizer: 'DataVizCons',
      description: 'Build predictive models and visualizations',
      type: 'hackathon',
      country: 'Remote',
      deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      domains: ['Data Science', 'Mathematics'],
      skills_needed: ['Python', 'Problem Solving', 'Teamwork'],
      level: 'bachelor',
      is_remote: true,
      created_date: new Date(Date.now() - 86400000).toISOString(),
    },
    // Business & Management
    {
      id: 'opp-3',
      title: 'Business Analyst Internship',
      organizer: 'Global Consulting Inc',
      description: 'Analyze market trends and create strategic reports',
      type: 'internship',
      country: 'USA',
      deadline: new Date(Date.now() + 20*24*60*60*1000).toISOString(),
      domains: ['Business & Management', 'Economics'],
      skills_needed: ['Business Analysis', 'Excel Advanced', 'Communication'],
      level: 'bachelor',
      is_remote: false,
      created_date: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
    },
    {
      id: 'opp-4',
      title: 'Marketing & Social Media Scholarship',
      organizer: 'BrandStudio Foundation',
      description: '€5,000 scholarship for digital marketing students',
      type: 'scholarship',
      country: 'France',
      deadline: new Date(Date.now() + 45*24*60*60*1000).toISOString(),
      domains: ['Marketing', 'Communications'],
      skills_needed: ['Digital Marketing', 'Social Media', 'Creativity'],
      level: 'bachelor',
      is_remote: true,
      created_date: new Date(Date.now() - 10*24*60*60*1000).toISOString(),
    },
    // Creative & Design
    {
      id: 'opp-5',
      title: 'UX/UI Design Internship',
      organizer: 'Creative Studios Co',
      description: 'Design mobile app interfaces for emerging market apps',
      type: 'internship',
      country: 'Spain',
      deadline: new Date(Date.now() + 25*24*60*60*1000).toISOString(),
      domains: ['Design', 'Graphic Design'],
      skills_needed: ['UI/UX Design', 'Figma', 'Creativity', 'Communication'],
      level: 'bachelor',
      is_remote: true,
      created_date: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
    },
    // Finance & Accounting
    {
      id: 'opp-6',
      title: 'Junior Accountant Position',
      organizer: 'Finance Solutions Ltd',
      description: 'Support audit and financial reporting teams',
      type: 'junior_job',
      country: 'Germany',
      deadline: new Date(Date.now() + 35*24*60*60*1000).toISOString(),
      domains: ['Finance', 'Economics'],
      skills_needed: ['Accounting', 'Excel Advanced', 'Attention to Detail'],
      level: 'bachelor',
      is_remote: false,
      created_date: new Date(Date.now() - 8*24*60*60*1000).toISOString(),
    },
    // Healthcare
    {
      id: 'opp-7',
      title: 'Healthcare Administration Internship',
      organizer: 'Medical Centers Network',
      description: 'Administrative support in hospital management',
      type: 'internship',
      country: 'Canada',
      deadline: new Date(Date.now() + 40*24*60*60*1000).toISOString(),
      domains: ['Healthcare', 'Public Health'],
      skills_needed: ['Organization', 'Communication', 'Problem Solving'],
      level: 'bachelor',
      is_remote: false,
      created_date: new Date(Date.now() - 12*24*60*60*1000).toISOString(),
    },
    // Communications & Journalism
    {
      id: 'opp-8',
      title: 'Content Writer Competition',
      organizer: 'Digital Media Awards',
      description: 'Write compelling stories - best submissions win prizes',
      type: 'competition',
      country: 'Remote',
      deadline: new Date(Date.now() + 60*24*60*60*1000).toISOString(),
      domains: ['Communications', 'Journalism'],
      skills_needed: ['Copywriting', 'Critical Thinking', 'Creativity'],
      level: 'any',
      is_remote: true,
      created_date: new Date(Date.now() - 15*24*60*60*1000).toISOString(),
    },
    // Law & Political Science
    {
      id: 'opp-9',
      title: 'Legal Research Internship',
      organizer: 'Law Associates Practice',
      description: 'Research case law and prepare legal documents',
      type: 'internship',
      country: 'UK',
      deadline: new Date(Date.now() + 28*24*60*60*1000).toISOString(),
      domains: ['Law', 'Political Science'],
      skills_needed: ['Legal Research', 'Communication', 'Attention to Detail'],
      level: 'bachelor',
      is_remote: false,
      created_date: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
    },
    // Human Resources
    {
      id: 'opp-10',
      title: 'HR Recruitment Internship',
      organizer: 'TalentWorks Agency',
      description: 'Help source and screen candidates for various positions',
      type: 'internship',
      country: 'Netherlands',
      deadline: new Date(Date.now() + 32*24*60*60*1000).toISOString(),
      domains: ['Human Resources', 'Business & Management'],
      skills_needed: ['Recruitment', 'Communication', 'Teamwork'],
      level: 'bachelor',
      is_remote: true,
      created_date: new Date(Date.now() - 6*24*60*60*1000).toISOString(),
    },
    // Sciences & Research
    {
      id: 'opp-11',
      title: 'Environmental Science Research Scholarship',
      organizer: 'Green Earth Institute',
      description: '€8,000 for research on sustainable agriculture',
      type: 'scholarship',
      country: 'Global',
      deadline: new Date(Date.now() + 50*24*60*60*1000).toISOString(),
      domains: ['Environmental Science', 'Biology'],
      skills_needed: ['Research', 'Problem Solving', 'Critical Thinking'],
      level: 'master',
      is_remote: true,
      created_date: new Date(Date.now() - 20*24*60*60*1000).toISOString(),
    },
    // Education
    {
      id: 'opp-12',
      title: 'Teacher Preparation Program',
      organizer: 'Education Foundation',
      description: 'Scholarship for aspiring educators - includes mentorship',
      type: 'scholarship',
      country: 'USA',
      deadline: new Date(Date.now() + 55*24*60*60*1000).toISOString(),
      domains: ['Education', 'Psychology'],
      skills_needed: ['Communication', 'Leadership', 'Creativity'],
      level: 'bachelor',
      is_remote: true,
      created_date: new Date(Date.now() - 18*24*60*60*1000).toISOString(),
    },
  ],
};

let currentUser = null;

export const mockClient = {
  auth: {
    me: async () => {
      // First try currentUser (for same-session persistence)
      if (currentUser) {
        return currentUser;
      }
      
      // If currentUser is null, try to load from authService (for page refresh)
      const authUser = authService.getCurrentUser();
      if (authUser) {
        currentUser = authUser; // Cache it for this session
        return authUser;
      }
      
      throw new Error('User not authenticated');
    },

    redirectToLogin: (redirectUrl) => {
      // Simulate Google login flow
      console.log('Mock: Redirecting to Google login');
      
      // Show email input dialog
      setTimeout(() => {
        const email = prompt('Demo Login\n\nTry: demo@opportunai.com or test@gmail.com\n\nEnter your email:');
        if (email) {
          // Create or get user
          let user = mockGoogleUsers[email] || {
            id: `google-user-${Date.now()}`,
            email: email,
            full_name: email.split('@')[0],
            auth_provider: 'google',
          };
          currentUser = user;
          // Dispatch event for auth state update
          window.dispatchEvent(new CustomEvent('user-authenticated', { detail: user }));
          // Redirect after small delay
          if (redirectUrl) {
            setTimeout(() => window.location.href = redirectUrl, 300);
          }
        }
      }, 100);
    },

    logout: (redirectUrl) => {
      // Mock logout
      console.log('Mock: Logging out');
      currentUser = null;
      window.dispatchEvent(new Event('user-logged-out'));
      // Redirect to home after small delay
      setTimeout(() => {
        window.location.href = redirectUrl || '/';
      }, 100);
    },

    googleSignIn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const email = prompt('Sign in with Google\n\nTry: demo@opportunai.com or test@gmail.com\n\nEnter your email:');
          if (email) {
            let user = mockGoogleUsers[email] || {
              id: `google-user-${Date.now()}`,
              email: email,
              full_name: email.split('@')[0],
              auth_provider: 'google',
            };
            currentUser = user;
            window.dispatchEvent(new CustomEvent('user-authenticated', { detail: user }));
            resolve(user);
          } else {
            resolve(null);
          }
        }, 500);
      });
    },
  },

  entities: {
    UserProfile: {
      list: async (orderBy, limit) => {
        return mockDatabase.UserProfile;
      },

      filter: async (query = {}, orderBy) => {
        const { created_by } = query;
        if (!created_by) {
          return mockDatabase.UserProfile;
        }
        return mockDatabase.UserProfile.filter((p) => p.created_by === created_by);
      },

      create: async (data) => {
        const newProfile = {
          id: `profile-${Date.now()}`,
          created_by: currentUser?.email || mockUsers.demo.email,
          created_date: new Date().toISOString(),
          ...data,
        };
        mockDatabase.UserProfile.push(newProfile);
        return newProfile;
      },

      update: async (id, data) => {
        const index = mockDatabase.UserProfile.findIndex((p) => p.id === id);
        if (index !== -1) {
          mockDatabase.UserProfile[index] = {
            ...mockDatabase.UserProfile[index],
            ...data,
            updated_date: new Date().toISOString(),
          };
          return mockDatabase.UserProfile[index];
        }
        return null;
      },

      delete: async (id) => {
        const index = mockDatabase.UserProfile.findIndex((p) => p.id === id);
        if (index !== -1) {
          mockDatabase.UserProfile.splice(index, 1);
          return true;
        }
        return false;
      },
    },

    Application: {
      list: async (orderBy, limit) => {
        return mockDatabase.Application;
      },

      filter: async (query = {}, orderBy) => {
        const { created_by } = query;
        if (!created_by) {
          return mockDatabase.Application;
        }
        return mockDatabase.Application.filter((a) => a.created_by === created_by);
      },

      create: async (data) => {
        const newApplication = {
          id: `app-${Date.now()}`,
          created_by: currentUser?.email || mockUsers.demo.email,
          created_date: new Date().toISOString(),
          ...data,
        };
        mockDatabase.Application.push(newApplication);
        return newApplication;
      },

      update: async (id, data) => {
        const index = mockDatabase.Application.findIndex((a) => a.id === id);
        if (index !== -1) {
          mockDatabase.Application[index] = {
            ...mockDatabase.Application[index],
            ...data,
            updated_date: new Date().toISOString(),
          };
          return mockDatabase.Application[index];
        }
        return null;
      },

      delete: async (id) => {
        const index = mockDatabase.Application.findIndex((a) => a.id === id);
        if (index !== -1) {
          mockDatabase.Application.splice(index, 1);
          return true;
        }
        return false;
      },
    },

    Opportunity: {
      list: async (orderBy, limit) => {
        const result = [...mockDatabase.Opportunity];
        if (orderBy === '-created_date') {
          result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        }
        return limit ? result.slice(0, limit) : result;
      },

      filter: async (query = {}, orderBy) => {
        return mockDatabase.Opportunity;
      },

      get: async (id) => {
        return mockDatabase.Opportunity.find((o) => o.id === id);
      },

      create: async (data) => {
        const newOpportunity = {
          id: `opp-${Date.now()}`,
          created_date: new Date().toISOString(),
          ...data,
        };
        mockDatabase.Opportunity.push(newOpportunity);
        return newOpportunity;
      },

      update: async (id, data) => {
        const index = mockDatabase.Opportunity.findIndex((o) => o.id === id);
        if (index !== -1) {
          mockDatabase.Opportunity[index] = {
            ...mockDatabase.Opportunity[index],
            ...data,
            updated_date: new Date().toISOString(),
          };
          return mockDatabase.Opportunity[index];
        }
        return null;
      },

      delete: async (id) => {
        const index = mockDatabase.Opportunity.findIndex((o) => o.id === id);
        if (index !== -1) {
          mockDatabase.Opportunity.splice(index, 1);
          return true;
        }
        return false;
      },
    },
  },

  integrations: {
    Core: {
      InvokeLLM: async (params) => {
        // Mock LLM response
        const { prompt } = params;
        return {
          success: true,
          result: 'This is a mock LLM response for: ' + (prompt || ''),
        };
      },

      UploadFile: async (params) => {
        // Mock file upload
        return {
          success: true,
          fileId: `file-${Date.now()}`,
          url: 'mock-file-url',
        };
      },
    },
  },
};

// Initialize currentUser
mockClient.auth.me().then((user) => {
  currentUser = user;
});

export default mockClient;
