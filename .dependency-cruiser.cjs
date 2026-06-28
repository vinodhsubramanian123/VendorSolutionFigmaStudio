/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. You might want to revise ' +
        'your solution (i.e. use dependency inversion, or move the modules to a common place)',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-orphans',
      comment:
        "This is an orphan module - it's likely not used (anymore?). Either use it or " +
        "remove it. If it's logical this module is an orphan (i.e. it's a config file), " +
        "add an exception for it in your dependency-cruiser configuration.",
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // dot files
          '\\.d\\.ts$',                            // TypeScript declaration files
          '(^|/)tsconfig\\.json$',                 // tsconfig
          '(^|/)(babel|webpack|rollup|vite)\\.config\\.(js|cjs|mjs|ts)$', // build tools config
          '^src/main\\.tsx$',                      // App entry point
          '^src/App\\.tsx$',                       // App root
          '^src/mocks/browser\\.ts$',              // MSW entry
          '\\.test\\.(ts|tsx|js)$',                // test files
          '\\.spec\\.(ts|tsx|js)$'                 // test files
        ]
      },
      to: {}
    },
    {
      name: 'not-to-unresolvable',
      comment:
        "This module depends on a module that cannot be found. This indicates a " +
        "missing dependency, or a typo in the import path.",
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true
      }
    },
    {
      name: 'no-shared-to-features',
      comment: 'Shared UI components should NOT import from feature domains.',
      severity: 'error',
      from: {
        path: '^src/components/shared/'
      },
      to: {
        path: '^src/components/(catalog|forensics|reconciliation|taxonomy)/'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"]
    }
  }
};
