
export const curriculumData = {
    totalCurricula: 247,
    schools: [
      {
        id: 'computing',
        name: "Computing & Informatics",
        icon: "fas fa-laptop-code",
        total: 45,
        departments: 8,
        programs: [
          {
            id: 'masters-computing',
            name: "Masters",
            type: "masters",
            count: 12,
            departments: [
              {
                id: 'cs-masters',
                name: "Computer Science",
                curricula: [
                  { 
                    id: 'msc-cs-se',
                    title: "MSc Computer Science - Software Engineering", 
                    status: "approved", 
                    lastUpdated: "2024-01-15" 
                  },
                  { 
                    id: 'msc-cs-ai',
                    title: "MSc Computer Science - Artificial Intelligence", 
                    status: "approved", 
                    lastUpdated: "2024-01-10" 
                  },
                  { 
                    id: 'msc-cs-cyber',
                    title: "MSc Computer Science - Cybersecurity", 
                    status: "pending", 
                    lastUpdated: "2024-01-20" 
                  },
                  { 
                    id: 'msc-cs-ds',
                    title: "MSc Computer Science - Data Science", 
                    status: "approved", 
                    lastUpdated: "2024-01-12" 
                  }
                ]
              },
              {
                id: 'it-masters',
                name: "Information Technology",
                curricula: [
                  { 
                    id: 'msc-it-net',
                    title: "MSc Information Technology - Network Security", 
                    status: "approved", 
                    lastUpdated: "2024-01-08" 
                  },
                  { 
                    id: 'msc-it-db',
                    title: "MSc Information Technology - Database Systems", 
                    status: "approved", 
                    lastUpdated: "2024-01-14" 
                  },
                  { 
                    id: 'msc-it-web',
                    title: "MSc Information Technology - Web Technologies", 
                    status: "pending", 
                    lastUpdated: "2024-01-18" 
                  },
                  { 
                    id: 'msc-it-mobile',
                    title: "MSc Information Technology - Mobile Computing", 
                    status: "approved", 
                    lastUpdated: "2024-01-16" 
                  }
                ]
              }
            ]
          },
          {
            id: 'degree-computing',
            name: "Degree",
            type: "degree",
            count: 28,
            departments: [
              {
                id: 'cs-degree',
                name: "Computer Science",
                curricula: [
                  { 
                    id: 'bcs',
                    title: "Bachelor of Computer Science", 
                    status: "approved", 
                    lastUpdated: "2024-01-05" 
                  },
                  { 
                    id: 'bse',
                    title: "Bachelor of Software Engineering", 
                    status: "approved", 
                    lastUpdated: "2024-01-07" 
                  }
                ]
              }
            ]
          },
          {
            id: 'phd-computing',
            name: "PhD",
            type: "phd",
            count: 5,
            departments: [
              {
                id: 'cs-phd',
                name: "Computer Science",
                curricula: [
                  { 
                    id: 'phd-cs',
                    title: "PhD in Computer Science", 
                    status: "approved", 
                    lastUpdated: "2024-01-03" 
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'agriculture',
        name: "Agriculture & Food Science",
        icon: "fas fa-seedling",
        total: 42,
        departments: 6,
        programs: [
          {
            id: 'masters-agriculture',
            name: "Masters",
            type: "masters",
            count: 15,
            departments: [
              {
                id: 'agric-econ-masters',
                name: "Agricultural Economics",
                curricula: [
                  { 
                    id: 'msc-agric-farm',
                    title: "MSc Agricultural Economics - Farm Management", 
                    status: "approved", 
                    lastUpdated: "2024-01-12" 
                  },
                  { 
                    id: 'msc-agric-rural',
                    title: "MSc Agricultural Economics - Rural Development", 
                    status: "approved", 
                    lastUpdated: "2024-01-09" 
                  }
                ]
              }
            ]
          },
          {
            id: 'degree-agriculture',
            name: "Degree",
            type: "degree",
            count: 21,
            departments: [
              {
                id: 'agric-econ-degree',
                name: "Agricultural Economics",
                curricula: [
                  { 
                    id: 'bagric-econ',
                    title: "Bachelor of Agricultural Economics", 
                    status: "approved", 
                    lastUpdated: "2024-01-06" 
                  }
                ]
              }
            ]
          },
          {
            id: 'phd-agriculture',
            name: "PhD",
            type: "phd",
            count: 6,
            departments: [
              {
                id: 'agric-econ-phd',
                name: "Agricultural Economics",
                curricula: [
                  { 
                    id: 'phd-agric-econ',
                    title: "PhD in Agricultural Economics", 
                    status: "pending", 
                    lastUpdated: "2024-01-22" 
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'engineering',
        name: "Engineering & Technology",
        icon: "fas fa-cogs",
        total: 38,
        departments: 5,
        programs: [
          {
            id: 'masters-engineering',
            name: "Masters",
            type: "masters",
            count: 12,
            departments: [
              {
                id: 'civil-masters',
                name: "Civil Engineering",
                curricula: [
                  { 
                    id: 'msc-civil-struct',
                    title: "MSc Civil Engineering - Structural", 
                    status: "approved", 
                    lastUpdated: "2024-01-11" 
                  }
                ]
              }
            ]
          },
          {
            id: 'degree-engineering',
            name: "Degree",
            type: "degree",
            count: 22,
            departments: [
              {
                id: 'civil-degree',
                name: "Civil Engineering",
                curricula: [
                  { 
                    id: 'bcivil',
                    title: "Bachelor of Civil Engineering", 
                    status: "approved", 
                    lastUpdated: "2024-01-04" 
                  }
                ]
              }
            ]
          },
          {
            id: 'phd-engineering',
            name: "PhD",
            type: "phd",
            count: 4,
            departments: [
              {
                id: 'civil-phd',
                name: "Civil Engineering",
                curricula: [
                  { 
                    id: 'phd-civil',
                    title: "PhD in Civil Engineering", 
                    status: "review", 
                    lastUpdated: "2024-01-21" 
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };