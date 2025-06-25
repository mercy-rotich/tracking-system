// MockData.js - Updated with better department organization
const mockSchools = [
  { id: 'sci', name: 'Computing & Informatics', icon: 'laptop-code' },
  { id: 'sbe', name: 'Business & Economics', icon: 'chart-line' },
  { id: 'sea', name: 'Engineering & Architecture', icon: 'cogs' },
  { id: 'son', name: 'Nursing', icon: 'heartbeat' },
  { id: 'sed', name: 'Education', icon: 'chalkboard-teacher' },
  { id: 'safs', name: 'Agriculture & Food Science', icon: 'seedling' },
  { id: 'spas', name: 'Pure & Applied Sciences', icon: 'atom' },
  { id: 'scmh', name: 'Clinical Medicine & Health', icon: 'user-md' }
];

const mockPrograms = [
  { id: 'phd', name: 'PhD Program', displayName: 'PhD Program', icon: 'graduation-cap' },
  { id: 'bachelor', name: "Bachelor's Degree", displayName: "Bachelor's Degree", icon: 'user-graduate' },
  { id: 'masters', name: "Master's Degree", displayName: "Master's Degree", icon: 'user-tie' }
];

const mockCurriculaData = [
  // School of Computing & Informatics (sci)
  {
    id: 'CUR-001',
    title: 'Bachelor of Science in Computer Science',
    status: 'approved',
    createdDate: '2024-01-15',
    lastModified: '2024-02-10',
    schoolId: 'sci',
    programId: 'bachelor',
    department: 'Computer Science'
  },
  {
    id: 'CUR-002',
    title: 'Bachelor of Science in Software Engineering',
    status: 'pending',
    createdDate: '2024-02-01',
    lastModified: '2024-02-15',
    schoolId: 'sci',
    programId: 'bachelor',
    department: 'Computer Science'
  },
  {
    id: 'CUR-003',
    title: 'Bachelor of Science in Cybersecurity and Forensics',
    status: 'approved',
    createdDate: '2024-01-20',
    lastModified: '2024-02-05',
    schoolId: 'sci',
    programId: 'bachelor',
    department: 'Cybersecurity'
  },
  {
    id: 'CUR-004',
    title: 'Bachelor of Science in Data Analytics',
    status: 'draft',
    createdDate: '2024-02-10',
    lastModified: '2024-02-18',
    schoolId: 'sci',
    programId: 'bachelor',
    department: 'Data Science'
  },
  {
    id: 'CUR-005',
    title: 'Master of Science in Artificial Intelligence',
    status: 'approved',
    createdDate: '2024-01-25',
    lastModified: '2024-02-12',
    schoolId: 'sci',
    programId: 'masters',
    department: 'Computer Science'
  },
  {
    id: 'CUR-006',
    title: 'Bachelor of Information Technology',
    status: 'pending',
    createdDate: '2024-01-30',
    lastModified: '2024-02-20',
    schoolId: 'sci',
    programId: 'bachelor',
    department: 'Information Technology'
  },
  {
    id: 'CUR-007',
    title: 'Master of Science in Data Science',
    status: 'approved',
    createdDate: '2024-02-05',
    lastModified: '2024-02-25',
    schoolId: 'sci',
    programId: 'masters',
    department: 'Data Science'
  },
  {
    id: 'CUR-008',
    title: 'PhD in Computer Science',
    status: 'draft',
    createdDate: '2024-02-15',
    lastModified: '2024-02-28',
    schoolId: 'sci',
    programId: 'phd',
    department: 'Computer Science'
  },

  // School of Business & Economics (sbe)
  {
    id: 'CUR-009',
    title: 'Bachelor of Business Administration',
    status: 'approved',
    createdDate: '2024-01-10',
    lastModified: '2024-02-05',
    schoolId: 'sbe',
    programId: 'bachelor',
    department: 'Business Administration'
  },
  {
    id: 'CUR-010',
    title: 'Master of Business Administration',
    status: 'pending',
    createdDate: '2024-01-20',
    lastModified: '2024-02-10',
    schoolId: 'sbe',
    programId: 'masters',
    department: 'Business Administration'
  },
  {
    id: 'CUR-011',
    title: 'Bachelor of Economics',
    status: 'approved',
    createdDate: '2024-01-25',
    lastModified: '2024-02-15',
    schoolId: 'sbe',
    programId: 'bachelor',
    department: 'Economics'
  },
  {
    id: 'CUR-012',
    title: 'Bachelor of Accounting and Finance',
    status: 'rejected',
    createdDate: '2024-02-01',
    lastModified: '2024-02-20',
    schoolId: 'sbe',
    programId: 'bachelor',
    department: 'Accounting'
  },

  // School of Clinical Medicine & Health (scmh)
  {
    id: 'CUR-013',
    title: 'Master of Science in Public Health',
    status: 'approved',
    createdDate: '2024-01-12',
    lastModified: '2024-02-08',
    schoolId: 'scmh',
    programId: 'masters',
    department: 'Public Health'
  },
  {
    id: 'CUR-014',
    title: 'Bachelor of Medicine and Surgery',
    status: 'pending',
    createdDate: '2024-01-18',
    lastModified: '2024-02-12',
    schoolId: 'scmh',
    programId: 'bachelor',
    department: 'Medicine'
  },
  {
    id: 'CUR-015',
    title: 'PhD in Epidemiology',
    status: 'draft',
    createdDate: '2024-02-03',
    lastModified: '2024-02-18',
    schoolId: 'scmh',
    programId: 'phd',
    department: 'Public Health'
  },

  // School of Pure & Applied Sciences (spas)
  {
    id: 'CUR-016',
    title: 'PhD in Entomology',
    status: 'pending',
    createdDate: '2024-01-25',
    lastModified: '2024-02-12',
    schoolId: 'spas',
    programId: 'phd',
    department: 'Biology'
  },
  {
    id: 'CUR-017',
    title: 'Bachelor of Science in Mathematics',
    status: 'approved',
    createdDate: '2024-01-30',
    lastModified: '2024-02-15',
    schoolId: 'spas',
    programId: 'bachelor',
    department: 'Mathematics'
  },
  {
    id: 'CUR-018',
    title: 'Bachelor of Science in Physics',
    status: 'draft',
    createdDate: '2024-02-08',
    lastModified: '2024-02-22',
    schoolId: 'spas',
    programId: 'bachelor',
    department: 'Physics'
  },

  // School of Nursing (son)
  {
    id: 'CUR-019',
    title: 'Master of Science in Nursing',
    status: 'approved',
    createdDate: '2024-01-25',
    lastModified: '2024-02-12',
    schoolId: 'son',
    programId: 'masters',
    department: 'Nursing'
  },
  {
    id: 'CUR-020',
    title: 'Bachelor of Science in Nursing',
    status: 'pending',
    createdDate: '2024-02-01',
    lastModified: '2024-02-18',
    schoolId: 'son',
    programId: 'bachelor',
    department: 'Nursing'
  }
];


export { mockSchools, mockPrograms, mockCurriculaData };