/**
 * Task Management Dashboard - JavaScript
 * Handles task loading, filtering, sorting, pagination, and interactions
 */

// Global state
let allTasks = [];
let filteredTasks = [];
let currentPage = 1;
const tasksPerPage = 10;
let currentFilter = 'all';
let currentSort = { column: null, direction: 'asc' };

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadTaskData();
    loadUserCreatedTasks();
    initializeEventListeners();
    renderPage();
});

/**
 * Load task data from JSON file
 */
async function loadTaskData() {
    try {
        showLoading();
        const response = await fetch('assets/data/tasks.json');
        if (!response.ok) throw new Error('Failed to load tasks');
        
        const data = await response.json();
        allTasks = data.tasks || [];
        filteredTasks = [...allTasks];
        
        // Check for saved status updates in localStorage
        loadSavedStatuses();
        
        hideLoading();
        showToast('Tasks loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading tasks:', error);
        hideLoading();
        showToast('Failed to load tasks', 'error');
    }
}

/**
 * Load saved task statuses from localStorage
 */
function loadSavedStatuses() {
    const savedStatuses = JSON.parse(localStorage.getItem('taskStatuses') || '{}');
    allTasks.forEach(task => {
        if (savedStatuses[task.id]) {
            task.status = savedStatuses[task.id];
        }
    });
}

/**
 * Save task status to localStorage
 */
function saveTaskStatus(taskId, status) {
    const savedStatuses = JSON.parse(localStorage.getItem('taskStatuses') || '{}');
    savedStatuses[taskId] = status;
    localStorage.setItem('taskStatuses', JSON.stringify(savedStatuses));
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleFilterChange(e.target.dataset.filter);
        });
    });
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    // Create task button
    const createTaskBtn = document.getElementById('createTaskBtn');
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', openCreateTaskModal);
    }
    
    // Save task button
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', saveNewTask);
    }
    
    // Sort headers
    document.querySelectorAll('[data-sort]').forEach(header => {
        header.addEventListener('click', (e) => {
            const column = e.currentTarget.dataset.sort;
            handleSort(column);
        });
    });
}

/**
 * Render the entire page
 */
function renderPage() {
    renderStatistics();
    renderTaskTable();
    renderPagination();
    updateNotificationBadge();
}

/**
 * Render statistics cards
 */
function renderStatistics() {
    const stats = calculateStatistics();
    
    document.getElementById('totalTasks').textContent = stats.total;
    document.getElementById('completedTasks').textContent = stats.completed;
    document.getElementById('inProgressTasks').textContent = stats.inProgress;
    document.getElementById('overdueTasks').textContent = stats.overdue;
}

/**
 * Calculate task statistics
 */
function calculateStatistics() {
    const now = new Date();
    
    return {
        total: allTasks.length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        inProgress: allTasks.filter(t => t.status === 'in-progress').length,
        overdue: allTasks.filter(t => {
            return t.status !== 'completed' && new Date(t.dueDate) < now;
        }).length,
        pending: allTasks.filter(t => t.status === 'pending').length
    };
}

/**
 * Handle filter change
 */
function handleFilterChange(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    applyFilters();
}

/**
 * Handle search input
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    currentPage = 1;
    
    filteredTasks = allTasks.filter(task => {
        const matchesSearch = 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.assignedTo.toLowerCase().includes(searchTerm);
        
        return matchesSearch && matchesFilter(task);
    });
    
    renderTaskTable();
    renderPagination();
}

/**
 * Apply current filters
 */
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    filteredTasks = allTasks.filter(task => {
        const matchesSearch = !searchTerm || 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.assignedTo.toLowerCase().includes(searchTerm);
        
        return matchesSearch && matchesFilter(task);
    });
    
    renderTaskTable();
    renderPagination();
}

/**
 * Check if task matches current filter
 */
function matchesFilter(task) {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'overdue') {
        return task.status !== 'completed' && new Date(task.dueDate) < new Date();
    }
    return task.status === currentFilter;
}

/**
 * Handle column sorting
 */
function handleSort(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    sortTasks();
    renderTaskTable();
}

/**
 * Sort tasks based on current sort settings
 */
function sortTasks() {
    filteredTasks.sort((a, b) => {
        let aVal, bVal;
        
        switch (currentSort.column) {
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                aVal = priorityOrder[a.priority];
                bVal = priorityOrder[b.priority];
                break;
            case 'dueDate':
                aVal = new Date(a.dueDate);
                bVal = new Date(b.dueDate);
                break;
            case 'status':
                aVal = a.status;
                bVal = b.status;
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Render task table
 */
function renderTaskTable() {
    const tbody = document.getElementById('taskTableBody');
    if (!tbody) return;
    
    const startIdx = (currentPage - 1) * tasksPerPage;
    const endIdx = startIdx + tasksPerPage;
    const tasksToShow = filteredTasks.slice(startIdx, endIdx);
    
    if (tasksToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="bi bi-inbox" style="font-size: 3rem; color: var(--text-light);"></i>
                    <p class="mt-3 text-muted">No tasks found</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = tasksToShow.map(task => `
        <tr>
            <td class="fw-semibold">#${task.id}</td>
            <td>
                <div class="task-title">${escapeHtml(task.title)}</div>
                <small class="text-muted">${escapeHtml(task.description.substring(0, 50))}...</small>
            </td>
            <td>
                <div class="team-member">
                    <img src="${task.teamMember.avatar}" alt="${escapeHtml(task.teamMember.name)}">
                    <div class="member-info">
                        <span class="member-name">${escapeHtml(task.teamMember.name)}</span>
                        <span class="member-role">${escapeHtml(task.teamMember.role)}</span>
                    </div>
                </div>
            </td>
            <td>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
            </td>
            <td>
                <select class="form-select form-select-sm status-select" 
                        data-task-id="${task.id}"
                        onchange="updateTaskStatus(${task.id}, this.value)">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td>
                <span class="${isOverdue(task) ? 'text-danger fw-semibold' : ''}">${formatDate(task.dueDate)}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewTaskDetails(${task.id})">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Render pagination
 */
function renderPagination() {
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    
    let html = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="bi bi-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="px-2">...</span>`;
        }
    }
    
    html += `
        <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="bi bi-chevron-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = html;
}

/**
 * Change page
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderTaskTable();
    renderPagination();
    
    // Scroll to top of table
    document.querySelector('.task-table')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Update task status
 */
function updateTaskStatus(taskId, newStatus) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.status = newStatus;
    saveTaskStatus(taskId, newStatus);
    
    renderStatistics();
    applyFilters();
    updateNotificationBadge();
    
    showToast(`Task status updated to ${newStatus}`, 'success');
}

/**
 * View task details in modal
 */
function viewTaskDetails(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modalHtml = `
        <div class="modal fade" id="taskModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Task Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="text-muted small">Task ID</label>
                                <p class="fw-semibold">#${task.id}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="text-muted small">Priority</label>
                                <p><span class="priority-badge ${task.priority}">${task.priority}</span></p>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="text-muted small">Title</label>
                            <h6>${escapeHtml(task.title)}</h6>
                        </div>
                        <div class="mb-3">
                            <label class="text-muted small">Description</label>
                            <p>${escapeHtml(task.description)}</p>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="text-muted small">Status</label>
                                <p><span class="status-badge ${task.status}">${task.status}</span></p>
                            </div>
                            <div class="col-md-6">
                                <label class="text-muted small">Progress</label>
                                <div class="progress" style="height: 25px;">
                                    <div class="progress-bar bg-primary" role="progressbar" 
                                         style="width: ${task.progress}%" 
                                         aria-valuenow="${task.progress}" 
                                         aria-valuemin="0" 
                                         aria-valuemax="100">
                                        ${task.progress}%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="text-muted small">Assigned To</label>
                                <div class="team-member">
                                    <img src="${task.teamMember.avatar}" alt="${escapeHtml(task.teamMember.name)}">
                                    <div class="member-info">
                                        <span class="member-name">${escapeHtml(task.teamMember.name)}</span>
                                        <span class="member-role">${escapeHtml(task.teamMember.role)}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="text-muted small">Department</label>
                                <p>${escapeHtml(task.teamMember.department)}</p>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="text-muted small">Created Date</label>
                                <p>${formatDate(task.createdDate)}</p>
                            </div>
                            <div class="col-md-4">
                                <label class="text-muted small">Due Date</label>
                                <p class="${isOverdue(task) ? 'text-danger fw-semibold' : ''}">${formatDate(task.dueDate)}</p>
                            </div>
                            <div class="col-md-4">
                                <label class="text-muted small">Completed Date</label>
                                <p>${task.completedDate ? formatDate(task.completedDate) : 'N/A'}</p>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="text-muted small">Tags</label>
                            <p>
                                ${task.tags.map(tag => `<span class="badge bg-secondary me-1">${escapeHtml(tag)}</span>`).join('')}
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('taskModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
    
    // Clean up after modal is hidden
    document.getElementById('taskModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

/**
 * Export tasks to CSV
 */
function exportToCSV() {
    const headers = ['ID', 'Title', 'Description', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Created Date'];
    const rows = filteredTasks.map(task => [
        task.id,
        task.title,
        task.description,
        task.assignedTo,
        task.priority,
        task.status,
        task.dueDate,
        task.createdDate
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
        csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Tasks exported successfully', 'success');
}

/**
 * Update notification badge
 */
function updateNotificationBadge() {
    const pendingCount = allTasks.filter(t => t.status === 'pending').length;
    const badge = document.getElementById('pendingBadge');
    
    if (badge) {
        badge.textContent = pendingCount;
        badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
}

/**
 * Utility: Check if task is overdue
 */
function isOverdue(task) {
    return task.status !== 'completed' && new Date(task.dueDate) < new Date();
}

/**
 * Utility: Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Show loading overlay
 */
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

/**
 * Show toast notification
 */
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

/**
 * Create toast container
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.id = 'toastContainer';
    document.body.appendChild(container);
    return container;
}

/**
 * Open create task modal
 */
function openCreateTaskModal() {
    // Reset form
    document.getElementById('createTaskForm').reset();
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('taskDueDate').value = tomorrow.toISOString().split('T')[0];
    
    // Open modal
    const modal = new bootstrap.Modal(document.getElementById('createTaskModal'));
    modal.show();
}

/**
 * Save new task
 */
function saveNewTask() {
    const form = document.getElementById('createTaskForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Get form values
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const assignee = document.getElementById('taskAssignee').value;
    const priority = document.getElementById('taskPriority').value;
    const status = document.getElementById('taskStatus').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const tagsInput = document.getElementById('taskTags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    // Generate new task ID
    const maxId = allTasks.length > 0 ? Math.max(...allTasks.map(t => parseInt(t.id))) : 0;
    const newId = (maxId + 1).toString();
    
    // Create new task object
    const newTask = {
        id: newId,
        title: title,
        description: description,
        assignedTo: assignee,
        priority: priority.toLowerCase(),
        status: status.toLowerCase().replace(' ', '-'),
        dueDate: dueDate,
        createdDate: new Date().toISOString().split('T')[0],
        progress: status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0,
        tags: tags,
        teamMember: {
            name: assignee,
            avatar: assignee.split(' ').map(n => n[0]).join(''),
            role: 'Team Member'
        }
    };
    
    // Add to tasks array
    allTasks.unshift(newTask);
    filteredTasks = [...allTasks];
    
    // Save to localStorage
    const savedTasks = JSON.parse(localStorage.getItem('userCreatedTasks') || '[]');
    savedTasks.push(newTask);
    localStorage.setItem('userCreatedTasks', JSON.stringify(savedTasks));
    
    // Reset to first page and render
    currentPage = 1;
    renderPage();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
    modal.hide();
    
    // Show success message
    showToast('Task created successfully!', 'success');
}

/**
 * Load user created tasks from localStorage on initialization
 */
function loadUserCreatedTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('userCreatedTasks') || '[]');
    if (savedTasks.length > 0) {
        // Merge user-created tasks with loaded tasks (avoid duplicates)
        savedTasks.forEach(savedTask => {
            if (!allTasks.find(t => t.id === savedTask.id)) {
                allTasks.unshift(savedTask);
            }
        });
        filteredTasks = [...allTasks];
    }
}
