import { authService } from '@/lib/authService';

const DEFAULT_OPPORTUNITIES = [
  // IT & Tech
  {
    id: 'opp-1',
    title: 'Senior React Developer',
    organizer: 'TechCorp',
    description: 'Experienced React developer for web platform',
    requirements: ['React', 'JavaScript', 'TypeScript', 'REST APIs'],
    type: 'junior_job',
    country: 'Remote',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Software Engineering', 'Frontend'],
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
    requirements: ['Python', 'Data Analysis', 'Machine Learning'],
    type: 'hackathon',
    country: 'Remote',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Data Science', 'Mathematics'],
    skills_needed: ['Python', 'Problem Solving', 'Teamwork'],
    level: 'bachelor',
    is_remote: true,
    created_date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'opp-3',
    title: 'Business Analyst Internship',
    organizer: 'Global Consulting Inc',
    description: 'Analyze market trends and create strategic reports',
    requirements: ['Excel', 'Analysis', 'Communication'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Business & Management', 'Economics'],
    skills_needed: ['Business Analysis', 'Excel Advanced', 'Communication'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-4',
    title: 'Marketing & Social Media Scholarship',
    organizer: 'BrandStudio Foundation',
    description: '€5,000 scholarship for digital marketing students',
    requirements: ['Marketing', 'Content Creation', 'Strategy'],
    type: 'scholarship',
    country: 'France',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Marketing', 'Communications'],
    skills_needed: ['Social Media', 'Creativity', 'Writing'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-5',
    title: 'Creative Design Fellowship',
    organizer: 'FutureLabs',
    description: 'Design digital campaigns and visual storytelling',
    requirements: ['Graphic Design', 'Figma', 'Branding'],
    type: 'competition',
    country: 'USA',
    deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Design', 'Creative'],
    skills_needed: ['Design', 'Creativity', 'Communication'],
    level: 'bachelor',
    is_remote: true,
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // More IT
  {
    id: 'opp-6',
    title: 'Full Stack Developer Internship',
    organizer: 'StartupXYZ',
    description: 'Build and maintain web applications',
    requirements: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
    type: 'internship',
    country: 'Remote',
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Software Engineering', 'Full Stack'],
    skills_needed: ['JavaScript', 'Problem Solving', 'Teamwork'],
    level: 'bachelor',
    is_remote: true,
    created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-7',
    title: 'Cybersecurity Analyst Job',
    organizer: 'SecureTech',
    description: 'Monitor and protect network security',
    requirements: ['Network Security', 'Python', 'Risk Assessment'],
    type: 'junior_job',
    country: 'France',
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Cybersecurity', 'IT Security'],
    skills_needed: ['Security Analysis', 'Python', 'Critical Thinking'],
    level: 'master',
    is_remote: false,
    created_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-8',
    title: 'AI/ML Research Competition',
    organizer: 'AI Institute',
    description: 'Develop innovative AI solutions',
    requirements: ['Python', 'TensorFlow', 'Research'],
    type: 'competition',
    country: 'Remote',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Artificial Intelligence', 'Research'],
    skills_needed: ['Machine Learning', 'Python', 'Innovation'],
    level: 'phd',
    is_remote: true,
    created_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Business & Finance
  {
    id: 'opp-9',
    title: 'Financial Analyst Internship',
    organizer: 'FinanceCorp',
    description: 'Analyze financial data and create reports',
    requirements: ['Excel', 'Financial Modeling', 'Analysis'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Finance', 'Business Analysis'],
    skills_needed: ['Financial Analysis', 'Excel', 'Attention to Detail'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-10',
    title: 'Marketing Manager Position',
    organizer: 'BrandAgency',
    description: 'Lead marketing campaigns and strategies',
    requirements: ['Marketing Strategy', 'Digital Marketing', 'Leadership'],
    type: 'junior_job',
    country: 'Remote',
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Marketing', 'Management'],
    skills_needed: ['Strategy', 'Leadership', 'Creativity'],
    level: 'master',
    is_remote: true,
    created_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-11',
    title: 'Entrepreneurship Scholarship',
    organizer: 'Business Foundation',
    description: '€10,000 for innovative business ideas',
    requirements: ['Business Plan', 'Innovation', 'Entrepreneurship'],
    type: 'scholarship',
    country: 'Europe',
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Entrepreneurship', 'Business'],
    skills_needed: ['Innovation', 'Business Planning', 'Leadership'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Healthcare & Medicine
  {
    id: 'opp-12',
    title: 'Medical Research Internship',
    organizer: 'Health Institute',
    description: 'Assist in clinical research studies',
    requirements: ['Research', 'Data Analysis', 'Medical Knowledge'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Healthcare', 'Research'],
    skills_needed: ['Research', 'Analysis', 'Attention to Detail'],
    level: 'master',
    is_remote: false,
    created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-13',
    title: 'Public Health Analyst Job',
    organizer: 'Health Ministry',
    description: 'Analyze public health data and policies',
    requirements: ['Public Health', 'Statistics', 'Policy Analysis'],
    type: 'junior_job',
    country: 'France',
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Public Health', 'Government'],
    skills_needed: ['Data Analysis', 'Policy', 'Communication'],
    level: 'master',
    is_remote: false,
    created_date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Engineering
  {
    id: 'opp-14',
    title: 'Mechanical Engineering Internship',
    organizer: 'Engineering Corp',
    description: 'Design and test mechanical systems',
    requirements: ['CAD', 'Mechanical Design', 'Prototyping'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Mechanical Engineering', 'Design'],
    skills_needed: ['CAD', 'Problem Solving', 'Technical Skills'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-15',
    title: 'Civil Engineering Competition',
    organizer: 'Engineering Society',
    description: 'Design sustainable infrastructure solutions',
    requirements: ['Civil Engineering', 'Sustainability', 'Design'],
    type: 'competition',
    country: 'Europe',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Civil Engineering', 'Sustainability'],
    skills_needed: ['Engineering Design', 'Innovation', 'Teamwork'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Education & Teaching
  {
    id: 'opp-16',
    title: 'Education Technology Internship',
    organizer: 'EdTech Startup',
    description: 'Develop educational software and content',
    requirements: ['Education', 'Technology', 'Content Creation'],
    type: 'internship',
    country: 'Remote',
    deadline: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Education', 'EdTech'],
    skills_needed: ['Teaching', 'Technology', 'Creativity'],
    level: 'bachelor',
    is_remote: true,
    created_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Arts & Creative
  {
    id: 'opp-17',
    title: 'Graphic Design Scholarship',
    organizer: 'Design Foundation',
    description: '€3,000 for creative design students',
    requirements: ['Graphic Design', 'Portfolio', 'Creativity'],
    type: 'scholarship',
    country: 'France',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Graphic Design', 'Arts'],
    skills_needed: ['Design', 'Creativity', 'Adobe Suite'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-18',
    title: 'Film Production Internship',
    organizer: 'Film Studio',
    description: 'Assist in film production and editing',
    requirements: ['Film Production', 'Video Editing', 'Creativity'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Film', 'Media'],
    skills_needed: ['Video Production', 'Creativity', 'Teamwork'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Environmental & Sustainability
  {
    id: 'opp-19',
    title: 'Environmental Science Internship',
    organizer: 'Green NGO',
    description: 'Research and implement sustainability projects',
    requirements: ['Environmental Science', 'Research', 'Sustainability'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Environmental Science', 'Sustainability'],
    skills_needed: ['Research', 'Analysis', 'Environmental Awareness'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-20',
    title: 'Sustainability Hackathon',
    organizer: 'EcoTech',
    description: 'Develop solutions for environmental challenges',
    requirements: ['Sustainability', 'Innovation', 'Technology'],
    type: 'hackathon',
    country: 'Remote',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Sustainability', 'Technology'],
    skills_needed: ['Innovation', 'Problem Solving', 'Teamwork'],
    level: 'bachelor',
    is_remote: true,
    created_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Law & Legal
  {
    id: 'opp-21',
    title: 'Legal Research Internship',
    organizer: 'Law Firm',
    description: 'Conduct legal research and case analysis',
    requirements: ['Legal Research', 'Analysis', 'Writing'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Law', 'Legal Research'],
    skills_needed: ['Research', 'Analysis', 'Writing'],
    level: 'master',
    is_remote: false,
    created_date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Hospitality & Tourism
  {
    id: 'opp-22',
    title: 'Hotel Management Internship',
    organizer: 'Luxury Hotel Chain',
    description: 'Learn hospitality operations and management',
    requirements: ['Hospitality', 'Customer Service', 'Management'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Hospitality', 'Management'],
    skills_needed: ['Customer Service', 'Communication', 'Organization'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Sports & Recreation
  {
    id: 'opp-23',
    title: 'Sports Management Internship',
    organizer: 'Sports Club',
    description: 'Organize events and manage sports programs',
    requirements: ['Sports Management', 'Event Planning', 'Leadership'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Sports Management', 'Event Planning'],
    skills_needed: ['Organization', 'Leadership', 'Communication'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Journalism & Media
  {
    id: 'opp-24',
    title: 'Digital Journalism Internship',
    organizer: 'News Media',
    description: 'Create digital content and social media',
    requirements: ['Journalism', 'Content Creation', 'Social Media'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Journalism', 'Digital Media'],
    skills_needed: ['Writing', 'Social Media', 'Creativity'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Psychology & Social Sciences
  {
    id: 'opp-25',
    title: 'Psychology Research Assistant',
    organizer: 'Psychology Lab',
    description: 'Assist in psychological research studies',
    requirements: ['Psychology', 'Research', 'Data Analysis'],
    type: 'internship',
    country: 'France',
    deadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Psychology', 'Research'],
    skills_needed: ['Research', 'Analysis', 'Empathy'],
    level: 'master',
    is_remote: false,
    created_date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // More IT variety
  {
    id: 'opp-26',
    title: 'UX/UI Designer Job',
    organizer: 'DesignTech',
    description: 'Design user interfaces and experiences',
    requirements: ['UX Design', 'UI Design', 'Figma'],
    type: 'junior_job',
    country: 'Remote',
    deadline: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Design', 'UX/UI'],
    skills_needed: ['Design', 'User Research', 'Creativity'],
    level: 'bachelor',
    is_remote: true,
    created_date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'opp-27',
    title: 'DevOps Engineer Internship',
    organizer: 'CloudTech',
    description: 'Manage cloud infrastructure and deployments',
    requirements: ['DevOps', 'AWS', 'Docker'],
    type: 'internship',
    country: 'Remote',
    deadline: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['DevOps', 'Cloud Computing'],
    skills_needed: ['Infrastructure', 'Automation', 'Problem Solving'],
    level: 'bachelor',
    is_remote: true,
    created_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // More Business
  {
    id: 'opp-28',
    title: 'HR Recruitment Specialist',
    organizer: 'HR Solutions',
    description: 'Manage recruitment and talent acquisition',
    requirements: ['HR', 'Recruitment', 'Communication'],
    type: 'junior_job',
    country: 'France',
    deadline: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Human Resources', 'Recruitment'],
    skills_needed: ['Communication', 'Organization', 'People Skills'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // More Healthcare
  {
    id: 'opp-29',
    title: 'Nursing Scholarship',
    organizer: 'Health Foundation',
    description: '€8,000 for nursing students',
    requirements: ['Nursing', 'Healthcare', 'Compassion'],
    type: 'scholarship',
    country: 'France',
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Nursing', 'Healthcare'],
    skills_needed: ['Patient Care', 'Empathy', 'Medical Knowledge'],
    level: 'bachelor',
    is_remote: false,
    created_date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // More Engineering
  {
    id: 'opp-30',
    title: 'Electrical Engineering Job',
    organizer: 'Energy Corp',
    description: 'Design electrical systems and circuits',
    requirements: ['Electrical Engineering', 'Circuit Design', 'CAD'],
    type: 'junior_job',
    country: 'France',
    deadline: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000).toISOString(),
    domains: ['Electrical Engineering', 'Energy'],
    skills_needed: ['Circuit Design', 'Technical Analysis', 'Problem Solving'],
    level: 'master',
    is_remote: false,
    created_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const APPLICATION_STORAGE_KEY = 'opportunai_applications';

const loadApplications = () => {
  try {
    const apps = localStorage.getItem(APPLICATION_STORAGE_KEY);
    return apps ? JSON.parse(apps) : [];
  } catch {
    return [];
  }
};

const saveApplications = (applications) => {
  localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(applications));
};

const mockLLM = async ({ prompt }) => {
  const normalized = prompt.toLowerCase();

  if (normalized.includes('generate 5 realistic interview questions')) {
    return {
      questions: Array.from({ length: 5 }, (_, index) => ({
        question: `Question ${index + 1}: Tell me about a time you used your skills to solve a real problem related to the role.`,
        category: index % 2 === 0 ? 'Behavioral' : 'Technical',
        tip: index % 2 === 0 ? 'Keep your answer personal and concrete.' : 'Explain the technical decision clearly.',
      })),
    };
  }

  if (normalized.includes('evaluate the answer')) {
    return {
      score: 7,
      what_was_good: 'You answered clearly and referenced relevant experience.',
      improvement: 'Try to include a more specific example and structure your response.',
      ideal_hint: 'Start with the situation, explain your action, and finish with the result.',
    };
  }

  if (normalized.includes('generate a concise, practical action plan')) {
    return {
      steps: [
        'Review the organization and highlight three specific reasons you want to join.',
        'Match your strongest skills to the role requirements and note examples.',
        'Prepare a short summary of why you are a good fit for this opportunity.',
        'Practice a short pitch explaining your motivation and relevant experience.',
        'Submit your application before the deadline and follow up if possible.',
      ],
      missing_requirements: ['Direct internship experience', 'Advanced Excel skills'],
      priority_tip: 'Focus on your real academic projects and soft skills that show teamwork.',
    };
  }

  if (normalized.includes('write a short, compelling motivation letter')) {
    return `Dear Hiring Team,

I am excited to apply for the ${prompt.includes('Opportunity:') ? prompt.split('Opportunity:')[1].split('\n')[0].trim() : 'opportunity'} because I am passionate about the work your team is doing. My experience in ${prompt.includes('Field:') ? prompt.split('Field:')[1].split('\n')[0].trim() : 'my field'} and my practical skills in ${prompt.includes('Skills:') ? prompt.split('Skills:')[1].split('\n')[0].trim() : 'relevant areas'} make me a strong candidate.

I am a motivated student who learns quickly, communicates clearly, and brings genuine enthusiasm to every project. I believe I can contribute immediately while continuing to grow through this role.

Thank you for considering my application. I look forward to the opportunity to demonstrate my motivation and commitment.`;
  }

  if (normalized.includes('analyze this resume')) {
    const score = 72;
    return {
      overall_score: score,
      summary: 'Strong foundational resume with room to sharpen technical keywords and achievements.',
      strengths: ['Clear structure', 'Relevant academic focus', 'Good variety of skills'],
      improvements: ['Add specific impact metrics', 'Highlight recent projects', 'Use more field-relevant keywords'],
      missing_keywords: ['Python', 'Data analysis', 'Project management'],
      skills_found: ['Communication', 'Teamwork'],
      profile_sync_tip: 'Add these skills to your profile to improve your matches.',
    };
  }

  return { message: 'This feature is not yet available in offline mode.' };
};

export const base44 = {
  auth: {
    loginWithGoogle: (credentialResponse) => authService.loginWithGoogle(credentialResponse),
    logout: (redirectUrl) => {
      authService.logout();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    getCurrentUser: () => authService.getCurrentUser(),
    isAuthenticated: () => authService.isAuthenticated(),
    me: () => Promise.resolve(authService.getCurrentUser()),
    listUsers: () => Promise.resolve(authService.listUsers()),
    redirectToLogin: (redirectUrl) => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = '/login';
      }
    },
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        if (!file) throw new Error('No file provided');
        const fileUrl = URL.createObjectURL(file);
        return { file_url: fileUrl };
      },
      InvokeLLM: async (params) => {
        return mockLLM(params);
      },
      SendEmail: async () => {
        return { success: true };
      },
    },
  },

  entities: {
    UserProfile: {
      get: async (id) => {
        const profiles = authService.loadProfiles();
        const profileById = Object.values(profiles).find((profile) => profile.id === id);
        if (profileById) return profileById;
        const user = authService.getCurrentUser();
        return user ? profiles[user.email] || null : null;
      },

      create: async (data) => {
        const user = authService.getCurrentUser();
        if (!user) throw new Error('User not authenticated');
        const profile = {
          ...data,
          id: user.id,
          created_by: user.email,
          email: user.email,
          created_date: new Date().toISOString(),
          onboarding_completed: data.onboarding_completed || false,
          onboarding_step: data.onboarding_step || 0,
        };
        authService.saveProfile(user.email, profile);
        return profile;
      },

      update: async (id, data) => {
        const user = authService.getCurrentUser();
        if (!user) throw new Error('User not authenticated');
        const existingProfile = authService.getProfile(user.email) || {};
        const updatedProfile = {
          ...existingProfile,
          ...data,
          id: existingProfile.id || id,
          email: user.email,
          created_by: user.email,
          created_date: existingProfile.created_date || new Date().toISOString(),
          updated_date: new Date().toISOString(),
        };
        authService.saveProfile(user.email, updatedProfile);
        return updatedProfile;
      },

      list: async () => {
        const user = authService.getCurrentUser();
        if (!user) return [];
        const profile = authService.getProfile(user.email);
        return profile ? [profile] : [];
      },

      filter: async (query = {}) => {
        const profiles = Object.values(authService.loadProfiles());
        return profiles.filter((profile) => {
          return Object.entries(query).every(([key, value]) => {
            if (value === undefined) return true;
            return profile[key] === value;
          });
        });
      },
    },

    Application: {
      list: async () => {
        return loadApplications();
      },

      create: async (data) => {
        const user = authService.getCurrentUser();
        if (!user) throw new Error('User not authenticated');
        const applications = loadApplications();
        const newApp = {
          ...data,
          id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          created_by: user.email,
          created_date: new Date().toISOString(),
          status: data.status || 'saved',
        };
        applications.push(newApp);
        saveApplications(applications);
        return newApp;
      },

      update: async (id, data) => {
        const applications = loadApplications();
        const index = applications.findIndex((app) => app.id === id);
        if (index === -1) throw new Error('Application not found');
        applications[index] = { ...applications[index], ...data, updated_date: new Date().toISOString() };
        saveApplications(applications);
        return applications[index];
      },

      delete: async (id) => {
        const applications = loadApplications();
        const filtered = applications.filter((app) => app.id !== id);
        saveApplications(filtered);
        return true;
      },

      filter: async (query = {}) => {
        const applications = loadApplications();
        return applications.filter((app) => {
          return Object.entries(query).every(([key, value]) => {
            if (value === undefined) return true;
            return String(app[key]) === String(value);
          });
        });
      },
    },

    Opportunity: {
      list: async (orderBy, limit) => {
        let results = [...DEFAULT_OPPORTUNITIES];
        if (orderBy === '-created_date') {
          results.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        }
        if (limit) {
          results = results.slice(0, limit);
        }
        return results;
      },

      get: async (id) => {
        return DEFAULT_OPPORTUNITIES.find((opp) => String(opp.id) === String(id)) || null;
      },

      create: async (data) => {
        const opportunity = {
          ...data,
          id: `opp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          created_date: new Date().toISOString(),
        };
        return opportunity;
      },

      update: async (id, data) => {
        return { ...data, id };
      },

      delete: async (id) => true,

      filter: async (query = {}) => {
        const opportunities = [...DEFAULT_OPPORTUNITIES];
        return opportunities.filter((opp) => {
          return Object.entries(query).every(([key, value]) => {
            if (value === undefined) return true;
            return String(opp[key]) === String(value);
          });
        });
      },
    },
  },
};

export default base44;

