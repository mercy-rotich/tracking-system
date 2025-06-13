// MockData.js - Fixed export and data structure
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
    schoolId: 'sbe',
    programId: 'bachelor',
    department: 'Software Engineering'
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
    title: 'Bachelor of Science in Artificial Intelligence',
    status: 'rejected',
    createdDate: '2024-01-25',
    lastModified: '2024-02-12',
    schoolId: 'sbe',
    programId: 'bachelor',
    department: 'Artificial Intelligence'
  },
  {
    id: 'CUR-006',
    title: 'Bachelor of Science in Mathematics and Computer Science',
    status: 'rejected',
    createdDate: '2024-01-25',
    lastModified: '2024-02-12',
    schoolId: 'sbe',
    programId: 'bachelor',
    department: 'Mathematics'
  },
  {
    id: 'CUR-007',
    title: 'Master of Science in Public Health',
    status: 'rejected',
    createdDate: '2024-01-25',
    lastModified: '2024-02-12',
    schoolId: 'scmh',
    programId: 'masters',
    department: 'Public Health'
  },
  {
    id: 'CUR-008',
    title: 'Ph.D in Entomology',
    status: 'pending',
    createdDate: '2024-01-25',
    lastModified: '2024-02-12',
    schoolId: 'spas',
    programId: 'phd',
    department: 'Biology'
  },
  {
    id: 'CUR-009',
    title: 'Master of Science in Nursing',
    status: 'rejected',
    createdDate: '2024-01-25',
    lastModified: '2024-02-12',
    schoolId: 'son',
    programId: 'masters',
    department: 'Nursing'
  }
];

// Export all the data
export { mockSchools, mockPrograms, mockCurriculaData };