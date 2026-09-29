const raw = process.env.PILOT_TEST_APP_API_URL || process.env.E2E_API_BASE || 'http://127.0.0.1:8081';
const target = String(raw).replace(/\/+$/, '');

module.exports = [
  {
    context: ['/api'],
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'warn',
  },
];
