# Election 2026 Poll Setup Guide

## 🚀 Quick Start

1. **Test Locally**: Open `index.html` in your browser
2. **Deploy to GitHub Pages**: Push to GitHub and enable Pages in repository settings

## 📧 Email Setup (EmailJS)

To enable email confirmations, set up EmailJS:

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for free account
3. Create a new service (Gmail, Outlook, etc.)

### Step 2: Create Email Template
Create a template with these variables:
- `{{to_email}}` - Recipient email
- `{{winner_vote}}` - Winner prediction
- `{{seats_vote}}` - Seats prediction  
- `{{pm_vote}}` - PM prediction
- `{{vote_date}}` - Vote date

Sample template:
```
Subject: Your Election 2026 Poll Submission

Hi there!

Thank you for participating in our Election 2026 poll. Here are your predictions:

🏆 Winner: {{winner_vote}}
🏛️ Most Seats: {{seats_vote}}
👤 Prime Minister: {{pm_vote}}

Submitted on: {{vote_date}}

Thanks for your participation!
```

### Step 3: Update Configuration
In `script.js`, replace these values:
```javascript
const EMAILJS_PUBLIC_KEY = 'your_public_key_here';
const EMAILJS_SERVICE_ID = 'your_service_id_here';
const EMAILJS_TEMPLATE_ID = 'your_template_id_here';
```

## 🌐 GitHub Pages Deployment

1. Push all files to your GitHub repository
2. Go to repository Settings > Pages
3. Select source branch (main/master)
4. Your site will be live at: `https://yourusername.github.io/election2026`

## 📱 Features

- ✅ Mobile-friendly responsive design
- ✅ Email validation (prevents duplicate voting)
- ✅ Local data storage
- ✅ Email confirmations
- ✅ Clean, modern UI

## 🔧 Development

- **View votes**: Open browser console and run `viewAllVotes()`
- **Reset data**: Clear localStorage to reset all votes
- **Test without email**: Works offline, emails just won't send

## 📊 Data Storage

Votes are stored in browser's localStorage:
- `pollEmails`: Array of used emails
- `pollVotes`: Array of all vote data

For production, consider migrating to a backend database.