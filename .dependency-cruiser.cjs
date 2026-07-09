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
        couldNotResolve: true,
        // src/main.tsx's `/// <reference types="vite/client" />` is a
        // TypeScript triple-slash type-reference directive, not a real
        // import -- vite's own client.d.ts resolves correctly via tsc
        // (confirmed: `tsc --noEmit` is clean), but dependency-cruiser's
        // dependency walker doesn't follow triple-slash directives the way
        // it does ordinary imports, so it reported this as couldNotResolve
        // even though nothing was actually broken. Excluded by the literal
        // specifier text ("vite/client") rather than by file, so a
        // genuinely missing/typo'd import anywhere in the project,
        // including any future real import added to main.tsx itself, is
        // still caught by this rule.
        pathNot: '^vite/client$'
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
