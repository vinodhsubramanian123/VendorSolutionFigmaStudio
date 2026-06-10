import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const routeLogic = `
  // Deep link routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/ucid/')) {
      const id = path.split('/')[2];
      if (id) {
        setActiveMissionId(id);
        setView('forensic'); // Prompt says "load ForensicView with UCID pre-selected"
      }
    } else if (path.startsWith('/config/')) {
      const id = path.split('/')[2];
      if (id) {
        // Here we could set configs but we don't have a state for it
        setView('solution-builder');
      }
    } else if (path.startsWith('/job/')) {
      const id = path.split('/')[2];
      if (id) {
        // pass job_id, just set view to ingestion hub for now
        setView('ingestion-hub');
      }
    }
  }, []);
`;

const replaceTarget = 'const [searchQuery, setSearchQuery] = useState("");';

if (content.includes(replaceTarget) && !content.includes('window.location.pathname')) {
    content = content.replace(replaceTarget, replaceTarget + '\n\n' + routeLogic);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log('Routes added');
} else {
    console.log('Already added or target not found');
}
