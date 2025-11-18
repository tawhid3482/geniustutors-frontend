module.exports = {
  apps: [
    {
      name: 'tutor-connect-frontend',
      script: 'npm',
      args: 'start:production',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      min_uptime: '10s',
      max_restarts: 10,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next', 'uploads']
    },
    {
      name: 'tutor-connect-backend',
      script: 'server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_file: '../logs/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      min_uptime: '10s',
      max_restarts: 10,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads']
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/tutor-connect.git',
      path: '/var/www/tutor-connect',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build:production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
