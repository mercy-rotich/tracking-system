
import curriculumService from "./curriculumService";

class StatisticsService{
    constructor(){
        this.cachedStats = null;
        this.cacheTimestamp = null;
        this.CACHE_DURATION = 5 * 60 * 1000;
    }

    async getCurriculumStatistics() {
        try{
            //check cache first
            if(this.cachedStats && this.cacheTimestamp && (Date.now() - this.cacheTimestamp)< this.CACHE_DURATION){
                console.log('using cached curriculum statistics')
                return this.cachedStats;
            }

            console.log('🔄 Loading fresh curriculum statistics with breakdown...')

            return await this.getFallbackStatistics();
        }catch(error){
            console.error('❌ Error getting curriculum statistics:', error);
            return this.getDefaultStats();
        }
    }
    //falback method with detailed analysis
    async getFallbackStatistics(){
        try{
            const curriculaResult = await curriculumService.getAllCurriculums(0,1000);
            const curriculums = curriculaResult.curriculums;
            const totalFromPagination = curriculaResult.total || curriculums.length;

            console.log(`analyzing ${curriculums.length} curriculums (total: ${totalFromPagination})`)

            const statusBreakdown = this.analyzeStatuses(curriculums);
            console.log('detailed status breakdown',statusBreakdown);

            //calculate overdue
            const overdueCount = this.calculateOverdueCount(curriculums);

            const detailedStats = {
                total:totalFromPagination,
                approved: statusBreakdown.approved,
                rejected: statusBreakdown.rejected,

                //breakdown of in-progress items
                pending:statusBreakdown.pending,
                underReview: statusBreakdown.underReview,
                draft:statusBreakdown.draft,

                inProgress:statusBreakdown.pending + statusBreakdown.underReview + statusBreakdown.draft,
                pendingReview: statusBreakdown.pending,

                approvalRate: totalFromPagination > 0?
                Math.round((statusBreakdown.approved / totalFromPagination) * 100): 0,
                overdueCount: overdueCount,

                breakdown:{
                    pending:statusBreakdown.pending,
                    underReview:statusBreakdown.underReview,
                    draft:statusBreakdown.draft,
                    approved: statusBreakdown.approved,
                    rejected:statusBreakdown.rejected,
                    other:statusBreakdown.other
                }
            };
        
            if(curriculums.length < totalFromPagination && curriculums.length > 50){
                const scaleFactor = totalFromPagination / curriculums.length;

                const fieldsToScale = ['approved','rejected','pending','underReview','draft','overdueCount']

                fieldsToScale.forEach(field =>{
                    if(detailedStats[field]){
                        detailedStats[field] = Math.round(detailedStats[field]* scaleFactor);
                    }
                });

                Object.keys(detailedStats.breakdown).forEach(key =>{
                    detailedStats.breakdown[key] = Math.round(detailedStats.breakdown[key] * scaleFactor)
                });

                
                detailedStats.inProgress = detailedStats.pending + detailedStats.underReview + detailedStats.draft;
                detailedStats.pendingReview = detailedStats.pending;
                detailedStats.approvalRate = detailedStats.total > 0 ? 
                Math.round((detailedStats.approved / detailedStats.total) * 100) : 0;


            }
            this.cachedStats = detailedStats;
            this.cacheTimestamp = Date.now();

            console.log('✅ Enhanced statistics calculated:', detailedStats);
            return detailedStats;
        }catch(error){
         console.error('❌ Error in enhanced statistics calculation:', error);
         return this.getDefaultStats();
        }
    }

    //analyze curriculum statuses with detailed mapping
    analyzeStatuses(curriculums){
        const breakdown ={
          approved: 0,
          pending: 0,
          underReview: 0,
          draft: 0,
          rejected: 0,
          other: 0
        };

        const statusMapping = {
            //clear approved states
            'approved': 'approved',
            'active': 'approved',
            'published': 'approved',

            //clear reected or inactive states
            'rejected': 'rejected',
            'inactive': 'rejected',
            'cancelled': 'rejected',
            'expired': 'rejected',

            //pending states(submitted ,, waiting for review)
            'pending': 'pending',
            'submitted': 'pending',
            'awaiting_review': 'pending',

            // Under review states (actively being reviewed)
            'under_review': 'underReview',
            'in_review': 'underReview',
            'reviewing': 'underReview',
            'committee_review': 'underReview',

            //draft states(still being prepared)
            'draft': 'draft',
            'editing': 'draft',
            'preparation': 'draft',
            'incomplete': 'draft'
        }

        curriculums.forEach(curriculum =>{
            const status =(curriculum.status || '').toLowerCase().trim();
            const mappedStatus = statusMapping[status] || 'other';
            breakdown[mappedStatus]++;

           if(mappedStatus === 'other' && status){
            console.log(`unmapped status found:"${status}" for curriculum: ${curriculum.title}`)
           }
        });
        return breakdown;
    }

    calculateOverdueCount(curriculums){
        const today = new Date();
        return curriculums.filter(curriculum =>{
            if(curriculum.status === 'approved') return false;
            if(!curriculum.expiryDate) return false;

            try{
                const expiryDate = new Date(curriculum.expiryDate);
                return expiryDate < today;
            }catch {
                return false;
            }

        }).length
    }

    getDefaultStats() {
        return {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          underReview: 0,
          draft: 0,
          inProgress: 0,
          pendingReview: 0,
          approvalRate: 0,
          overdueCount: 0,
          breakdown: {
            pending: 0,
            underReview: 0,
            draft: 0,
            approved: 0,
            rejected: 0,
            other: 0
          }
        };
      }
      async getDetailedBreakdown(){
        const stats = await this.getCurriculumStatistics();
        return{
            total:stats.total,
            breakdown:stats.breakdown,
            summary:{
                approved: stats.approved,
                inProgress: stats.inProgress,
                rejected: stats.rejected
            },
            details: {
                pending: stats.pending,
                underReview: stats.underReview,
                draft: stats.draft
              }
        }
      }

      async getMetricsForDashboard(){
        const stats = await this.getCurriculumStatistics();
        return {
            total: stats.total,
            inProgress: stats.inProgress,
            approved: stats.approved,
            overdue: stats.overdueCount,
            approvalRate: stats.approvalRate,
            breakdown: {
              pending: stats.pending,
              underReview: stats.underReview,
              draft: stats.draft
            }
          };
      }

      async getMetricsForCurriculaPage(){
        const stats = await this.getCurriculumStatistics();
        return {
            total: stats.total,
            approved: stats.approved,
            pending: stats.pending,        
            underReview: stats.underReview,
            rejected: stats.rejected,
            draft: stats.draft,
           
            inProgress: stats.inProgress
          };
        
      }
      async getMetricsForTracking() {
        const stats = await this.getCurriculumStatistics();
        
        return {
          total: stats.total,
          inProgress: stats.inProgress,
          onHold: 0, 
          completed: stats.approved,
          overdue: stats.overdueCount,
          breakdown: {
            pending: stats.pending,
            underReview: stats.underReview,
            draft: stats.draft
          }
        };
      }

      async refreshStatistics(){
        this.clearCache();
        return await this.getCurriculumStatistics();
      }

      clearCache(){
        this.cachedStats =  null;
        this.cacheTimestamp = null;
        console.log(' Statistics cache cleared');
      }

       // Debug method to see all statuses in the system
  async debugStatuses() {
    try {
      const curriculaResult = await curriculumService.getAllCurriculums(0, 1000);
      const statusCounts = {};
      
      curriculaResult.curriculums.forEach(curriculum => {
        const status = curriculum.status || 'undefined';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      console.log('🔍 All statuses in system:', statusCounts);
      return statusCounts;
    } catch (error) {
      console.error('Error debugging statuses:', error);
      return {};
    }
  }

}
const statisticsService = new StatisticsService();

// Enhanced debug helpers
if (typeof window !== 'undefined') {
  window.statisticsService = statisticsService;
  window.debugStats = () => statisticsService.getCurriculumStatistics().then(console.log);
  window.debugStatuses = () => statisticsService.debugStatuses();
  window.debugBreakdown = () => statisticsService.getDetailedBreakdown().then(console.log);
  window.refreshStats = () => statisticsService.refreshStatistics().then(console.log);
}

export default statisticsService;