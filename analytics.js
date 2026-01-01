/**
 * Task Analytics Dashboard - JavaScript
 * Handles data visualization and analytics calculations
 */

let analyticsData = null;
let charts = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAnalyticsData();
    renderAnalytics();
});

/**
 * Load analytics data
 */
async function loadAnalyticsData() {
    try {
        showLoading();
        const response = await fetch('assets/data/tasks.json');
        if (!response.ok) throw new Error('Failed to load data');
        
        analyticsData = await response.json();
        
        // Check for saved status updates
        loadSavedStatuses();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading analytics data:', error);
        hideLoading();
        showToast('Failed to load analytics data', 'error');
    }
}

/**
 * Load saved task statuses from localStorage
 */
function loadSavedStatuses() {
    const savedStatuses = JSON.parse(localStorage.getItem('taskStatuses') || '{}');
    analyticsData.tasks.forEach(task => {
        if (savedStatuses[task.id]) {
            task.status = savedStatuses[task.id];
        }
    });
}

/**
 * Render all analytics
 */
function renderAnalytics() {
    renderKeyMetrics();
    renderStatusChart();
    renderPriorityChart();
    renderWeeklyCompletionChart();
    renderTeamMemberChart();
    renderTopPerformers();
    renderBottlenecks();
}

/**
 * Render key metrics
 */
function renderKeyMetrics() {
    const metrics = calculateKeyMetrics();
    
    document.getElementById('avgCompletionTime').textContent = `${metrics.avgCompletionTime} days`;
    document.getElementById('onTimeRate').textContent = `${metrics.onTimeRate}%`;
    document.getElementById('topPerformer').textContent = metrics.topPerformer;
    document.getElementById('bottleneckCount').textContent = metrics.bottleneckCount;
}

/**
 * Calculate key metrics
 */
function calculateKeyMetrics() {
    const tasks = analyticsData.tasks;
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    // Average completion time
    let totalDays = 0;
    completedTasks.forEach(task => {
        const start = new Date(task.createdDate);
        const end = new Date(task.completedDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        totalDays += days;
    });
    const avgCompletionTime = completedTasks.length > 0 
        ? (totalDays / completedTasks.length).toFixed(1) 
        : 0;
    
    // On-time completion rate
    const onTimeCompleted = completedTasks.filter(task => {
        return new Date(task.completedDate) <= new Date(task.dueDate);
    }).length;
    const onTimeRate = completedTasks.length > 0 
        ? Math.round((onTimeCompleted / completedTasks.length) * 100) 
        : 0;
    
    // Top performer
    const teamMembers = analyticsData.teamMembers || [];
    const topPerformer = teamMembers.sort((a, b) => b.productivity - a.productivity)[0];
    
    // Bottlenecks (overdue tasks)
    const now = new Date();
    const bottleneckCount = tasks.filter(task => {
        return task.status !== 'completed' && new Date(task.dueDate) < now;
    }).length;
    
    return {
        avgCompletionTime,
        onTimeRate,
        topPerformer: topPerformer ? topPerformer.name : 'N/A',
        bottleneckCount
    };
}

/**
 * Render tasks by status pie chart
 */
function renderStatusChart() {
    const ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx) return;
    
    const statusCounts = getStatusCounts();
    
    if (charts.status) charts.status.destroy();
    
    charts.status = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Pending', 'In Progress', 'Completed', 'Overdue'],
            datasets: [{
                data: [
                    statusCounts.pending,
                    statusCounts.inProgress,
                    statusCounts.completed,
                    statusCounts.overdue
                ],
                backgroundColor: [
                    '#94a3b8', // Pending
                    '#3b82f6', // In Progress
                    '#10b981', // Completed
                    '#ef4444'  // Overdue
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Get status counts
 */
function getStatusCounts() {
    const tasks = analyticsData.tasks;
    const now = new Date();
    
    return {
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => {
            return t.status !== 'completed' && new Date(t.dueDate) < now;
        }).length
    };
}

/**
 * Render tasks by priority bar chart
 */
function renderPriorityChart() {
    const ctx = document.getElementById('priorityChart')?.getContext('2d');
    if (!ctx) return;
    
    const priorityCounts = getPriorityCounts();
    
    if (charts.priority) charts.priority.destroy();
    
    charts.priority = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High Priority', 'Medium Priority', 'Low Priority'],
            datasets: [{
                label: 'Number of Tasks',
                data: [
                    priorityCounts.high,
                    priorityCounts.medium,
                    priorityCounts.low
                ],
                backgroundColor: [
                    '#ef4444', // High
                    '#f59e0b', // Medium
                    '#10b981'  // Low
                ],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Tasks: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: '#e2e8f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    });
}

/**
 * Get priority counts
 */
function getPriorityCounts() {
    const tasks = analyticsData.tasks;
    
    return {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };
}

/**
 * Render weekly completion line chart
 */
function renderWeeklyCompletionChart() {
    const ctx = document.getElementById('weeklyChart')?.getContext('2d');
    if (!ctx) return;
    
    const weeklyData = getWeeklyCompletionData();
    
    if (charts.weekly) charts.weekly.destroy();
    
    charts.weekly = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
            datasets: [{
                label: 'Completed Tasks',
                data: weeklyData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Completed: ${context.parsed.y} tasks`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: '#e2e8f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    });
}

/**
 * Get weekly completion data
 */
function getWeeklyCompletionData() {
    // Using sample data for demonstration
    // In production, calculate from actual completion dates
    return analyticsData.statistics?.weeklyCompletions || [2, 1, 0, 3, 1, 2, 1];
}

/**
 * Render tasks by team member doughnut chart
 */
function renderTeamMemberChart() {
    const ctx = document.getElementById('teamMemberChart')?.getContext('2d');
    if (!ctx) return;
    
    const teamData = getTeamMemberData();
    
    if (charts.teamMember) charts.teamMember.destroy();
    
    charts.teamMember = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: teamData.names,
            datasets: [{
                data: teamData.counts,
                backgroundColor: [
                    '#6366f1',
                    '#8b5cf6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value} tasks`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

/**
 * Get team member data
 */
function getTeamMemberData() {
    const tasks = analyticsData.tasks;
    const teamCounts = {};
    
    tasks.forEach(task => {
        const name = task.teamMember.name;
        teamCounts[name] = (teamCounts[name] || 0) + 1;
    });
    
    return {
        names: Object.keys(teamCounts),
        counts: Object.values(teamCounts)
    };
}

/**
 * Render top performers list
 */
function renderTopPerformers() {
    const container = document.getElementById('topPerformers');
    if (!container) return;
    
    const teamMembers = [...(analyticsData.teamMembers || [])]
        .sort((a, b) => b.productivity - a.productivity)
        .slice(0, 5);
    
    container.innerHTML = teamMembers.map(member => `
        <div class="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
            <div class="d-flex align-items-center gap-3">
                <img src="${member.avatar}" alt="${escapeHtml(member.name)}" 
                     style="width: 48px; height: 48px; border-radius: 50%;">
                <div>
                    <div class="fw-semibold">${escapeHtml(member.name)}</div>
                    <small class="text-muted">${escapeHtml(member.role)}</small>
                </div>
            </div>
            <div class="text-end">
                <div class="fw-bold text-primary">${member.productivity}%</div>
                <small class="text-muted">${member.tasksCompleted}/${member.tasksAssigned} tasks</small>
            </div>
        </div>
    `).join('');
}

/**
 * Render bottlenecks (overdue tasks)
 */
function renderBottlenecks() {
    const container = document.getElementById('bottlenecks');
    if (!container) return;
    
    const now = new Date();
    const overdueTasks = analyticsData.tasks
        .filter(task => task.status !== 'completed' && new Date(task.dueDate) < now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
    
    if (overdueTasks.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
                <p class="mt-3 text-muted">No overdue tasks!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = overdueTasks.map(task => {
        const daysOverdue = Math.floor((now - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
        return `
            <div class="d-flex align-items-start justify-content-between mb-3 p-3 border-start border-danger border-4 bg-light rounded">
                <div class="flex-grow-1">
                    <div class="fw-semibold mb-1">${escapeHtml(task.title)}</div>
                    <small class="text-muted d-block mb-2">${escapeHtml(task.assignedTo)}</small>
                    <span class="badge bg-danger">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</span>
                </div>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
            </div>
        `;
    }).join('');
}

/**
 * Utility functions
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle-fill' : type === 'error' ? 'exclamation-circle-fill' : 'info-circle-fill'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
    return container;
}
