
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

// --- Background interval for updating trains arriving in next 30 minutes ---
const UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
function updateUpcomingTrains() {
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  todayDb.all('SELECT rowid, train_number, train_name, exp_arrival FROM allocations', async (err, rows) => {
    if (err) {
      todayDb.close();
      return;
    }
    const { spawn } = require('child_process');
    const path = require('path');
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    function timeToMinutes(timeStr) {
      if (!timeStr || timeStr === 'TBD') return null;
      const [h, m] = timeStr.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    }
    // Only fetch for trains whose exp_arrival is within the next 30 minutes
    const filteredRows = rows.filter(row => {
      const schedMin = timeToMinutes(row.exp_arrival);
      return schedMin !== null && schedMin > nowMinutes && schedMin <= nowMinutes + 30;
    });
    await Promise.all(filteredRows.map(row => {
      return new Promise((resolve) => {
        const formattedName = (row.train_name || '').toLowerCase().replace(/\s+/g, '-');
        const inputStr = `${formattedName}-${row.train_number}`;
        const pyPath = path.join(__dirname, '..', 'py', 'real_time.py');
        const pyProcess = spawn('python', [pyPath, inputStr]);
        let dataString = '';
        pyProcess.stdout.on('data', (chunk) => {
          dataString += chunk.toString();
        });
        pyProcess.on('close', () => {
          let selected = {};
          try {
            const parsed = JSON.parse(dataString.replace(/'/g, '"'));
            selected = {
              real_arrival: parsed.real_arrival,
              delay: parsed.delay
            };
          } catch (e) {
            selected = { error: 'parse_error', raw: dataString };
          }
          todayDb.run('UPDATE allocations SET real_arrival = ?, delay = ? WHERE rowid = ?', [selected.real_arrival || null, selected.delay || null, row.rowid], (err2) => {
            resolve();
          });
        });
      });
    }));
    todayDb.close();
  });
}
setInterval(updateUpcomingTrains, UPDATE_INTERVAL_MS);





// Health check endpoint for both databases
app.get('/api/db-health', (req, res) => {
  const mainDbPath = path.join(__dirname, '../database/train_allocations.db');
  const todayDbPath = path.join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  let mainDbStatus = 'ok';
  let todayDbStatus = 'ok';
  const mainDb = new sqlite3.Database(mainDbPath, (err) => {
    if (err) mainDbStatus = err.message;
    mainDb.get('SELECT 1 FROM allocations LIMIT 1', (err2) => {
      if (err2) mainDbStatus = err2.message;
      mainDb.close();
      const todayDb = new sqlite3.Database(todayDbPath, (err3) => {
        if (err3) todayDbStatus = err3.message;
        todayDb.get('SELECT 1 FROM allocations LIMIT 1', (err4) => {
          if (err4) todayDbStatus = err4.message;
          todayDb.close();
          res.json({
            train_allocations_db: mainDbStatus,
            today_db: todayDbStatus
          });
        });
      });
    });
  });
});

// Endpoint to count all rows in today.db allocations table
app.get('/api/active', (req, res) => {
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  todayDb.get('SELECT COUNT(*) as count FROM allocations', (err, row) => {
    todayDb.close();
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ count: row.count });
  });
});

// New endpoint for comprehensive dashboard statistics
app.get('/api/dashboard-stats', (req, res) => {
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  
  // Get current time for filtering
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  
  function timeToMinutes(timeStr) {
    if (!timeStr || timeStr === 'TBD') return null;
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }
  
  todayDb.all('SELECT * FROM allocations', (err, rows) => {
    todayDb.close();
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Calculate various statistics
    const totalTrains = rows.length;
    const currentWindow = rows.filter(row => {
      const schedMin = timeToMinutes(row.exp_arrival);
      return schedMin !== null && Math.abs(schedMin - nowMinutes) <= 240; // 4 hours
    });
    
    const onTimeTrains = rows.filter(row => 
      !row.delay || row.delay === "Right Time" || 
      (row.delay && !row.delay.includes("Delayed"))
    ).length;
    
    const delayedTrains = rows.filter(row => 
      row.delay && row.delay.includes("Delayed")
    ).length;
    
    const platformUtilization = rows.filter(row => 
      row.allocated_platform && row.allocated_platform !== '-'
    ).length;
    
    // Calculate average delay
    let totalDelayMinutes = 0;
    let delayCount = 0;
    rows.forEach(row => {
      if (row.delay && row.delay.includes("Delayed")) {
        const match = row.delay.match(/(\d+)/);
        if (match) {
          totalDelayMinutes += parseInt(match[1]);
          delayCount++;
        }
      }
    });
    
    const avgDelay = delayCount > 0 ? Math.round(totalDelayMinutes / delayCount) : 0;
    
    res.json({
      totalTrains,
      activeTrains: currentWindow.length,
      onTimeTrains,
      delayedTrains,
      platformUtilization: Math.round((platformUtilization / totalTrains) * 100),
      averageDelay: avgDelay,
      onTimePercentage: Math.round((onTimeTrains / totalTrains) * 100),
      currentDay: todayValue,
      lastUpdated: new Date().toISOString()
    });
  });
});

// Variable to store current real time in 24-hour format (HH:mm)
let currentRealTime = () => {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};


// Function to get present day as a string (e.g., 'Sunday')
function getPresentDay() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
}
let todayValue = null;

// Update the value periodically or on server start
function updateTodayValue() {
  todayValue = getPresentDay();
}
updateTodayValue();

// Use persistent SQLite DB in database folder
const path = require('path');
const dbPath = path.join(__dirname, '../database/train_allocations.db');
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  // Optional: Only insert sample data if table is empty
  db.get('SELECT * FROM allocations WHERE days = ?', [todayValue]);
});

// Function to create/overwrite today.db for the current day
const fs = require('fs');

function safeUnlinkSync(filePath, maxRetries = 5, delay = 200) {
  let tries = 0;
  while (fs.existsSync(filePath) && tries < maxRetries) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        // Wait and retry
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
        tries++;
      } else {
        throw err;
      }
    }
  }
  return !fs.existsSync(filePath);
}

function createTodayDb(callback) {
  const todayDbPath = path.join(__dirname, '../database/today.db');
  // Try to close any open connection by opening and closing
  if (fs.existsSync(todayDbPath)) {
    try {
      const tempDb = new sqlite3.Database(todayDbPath);
      tempDb.close();
    } catch (e) {}
    safeUnlinkSync(todayDbPath);
  }
  const todayDb = new sqlite3.Database(todayDbPath);
  todayDb.serialize(() => {
    // Attach the main database
    todayDb.run(`ATTACH DATABASE ? AS mainDb`, [path.join(__dirname, '../database/train_allocations.db')], (err1) => {
      if (err1) {
        todayDb.close();
        if (callback) callback(err1);
        return;
      }
      // Create the allocations table structure
      todayDb.run(`CREATE TABLE allocations AS SELECT * FROM mainDb.allocations WHERE days = ?`, [todayValue], (err2) => {
        todayDb.close();
        if (callback) callback(err2);
      });
    });
  });
}

// Track last day for which today.db was created
let lastTodayDbDay = todayValue;
function checkAndUpdateTodayDbIfNeeded() {
  const currentDay = getPresentDay();
  if (currentDay !== lastTodayDbDay) {
    todayValue = currentDay;
    lastTodayDbDay = currentDay;
    createTodayDb();
  }
}

// Create today.db at server start
createTodayDb();

// API endpoint to get present day info (and update today.db if day changed)
app.get('/api/today', (req, res) => {
  checkAndUpdateTodayDbIfNeeded();
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  todayDb.all('SELECT * FROM allocations', (err, rows) => {
    todayDb.close();
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ day: todayValue, rows });
  });
});

// API endpoint to get all train data
app.get('/api/trains', (req, res) => {
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  todayDb.all('SELECT * FROM allocations', (err, rows) => {
    todayDb.close();
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    // Get current time in minutes since midnight
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    // Helper to convert HH:mm string to minutes since midnight
    function timeToMinutes(timeStr) {
      if (!timeStr || timeStr === 'TBD') return null;
      const [h, m] = timeStr.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    }
    
    // Calculate train status based on real-time data
    function calculateStatus(scheduled, real_arrival, delay) {
      if (!real_arrival && !delay) return "Scheduled";
      if (delay && delay !== "Right Time") {
        return delay.includes("Delayed") ? "Delayed" : "On Time";
      }
      if (real_arrival && scheduled) {
        const schedMin = timeToMinutes(scheduled);
        const realMin = timeToMinutes(real_arrival);
        if (schedMin && realMin) {
          const diff = realMin - schedMin;
          if (diff > 5) return `Delayed by ${diff} min`;
          if (diff < -5) return `Early by ${Math.abs(diff)} min`;
        }
      }
      return "On Time";
    }
    
    // Filter trains within ±4 hours (240 minutes) of now for better coverage
    const trains = rows
      .map(row => ({
        id: row.train_number?.toString() || row.id?.toString() || '',
        name: row.train_name || "Unknown Train",
        type: row.type || "Express",
        from: row.from_station || "",
        to: row.to_station || "",
        scheduled: row.exp_arrival || row.arrives || "",
        estimated: row.real_arrival || row.estimated || row.exp_arrival || "",
        status: calculateStatus(row.exp_arrival, row.real_arrival, row.delay),
        platform: row.allocated_platform || row.platform || "-",
        passengers: row.passengers || Math.floor(Math.random() * 500) + 50, // Fallback with realistic number
        priority: row.priority || (row.type === "Rajdhani" ? "High" : row.type === "Express" ? "Medium" : "Normal"),
        delay: row.delay || "Right Time",
        real_arrival: row.real_arrival || null,
        days: row.days || "",
        distance: row.distance || 0
      }))
      .filter(train => {
        const schedMin = timeToMinutes(train.scheduled);
        return schedMin !== null && Math.abs(schedMin - nowMinutes) <= 240; // 4 hours window
      })
      .sort((a, b) => {
        // Sort by scheduled arrival time
        const aMin = timeToMinutes(a.scheduled);
        const bMin = timeToMinutes(b.scheduled);
        return (aMin || 0) - (bMin || 0);
      });
    
    res.json({ 
      trains,
      currentTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      totalTrains: trains.length,
      activeDay: todayValue
    });
  });
});


// Endpoint to fetch and update real-time train data for each row (parallel, today.db, only delay/real_arrival)
app.post('/api/update-realtime', async (req, res) => {
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  todayDb.all('SELECT rowid, train_number, train_name, exp_arrival FROM allocations', async (err, rows) => {
    if (err) {
      todayDb.close();
      return res.status(500).json({ error: 'Database error' });
    }
    const { spawn } = require('child_process');
    const path = require('path');
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    function timeToMinutes(timeStr) {
      if (!timeStr || timeStr === 'TBD') return null;
      const [h, m] = timeStr.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      return h * 60 + m;
    }
    // Only fetch for trains up to now
    const filteredRows = rows.filter(row => {
      const schedMin = timeToMinutes(row.exp_arrival);
      return schedMin !== null && schedMin <= nowMinutes;
    });
    // Run all fetches in parallel
    await Promise.all(filteredRows.map(row => {
      return new Promise((resolve) => {
        const formattedName = (row.train_name || '').toLowerCase().replace(/\s+/g, '-');
        const inputStr = `${formattedName}-${row.train_number}`;
        const pyPath = path.join(__dirname, '..', 'py', 'real_time.py');
        const pyProcess = spawn('python', [pyPath, inputStr]);
        let dataString = '';
        pyProcess.stdout.on('data', (chunk) => {
          dataString += chunk.toString();
        });
        pyProcess.on('close', () => {
          // Debug: log the raw output from Python
          console.log('Python output for', inputStr, ':', dataString);
          // Parse output and extract only real_arrival and delay
          let selected = {};
          try {
            const parsed = JSON.parse(dataString.replace(/'/g, '"'));
            selected = {
              real_arrival: parsed.real_arrival,
              delay: parsed.delay
            };
          } catch (e) {
            console.error('Parse error for', inputStr, ':', e.message, '| Raw:', dataString);
            selected = { error: 'parse_error', raw: dataString };
          }
          todayDb.run('UPDATE allocations SET real_arrival = ?, delay = ? WHERE rowid = ?', [selected.real_arrival || null, selected.delay || null, row.rowid], (err2) => {
            resolve();
          });
        });
      });
    }));
    todayDb.close();
    res.json({ updated: filteredRows.length });
  });
});

app.get('/api/allocations/real-time', (req, res) => {
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  todayDb.all('SELECT train_number, train_name, real_arrival, delay, exp_arrival, allocated_platform FROM allocations WHERE real_arrival IS NOT NULL OR delay IS NOT NULL', (err, rows) => {
    todayDb.close();
    if (err) return res.status(500).json({ error: 'Database error' });
    
    const data = rows.map(row => ({
      trainNumber: row.train_number,
      trainName: row.train_name,
      scheduledArrival: row.exp_arrival,
      realArrival: row.real_arrival,
      delay: row.delay,
      platform: row.allocated_platform,
      status: row.delay && row.delay.includes("Delayed") ? "Delayed" : "On Time"
    }));
    
    res.json({ 
      data,
      count: data.length,
      lastUpdated: new Date().toISOString()
    });
  });
});

// New endpoint to get train details by ID
app.get('/api/train/:id', (req, res) => {
  const trainId = req.params.id;
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  
  todayDb.get('SELECT * FROM allocations WHERE train_number = ?', [trainId], (err, row) => {
    todayDb.close();
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Train not found' });
    }
    
    res.json({
      id: row.train_number,
      name: row.train_name,
      type: row.type || "Express",
      from: row.from_station,
      to: row.to_station,
      scheduledArrival: row.exp_arrival,
      realArrival: row.real_arrival,
      delay: row.delay,
      platform: row.allocated_platform,
      days: row.days,
      distance: row.distance,
      status: row.delay && row.delay.includes("Delayed") ? "Delayed" : "On Time"
    });
  });
});

// Endpoint to fetch weather data from Python script, with 30 min cache
const { spawn } = require('child_process');
let cachedWeather = null;
let lastWeatherFetch = 0;
const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in ms

function fetchWeatherFromPython(callback) {
  const pyProcess = spawn('python', [
    path.join(__dirname, '..', 'py', 'scrape_weather.py')
  ]);
  let dataString = '';
  pyProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });
  pyProcess.stderr.on('data', (data) => {
    console.error('Python error:', data.toString());
  });
  pyProcess.on('close', (code) => {
    try {
      const weather = JSON.parse(dataString.replace(/'/g, '"'));
      cachedWeather = weather;
      lastWeatherFetch = Date.now();
      callback(null, weather);
    } catch (e) {
      callback(e, null);
    }
  });
}

app.get('/api/weather', (req, res) => {
  const now = Date.now();
  if (cachedWeather && (now - lastWeatherFetch) < WEATHER_CACHE_DURATION) {
    return res.json({
      ...cachedWeather,
      cached: true,
      lastUpdated: new Date(lastWeatherFetch).toISOString()
    });
  }
  fetchWeatherFromPython((err, weather) => {
    if (err) {
      console.error('Weather fetch error:', err);
      // Return cached data if available, otherwise return error
      if (cachedWeather) {
        return res.json({
          ...cachedWeather,
          cached: true,
          error: 'Failed to fetch new data, showing cached',
          lastUpdated: new Date(lastWeatherFetch).toISOString()
        });
      }
      return res.status(500).json({ error: 'Failed to fetch weather data' });
    }
    res.json({
      ...weather,
      cached: false,
      lastUpdated: new Date().toISOString(),
      location: "Bararuni Junction, Bihar"
    });
  });
});

// New endpoint to trigger real-time data update for all trains
app.post('/api/update-all-realtime', async (req, res) => {
  const todayDbPath = require('path').join(__dirname, '../database/today.db');
  const sqlite3 = require('sqlite3').verbose();
  const todayDb = new sqlite3.Database(todayDbPath);
  
  todayDb.all('SELECT rowid, train_number, train_name, exp_arrival FROM allocations', async (err, rows) => {
    if (err) {
      todayDb.close();
      return res.status(500).json({ error: 'Database error' });
    }
    
    const { spawn } = require('child_process');
    const path = require('path');
    let updatedCount = 0;
    let errorCount = 0;
    
    console.log(`Starting real-time update for ${rows.length} trains...`);
    
    // Process all trains in parallel with limit
    const batchSize = 5; // Process 5 trains at a time to avoid overwhelming the server
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      await Promise.all(batch.map(row => {
        return new Promise((resolve) => {
          const formattedName = (row.train_name || '').toLowerCase().replace(/\s+/g, '-');
          const inputStr = `${formattedName}-${row.train_number}`;
          const pyPath = path.join(__dirname, '..', 'py', 'real_time.py');
          const pyProcess = spawn('python', [pyPath, inputStr]);
          
          let dataString = '';
          let errorString = '';
          
          pyProcess.stdout.on('data', (chunk) => {
            dataString += chunk.toString();
          });
          
          pyProcess.stderr.on('data', (chunk) => {
            errorString += chunk.toString();
          });
          
          pyProcess.on('close', (code) => {
            if (code !== 0 || errorString) {
              console.error(`Error for train ${inputStr}:`, errorString);
              errorCount++;
              resolve();
              return;
            }
            
            try {
              const parsed = JSON.parse(dataString.replace(/'/g, '"'));
              const realArrival = parsed.real_arrival || null;
              const delay = parsed.delay || null;
              
              todayDb.run(
                'UPDATE allocations SET real_arrival = ?, delay = ? WHERE rowid = ?',
                [realArrival, delay, row.rowid],
                (err2) => {
                  if (!err2) updatedCount++;
                  resolve();
                }
              );
            } catch (e) {
              console.error(`Parse error for train ${inputStr}:`, e.message);
              errorCount++;
              resolve();
            }
          });
        });
      }));
    }
    
    todayDb.close();
    console.log(`Real-time update completed: ${updatedCount} updated, ${errorCount} errors`);
    
    res.json({
      totalTrains: rows.length,
      updated: updatedCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/trains - Get all train data with real-time updates');
  console.log('  GET  /api/active - Get count of active trains');
  console.log('  GET  /api/dashboard-stats - Get comprehensive dashboard statistics');
  console.log('  GET  /api/weather - Get current weather data');
  console.log('  GET  /api/train/:id - Get specific train details');
  console.log('  GET  /api/allocations/real-time - Get real-time data for all trains');
  console.log('  POST /api/update-realtime - Update real-time data for recent trains');
  console.log('  POST /api/update-all-realtime - Update real-time data for all trains');
  console.log('  GET  /api/today - Get today\'s train allocations');
  console.log('  GET  /api/db-health - Check database health');
  console.log('');
  console.log('Database integration:');
  console.log('  - Main DB: train_allocations.db');
  console.log('  - Today DB: today.db (auto-created for current day)');
  console.log('  - Python scripts: weather scraping, real-time train tracking');
  console.log('');
  console.log('Real-time updates running every 5 minutes for upcoming trains...');
});
