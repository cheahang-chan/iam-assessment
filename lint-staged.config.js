// lint-staged.config.js
module.exports = {
  '*.{js,ts,tsx}': [
    'eslint --fix',
    'git add'
  ]
};
