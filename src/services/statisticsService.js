import curriculumService from "./curriculumService";
import curriculumTrackingService from "./curriculumTrackingService";

class StatisticsService {
    constructor() {
        this.cachedStats = null;
        this.cacheTimestamp = null;
        this.CACHE_DURATION = 5 * 60 * 1000;
        
        //  cache for tracking data
        this.cachedTrackingStats = null;
        this.trackingCacheTimestamp = null;
        this.TRACKING_CACHE_DURATION = 2 * 60 * 1000; 
    }

    async getCurriculumStatistics() {
        try {
            // Check cache first
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

    // Get tracking statistics
    async getTrackingStatistics() {
        try {
            // Check cache first
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

    //  Calculate tracking statistics from tracking service
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

            console.log('📋 [Tracking Statistics] Data sources:', {
                all: allData.length,
                school: schoolData.length,
                initiated: initiatedData.length,
                assigned: assignedData.length
            });

           
            const primaryDataset = [allData, schoolData, initiatedData, assignedData]
                .sort((a, b) => b.length - a.length)[0];

            if (primaryDataset.length === 0) {
                console.warn('⚠️ [Tracking Statistics] No tracking data available');
                return this.getDefaultTrackingStats();
            }

            console.log(`📊 [Tracking Statistics] Analyzing ${primaryDataset.length} tracking records...`);

            // Analyze tracking data
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
                
                // Detailed breakdowns
                statusBreakdown,
                stageBreakdown,
                priorityBreakdown,
                
                // Calculated metrics
                completionRate: primaryDataset.length > 0 ? 
                    Math.round((statusBreakdown.completed / primaryDataset.length) * 100) : 0,
                overduePercentage: primaryDataset.length > 0 ? 
                    Math.round((overdueCount / primaryDataset.length) * 100) : 0,
                
                // Additional metrics
                averageDaysInCurrentStage: this.calculateAverageTrackingDays(primaryDataset, 'daysInCurrentStage'),
                averageTotalDays: this.calculateAverageTrackingDays(primaryDataset, 'totalDays'),
                
                
                dataSource: 'tracking_service',
                lastUpdated: new Date().toISOString()
            };

            // Cache the results
            this.cachedTrackingStats = trackingStats;
            this.trackingCacheTimestamp = Date.now();

            console.log('✅ [Tracking Statistics] Enhanced tracking statistics calculated:', trackingStats);
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
            console.warn('⚠️ [Tracking Statistics] API call failed:', error.message);
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
                if (status) {
                    console.log(`🔍 [Tracking Statistics] Unmapped tracking status: "${status}" for tracking: ${tracking.trackingId}`);
                }
            }
        });

        return breakdown;
    }
    analyzeTrackingStages(trackingData) {
        const stageBreakdown = {
            initiation: 0,
            school_board: 0,
            dean_committee: 0,
            senate: 0,
            qa_review: 0,
            vice_chancellor: 0,
            cue_review: 0,
            site_inspection: 0,
            other: 0
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
        const priorityBreakdown = {
            high: 0,
            medium: 0,
            low: 0,
            other: 0
        };

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
                const estimatedDate = new Date(tracking.estimatedCompletion);
                return estimatedDate < today;
            } catch {
                return false;
            }
        }).length;
    }

    calculateAverageTrackingDays(trackingData, field) {
        const validDays = trackingData
            .map(t => t[field] || 0)
            .filter(days => days > 0);
        
        if (validDays.length === 0) return 0;
        
        return Math.round(validDays.reduce((sum, days) => sum + days, 0) / validDays.length);
    }

    getDefaultTrackingStats() {
        return {
            total: 0,
            inProgress: 0,
            onHold: 0,
            completed: 0,
            overdue: 0,
            statusBreakdown: {
                under_review: 0,
                pending_approval: 0,
                on_hold: 0,
                completed: 0,
                rejected: 0,
                other: 0
            },
            stageBreakdown: {
                initiation: 0,
                school_board: 0,
                dean_committee: 0,
                senate: 0,
                qa_review: 0,
                vice_chancellor: 0,
                cue_review: 0,
                site_inspection: 0,
                other: 0
            },
            priorityBreakdown: {
                high: 0,
                medium: 0,
                low: 0,
                other: 0
            },
            completionRate: 0,
            overduePercentage: 0,
            averageDaysInCurrentStage: 0,
            averageTotalDays: 0,
            dataSource: 'default_fallback',
            lastUpdated: new Date().toISOString()
        };
    }

    async getFallbackStatistics() {
        try {
            const curriculaResult = await curriculumService.getAllCurriculums(0, 1000);
            const curriculums = curriculaResult.curriculums;
            const totalFromPagination = curriculaResult.total || curriculums.length;

            console.log(`📊 Analyzing ${curriculums.length} curriculums (total: ${totalFromPagination})`);

            const statusBreakdown = this.analyzeStatuses(curriculums);
            console.log('📋 Detailed status breakdown', statusBreakdown);

            // Calculate overdue
            const overdueCount = this.calculateOverdueCount(curriculums);

            const detailedStats = {
                total: totalFromPagination,
                approved: statusBreakdown.approved,
                rejected: statusBreakdown.rejected,

                // Breakdown of in-progress items
                pending: statusBreakdown.pending,
                underReview: statusBreakdown.underReview,
                draft: statusBreakdown.draft,

                inProgress: statusBreakdown.pending + statusBreakdown.underReview + statusBreakdown.draft,
                pendingReview: statusBreakdown.pending,

                approvalRate: totalFromPagination > 0 ?
                    Math.round((statusBreakdown.approved / totalFromPagination) * 100) : 0,
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

            if (curriculums.length < totalFromPagination && curriculums.length > 50) {
                const scaleFactor = totalFromPagination / curriculums.length;

                const fieldsToScale = ['approved', 'rejected', 'pending', 'underReview', 'draft', 'overdueCount'];

                fieldsToScale.forEach(field => {
                    if (detailedStats[field]) {
                        detailedStats[field] = Math.round(detailedStats[field] * scaleFactor);
                    }
                });

                Object.keys(detailedStats.breakdown).forEach(key => {
                    detailedStats.breakdown[key] = Math.round(detailedStats.breakdown[key] * scaleFactor);
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
        } catch (error) {
            console.error('❌ Error in enhanced statistics calculation:', error);
            return this.getDefaultStats();
        }
    }

    analyzeStatuses(curriculums) {
        const breakdown = {
            approved: 0,
            pending: 0,
            underReview: 0,
            draft: 0,
            rejected: 0,
            other: 0
        };

        const statusMapping = {
            //  approved states
            'approved': 'approved',
            'active': 'approved',
            'published': 'approved',

            //  rejected or inactive states
            'rejected': 'rejected',
            'inactive': 'rejected',
            'cancelled': 'rejected',
            'expired': 'rejected',

            // Pending states (submitted, waiting for review)
            'pending': 'pending',
            'submitted': 'pending',
            'awaiting_review': 'pending',

            // Under review states (actively being reviewed)
            'under_review': 'underReview',
            'in_review': 'underReview',
            'reviewing': 'underReview',
            'committee_review': 'underReview',

            // Draft states (still being prepared)
            'draft': 'draft',
            'editing': 'draft',
            'preparation': 'draft',
            'incomplete': 'draft'
        };

        curriculums.forEach(curriculum => {
            const status = (curriculum.status || '').toLowerCase().trim();
            const mappedStatus = statusMapping[status] || 'other';
            breakdown[mappedStatus]++;

            if (mappedStatus === 'other' && status) {
                console.log(`🔍 Unmapped status found: "${status}" for curriculum: ${curriculum.title}`);
            }
        });
        return breakdown;
    }

    calculateOverdueCount(curriculums) {
        const today = new Date();
        return curriculums.filter(curriculum => {
            if (curriculum.status === 'approved') return false;
            if (!curriculum.expiryDate) return false;

            try {
                const expiryDate = new Date(curriculum.expiryDate);
                return expiryDate < today;
            } catch {
                return false;
            }
        }).length;
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

    async getDetailedBreakdown() {
        const stats = await this.getCurriculumStatistics();
        return {
            total: stats.total,
            breakdown: stats.breakdown,
            summary: {
                approved: stats.approved,
                inProgress: stats.inProgress,
                rejected: stats.rejected
            },
            details: {
                pending: stats.pending,
                underReview: stats.underReview,
                draft: stats.draft
            }
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
        console.log('🔄 [Statistics] Getting metrics for tracking page...');
        
        const trackingStats = await this.getTrackingStatistics();
        
        console.log('📊 [Statistics] Tracking metrics prepared:', {
            total: trackingStats.total,
            inProgress: trackingStats.inProgress,
            completed: trackingStats.completed,
            dataSource: trackingStats.dataSource
        });
        
        return {
            total: trackingStats.total,
            inProgress: trackingStats.inProgress,
            onHold: trackingStats.onHold,
            completed: trackingStats.completed,
            overdue: trackingStats.overdue,
            
            // Additional tracking-specific metrics
            completionRate: trackingStats.completionRate,
            overduePercentage: trackingStats.overduePercentage,
            averageDaysInStage: trackingStats.averageDaysInCurrentStage,
            
            // Detailed breakdowns
            statusBreakdown: trackingStats.statusBreakdown,
            stageBreakdown: trackingStats.stageBreakdown,
            priorityBreakdown: trackingStats.priorityBreakdown,
            
            // Metadata
            lastUpdated: trackingStats.lastUpdated,
            dataSource: trackingStats.dataSource
        };
    }

    
    async getMetricsForTrackingView(viewType) {
        console.log(`🔄 [Statistics] Getting metrics for tracking view: ${viewType}`);
        
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
            
            if (trackingData.length === 0) {
                console.warn(`⚠️ [Statistics] No data for tracking view: ${viewType}`);
                return this.getDefaultTrackingStats();
            }
            
            // Calculate metrics for this specific view
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
            console.error(`❌ [Statistics] Error getting metrics for view ${viewType}:`, error);
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
        console.log('🧹 All statistics caches cleared');
    }
    async refreshTrackingStatistics() {
        this.cachedTrackingStats = null;
        this.trackingCacheTimestamp = null;
        console.log('🔄 [Statistics] Refreshing tracking statistics...');
        return await this.getTrackingStatistics();
    }

    async debugStatuses() {
        try {
            const curriculaResult = await curriculumService.getAllCurriculums(0, 1000);
            const statusCounts = {};

            curriculaResult.curriculums.forEach(curriculum => {
                const status = curriculum.status || 'undefined';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            console.log('🔍 All statuses in curriculum system:', statusCounts);
            return statusCounts;
        } catch (error) {
            console.error('❌ Error debugging curriculum statuses:', error);
            return {};
        }
    }

    // Debug tracking statuses
    async debugTrackingStatuses() {
        try {
            const trackingResult = await curriculumTrackingService.getAllCurricula();
            if (!trackingResult.success) {
                console.log('⚠️ Could not get tracking data for debugging');
                return {};
            }

            const statusCounts = {};
            const stageCounts = {};

            trackingResult.data.forEach(tracking => {
                const status = tracking.status || 'undefined';
                const stage = tracking.currentStage || 'undefined';
                
                statusCounts[status] = (statusCounts[status] || 0) + 1;
                stageCounts[stage] = (stageCounts[stage] || 0) + 1;
            });

            console.log('🔍 All statuses in tracking system:', statusCounts);
            console.log('🔍 All stages in tracking system:', stageCounts);
            return { statusCounts, stageCounts };
        } catch (error) {
            console.error('❌ Error debugging tracking statuses:', error);
            return {};
        }
    }

    async diagnoseStatistics() {
        console.log('🔍 STATISTICS SERVICE DIAGNOSIS');
        console.log('===============================');
        
        try {
            console.log('1. Testing general curriculum statistics...');
            const curriculumStats = await this.getCurriculumStatistics();
            console.log('   ✅ Curriculum stats:', {
                total: curriculumStats.total,
                approved: curriculumStats.approved,
                inProgress: curriculumStats.inProgress
            });

            console.log('2. Testing tracking statistics...');
            const trackingStats = await this.getTrackingStatistics();
            console.log('   ✅ Tracking stats:', {
                total: trackingStats.total,
                inProgress: trackingStats.inProgress,
                completed: trackingStats.completed,
                dataSource: trackingStats.dataSource
            });

            console.log('3. Testing tracking page metrics...');
            const trackingMetrics = await this.getMetricsForTracking();
            console.log('   ✅ Tracking page metrics:', {
                total: trackingMetrics.total,
                inProgress: trackingMetrics.inProgress,
                completed: trackingMetrics.completed
            });

            console.log('4. Testing debug methods...');
            await this.debugStatuses();
            await this.debugTrackingStatuses();

            return {
                success: true,
                curriculumStats,
                trackingStats,
                trackingMetrics
            };
            
        } catch (error) {
            console.error('❌ Statistics diagnosis failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

const statisticsService = new StatisticsService();

//  debug helpers
if (typeof window !== 'undefined') {
    window.statisticsService = statisticsService;
    window.debugStats = () => statisticsService.getCurriculumStatistics().then(console.log);
    window.debugTrackingStats = () => statisticsService.getTrackingStatistics().then(console.log);
    window.debugStatuses = () => statisticsService.debugStatuses();
    window.debugTrackingStatuses = () => statisticsService.debugTrackingStatuses();
    window.debugBreakdown = () => statisticsService.getDetailedBreakdown().then(console.log);
    window.refreshStats = () => statisticsService.refreshStatistics().then(console.log);
    window.refreshTrackingStats = () => statisticsService.refreshTrackingStatistics().then(console.log);
    window.diagnoseStatistics = () => statisticsService.diagnoseStatistics();
    window.getTrackingMetrics = () => statisticsService.getMetricsForTracking().then(console.log);
}

export default statisticsService;