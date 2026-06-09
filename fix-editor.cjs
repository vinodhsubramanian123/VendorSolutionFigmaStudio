const fs = require('fs');

let code = fs.readFileSync('src/components/taxonomy/TaxonomyGraphEditor.tsx', 'utf8');

// add import
code = 'import { useCatalogGraphData } from "../../hooks/useCatalogGraphData";\n' + code;

// Remove the old state and useEffect up to Derived Tree Logic
const searchRegex = /const \[isLoading, setIsLoading\] = useState\(false\);[\s\S]*?\/\/ Derived Tree logic/m;
const replaceRegex = `const { data: graphData, isLoading, mapNode, unmapNode, addRule } = useCatalogGraphData(activeConfigId, allConfigs, catalogSkus);

  // Derived Tree logic`;
code = code.replace(searchRegex, replaceRegex);

// Replace mapping functions
const searchMapNode = /const handleMapNode = async[\s\S]*?catch\(e\) \{\s*error\(['"]Failed to map node['"]\);\s*\}\s*\};/m;
const replaceMapNode = `const handleMapNode = async (childId: string, parentId: string, childInfo: any) => {
     try {
       await mapNode(childId, parentId, childInfo);
       success("Node dynamically linked to the active configuration graph.");
     } catch(e) {
       error("Failed to map node");
     }
  };`;
code = code.replace(searchMapNode, replaceMapNode);

// Replace remove mapping
const searchRemoveMap = /const handleRemoveMapping = async[\s\S]*?catch\(e\) \{\s*error\(['"]Failed to detach node['"]\);\s*\}\s*\};/m;
const replaceRemoveMap = `const handleRemoveMapping = async (nodeId: string) => {
     try {
       await unmapNode(nodeId);
       setSelectedNodeId(null);
       warn("Mapping successfully degraded to orphaned state.");
     } catch(e) {
       error("Failed to detach node");
     }
  };`;
code = code.replace(searchRemoveMap, replaceRemoveMap);

// Replace add rule
const searchAddRule = /const handleAddRule = async[\s\S]*?catch\(e\) \{\s*error\(['"]Failed to inject rule\.['"]\);\s*\}\s*\};/m;
const replaceAddRule = `const handleAddRule = async (nodeId: string, type: "requires"|"exclusive", note: string) => {
    try {
      await addRule(nodeId, type, note);
      success("A new relational logic constraint was baked into the graph.");
    } catch(e) {
      error("Failed to inject rule.");
    }
  };`;
code = code.replace(searchAddRule, replaceAddRule);

// For unmapped, modify tree logic to format them correctly 
const searchTreeRoot = /const tree = rootNode \? buildTree\(rootNode\.id\) : null;\s*return \{ nodesMap: nodes, treeRoot: tree, unmapped: graphData\.unmappedItems, edgesArray: graphData\.edges \};/m;
const replaceTreeRoot = `const tree = rootNode ? buildTree(rootNode.id) : null;
    const unmappedItems = graphData.unmappedIds.map(id => {
      const existing = catalogSkus.find(s => s.id === id || s.partNumber === id) || { name: 'Unknown', confidence: 10 };
      return {
        id,
        partNumber: id,
        name: existing.name || \`Unknown Part \${id}\`,
        rawDescription: \`Parsed string identifier: \${id}\`,
        confidence: existing.confidence || Math.floor(Math.random() * 40) + 10
      };
    });
    return { nodesMap: nodes, treeRoot: tree, unmapped: unmappedItems, edgesArray: graphData.edges };`;
code = code.replace(searchTreeRoot, replaceTreeRoot);

fs.writeFileSync('src/components/taxonomy/TaxonomyGraphEditor.tsx', code, 'utf8');
