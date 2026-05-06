/**
 * Stage 6: Priority Inbox Implementation
 * 
 * Run with: node priority_inbox.js
 * (Requires Node.js v18+ for native fetch support)
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://20.207.122.201/evaluation-service/notifications';

// Attempt to read the token from the frontend's .env file automatically
let rawToken = process.env.LOG_API_TOKEN || process.env.VITE_API_TOKEN || '';

if (!rawToken) {
  try {
    const envPath = path.join(__dirname, 'stage7_frontend', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/VITE_API_TOKEN=(.*)/);
      if (match && match[1]) {
        rawToken = match[1];
      }
    }
  } catch (err) {
    console.warn("Could not read .env file automatically.");
  }
}

rawToken = rawToken || 'YOUR_TOKEN_HERE';
const TOKEN = rawToken.replace(/^["']|["']$/g, '');

// Priority weights as defined in requirements
const WEIGHTS = {
  Placement: 300,
  Result: 200,
  Event: 100,
};

async function getPriorityInbox(topN = 10) {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }

    // The API response might be wrapped in a "notifications" key or returned directly as an array
    const data = await response.json();
    const notifications = Array.isArray(data) ? data : (data.notifications || []);

    const scoredNotifications = notifications.map(notif => {
      // Determine base weight from notification type
      const baseWeight = WEIGHTS[notif.Type] || 0;
      
      // Calculate recency. We use the epoch timestamp.
      // We scale down the timestamp so it acts as a secondary tie-breaker 
      // without overpowering the primary Weight factor.
      const timestampMs = new Date(notif.Timestamp).getTime();
      const recencyFactor = timestampMs / 100000000000; 
      
      const priorityScore = baseWeight + recencyFactor;

      return {
        ...notif,
        priorityScore
      };
    });

    // Sort descending by calculated priority score
    scoredNotifications.sort((a, b) => b.priorityScore - a.priorityScore);

    // Return the top 'n' results
    return scoredNotifications.slice(0, topN);

  } catch (error) {
    console.error('Error fetching priority inbox:', error.message);
    return [];
  }
}

// Execute the function
getPriorityInbox(10).then(top10 => {
  if (top10.length === 0) {
    console.log("No notifications found or authentication failed.");
    return;
  }
  
  console.log('\n======================================================');
  console.log('                 PRIORITY INBOX (Top 10)                ');
  console.log('======================================================\n');
  
  top10.forEach((n, index) => {
    console.log(`${index + 1}. [${n.Type}] ${n.Message}`);
    console.log(`   Timestamp: ${n.Timestamp} | Score: ${n.priorityScore.toFixed(4)}`);
    console.log(`   ID: ${n.ID}\n`);
  });
});
