module.exports = {
  
  all: true,
  
  include: [
    'packages/cli/src/lib/*.js',
    'packages/cli/src/lifecycles/*.js',
    'packages/cli/src/plugins/*.js',
    'packages/cli/src/tasks/*.js'
  ],

  reporter: [
    'cobertura',
    'html',
    'text',
    'text-summary'
  ],

  checkCoverage: true,

  statements: 80,
  branches: 65,
  functions: 85,
  lines: 80,

  watermarks: {
    statements: [75, 85],
    branches: [75, 85],
    functions: [75, 85],
    lines: [75, 85]
  }
};