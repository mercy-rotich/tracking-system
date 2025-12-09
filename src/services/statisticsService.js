import curriculumService from "./curriculumService";
import curriculumTrackingService from "./tracking/CurriculumTrackingService";

class StatisticsService {
    constructor() {
        this.cachedStats = null;
        this.cacheTimestamp = null;
        this.CACHE_DURATION = 5 * 60 * 1000;
        
        this.cachedTrackingStats = null;
        this.trackingCacheTimestamp = null;
        this.TRACKING_CACHE_DURATION = 2 * 60 * 1000; 
    }

    async getCurriculumStatistics() {
        try {
            if (this.cachedStats && this.cacheTimestamp && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
                console.log('📦 Using cached curriculum statistics');
                return this.cachedStats;
            }

            console.log('🔄 Loading fresh curriculum statistics with breakdown...');
            return await this.getFallbackStatistics();
        } catch (error) {
            console.error('❌ Error getting curriculum statistics:', error);
            return this.getDefaultStats();
        }
    }

    async getTrackingStatistics() {
        try {
            if (this.cachedTrackingStats && this.trackingCacheTimestamp && 
                (Date.now() - this.trackingCacheTimestamp) < this.TRACKING_CACHE_DURATION) {
                console.log('📦 Using cached tracking statistics');
                return this.cachedTrackingStats;
            }

            console.log('🔄 Loading fresh tracking statistics...');
            return await this.calculateTrackingStatistics();
        } catch (error) {
            console.error('❌ Error getting tracking statistics:', error);
            return this.getDefaultTrackingStats();
        }
    }

    // --- TRACKING STATS CALCULATION ---
    async calculateTrackingStatistics() {
        try {
            const [
                allTrackingResult,
                schoolTrackingResult,
                myInitiatedResult,
                myAssignedResult
            ] = await Promise.allSettled([
                this.safeTrackingApiCall(() => curriculumTrackingService.getAllCurricula()),
                this.safeTrackingApiCall(() => curriculumTrackingService.getTrackingBySchool(1)),
                this.safeTrackingApiCall(() => curriculumTrackingService.getMyInitiatedTrackings()),
                this.safeTrackingApiCall(() => curriculumTrackingService.getMyAssignedTrackings())
            ]);

            const allData = this.extractTrackingDataFromSettled(allTrackingResult);
            const schoolData = this.extractTrackingDataFromSettled(schoolTrackingResult);
            const initiatedData = this.extractTrackingDataFromSettled(myInitiatedResult);
            const assignedData = this.extractTrackingDataFromSettled(myAssignedResult);

            const primaryDataset = [allData, schoolData, initiatedData, assignedData]
                .sort((a, b) => b.length - a.length)[0];

            if (primaryDataset.length === 0) {
                return this.getDefaultTrackingStats();
            }

            const statusBreakdown = this.analyzeTrackingStatuses(primaryDataset);
            const stageBreakdown = this.analyzeTrackingStages(primaryDataset);
            const priorityBreakdown = this.analyzeTrackingPriorities(primaryDataset);
            const overdueCount = this.calculateTrackingOverdueCount(primaryDataset);

            const trackingStats = {
                total: primaryDataset.length,
                inProgress: statusBreakdown.under_review + statusBreakdown.pending_approval,
                onHold: statusBreakdown.on_hold,
                completed: statusBreakdown.completed,
                overdue: overdueCount,
                statusBreakdown,
                stageBreakdown,
                priorityBreakdown,
                completionRate: primaryDataset.length > 0 ? 
                    Math.round((statusBreakdown.completed / primaryDataset.length) * 100) : 0,
                overduePercentage: primaryDataset.length > 0 ? 
                    Math.round((overdueCount / primaryDataset.length) * 100) : 0,
                averageDaysInCurrentStage: this.calculateAverageTrackingDays(primaryDataset, 'daysInCurrentStage'),
                averageTotalDays: this.calculateAverageTrackingDays(primaryDataset, 'totalDays'),
                dataSource: 'tracking_service',
                lastUpdated: new Date().toISOString()
            };

            this.cachedTrackingStats = trackingStats;
            this.trackingCacheTimestamp = Date.now();

            return trackingStats;
        } catch (error) {
            console.error('❌ [Tracking Statistics] Error calculating tracking statistics:', error);
            return this.getDefaultTrackingStats();
        }
    }

    async safeTrackingApiCall(apiFunction) {
        try {
            const result = await apiFunction();
            return result.success && Array.isArray(result.data) ? result.data : [];
        } catch (error) {
            return [];
        }
    }

    extractTrackingDataFromSettled(settledResult) {
        if (settledResult.status === 'fulfilled') {
            return Array.isArray(settledResult.value) ? settledResult.value : [];
        }
        return [];
    }

    analyzeTrackingStatuses(trackingData) {
        const breakdown = {
            under_review: 0,
            pending_approval: 0,
            on_hold: 0,
            completed: 0,
            rejected: 0,
            other: 0
        };
        trackingData.forEach(tracking => {
            const status = (tracking.status || '').toLowerCase().trim();
            if (breakdown.hasOwnProperty(status)) {
                breakdown[status]++;
            } else {
                breakdown.other++;
            }
        });
        return breakdown;
    }

    analyzeTrackingStages(trackingData) {
        const stageBreakdown = {
            initiation: 0, school_board: 0, dean_committee: 0, senate: 0,
            qa_review: 0, vice_chancellor: 0, cue_review: 0, site_inspection: 0, other: 0
        };
        trackingData.forEach(tracking => {
            const stage = tracking.currentStage || '';
            if (stageBreakdown.hasOwnProperty(stage)) {
                stageBreakdown[stage]++;
            } else {
                stageBreakdown.other++;
            }
        });
        return stageBreakdown;
    }

    analyzeTrackingPriorities(trackingData) {
        const priorityBreakdown = { high: 0, medium: 0, low: 0, other: 0 };
        trackingData.forEach(tracking => {
            const priority = tracking.priority || 'low';
            if (priorityBreakdown.hasOwnProperty(priority)) {
                priorityBreakdown[priority]++;
            } else {
                priorityBreakdown.other++;
            }
        });
        return priorityBreakdown;
    }

    calculateTrackingOverdueCount(trackingData) {
        const today = new Date();
        return trackingData.filter(tracking => {
            if (tracking.status === 'completed') return false;
            if (!tracking.estimatedCompletion) return false;
            try {
                return new Date(tracking.estimatedCompletion) < today;
            } catch { return false; }
        }).length;
    }

    calculateAverageTrackingDays(trackingData, field) {
        const validDays = trackingData.map(t => t[field] || 0).filter(days => days > 0);
        if (validDays.length === 0) return 0;
        return Math.round(validDays.reduce((sum, days) => sum + days, 0) / validDays.length);
    }

    getDefaultTrackingStats() {
        return {
            total: 0, inProgress: 0, onHold: 0, completed: 0, overdue: 0,
            statusBreakdown: { under_review: 0, pending_approval: 0, on_hold: 0, completed: 0, rejected: 0, other: 0 },
            stageBreakdown: { initiation: 0, school_board: 0, dean_committee: 0, senate: 0, qa_review: 0, vice_chancellor: 0, cue_review: 0, site_inspection: 0, other: 0 },
            priorityBreakdown: { high: 0, medium: 0, low: 0, other: 0 },
            completionRate: 0, overduePercentage: 0, averageDaysInCurrentStage: 0, averageTotalDays: 0,
            dataSource: 'default_fallback', lastUpdated: new Date().toISOString()
        };
    }

  
    
    async getFallbackStatistics() {
        try {
            
            const curriculaResult = await curriculumService.fetchAllCurriculums();
            const curriculums = curriculaResult.curriculums || [];
            
            console.log(`📊 [Stats Service] Analyzing exact dataset of ${curriculums.length} curriculums`);

            const statusBreakdown = this.analyzeStatuses(curriculums);
            const overdueCount = this.calculateOverdueCount(curriculums);

            
            const detailedStats = {
                total: curriculums.length,
                approved: statusBreakdown.approved,
                rejected: statusBreakdown.rejected,
                pending: statusBreakdown.pending,
                underReview: statusBreakdown.underReview,
                draft: statusBreakdown.draft,
                
                inProgress: statusBreakdown.pending + statusBreakdown.underReview + statusBreakdown.draft,
                pendingReview: statusBreakdown.pending,
                approvalRate: curriculums.length > 0 ? 
                    Math.round((statusBreakdown.approved / curriculums.length) * 100) : 0,
                overdueCount: overdueCount,
                
                breakdown: {
                    pending: statusBreakdown.pending,
                    underReview: statusBreakdown.underReview,
                    draft: statusBreakdown.draft,
                    approved: statusBreakdown.approved,
                    rejected: statusBreakdown.rejected,
                    other: statusBreakdown.other
                }
            };

            this.cachedStats = detailedStats;
            this.cacheTimestamp = Date.now();

            console.log('✅ Exact statistics calculated:', detailedStats);
            return detailedStats;
        } catch (error) {
            console.error('❌ Error in statistics calculation:', error);
            return this.getDefaultStats();
        }
    }

    analyzeStatuses(curriculums) {
        const breakdown = { approved: 0, pending: 0, underReview: 0, draft: 0, rejected: 0, other: 0 };
        const statusMapping = {
            'approved': 'approved', 'active': 'approved', 'published': 'approved',
            'rejected': 'rejected', 'inactive': 'rejected', 'cancelled': 'rejected',
            'pending': 'pending', 'submitted': 'pending', 'awaiting_review': 'pending',
            'under_review': 'underReview', 'in_review': 'underReview', 'reviewing': 'underReview', 'under review': 'underReview',
            'draft': 'draft', 'editing': 'draft', 'preparation': 'draft'
        };

        curriculums.forEach(curriculum => {
            const status = (curriculum.status || '').toLowerCase().trim();
            // Handle "under review" variations
            const normalizedStatus = status.replace('_', ' '); 
            
            // Check direct mapping or normalized
            let mappedStatus = statusMapping[status] || statusMapping[normalizedStatus];
            
            // Fallback heuristics if simple mapping fails
            if (!mappedStatus) {
               if (status.includes('review')) mappedStatus = 'underReview';
               else if (status.includes('approv')) mappedStatus = 'approved';
               else if (status.includes('draft')) mappedStatus = 'draft';
               else mappedStatus = 'other';
            }
            
            breakdown[mappedStatus]++;
        });
        return breakdown;
    }

    calculateOverdueCount(curriculums) {
        const today = new Date();
        return curriculums.filter(curriculum => {
            if (curriculum.status === 'approved') return false;
            if (!curriculum.expiryDate) return false;
            try { return new Date(curriculum.expiryDate) < today; } catch { return false; }
        }).length;
    }

    getDefaultStats() {
        return {
            total: 0, approved: 0, rejected: 0, pending: 0, underReview: 0, draft: 0,
            inProgress: 0, pendingReview: 0, approvalRate: 0, overdueCount: 0,
            breakdown: { pending: 0, underReview: 0, draft: 0, approved: 0, rejected: 0, other: 0 }
        };
    }

    async getMetricsForDashboard() {
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

    async getMetricsForCurriculaPage() {
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
        const trackingStats = await this.getTrackingStatistics();
        return {
            total: trackingStats.total,
            inProgress: trackingStats.inProgress,
            onHold: trackingStats.onHold,
            completed: trackingStats.completed,
            overdue: trackingStats.overdue,
            completionRate: trackingStats.completionRate,
            overduePercentage: trackingStats.overduePercentage,
            averageDaysInStage: trackingStats.averageDaysInCurrentStage,
            statusBreakdown: trackingStats.statusBreakdown,
            stageBreakdown: trackingStats.stageBreakdown,
            priorityBreakdown: trackingStats.priorityBreakdown,
            lastUpdated: trackingStats.lastUpdated,
            dataSource: trackingStats.dataSource
        };
    }

    async getMetricsForTrackingView(viewType) {
        let trackingData = [];
        try {
            switch (viewType) {
                case 'myInitiated':
                    const initiatedResult = await curriculumTrackingService.getMyInitiatedTrackings();
                    trackingData = initiatedResult.success ? initiatedResult.data : [];
                    break;
                case 'myAssigned':
                    const assignedResult = await curriculumTrackingService.getMyAssignedTrackings();
                    trackingData = assignedResult.success ? assignedResult.data : [];
                    break;
                case 'bySchool':
                    const schoolResult = await curriculumTrackingService.getTrackingBySchool(1);
                    trackingData = schoolResult.success ? schoolResult.data : [];
                    break;
                default:
                    const allResult = await curriculumTrackingService.getAllCurricula();
                    trackingData = allResult.success ? allResult.data : [];
            }
            
            if (trackingData.length === 0) return this.getDefaultTrackingStats();
            
            const statusBreakdown = this.analyzeTrackingStatuses(trackingData);
            const overdueCount = this.calculateTrackingOverdueCount(trackingData);
            
            return {
                total: trackingData.length,
                inProgress: statusBreakdown.under_review + statusBreakdown.pending_approval,
                onHold: statusBreakdown.on_hold,
                completed: statusBreakdown.completed,
                overdue: overdueCount,
                viewType,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            return this.getDefaultTrackingStats();
        }
    }

    async refreshStatistics() {
        this.clearCache();
        return await this.getCurriculumStatistics();
    }

    clearCache() {
        this.cachedStats = null;
        this.cacheTimestamp = null;
        this.cachedTrackingStats = null;
        this.trackingCacheTimestamp = null;
    }

    async refreshTrackingStatistics() {
        this.cachedTrackingStats = null;
        this.trackingCacheTimestamp = null;
        return await this.getTrackingStatistics();
    }

    async debugStatuses() {
        try {
           
            const curriculaResult = await curriculumService.fetchAllCurriculums();
            const statusCounts = {};
            curriculaResult.curriculums.forEach(curriculum => {
                const status = curriculum.status || 'undefined';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });
            console.log('🔍 All statuses in system:', statusCounts);
            return statusCounts;
        } catch (error) {
            return {};
        }
    }
    
    async debugTrackingStatuses() {
        try {
            const trackingResult = await curriculumTrackingService.getAllCurricula();
            if (!trackingResult.success) return {};
            const statusCounts = {};
            const stageCounts = {};
            trackingResult.data.forEach(tracking => {
                const status = tracking.status || 'undefined';
                const stage = tracking.currentStage || 'undefined';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
                stageCounts[stage] = (stageCounts[stage] || 0) + 1;
            });
            return { statusCounts, stageCounts };
        } catch { return {}; }
    }

    async diagnoseStatistics() {
       
        try {
            const curriculumStats = await this.getCurriculumStatistics();
            const trackingStats = await this.getTrackingStatistics();
            const trackingMetrics = await this.getMetricsForTracking();
            return { success: true, curriculumStats, trackingStats, trackingMetrics };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

const statisticsService = new StatisticsService();
export default statisticsService;