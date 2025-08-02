import React,{useState,useEffect} from 'react';
import './TrackingStats.css';
import curriculumService from '../../../../services/curriculumService';

const TrackingStats = ({ stats,refreshTrigger= 0 }) => {
  const [realStats,setRealStats] = useState({
    total:0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    overdue: 0,

  });
  const [isLoading,setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadRealStats = async () =>{
    try{
      setIsLoading(true);
      console.log('🔄 Loading real curriculum statistics...');

      try{
        const statsResult = await curriculumService.getCurriculumStats();
        const apiStats = statsResult.data;

        console.log('✅ Stats from dedicated endpoint:', apiStats);

        const mappedStats ={
          total: apiStats.total || 0,
          inProgress:(apiStats.pending || 0) + (apiStats.underReview || 0),
          onHold:0,
          completed:apiStats.approved || 0,
          overdue:0

        };

        //calculate overdue
        try{
          const expiringResult = await curriculumService.getExpiringCurriculums();
          mappedStats.overdue = expiringResult.data?.length || 0;

        }catch(expiringError){
          console.warn('⚠️ Could not load expiring curriculums:', expiringError.message);
        }

        setRealStats(mappedStats);
        console.log('✅ Final mapped stats:', mappedStats);
        return mappedStats;
      }catch(statsError) {
        console.warn('⚠️ Dedicated stats endpoint failed, using fallback method:', statsError.message);
      

      //fallback2-load sample of curriculums and calculate stats

      const curriculaResult = await curriculumService.getAllCurriculums(0,500);
      const curriculums = curriculaResult.curriculums;
      const totalFromPagination = curriculaResult.total || curriculums.length;

      console.log(`Calculating stats from ${curriculums.length} curriculums (total: ${totalFromPagination})`)

      //count by status
      const statusCounts = curriculums.reduce((acc,curriculum)=>{
        const status = curriculum.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },{});
      //calculate overdue

      const today = new Date();
      const overdueCount = curriculums.filter(curriculum =>{
        if(curriculum.status === 'approved') return false;
        if(!curriculum.expiryDate) return false;

        try{
          const expiryDate = new Date(curriculum.expiryDate);
          return expiryDate < today;

        }catch {
          return false;
        }

      }).length;

      const calculatedStats = {
        total: totalFromPagination,
        inProgress: (statusCounts.pending || 0) + (statusCounts.draft || 0),
        onHold: 0, // No specific "on hold" status in API
        completed: statusCounts.approved || 0,
        overdue: overdueCount
      }

      if (curriculums.length < totalFromPagination && curriculums.length > 50){
        const scaleFactor = totalFromPagination /curriculums.length;
        calculatedStats.inProgress = Math.round(calculatedStats.inProgress * scaleFactor);
        calculatedStats.completed = Math.round(calculatedStats.completed  * scaleFactor);
        calculatedStats.overdue = Math.round(calculatedStats.overdue * scaleFactor);
      }

      setRealStats(calculatedStats);
      console.log('✅ Calculated stats:', calculatedStats);
      return calculatedStats;
    }
    
    }catch (error){
      console.error('❌ Error loading curriculum statistics:', error);

      // Fallback to provided stats or defaults
      const fallbackStats = stats || {
        total: 0,
        inProgress: 0,
        onHold: 0,
        completed: 0,
        overdue: 0
      };
      
      setRealStats(fallbackStats);
      return fallbackStats;
    }finally{
      setIsLoading(false);
      setLastRefresh(Date.now());
    }
  };
  useEffect(()=>{
    loadRealStats();

  },[refreshTrigger]);

  //fall back to provided stats
  const displayStats = realStats.total > 0 ? realStats : (stats || realStats);

  const statCards = [
    {
      key: 'total',
      title: 'Total Curricula',
      value: displayStats.total,
      icon: 'fas fa-book',
      color: 'tracking-badge-secondary',
      bgColor: 'rgba(26, 58, 110, 0.1)'
    },
    {
      key: 'inProgress',
      title: 'In Progress',
      value: displayStats.inProgress,
      icon: 'fas fa-clock',
      color: 'tracking-badge-primary',
      bgColor: 'rgba(0, 214, 102, 0.1)'
    },
    {
      key: 'onHold',
      title: 'On Hold',
      value: displayStats.onHold,
      icon: 'fas fa-pause-circle',
      color: 'tracking-badge-warning',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      key: 'completed',
      title: 'Completed',
      value: displayStats.completed,
      icon: 'fas fa-check-circle',
      color: 'tracking-badge-success',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      key: 'overdue',
      title: 'Overdue',
      value: displayStats.overdue,
      icon: 'fas fa-exclamation-triangle',
      color: 'tracking-badge-danger',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];


  return (
    <div className="tracking-stats">
      <div className="tracking-grid tracking-grid-auto">
        {statCards.map(stat => (
          <div key={stat.key} className="tracking-card tracking-stat-card">
            <div className="tracking-card-body">
              <div className="tracking-flex tracking-items-center tracking-justify-between tracking-mb-4">
                <div className="tracking-stat-info">
                  <h3 className="tracking-stat-title">{stat.title}</h3>
                  <div className="tracking-stat-value">
                  {isLoading ? (
                      <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: '#6b7280' }}></i>
                    ) : (
                      stat.value
                    )}
                  </div>
                </div>
                <div 
                  className="tracking-stat-icon"
                  style={{ 
                    backgroundColor: stat.bgColor,
                    padding: '1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className={`${stat.icon}`} style={{ 
                    fontSize: '1.5rem',
                    color: stat.color.includes('secondary') ? '#1a3a6e' :
                           stat.color.includes('primary') ? '#00D666' :
                           stat.color.includes('warning') ? '#f59e0b' :
                           stat.color.includes('success') ? '#10b981' :
                           stat.color.includes('danger') ? '#ef4444' : '#6b7280'
                  }}></i>
                </div>
              </div>
              
              {/* Progress indicator for some stats */}
              {stat.key === 'inProgress' && displayStats.total > 0 &&  (
                <div className="tracking-progress-container">
                  <div className="tracking-progress-bar">
                    <div 
                      className="tracking-progress-fill" 
                      style={{ width: `${Math.min((displayStats.inProgress / displayStats.total) * 100,100)}%` }}
                    ></div>
                  </div>
                  <div className="tracking-progress-text">
                    <span style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                      {Math.round((displayStats.inProgress / displayStats.total) * 100)}% of total curricula
                    </span>
                  </div>
                </div>
              )}
              {/*alert badge for overdue items*/}
              {stat.key === 'overdue' && displayStats.overdue > 0 && (
                <div className="tracking-mt-2">
                  <span className="tracking-badge tracking-badge-danger">
                    <i className="fas fa-exclamation-circle"></i>
                    Requires Attention
                  </span>
                </div>
              )}

              {/* Refresh indicator */}
              {stat.key === 'total' && !isLoading && (
                <div style={{ fontSize: '0.7rem', color: 'var(--tracking-text-muted)', marginTop: '0.5rem' }}>
                  Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingStats;