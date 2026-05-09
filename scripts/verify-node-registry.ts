/**
 * Node Identity Registry Verification Script
 * ===========================================
 * Validates the complete 351-node Lucy architecture
 */

import {
  LUCY_NODE_IDENTITY_REGISTRY,
  NODE_IDENTITY_EVOLUTION_ALIASES,
  getLivingName,
  getNodeByLivingName,
  getNodesByLayer,
  TOTAL_NODE_COUNT,
  NodeLayer
} from '../src/core/nodes/NodeIdentityRegistry.js';  // .js extension for ESM Node.js 20+

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
	totalNodes: number;
	byLayer: Record<NodeLayer, number>;
	missingNodes: string[];
	duplicateNames: string[];
  };
}

/**
 * Validate the complete node registry
 */
function validateRegistry(): ValidationResult {
  const result: ValidationResult = {
	success: true,
	errors: [],
	warnings: [],
	stats: {
	  totalNodes: TOTAL_NODE_COUNT,
	  byLayer: {
		refiner: 0,
		classical_core: 0,
		quantum_oracle: 0,
		stem_cell: 0,
		planetary_sensor_feed: 0,
		intelligence_control: 0,
		builder_gamedev: 0,
		reserved_evolution: 0
	  },
	  missingNodes: [],
	  duplicateNames: []
	}
  };

  // Expected node count
  const EXPECTED_NODE_COUNT = 351;

  // Check total count
  if (TOTAL_NODE_COUNT !== EXPECTED_NODE_COUNT) {
	result.errors.push(
	  `Expected ${EXPECTED_NODE_COUNT} nodes, found ${TOTAL_NODE_COUNT}`
	);
	result.success = false;
  }

  // Check for missing nodes (LL000-LL350)
  const expectedNodes: string[] = ['LL000'];
  for (let i = 1; i <= 350; i++) {
	expectedNodes.push(`LL${i.toString().padStart(3, '0')}`);
  }

  const actualNodes = Object.keys(LUCY_NODE_IDENTITY_REGISTRY);
  const missingNodes = expectedNodes.filter(n => !actualNodes.includes(n));

  if (missingNodes.length > 0) {
	result.errors.push(`Missing nodes: ${missingNodes.join(', ')}`);
	result.stats.missingNodes = missingNodes;
	result.success = false;
  }

  // Check for duplicate living names
  const livingNames = new Set<string>();
  const duplicates: string[] = [];

  Object.values(LUCY_NODE_IDENTITY_REGISTRY).forEach(node => {
	if (livingNames.has(node.livingName)) {
	  duplicates.push(node.livingName);
	}
	livingNames.add(node.livingName);

	// Count by layer
	result.stats.byLayer[node.layer]++;
  });

  if (duplicates.length > 0) {
	result.errors.push(`Duplicate living names: ${duplicates.join(', ')}`);
	result.stats.duplicateNames = duplicates;
	result.success = false;
  }

  // Validate evolution aliases
  Object.entries(NODE_IDENTITY_EVOLUTION_ALIASES).forEach(([nodeId, alias]) => {
	const node = LUCY_NODE_IDENTITY_REGISTRY[nodeId];
	if (!node) {
	  result.errors.push(`Evolution alias for non-existent node: ${nodeId}`);
	  result.success = false;
	  return;
	}

	if (node.livingName !== alias.evolvedName) {
	  result.errors.push(
		`Evolution alias mismatch for ${nodeId}: ` +
		`registry has ${node.livingName}, alias expects ${alias.evolvedName}`
	  );
	  result.success = false;
	}

	if (!node.legacyAliases || !node.legacyAliases.includes(alias.legacyName)) {
	  result.warnings.push(
		`Node ${nodeId} (${node.livingName}) missing legacy alias: ${alias.legacyName}`
	  );
	}
  });

  // Validate helper functions
  const testNodeId = 'LL210';
  const expectedName = 'STATE_ORCHESTRATOR';
  const retrievedName = getLivingName(testNodeId);

  if (retrievedName !== expectedName) {
	result.errors.push(
	  `getLivingName('${testNodeId}') returned '${retrievedName}', expected '${expectedName}'`
	);
	result.success = false;
  }

  const retrievedNode = getNodeByLivingName(expectedName);
  if (!retrievedNode || retrievedNode.id !== testNodeId) {
	result.errors.push(
	  `getNodeByLivingName('${expectedName}') failed to retrieve correct node`
	);
	result.success = false;
  }

  // Validate layer queries
  const stemCells = getNodesByLayer('stem_cell');
  if (stemCells.length !== 13) {
	result.errors.push(
	  `Expected 13 stem cell nodes, found ${stemCells.length}`
	);
	result.success = false;
  }

  // Validate quantum oracle nodes
  const quantumNodes = getNodesByLayer('quantum_oracle');
  if (quantumNodes.length !== 18) {
	result.errors.push(
	  `Expected 18 quantum oracle nodes, found ${quantumNodes.length}`
	);
	result.success = false;
  }

  quantumNodes.forEach(node => {
	if (!node.quantumGate) {
	  result.warnings.push(
		`Quantum oracle node ${node.id} (${node.livingName}) missing quantumGate property`
	  );
	}
  });

  // Validate stem cell nodes
  stemCells.forEach(node => {
	if (!node.defaultState) {
	  result.warnings.push(
		`Stem cell node ${node.id} (${node.livingName}) missing defaultState property`
	  );
	}
  });

  return result;
}

/**
 * Print validation results
 */
function printResults(result: ValidationResult): void {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  LUCY NODE IDENTITY REGISTRY VALIDATION                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`✨ Total Nodes: ${result.stats.totalNodes}`);
  console.log('\n📊 Layer Distribution:');
  Object.entries(result.stats.byLayer).forEach(([layer, count]) => {
	const padding = ' '.repeat(30 - layer.length);
	console.log(`   ${layer}:${padding}${count} nodes`);
  });

  if (result.errors.length > 0) {
	console.log('\n❌ ERRORS:');
	result.errors.forEach(error => console.log(`   - ${error}`));
  }

  if (result.warnings.length > 0) {
	console.log('\n⚠️  WARNINGS:');
	result.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (result.success) {
	console.log('\n✅ VALIDATION PASSED - All 351 nodes accounted for!');
	console.log('🌐 "Welcome to the Freeway. Pulse routing active."\n');
  } else {
	console.log('\n❌ VALIDATION FAILED - See errors above.\n');
	process.exit(1);
  }
}

// Run validation
const result = validateRegistry();
printResults(result);
