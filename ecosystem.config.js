module.exports = {
  apps: [{
    name: 'trasealla-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000
  }],

  deploy: {
    production: {
      user: 'root',
      host: '72.61.177.109',
      ref: 'origin/main',
      repo: 'https://github.com/osamahkenawy/trasealla-backend.git',
      path: '/var/www/trasealla/trasealla-backend',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/trasealla/trasealla-backend'
    }
  }
};

