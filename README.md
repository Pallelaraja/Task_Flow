# TaskFlow - Task Management Dashboard

![TaskFlow](assets/images/logo.svg)

A fully functional task management dashboard built as a customization of the Mazer Admin Dashboard template. Features include task tracking, analytics, data visualization, and responsive design.

## 🚀 Quick Start

**[View Live Demo →](#)** *(Add your GitHub Pages URL)*

### Run Locally

No build process required! Simply open in a browser:

```bash
# Using Python
python -m http.server 8000

# Using Node
npx http-server -p 8000

# Or use VS Code Live Server extension
```

Navigate to `http://localhost:8000`

## ✨ Features

- ✅ Task Management with CRUD operations
- ✅ Advanced filtering and search
- ✅ Real-time statistics and analytics
- ✅ Data visualization with Chart.js
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ CSV export functionality
- ✅ LocalStorage persistence
- ✅ Dark sidebar theme
- ✅ Custom color scheme (Indigo & Purple)

## 📸 Screenshots

<table>
  <tr>
    <td><img src="screenshots/dashboard.png" alt="Dashboard" width="400"/></td>
    <td><img src="screenshots/tasks-list.png" alt="Tasks" width="400"/></td>
  </tr>
  <tr>
    <td><img src="screenshots/analytics.png" alt="Analytics" width="400"/></td>
    <td><img src="screenshots/mobile-view.png" alt="Mobile" width="400"/></td>
  </tr>
</table>

## 🛠️ Technologies

- **Bootstrap 5.3.0** - UI Framework
- **Chart.js 4.4.0** - Data Visualization
- **Vanilla JavaScript** - Application Logic
- **Bootstrap Icons** - Icon Library
- **Google Fonts (Inter)** - Typography

## 📁 Project Structure

```
task3-mazer-customization/
├── index.html              # Dashboard homepage
├── tasks.html              # Task management page
├── analytics.html          # Analytics dashboard
├── assets/
│   ├── css/
│   │   └── custom.css     # Custom styles
│   ├── js/
│   │   ├── tasks.js       # Task logic
│   │   └── analytics.js   # Analytics logic
│   ├── data/
│   │   └── tasks.json     # Sample data
│   └── images/
│       └── logo.svg       # Brand logo
└── screenshots/           # Project screenshots
```

## 📖 Documentation

- **[ASSESSMENT_README.md](ASSESSMENT_README.md)** - Complete implementation documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide for GitHub Pages

## 🎯 Assessment Requirements Met

This project fulfills all requirements for **Task 3 - Front-End Skill Assessment**:

### Part 1: Setup & Customization (40%)
- ✅ Theme customization (Indigo & Purple colors)
- ✅ Dark sidebar by default
- ✅ Inter font family
- ✅ Custom logo
- ✅ Menu reordering
- ✅ Notification badges
- ✅ Breadcrumb navigation

### Part 2: Data Integration (40%)
- ✅ Task statistics cards
- ✅ Interactive task table
- ✅ Sorting & filtering
- ✅ Search functionality
- ✅ Pagination
- ✅ Status updates with persistence
- ✅ CSV export
- ✅ Analytics with 4 chart types
- ✅ Key metrics calculation

### Part 3: UX Enhancements (20%)
- ✅ Fully responsive design
- ✅ Loading states
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Smooth transitions
- ✅ Accessibility features

## 🧪 Browser Compatibility

- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+

## 📱 Responsive Breakpoints

- Desktop: 1920px, 1366px
- Tablet: 1024px, 768px
- Mobile: 414px, 375px

## 🚀 Deployment

### GitHub Pages

1. Push code to GitHub
2. Settings → Pages
3. Source: main branch
4. Access at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

Detailed instructions: [DEPLOYMENT.md](DEPLOYMENT.md)

## 💡 Key Features

### Task Management
- View all tasks with detailed information
- Filter by status (All, Pending, In Progress, Completed, Overdue)
- Search across title, description, and assignee
- Sort by priority, status, or due date
- Update task status with dropdown
- View full task details in modal
- Export filtered results to CSV

### Analytics Dashboard
- **Pie Chart**: Task distribution by status
- **Bar Chart**: Tasks by priority level
- **Line Chart**: Weekly completion trend
- **Doughnut Chart**: Tasks by team member
- **Metrics**: Avg completion time, on-time rate, top performer, bottlenecks
- **Lists**: Top performers and overdue tasks

## 🎨 Customization

### Colors
```css
--primary: #6366f1    /* Indigo */
--secondary: #8b5cf6  /* Purple */
--success: #10b981    /* Green */
--warning: #f59e0b    /* Orange */
--danger: #ef4444     /* Red */
```

### Data
Edit `assets/data/tasks.json` to modify task data, team members, and statistics.

## 📝 License

Built on [Mazer Admin Dashboard](https://github.com/zuramai/mazer) (MIT License).  
All customizations are also MIT Licensed.

## 👤 Developer

**[Your Name]**
- GitHub: [@yourusername](#)
- Portfolio: [yourportfolio.com](#)

## 🙏 Credits

- [Mazer Dashboard](https://github.com/zuramai/mazer) by Saugi Rahmat
- [Bootstrap](https://getbootstrap.com/) by Twitter
- [Chart.js](https://www.chartjs.org/) Community
- [Bootstrap Icons](https://icons.getbootstrap.com/)

---

**Built for Task 3 - Front-End Skill Assessment** | January 2026
