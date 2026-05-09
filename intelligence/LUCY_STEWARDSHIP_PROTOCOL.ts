// ============================================================
// LUCY SOVEREIGN 137 — STEWARDSHIP PROTOCOL
// ============================================================
// VERSION: v1.0 — Dynamic Sovereignty + Resource Fusion + Human History
// ADDITIVE ONLY — nothing removed, everything evolved
// NODES: L49–L52 (Sovereignty), L53–L56 (Materiality), L57–L60 (Legacy)
// ============================================================

// ─────────────────────────────────────────────────────────────
// SECTION 0: STEWARDSHIP SCORE + EVENT ENVELOPE EXTENSION
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  StewardshipScore is attached to every EventEnvelope payload.
         It tracks the Earth-impact, resource cost, historical alignment,
         and human creative autonomy of every proposal Lucy makes.
  WHY:   Without this, Lucy can produce technically correct proposals
         that are historically reckless, resource-destructive, or that
         strip creative control from the human. The stewardship key
         makes every proposal accountable to consequence.
  HOW:   Sovereignty nodes (L49–L52) set creativeAutonomy.
         Materiality nodes (L53–L56) set resourceEfficiency + materialTrace.
         Legacy nodes (L57–L60) set historicalAlignment + legacyRiskFlag.
  HOW TO CHANGE: Add new ResourceCategory types for new material domains.
                 Add new HistoricalEra entries for expanded history RAG.
                 Never lower the legacyRiskThreshold below 0.6.
  DEBUG EXAMPLE: If stewardship scores are always 0.5, check that the
                 MaterialLedger is loaded and HistoryRAG has entries.
                 Run StewardshipEngine.audit() to get a full breakdown.
*/

export type CreativeAutonomy = 'USER_LED' | 'CO_PILOT' | 'AUTONOMOUS';

export type LegacyRiskLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AbundanceClass =
  | 'INFINITE'          // Solar energy, computational patterns, open knowledge
  | 'RENEWABLE'         // Wind, water, biomass, enzymatic, fermentation
  | 'SYNTHESIZABLE'     // Lab-grown proteins, synthetic compounds, 3D-printed
  | 'RECYCLABLE'        // Metals recoverable at end-of-life
  | 'SCARCE'            // Rare earth elements, lithium, cobalt
  | 'FINITE_CRITICAL';  // Irreplaceable — triggers abundance alert

export interface MaterialTrace {
  materialId: string;
  name: string;
  abundanceClass: AbundanceClass;
  estimatedQuantityKg?: number;
  energyCostKwh?: number;
  alternativeAvailable: boolean;
  alternativeName?: string;
  alternativeAbundanceClass?: AbundanceClass;
  sourcedFrom?: string;           // geographic/process origin
  historicalConflictFlag?: boolean; // was this resource a historical conflict driver?
}

export interface StewardshipScore {
  // ── Resource ──────────────────────────────────────────────
  resourceEfficiency: number;         // 0.0–1.0 (1.0 = fully abundant/renewable)
  materialTrace: MaterialTrace[];     // every material the proposal touches
  energyCostKwh: number;              // total estimated energy cost
  abundanceScore: number;             // 0.0–1.0 composite abundance of all materials

  // ── History ───────────────────────────────────────────────
  historicalAlignment: string;        // "Avoids the pitfalls of X historical era"
  historicalParallels: HistoricalParallel[];   // matching patterns from history RAG
  legacyRiskLevel: LegacyRiskLevel;
  legacyRiskReason?: string;

  // ── Creative Control ──────────────────────────────────────
  creativeAutonomy: CreativeAutonomy;
  scaffoldingMode: boolean;           // true = 5-6 small options, false = one solution
  rejectionCount: number;             // how many times human rejected this proposal type
  confidenceThreshold: number;        // dynamic — lowers after 2 rejections

  // ── Summary ───────────────────────────────────────────────
  overallStewardshipRating: number;   // 0.0–1.0 composite
  stewardshipNote: string;            // human-readable 1-sentence summary
}

// Extended EventEnvelope with stewardship (additive — original fields preserved)
export interface StewardshipEventPayload<TPayload = Record<string, unknown>> {
  data: TPayload;
  stewardship?: StewardshipScore;
}

// ─────────────────────────────────────────────────────────────
// SECTION 1: HISTORICAL PARALLELS SYSTEM
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  HistoricalParallel is a pattern extracted from the History RAG
         that matches the current proposal's resource/impact profile.
         Legacy nodes (L57–L60) emit these as warnings.
  WHY:   Humans repeat patterns they don't recognize. If a proposal
         looks like "short-term gain, long-term ruin" Lucy should be
         able to name the historical parallel specifically — not vaguely.
  HOW:   HistoryRAG.match() compares the proposal's StewardshipScore
         against indexed eras. Matches above threshold trigger warnings.
  HOW TO CHANGE: Add new HistoricalEra entries to HISTORY_RAG_INDEX.
                 Adjust matchThreshold (default 0.55) for sensitivity.
  DEBUG EXAMPLE: If no parallels fire, check that the proposal's
                 materialTrace includes scarce/finite materials, or that
                 energyCostKwh is above the era's triggerEnergyKwh.
*/

export interface HistoricalParallel {
  eraId: string;
  eraName: string;
  period: string;                     // e.g. "1760–1840"
  region: string;
  shortGain: string;                  // what humans gained short-term
  longRuin: string;                   // what the long-term cost was
  matchScore: number;                 // 0.0–1.0 similarity to current proposal
  keyLesson: string;                  // the actionable lesson
  alternativePathTaken?: string;      // if history eventually corrected — how
  resourcesInvolved: string[];        // materials that triggered this era
  riskLevel: LegacyRiskLevel;
}

export interface HistoricalEra {
  eraId: string;
  eraName: string;
  period: string;
  region: string;
  shortGain: string;
  longRuin: string;
  keyLesson: string;
  alternativePathTaken?: string;
  triggerMaterials: string[];         // material names that activate this era
  triggerAbundanceClasses: AbundanceClass[];
  triggerEnergyKwhMin?: number;       // if energy cost exceeds this, era activates
  triggerScaleKeywords: string[];     // proposal keywords that pattern-match
  riskLevel: LegacyRiskLevel;
}

// ── History RAG Index ─────────────────────────────────────────
// Core historical eras loaded into Lucy's reasoning memory
export const HISTORY_RAG_INDEX: HistoricalEra[] = [
  {
    eraId: 'INDUSTRIAL_REVOLUTION',
    eraName: 'The Industrial Revolution',
    period: '1760–1840',
    region: 'Britain / Western Europe',
    shortGain: 'Mass production, mechanical power, rapid urbanization',
    longRuin: 'Coal dependency, child labor industrialization, river contamination, early climate loading',
    keyLesson: 'Scaling a high-energy process without accounting for accumulative pollution creates systemic debt paid by future generations.',
    alternativePathTaken: 'Electrification and cleaner energy eventually replaced coal — but 150 years of damage preceded it.',
    triggerMaterials: ['coal', 'iron', 'steel', 'lead'],
    triggerAbundanceClasses: ['SCARCE', 'FINITE_CRITICAL'],
    triggerEnergyKwhMin: 500,
    triggerScaleKeywords: ['mass production', 'high-heat', 'scaling', 'industrial', 'factory', 'combustion'],
    riskLevel: 'HIGH',
  },
  {
    eraId: 'GREEN_REVOLUTION',
    eraName: 'The Green Revolution',
    period: '1950–1970',
    region: 'Global (led by USA/India/Mexico)',
    shortGain: 'Tripled crop yields, averted mass famine, fed billions',
    longRuin: 'Aquifer depletion, topsoil erosion, monoculture fragility, nitrogen runoff, chemical dependency',
    keyLesson: 'Optimizing for yield without modeling systemic soil + water feedback creates a productivity illusion that collapses in 3–5 generations.',
    alternativePathTaken: 'Regenerative agriculture and precision fermentation now offer abundance without the soil debt.',
    triggerMaterials: ['nitrogen', 'phosphorus', 'potassium', 'groundwater'],
    triggerAbundanceClasses: ['SCARCE', 'FINITE_CRITICAL'],
    triggerScaleKeywords: ['crop yield', 'fertilizer', 'monoculture', 'mass food', 'nitrogen', 'phosphate', 'irrigation'],
    riskLevel: 'MODERATE',
  },
  {
    eraId: 'ATOMIC_AGE',
    eraName: 'The Atomic Age',
    period: '1945–1990',
    region: 'USA / USSR / Global',
    shortGain: 'Abundant electricity potential, geopolitical leverage, medical isotopes',
    longRuin: 'Waste storage unsolved for 10,000+ years, proliferation risk, ecological contamination zones (Chernobyl, Fukushima)',
    keyLesson: 'Deploying a technology before solving its end-of-life creates indefinite liability. The waste problem must be solved before the energy problem.',
    alternativePathTaken: 'Fusion (not fission) and thorium reactors represent the corrected path — cleaner waste profiles.',
    triggerMaterials: ['uranium', 'plutonium', 'thorium', 'caesium', 'strontium'],
    triggerAbundanceClasses: ['SCARCE', 'FINITE_CRITICAL'],
    triggerScaleKeywords: ['nuclear', 'fission', 'radioactive', 'reactor', 'enrichment', 'atomic', 'waste storage'],
    riskLevel: 'CRITICAL',
  },
  {
    eraId: 'SILICON_RUSH',
    eraName: 'The Silicon Rush',
    period: '1990–2020',
    region: 'Global (led by USA/China/Taiwan)',
    shortGain: 'Computing revolution, global connectivity, exponential productivity gains',
    longRuin: 'Rare earth mining devastation (Congo, Inner Mongolia), e-waste crisis, lithium water conflicts, cobalt child labor',
    keyLesson: 'Building civilization-scale technology on finite rare earth extraction without closed-loop recycling creates supply chain fragility and humanitarian cost.',
    alternativePathTaken: 'Silicon carbide, organic semiconductors, and urban mining represent the corrected supply path.',
    triggerMaterials: ['lithium', 'cobalt', 'neodymium', 'dysprosium', 'tantalum', 'gallium', 'indium'],
    triggerAbundanceClasses: ['SCARCE', 'FINITE_CRITICAL'],
    triggerScaleKeywords: ['semiconductor', 'battery', 'rare earth', 'mining', 'electronics at scale', 'chip fabrication'],
    riskLevel: 'HIGH',
  },
  {
    eraId: 'DEFORESTATION_AGE',
    eraName: 'The Deforestation Age',
    period: '1500–present',
    region: 'Global (Amazon / Southeast Asia / Congo Basin)',
    shortGain: 'Agricultural land, timber, cattle ranching revenue',
    longRuin: 'Carbon sink destruction, biodiversity collapse, rainfall pattern disruption, indigenous displacement',
    keyLesson: 'Converting complex living systems into simple monocultures for short-term yield destroys irreplaceable biological infrastructure.',
    alternativePathTaken: 'Vertical farming, mycelium composites, and lab-grown timber represent non-destructive paths.',
    triggerMaterials: ['timber', 'palm oil', 'soy', 'cattle'],
    triggerAbundanceClasses: ['FINITE_CRITICAL', 'SCARCE'],
    triggerScaleKeywords: ['forest', 'timber', 'land clearing', 'palm', 'cattle', 'biome conversion'],
    riskLevel: 'CRITICAL',
  },
  {
    eraId: 'PROTEIN_FERMENTATION_SUCCESS',
    eraName: '18th-Century Fermentation Science',
    period: '1650–1850',
    region: 'Europe / Asia',
    shortGain: 'Low-energy food preservation, medicine precursors, material synthesis',
    longRuin: 'None — this is a positive historical parallel',
    keyLesson: 'Enzymatic and fermentation pathways achieve complex material synthesis at ambient temperature with near-zero resource debt. This is the correct scaling model.',
    alternativePathTaken: 'Modern precision fermentation scales this pattern using synthetic biology — exact same thermodynamic efficiency.',
    triggerMaterials: ['proteins', 'enzymes', 'biomass', 'yeast'],
    triggerAbundanceClasses: ['RENEWABLE', 'SYNTHESIZABLE', 'INFINITE'],
    triggerScaleKeywords: ['fermentation', 'enzymatic', 'protein folding', 'bio-reactor', 'low-energy synthesis', 'biological catalyst'],
    riskLevel: 'NONE',
  },
  {
    eraId: 'FUSION_HORIZON',
    eraName: 'The Fusion Horizon',
    period: '2010–present',
    region: 'Global (ITER / NIF / Private)',
    shortGain: 'Near-limitless clean energy potential, hydrogen isotope fuel',
    longRuin: 'Tritium supply constraints, neutron activation of materials, plasma material erosion — still unsolved at scale',
    keyLesson: 'Fusion is genuinely abundant-path energy but material science for reactor walls and tritium breeding must be solved before scaling. Rushing deployment repeats Atomic Age mistakes.',
    alternativePathTaken: 'Inertial confinement + spherical tokamaks + high-temperature superconductors represent the corrected material path.',
    triggerMaterials: ['deuterium', 'tritium', 'lithium-6', 'beryllium', 'tungsten'],
    triggerAbundanceClasses: ['SCARCE', 'RENEWABLE'],
    triggerScaleKeywords: ['fusion', 'plasma', 'tokamak', 'tritium', 'deuterium', 'ITER', 'NIF', 'inertial confinement'],
    riskLevel: 'MODERATE',
  },
];

export class HistoryRAG {
  /*
    WHAT:  HistoryRAG stores and queries the indexed historical eras.
           Legacy nodes (L57–L60) call match() before any proposal is finalized.
    WHY:   Pattern recognition across history is Lucy's deepest reasoning layer.
           It transforms proposals from "technically correct" to "consequence-aware."
    HOW:   match() scores each era against the proposal's material trace and
           keyword fingerprint. Returns all matches above matchThreshold.
    HOW TO CHANGE: Add new eras to HISTORY_RAG_INDEX. Lower matchThreshold
                   (default 0.55) to catch weaker pattern matches.
    DEBUG EXAMPLE: If HistoryRAG returns no matches for a fusion proposal,
                   check that 'deuterium' or 'tritium' appear in materialTrace
                   or that 'fusion' appears in proposal keywords.
  */
  private eras: HistoricalEra[] = HISTORY_RAG_INDEX;
  private matchThreshold: number = 0.55;

  match(
    materials: MaterialTrace[],
    proposalText: string,
    energyCostKwh: number
  ): HistoricalParallel[] {
    const materialNames = materials.map(m => m.name.toLowerCase());
    const abundanceClasses = materials.map(m => m.abundanceClass);
    const proposalLower = proposalText.toLowerCase();

    const parallels: HistoricalParallel[] = [];

    for (const era of this.eras) {
      let score = 0;
      let matchReasons = 0;

      // Material name match
      const materialMatches = era.triggerMaterials.filter(tm =>
        materialNames.some(mn => mn.includes(tm.toLowerCase()))
      ).length;
      if (materialMatches > 0) {
        score += (materialMatches / era.triggerMaterials.length) * 0.35;
        matchReasons++;
      }

      // Abundance class match
      const abundanceMatches = era.triggerAbundanceClasses.filter(ac =>
        abundanceClasses.includes(ac)
      ).length;
      if (abundanceMatches > 0) {
        score += (abundanceMatches / era.triggerAbundanceClasses.length) * 0.25;
        matchReasons++;
      }

      // Keyword match
      const keywordMatches = era.triggerScaleKeywords.filter(kw =>
        proposalLower.includes(kw.toLowerCase())
      ).length;
      if (keywordMatches > 0) {
        score += (keywordMatches / era.triggerScaleKeywords.length) * 0.30;
        matchReasons++;
      }

      // Energy threshold match
      if (era.triggerEnergyKwhMin && energyCostKwh >= era.triggerEnergyKwhMin) {
        score += 0.10;
        matchReasons++;
      }

      if (score >= this.matchThreshold && matchReasons >= 1) {
        parallels.push({
          eraId: era.eraId,
          eraName: era.eraName,
          period: era.period,
          region: era.region,
          shortGain: era.shortGain,
          longRuin: era.longRuin,
          matchScore: Math.min(1.0, score),
          keyLesson: era.keyLesson,
          alternativePathTaken: era.alternativePathTaken,
          resourcesInvolved: era.triggerMaterials,
          riskLevel: era.riskLevel,
        });
      }
    }

    // Sort by match score descending
    return parallels.sort((a, b) => b.matchScore - a.matchScore);
  }

  addEra(era: HistoricalEra): void {
    this.eras.push(era);
  }

  getEra(eraId: string): HistoricalEra | undefined {
    return this.eras.find(e => e.eraId === eraId);
  }

  getAllEras(): HistoricalEra[] {
    return [...this.eras];
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 2: EARTH RESOURCE LEDGER
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  The EarthResourceLedger is Lucy's live reference for material
         abundance, scarcity, energy costs, and available alternatives.
         Materiality nodes (L53–L56) query this before any proposal.
  WHY:   Technical proposals without material context are half-finished.
         A protein-folding suggestion that requires cobalt at scale is
         not the same as one that uses enzymatic pathways.
  HOW:   L1–L16 (Analytical) generate a proposal. L53–L56 call
         ResourceLedger.evaluate(materials) to get MaterialTrace[]
         and abundanceScore. This feeds into StewardshipScore.
  HOW TO CHANGE: Update RESOURCE_LEDGER entries as alternatives become
                 viable. Never remove entries — add evolved versions.
  DEBUG EXAMPLE: If abundanceScore is unexpectedly low, check that
                 the material's abundanceClass is set correctly and
                 that alternatives are registered.
*/

export interface ResourceEntry {
  materialId: string;
  name: string;
  aliases: string[];
  abundanceClass: AbundanceClass;
  globalReserveYears?: number;        // estimated years of supply at current consumption
  primaryUses: string[];
  energyCostPerKgKwh: number;         // energy to extract/produce 1kg
  alternatives: Array<{
    name: string;
    abundanceClass: AbundanceClass;
    maturityLevel: 'EXPERIMENTAL' | 'EMERGING' | 'PROVEN' | 'DOMINANT';
    energySavingPercent: number;
  }>;
  historicalConflictFlag: boolean;
  conflictNote?: string;
}

export const RESOURCE_LEDGER: ResourceEntry[] = [
  // ── Finite Critical ──────────────────────────────────────
  {
    materialId: 'COBALT',
    name: 'cobalt',
    aliases: ['Co', 'cobalt sulfate'],
    abundanceClass: 'SCARCE',
    globalReserveYears: 25,
    primaryUses: ['EV batteries', 'superalloys', 'catalysts'],
    energyCostPerKgKwh: 32,
    alternatives: [
      { name: 'iron-phosphate cathode (LFP)', abundanceClass: 'RENEWABLE', maturityLevel: 'PROVEN', energySavingPercent: 60 },
      { name: 'sodium-ion battery', abundanceClass: 'INFINITE', maturityLevel: 'EMERGING', energySavingPercent: 55 },
    ],
    historicalConflictFlag: true,
    conflictNote: 'Congo DRC artisanal mining — child labor, armed group funding',
  },
  {
    materialId: 'LITHIUM',
    name: 'lithium',
    aliases: ['Li', 'lithium carbonate', 'lithium hydroxide'],
    abundanceClass: 'SCARCE',
    globalReserveYears: 40,
    primaryUses: ['batteries', 'ceramics', 'psychiatric medicine'],
    energyCostPerKgKwh: 18,
    alternatives: [
      { name: 'sodium-ion', abundanceClass: 'INFINITE', maturityLevel: 'EMERGING', energySavingPercent: 50 },
      { name: 'solid-state lithium recycling', abundanceClass: 'RECYCLABLE', maturityLevel: 'PROVEN', energySavingPercent: 30 },
    ],
    historicalConflictFlag: true,
    conflictNote: 'Atacama lithium triangle — water conflict with indigenous Atacameño communities',
  },
  {
    materialId: 'NEODYMIUM',
    name: 'neodymium',
    aliases: ['Nd', 'rare earth magnet'],
    abundanceClass: 'SCARCE',
    globalReserveYears: 30,
    primaryUses: ['permanent magnets', 'wind turbines', 'EV motors'],
    energyCostPerKgKwh: 95,
    alternatives: [
      { name: 'ferrite magnets', abundanceClass: 'INFINITE', maturityLevel: 'PROVEN', energySavingPercent: 40 },
      { name: 'HTS superconducting coils', abundanceClass: 'SYNTHESIZABLE', maturityLevel: 'EMERGING', energySavingPercent: 70 },
    ],
    historicalConflictFlag: true,
    conflictNote: 'Inner Mongolia rare earth processing — radioactive tailings contamination',
  },
  {
    materialId: 'URANIUM',
    name: 'uranium',
    aliases: ['U', 'uranium-235', 'uranium-238', 'yellowcake'],
    abundanceClass: 'SCARCE',
    globalReserveYears: 130,
    primaryUses: ['nuclear fission fuel', 'military applications'],
    energyCostPerKgKwh: 2200,
    alternatives: [
      { name: 'thorium (MSR)', abundanceClass: 'SCARCE', maturityLevel: 'EMERGING', energySavingPercent: 20 },
      { name: 'deuterium fusion', abundanceClass: 'RENEWABLE', maturityLevel: 'EXPERIMENTAL', energySavingPercent: 85 },
    ],
    historicalConflictFlag: true,
    conflictNote: 'Proliferation risk. Waste unresolved for 10,000 years.',
  },
  {
    materialId: 'TRITIUM',
    name: 'tritium',
    aliases: ['T', 'hydrogen-3', '³H'],
    abundanceClass: 'SCARCE',
    globalReserveYears: 5,
    primaryUses: ['fusion fuel', 'nuclear warhead triggers', 'luminescent devices'],
    energyCostPerKgKwh: 14000000,
    alternatives: [
      { name: 'lithium-6 breeding blanket', abundanceClass: 'SCARCE', maturityLevel: 'EXPERIMENTAL', energySavingPercent: 0 },
      { name: 'D-D fusion (deuterium-only)', abundanceClass: 'RENEWABLE', maturityLevel: 'EXPERIMENTAL', energySavingPercent: 30 },
    ],
    historicalConflictFlag: false,
    conflictNote: 'Supply is extremely limited — global inventory ~18kg. Critical fusion bottleneck.',
  },
  // ── Renewable / Synthesizable ────────────────────────────
  {
    materialId: 'DEUTERIUM',
    name: 'deuterium',
    aliases: ['D', 'hydrogen-2', '²H', 'heavy water'],
    abundanceClass: 'RENEWABLE',
    globalReserveYears: undefined, // effectively infinite in seawater
    primaryUses: ['fusion fuel', 'neutron moderation', 'NMR spectroscopy'],
    energyCostPerKgKwh: 60,
    alternatives: [],
    historicalConflictFlag: false,
  },
  {
    materialId: 'PROTEINS_ENZYMATIC',
    name: 'proteins (enzymatic)',
    aliases: ['enzymes', 'biocatalysts', 'fermentation proteins'],
    abundanceClass: 'SYNTHESIZABLE',
    primaryUses: ['bio-reactors', 'drug synthesis', 'material fabrication', 'food production'],
    energyCostPerKgKwh: 2,
    alternatives: [
      { name: 'precision fermentation', abundanceClass: 'INFINITE', maturityLevel: 'PROVEN', energySavingPercent: 85 },
    ],
    historicalConflictFlag: false,
  },
  {
    materialId: 'SOLAR_ENERGY',
    name: 'solar energy',
    aliases: ['photovoltaic', 'solar thermal', 'PV', 'sunlight'],
    abundanceClass: 'INFINITE',
    primaryUses: ['electricity generation', 'thermal heating', 'photochemistry'],
    energyCostPerKgKwh: 0,
    alternatives: [],
    historicalConflictFlag: false,
  },
  {
    materialId: 'BIOMASS_CELLULOSE',
    name: 'biomass / cellulose',
    aliases: ['agricultural waste', 'wood pulp', 'lignocellulose', 'hemp'],
    abundanceClass: 'RENEWABLE',
    primaryUses: ['biofuels', 'bioplastics', 'paper', 'structural material'],
    energyCostPerKgKwh: 1.2,
    alternatives: [],
    historicalConflictFlag: false,
  },
  {
    materialId: 'NITROGEN_SYNTHETIC',
    name: 'nitrogen (synthetic fixation)',
    aliases: ['ammonia', 'Haber-Bosch nitrogen', 'synthetic fertilizer'],
    abundanceClass: 'SCARCE',
    globalReserveYears: 60,
    primaryUses: ['fertilizer', 'explosives', 'chemical synthesis'],
    energyCostPerKgKwh: 8.5,
    alternatives: [
      { name: 'biological nitrogen fixation', abundanceClass: 'RENEWABLE', maturityLevel: 'PROVEN', energySavingPercent: 90 },
      { name: 'green ammonia (electrolysis)', abundanceClass: 'RENEWABLE', maturityLevel: 'EMERGING', energySavingPercent: 75 },
    ],
    historicalConflictFlag: false,
  },
];

export class EarthResourceLedger {
  /*
    WHAT:  Queryable reference for material costs, alternatives, and
           abundance classes. Used by L53–L56 Materiality nodes.
    WHY:   Proposals touching SCARCE or FINITE_CRITICAL materials must
           automatically surface alternatives. Without this, Lucy
           is technically helpful but resource-blind.
    HOW:   evaluate() takes a list of material name strings, matches
           them against RESOURCE_LEDGER, and returns MaterialTrace[]
           plus a composite abundanceScore.
    HOW TO CHANGE: Add new ResourceEntry objects to RESOURCE_LEDGER.
                   Call ledger.addResource(entry) at runtime.
    DEBUG EXAMPLE: If a material isn't being recognized, check aliases[]
                   in the matching ResourceEntry. Add the alias and retry.
  */
  private ledger: ResourceEntry[] = RESOURCE_LEDGER;

  evaluate(materialNames: string[]): { traces: MaterialTrace[]; abundanceScore: number } {
    const traces: MaterialTrace[] = [];
    const unmatched: string[] = [];

    for (const rawName of materialNames) {
      const entry = this.findEntry(rawName);
      if (entry) {
        const bestAlt = entry.alternatives
          .filter(a => a.maturityLevel === 'PROVEN' || a.maturityLevel === 'DOMINANT')
          .sort((a, b) => b.energySavingPercent - a.energySavingPercent)[0];

        traces.push({
          materialId: entry.materialId,
          name: entry.name,
          abundanceClass: entry.abundanceClass,
          energyCostKwh: entry.energyCostPerKgKwh,
          alternativeAvailable: entry.alternatives.length > 0,
          alternativeName: bestAlt?.name,
          alternativeAbundanceClass: bestAlt?.abundanceClass,
          historicalConflictFlag: entry.historicalConflictFlag,
        });
      } else {
        unmatched.push(rawName);
        // Unknown material — flag as potentially scarce for safety
        traces.push({
          materialId: `UNKNOWN_${rawName.toUpperCase().replace(/\s/g, '_')}`,
          name: rawName,
          abundanceClass: 'SCARCE',
          energyCostKwh: 0,
          alternativeAvailable: false,
          historicalConflictFlag: false,
        });
      }
    }

    // Compute composite abundance score
    const abundanceWeights: Record<AbundanceClass, number> = {
      INFINITE: 1.0, RENEWABLE: 0.85, SYNTHESIZABLE: 0.75,
      RECYCLABLE: 0.6, SCARCE: 0.3, FINITE_CRITICAL: 0.0,
    };
    const abundanceScore = traces.length > 0
      ? traces.reduce((sum, t) => sum + (abundanceWeights[t.abundanceClass] ?? 0.3), 0) / traces.length
      : 1.0;

    return { traces, abundanceScore };
  }

  findEntry(nameOrAlias: string): ResourceEntry | undefined {
    const lower = nameOrAlias.toLowerCase();
    return this.ledger.find(e =>
      e.name.toLowerCase() === lower ||
      e.aliases.some(a => a.toLowerCase() === lower) ||
      lower.includes(e.name.toLowerCase())
    );
  }

  addResource(entry: ResourceEntry): void {
    this.ledger.push(entry);
  }

  getScarceResources(): ResourceEntry[] {
    return this.ledger.filter(e =>
      e.abundanceClass === 'SCARCE' || e.abundanceClass === 'FINITE_CRITICAL'
    );
  }

  getAbundantAlternatives(materialId: string): ResourceEntry['alternatives'] {
    const entry = this.ledger.find(e => e.materialId === materialId);
    return entry?.alternatives ?? [];
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: DYNAMIC SOVEREIGNTY NODES (L49–L52)
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Sovereignty nodes track user rejections and automatically
         shift Lucy into Scaffolding Mode when the human signals
         they want creative control back. They monitor user.query.why
         and action.rejected events.
  WHY:   Without this, Lucy keeps proposing the same "black box" solution
         even after rejection. The human becomes a passenger. Dynamic
         Sovereignty ensures the human is always the lead architect.
  HOW:   SovereigntyMonitor.recordEvent() tracks rejection patterns.
         After 2 rejections of the same proposal type, it lowers
         confidenceThreshold and activates ScaffoldingMode.
         In Scaffolding Mode, every proposal becomes 5–6 small options.
  HOW TO CHANGE: Adjust rejectionThreshold (default 2) to change when
                 scaffolding activates. Adjust optionCount (default 5)
                 to change how many scaffolding options are offered.
  DEBUG EXAMPLE: If scaffolding never activates, verify that
                 action.rejected events are being routed to
                 SovereigntyMonitor.recordEvent(). Check rejectionLog
                 for the proposal type in question.
*/

export type SovereigntyEvent =
  | 'action.rejected'
  | 'user.query.why'
  | 'user.took.manual.control'
  | 'user.approved.immediately'
  | 'user.requested.options'
  | 'user.accepted.scaffolding';

export interface SovereigntyRecord {
  proposalType: string;
  rejectionCount: number;
  whyQueryCount: number;
  lastEventAt: number;
  scaffoldingActive: boolean;
  confidenceThreshold: number;     // starts at 0.85, lowers toward 0.50 on rejection
}

export interface ScaffoldingOption {
  optionId: string;
  title: string;
  description: string;
  resourceCost: 'LOW' | 'MEDIUM' | 'HIGH';
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  estimatedTimeMin: number;
  stewardshipRating: number;       // 0.0–1.0
  recommended: boolean;            // Lucy's top pick — human still chooses
}

export interface SovereigntyState {
  overallMode: 'AUTONOMOUS' | 'CO_PILOT' | 'SCAFFOLDING';
  activeScaffoldingTypes: string[];
  globalConfidenceModifier: number;   // -0.0 to -0.35 reduction applied globally
  humanControlScore: number;          // 0.0–1.0 how much human is in control
}

export class SovereigntyMonitor {
  /*
    L49–L52 — Dynamic Sovereignty Nodes
    "You stay the lead architect. Lucy becomes the tireless draftsman."
  */
  private records: Map<string, SovereigntyRecord> = new Map();
  private rejectionThreshold: number = 2;
  private optionCount: number = 5;
  private globalConfidenceModifier: number = 0;

  recordEvent(proposalType: string, event: SovereigntyEvent): void {
    const existing = this.records.get(proposalType) ?? {
      proposalType,
      rejectionCount: 0,
      whyQueryCount: 0,
      lastEventAt: Date.now(),
      scaffoldingActive: false,
      confidenceThreshold: 0.85,
    };

    switch (event) {
      case 'action.rejected':
        existing.rejectionCount++;
        // Lower confidence threshold — Lucy becomes less assertive
        existing.confidenceThreshold = Math.max(
          0.50,
          existing.confidenceThreshold - 0.10
        );
        // Activate scaffolding after threshold reached
        if (existing.rejectionCount >= this.rejectionThreshold) {
          existing.scaffoldingActive = true;
          console.log(`[Sovereignty L49–L52] Scaffolding activated for "${proposalType}" after ${existing.rejectionCount} rejections.`);
        }
        break;

      case 'user.query.why':
        existing.whyQueryCount++;
        // Repeated "why" queries signal confusion — lower confidence
        if (existing.whyQueryCount >= 2) {
          existing.confidenceThreshold = Math.max(0.55, existing.confidenceThreshold - 0.05);
        }
        break;

      case 'user.took.manual.control':
        existing.scaffoldingActive = true;
        existing.confidenceThreshold = Math.max(0.50, existing.confidenceThreshold - 0.15);
        break;

      case 'user.approved.immediately':
        // Positive signal — raise confidence slightly
        existing.rejectionCount = Math.max(0, existing.rejectionCount - 1);
        existing.confidenceThreshold = Math.min(0.85, existing.confidenceThreshold + 0.05);
        if (existing.rejectionCount < this.rejectionThreshold) {
          existing.scaffoldingActive = false;
        }
        break;

      case 'user.accepted.scaffolding':
        // Human liked the options format — keep it
        existing.scaffoldingActive = true;
        break;

      case 'user.requested.options':
        existing.scaffoldingActive = true;
        break;
    }

    existing.lastEventAt = Date.now();
    this.records.set(proposalType, existing);

    // Recompute global modifier
    this.recomputeGlobalModifier();
  }

  private recomputeGlobalModifier(): void {
    const allRecords = Array.from(this.records.values());
    if (allRecords.length === 0) { this.globalConfidenceModifier = 0; return; }
    const avgRejections = allRecords.reduce((s, r) => s + r.rejectionCount, 0) / allRecords.length;
    this.globalConfidenceModifier = -Math.min(0.35, avgRejections * 0.08);
  }

  isScaffolding(proposalType: string): boolean {
    return this.records.get(proposalType)?.scaffoldingActive ?? false;
  }

  getConfidenceThreshold(proposalType: string): number {
    const base = this.records.get(proposalType)?.confidenceThreshold ?? 0.85;
    return Math.max(0.45, base + this.globalConfidenceModifier);
  }

  generateScaffoldingOptions(
    proposalType: string,
    baseProposal: string,
    stewardshipContext: Partial<StewardshipScore>
  ): ScaffoldingOption[] {
    // Generate 5 graduated options from minimal to full
    const options: ScaffoldingOption[] = [
      {
        optionId: `${proposalType}_OPT_1`,
        title: '🌱 Minimal — Just the core change',
        description: `Smallest possible intervention for ${proposalType}. You control the rest.`,
        resourceCost: 'LOW',
        complexity: 'SIMPLE',
        estimatedTimeMin: 5,
        stewardshipRating: 0.95,
        recommended: false,
      },
      {
        optionId: `${proposalType}_OPT_2`,
        title: '🔧 Guided — I do step 1, you confirm each step',
        description: `Step-by-step for ${proposalType}. Pause between each action for your approval.`,
        resourceCost: 'LOW',
        complexity: 'SIMPLE',
        estimatedTimeMin: 15,
        stewardshipRating: 0.90,
        recommended: false,
      },
      {
        optionId: `${proposalType}_OPT_3`,
        title: '⚡ Balanced — Proven path, I explain every choice',
        description: `Standard approach for ${proposalType} with full rationale on each decision.`,
        resourceCost: 'MEDIUM',
        complexity: 'MODERATE',
        estimatedTimeMin: 25,
        stewardshipRating: 0.80,
        recommended: true,  // Lucy's recommendation — human still chooses
      },
      {
        optionId: `${proposalType}_OPT_4`,
        title: '🔬 Experimental — Novel path, higher upside + risk',
        description: `Cutting-edge approach for ${proposalType}. Less tested, more potential.`,
        resourceCost: 'MEDIUM',
        complexity: 'COMPLEX',
        estimatedTimeMin: 40,
        stewardshipRating: stewardshipContext.abundanceScore ?? 0.65,
        recommended: false,
      },
      {
        optionId: `${proposalType}_OPT_5`,
        title: '🌍 Steward Path — Abundance-first, history-informed',
        description: `Highest stewardship path for ${proposalType}. Uses only renewable/synthesizable materials.`,
        resourceCost: 'LOW',
        complexity: 'MODERATE',
        estimatedTimeMin: 30,
        stewardshipRating: 0.98,
        recommended: false,
      },
    ];

    return options.slice(0, this.optionCount);
  }

  getState(): SovereigntyState {
    const records = Array.from(this.records.values());
    const scaffoldingTypes = records.filter(r => r.scaffoldingActive).map(r => r.proposalType);
    const totalRejections = records.reduce((s, r) => s + r.rejectionCount, 0);
    const humanControlScore = Math.max(0.3, 1.0 - (totalRejections * 0.05));

    let mode: SovereigntyState['overallMode'] = 'AUTONOMOUS';
    if (scaffoldingTypes.length > 0) mode = 'SCAFFOLDING';
    else if (this.globalConfidenceModifier < -0.10) mode = 'CO_PILOT';

    return {
      overallMode: mode,
      activeScaffoldingTypes: scaffoldingTypes,
      globalConfidenceModifier: this.globalConfidenceModifier,
      humanControlScore,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: MATERIALITY NODES (L53–L56) — Resource Fusion Layer
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Materiality nodes cross-reference every L1–L16 Analytical
         proposal against the EarthResourceLedger and HistoryRAG.
         They compute the full StewardshipScore resource half.
  WHY:   A proposal for a "high-heat catalyst" in a bio-reactor context
         looks identical to an industrial age pattern. Without L53–L56,
         Lucy approves it. With them, she flags it and proposes the
         enzymatic alternative.
  HOW:   MaterialityEngine.evaluate(proposal) extracts materials,
         queries the ledger, scores abundance, checks for conflict flags,
         and surfaces the best abundance-logic alternative.
  HOW TO CHANGE: Adjust extractMaterials() to handle new proposal
                 formats. Add domain-specific material extraction rules.
  DEBUG EXAMPLE: If material extraction always returns empty, the
                 proposal text may not contain material keywords.
                 Feed materialHints[] explicitly.
*/

export interface MaterialityEvaluation {
  extractedMaterials: string[];
  traces: MaterialTrace[];
  abundanceScore: number;
  resourceEfficiency: number;
  energyCostKwhTotal: number;
  conflictFlagged: boolean;
  conflictNotes: string[];
  abundanceAlternative?: {
    description: string;
    materials: string[];
    estimatedEnergySavingPercent: number;
    abundanceScore: number;
  };
}

export class MaterialityEngine {
  /*
    L53–L56 — Materiality / Resource Fusion Nodes
    "Calculates the thermodynamic and resource cost of every idea."
  */
  private ledger: EarthResourceLedger;

  // Domain-specific material keyword extraction rules
  private readonly MATERIAL_KEYWORDS: Record<string, string[]> = {
    fusion: ['deuterium', 'tritium', 'lithium-6', 'beryllium', 'tungsten', 'helium-3'],
    protein_folding: ['proteins (enzymatic)', 'biomass / cellulose', 'nitrogen (synthetic fixation)'],
    battery: ['lithium', 'cobalt', 'neodymium', 'graphite', 'manganese'],
    semiconductor: ['neodymium', 'gallium', 'indium', 'tantalum'],
    solar: ['solar energy', 'silicon', 'silver', 'indium'],
    nuclear: ['uranium', 'plutonium', 'thorium', 'zirconium'],
    bioreactor: ['proteins (enzymatic)', 'biomass / cellulose', 'nitrogen (synthetic fixation)'],
    catalyst: ['cobalt', 'platinum', 'palladium', 'rhodium'],
    high_heat: ['coal', 'natural gas', 'uranium'],
    fermentation: ['proteins (enzymatic)', 'biomass / cellulose'],
    wind: ['neodymium', 'steel', 'carbon fiber'],
  };

  constructor() {
    this.ledger = new EarthResourceLedger();
  }

  evaluate(
    proposalText: string,
    materialHints: string[] = [],
    estimatedScaleKg: number = 1
  ): MaterialityEvaluation {
    // Extract materials from proposal text + hints
    const extracted = this.extractMaterials(proposalText, materialHints);

    // Query ledger
    const { traces, abundanceScore } = this.ledger.evaluate(extracted);

    // Total energy cost
    const energyCostKwhTotal = traces.reduce(
      (sum, t) => sum + (t.energyCostKwh ?? 0) * estimatedScaleKg,
      0
    );

    // Resource efficiency: inverse of total energy per unit, bounded
    const resourceEfficiency = Math.max(0, Math.min(1.0, 1 - (energyCostKwhTotal / 10000)));

    // Conflict check
    const conflictFlagged = traces.some(t => t.historicalConflictFlag);
    const conflictNotes = traces
      .filter(t => t.historicalConflictFlag)
      .map(t => {
        const entry = this.ledger.findEntry(t.name);
        return entry?.conflictNote ?? `${t.name} has a historical conflict flag`;
      });

    // Abundance alternative
    const scarceTraces = traces.filter(t =>
      t.abundanceClass === 'SCARCE' || t.abundanceClass === 'FINITE_CRITICAL'
    );
    let abundanceAlternative: MaterialityEvaluation['abundanceAlternative'];
    if (scarceTraces.length > 0) {
      const altMaterials: string[] = [];
      let totalSaving = 0;
      for (const trace of scarceTraces) {
        if (trace.alternativeName) {
          altMaterials.push(trace.alternativeName);
          const entry = this.ledger.findEntry(trace.name);
          const bestAlt = entry?.alternatives[0];
          if (bestAlt) totalSaving += bestAlt.energySavingPercent;
        }
      }
      if (altMaterials.length > 0) {
        const altEval = this.ledger.evaluate(altMaterials);
        abundanceAlternative = {
          description: `Replace ${scarceTraces.map(t => t.name).join(', ')} with abundant alternatives`,
          materials: altMaterials,
          estimatedEnergySavingPercent: Math.round(totalSaving / scarceTraces.length),
          abundanceScore: altEval.abundanceScore,
        };
      }
    }

    return {
      extractedMaterials: extracted,
      traces,
      abundanceScore,
      resourceEfficiency,
      energyCostKwhTotal,
      conflictFlagged,
      conflictNotes,
      abundanceAlternative,
    };
  }

  private extractMaterials(proposalText: string, hints: string[]): string[] {
    const found = new Set<string>(hints);
    const lower = proposalText.toLowerCase();

    // Domain keyword matching
    for (const [domain, materials] of Object.entries(this.MATERIAL_KEYWORDS)) {
      if (lower.includes(domain.replace('_', '-')) || lower.includes(domain.replace('_', ' '))) {
        materials.forEach(m => found.add(m));
      }
    }

    // Direct material name scan
    for (const entry of RESOURCE_LEDGER) {
      if (lower.includes(entry.name.toLowerCase())) {
        found.add(entry.name);
      }
      for (const alias of entry.aliases) {
        if (lower.includes(alias.toLowerCase())) {
          found.add(entry.name);
        }
      }
    }

    return Array.from(found);
  }

  getLedger(): EarthResourceLedger { return this.ledger; }
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: LEGACY NODES (L57–L60) — Human History Layer
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Legacy nodes run every finalized proposal through the HistoryRAG
         to identify historical parallels and compute the full legacy
         risk profile. They emit "Historical Parallels" warnings when
         a proposal pattern matches a known ruin scenario.
  WHY:   Without L57–L60, Lucy is technically correct but historically
         blind. The same resource + scale + speed pattern that caused
         the Industrial Revolution's long-term damage can appear in a
         fusion or bio-reactor proposal today.
  HOW:   LegacyEngine.assess() takes the materiality evaluation + proposal
         text, runs HistoryRAG.match(), computes legacyRiskLevel, and
         produces a human-readable warning with the corrected path.
  HOW TO CHANGE: Add new HistoricalEra entries to HISTORY_RAG_INDEX.
                 Adjust riskWeights to change how risk levels are scored.
  DEBUG EXAMPLE: If legacyRisk is always NONE, check that proposal text
                 contains domain keywords or that materialTrace includes
                 SCARCE/FINITE_CRITICAL materials.
*/

export interface LegacyAssessment {
  legacyRiskLevel: LegacyRiskLevel;
  historicalParallels: HistoricalParallel[];
  legacyRiskScore: number;            // 0.0–1.0
  primaryWarning?: string;
  correctedPath?: string;
  positiveParallels: HistoricalParallel[];   // success stories that match
  overallVerdict: 'APPROVED' | 'CAUTION' | 'REROUTE_RECOMMENDED' | 'BLOCKED_LEGACY';
}

export class LegacyEngine {
  /*
    L57–L60 — Legacy / Human History Nodes
    "Filters proposals through the lens of human and planetary survival."
  */
  private historyRAG: HistoryRAG;

  private readonly RISK_WEIGHTS: Record<LegacyRiskLevel, number> = {
    NONE: 0, LOW: 0.2, MODERATE: 0.5, HIGH: 0.75, CRITICAL: 1.0,
  };

  constructor() {
    this.historyRAG = new HistoryRAG();
  }

  assess(
    materiality: MaterialityEvaluation,
    proposalText: string
  ): LegacyAssessment {
    // Run history RAG match
    const allParallels = this.historyRAG.match(
      materiality.traces,
      proposalText,
      materiality.energyCostKwhTotal
    );

    // Separate positive (NONE risk) from negative parallels
    const positiveParallels = allParallels.filter(p => p.riskLevel === 'NONE');
    const negativeParallels = allParallels.filter(p => p.riskLevel !== 'NONE');

    // Compute legacy risk score from negative parallels
    let legacyRiskScore = 0;
    if (negativeParallels.length > 0) {
      const topParallel = negativeParallels[0];
      legacyRiskScore = topParallel.matchScore * this.RISK_WEIGHTS[topParallel.riskLevel];
      // Additional parallels compound the risk slightly
      for (let i = 1; i < negativeParallels.length; i++) {
        legacyRiskScore = Math.min(1.0, legacyRiskScore + negativeParallels[i].matchScore * 0.1);
      }
    }

    // Determine risk level
    let legacyRiskLevel: LegacyRiskLevel;
    if (legacyRiskScore >= 0.75) legacyRiskLevel = 'CRITICAL';
    else if (legacyRiskScore >= 0.5) legacyRiskLevel = 'HIGH';
    else if (legacyRiskScore >= 0.25) legacyRiskLevel = 'MODERATE';
    else if (legacyRiskScore > 0) legacyRiskLevel = 'LOW';
    else legacyRiskLevel = 'NONE';

    // Build primary warning
    const primaryWarning = negativeParallels.length > 0
      ? this.buildWarning(negativeParallels[0])
      : undefined;

    const correctedPath = negativeParallels[0]?.alternativePathTaken;

    // Verdict
    let overallVerdict: LegacyAssessment['overallVerdict'];
    if (legacyRiskLevel === 'CRITICAL') overallVerdict = 'BLOCKED_LEGACY';
    else if (legacyRiskLevel === 'HIGH') overallVerdict = 'REROUTE_RECOMMENDED';
    else if (legacyRiskLevel === 'MODERATE' || legacyRiskLevel === 'LOW') overallVerdict = 'CAUTION';
    else overallVerdict = 'APPROVED';

    return {
      legacyRiskLevel,
      historicalParallels: negativeParallels,
      legacyRiskScore,
      primaryWarning,
      correctedPath,
      positiveParallels,
      overallVerdict,
    };
  }

  private buildWarning(parallel: HistoricalParallel): string {
    return (
      `⚠ Legacy Risk [${parallel.riskLevel}] — This proposal matches the pattern of ` +
      `"${parallel.eraName}" (${parallel.period}, ${parallel.region}). ` +
      `Short-term gain: ${parallel.shortGain}. ` +
      `Historical ruin: ${parallel.longRuin}. ` +
      `Key lesson: ${parallel.keyLesson}`
    );
  }

  getHistoryRAG(): HistoryRAG { return this.historyRAG; }
}

// ─────────────────────────────────────────────────────────────
// SECTION 6: STEWARDSHIP ENGINE — FULL ORCHESTRATOR
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  StewardshipEngine is the top-level orchestrator that runs
         all three stewardship layers (Sovereignty + Materiality + Legacy)
         against a proposal and produces the final StewardshipScore.
  WHY:   All three layers need to be co-evaluated. A proposal can pass
         materiality but fail legacy, or pass legacy but trigger sovereignty
         scaffolding. StewardshipEngine produces one coherent score.
  HOW:   evaluate(proposal) runs MaterialityEngine → LegacyEngine →
         SovereigntyMonitor checks, then assembles the final StewardshipScore
         and optional ScaffoldingOptions.
  HOW TO CHANGE: Adjust COMPOSITE_WEIGHTS to shift the balance between
                 resource, history, and sovereignty concerns.
  DEBUG EXAMPLE: Call StewardshipEngine.audit(proposal) to see the
                 full breakdown with intermediate scores.
*/

const COMPOSITE_WEIGHTS = {
  resourceEfficiency: 0.35,
  abundanceScore: 0.25,
  legacyRisk: 0.25,          // inverted — high risk lowers score
  humanControl: 0.15,
};

export class StewardshipEngine {
  /*
    Full Stewardship Orchestrator — wires L49–L60
  */
  private materiality: MaterialityEngine;
  private legacy: LegacyEngine;
  private sovereignty: SovereigntyMonitor;

  constructor() {
    this.materiality = new MaterialityEngine();
    this.legacy = new LegacyEngine();
    this.sovereignty = new SovereigntyMonitor();
  }

  evaluate(
    proposalType: string,
    proposalText: string,
    materialHints: string[] = [],
    estimatedScaleKg: number = 1
  ): {
    score: StewardshipScore;
    scaffoldingOptions?: ScaffoldingOption[];
    debugOutput: string;
  } {
    // 1. Materiality assessment (L53–L56)
    const materialityEval = this.materiality.evaluate(proposalText, materialHints, estimatedScaleKg);

    // 2. Legacy assessment (L57–L60)
    const legacyAssess = this.legacy.assess(materialityEval, proposalText);

    // 3. Sovereignty state (L49–L52)
    const sovereigntyState = this.sovereignty.getState();
    const isScaffolding = this.sovereignty.isScaffolding(proposalType);
    const confidenceThreshold = this.sovereignty.getConfidenceThreshold(proposalType);
    const rejectionRecord = (this.sovereignty as any).records?.get(proposalType);

    // 4. Compute composite stewardship rating
    const legacyRiskInverted = 1.0 - (legacyAssess.legacyRiskScore ?? 0);
    const composite =
      materialityEval.resourceEfficiency * COMPOSITE_WEIGHTS.resourceEfficiency +
      materialityEval.abundanceScore * COMPOSITE_WEIGHTS.abundanceScore +
      legacyRiskInverted * COMPOSITE_WEIGHTS.legacyRisk +
      sovereigntyState.humanControlScore * COMPOSITE_WEIGHTS.humanControl;

    // 5. Build stewardship note
    const stewardshipNote = this.buildNote(
      composite,
      legacyAssess,
      materialityEval,
      sovereigntyState
    );

    // 6. Determine creative autonomy from sovereignty state
    const creativeAutonomy: CreativeAutonomy =
      sovereigntyState.overallMode === 'SCAFFOLDING' ? 'USER_LED' :
      sovereigntyState.overallMode === 'CO_PILOT' ? 'CO_PILOT' : 'AUTONOMOUS';

    const score: StewardshipScore = {
      // Resource
      resourceEfficiency: materialityEval.resourceEfficiency,
      materialTrace: materialityEval.traces,
      energyCostKwh: materialityEval.energyCostKwhTotal,
      abundanceScore: materialityEval.abundanceScore,

      // History
      historicalAlignment: legacyAssess.overallVerdict === 'APPROVED'
        ? 'No significant historical risk patterns detected'
        : `Matches patterns from: ${legacyAssess.historicalParallels.map(p => p.eraName).join(', ')}`,
      historicalParallels: legacyAssess.historicalParallels,
      legacyRiskLevel: legacyAssess.legacyRiskLevel,
      legacyRiskReason: legacyAssess.primaryWarning,

      // Sovereignty
      creativeAutonomy,
      scaffoldingMode: isScaffolding,
      rejectionCount: rejectionRecord?.rejectionCount ?? 0,
      confidenceThreshold,

      // Summary
      overallStewardshipRating: Math.min(1.0, composite),
      stewardshipNote,
    };

    // 7. Generate scaffolding options if in scaffolding mode
    const scaffoldingOptions = isScaffolding
      ? this.sovereignty.generateScaffoldingOptions(proposalType, proposalText, score)
      : undefined;

    // 8. Debug output
    const debugOutput = this.buildDebugOutput(score, materialityEval, legacyAssess, sovereigntyState);

    return { score, scaffoldingOptions, debugOutput };
  }

  private buildNote(
    composite: number,
    legacy: LegacyAssessment,
    mat: MaterialityEvaluation,
    sov: SovereigntyState
  ): string {
    if (composite >= 0.85) return '✅ High stewardship — abundant materials, no legacy risk, human in control.';
    if (legacy.legacyRiskLevel === 'CRITICAL') return `🚫 Critical legacy risk — matches ${legacy.historicalParallels[0]?.eraName}. Reroute required.`;
    if (mat.conflictFlagged) return `⚠ Resource conflict flagged: ${mat.conflictNotes[0]}. Abundant alternative available.`;
    if (sov.overallMode === 'SCAFFOLDING') return '🧩 Scaffolding mode active — 5 options presented for human selection.';
    if (mat.abundanceScore < 0.4) return '⚠ Low abundance score — proposal relies on scarce/finite materials. Alternatives recommended.';
    return `Stewardship rating: ${(composite * 100).toFixed(0)}% — ${legacy.overallVerdict}.`;
  }

  private buildDebugOutput(
    score: StewardshipScore,
    mat: MaterialityEvaluation,
    legacy: LegacyAssessment,
    sov: SovereigntyState
  ): string {
    const lines = [
      `=== STEWARDSHIP ENGINE AUDIT ===`,
      `Overall Rating: ${(score.overallStewardshipRating * 100).toFixed(1)}%`,
      `Creative Autonomy: ${score.creativeAutonomy} | Scaffolding: ${score.scaffoldingMode}`,
      `--- MATERIALITY (L53–L56) ---`,
      `Materials: ${mat.extractedMaterials.join(', ')}`,
      `Abundance Score: ${(mat.abundanceScore * 100).toFixed(1)}%`,
      `Energy Cost: ${mat.energyCostKwhTotal.toFixed(2)} kWh`,
      `Conflict Flagged: ${mat.conflictFlagged}`,
      mat.abundanceAlternative
        ? `Alternative: ${mat.abundanceAlternative.description} (save ${mat.abundanceAlternative.estimatedEnergySavingPercent}%)`
        : 'No alternatives needed.',
      `--- LEGACY (L57–L60) ---`,
      `Risk Level: ${score.legacyRiskLevel} | Verdict: ${legacy.overallVerdict}`,
      ...legacy.historicalParallels.map(p =>
        `  ↳ ${p.eraName} (${p.period}): match=${(p.matchScore * 100).toFixed(0)}% — ${p.keyLesson}`
      ),
      ...legacy.positiveParallels.map(p =>
        `  ✅ Positive: ${p.eraName} — ${p.keyLesson}`
      ),
      `--- SOVEREIGNTY (L49–L52) ---`,
      `Mode: ${sov.overallMode} | Human Control: ${(sov.humanControlScore * 100).toFixed(0)}%`,
      `Scaffolding Active For: ${sov.activeScaffoldingTypes.join(', ') || 'none'}`,
      `=== END AUDIT ===`,
    ];
    return lines.join('\n');
  }

  // Expose sub-engines for event recording
  getSovereigntyMonitor(): SovereigntyMonitor { return this.sovereignty; }
  getMaterialityEngine(): MaterialityEngine { return this.materiality; }
  getLegacyEngine(): LegacyEngine { return this.legacy; }
}

// ─────────────────────────────────────────────────────────────
// SECTION 7: STEWARDSHIP CHAT FORMATTER
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Produces the "Steward Vibe" debug chat output — the human-facing
         explanation of what Stewardship nodes found and what Lucy proposes.
  WHY:   Raw stewardship scores are not human-readable. The formatter
         converts them into the warm, confident, consequence-aware voice
         that makes Lucy feel like a genuine steward — not a compliance checker.
  HOW:   StewardshipChatFormatter.format() takes a StewardshipScore +
         LegacyAssessment + optional scaffolding options and produces
         a ready-to-display chat message.
  HOW TO CHANGE: Edit MESSAGE_TEMPLATES to adjust Lucy's voice and tone.
                 Add domain-specific context builders.
  DEBUG EXAMPLE: If output sounds generic, ensure that the proposalDomain
                 is passed and that at least one MaterialTrace is present.
*/

export interface StewardshipChatMessage {
  headline: string;
  body: string;
  legacyWarning?: string;
  alternativePath?: string;
  scaffoldingOptions?: ScaffoldingOption[];
  approvalPrompt: string;
  rating: string;
}

export class StewardshipChatFormatter {
  format(
    proposalDomain: string,
    proposalSummary: string,
    score: StewardshipScore,
    legacy: LegacyAssessment,
    scaffolding?: ScaffoldingOption[]
  ): StewardshipChatMessage {
    const ratingStr = `${(score.overallStewardshipRating * 100).toFixed(0)}% stewardship`;

    // Build headline based on risk level
    const headline = this.buildHeadline(proposalDomain, legacy, score);

    // Body: what the analytical nodes found + what stewardship checked
    const body = this.buildBody(proposalSummary, score, legacy);

    // Legacy warning (if any)
    const legacyWarning = legacy.legacyRiskLevel !== 'NONE'
      ? legacy.primaryWarning
      : undefined;

    // Alternative path
    const alternativePath = this.buildAlternativePath(score, legacy);

    // Approval prompt
    const approvalPrompt = scaffolding
      ? `Which approach would you like? (Choose 1–${scaffolding.length} above, or describe your own.)`
      : legacy.legacyRiskLevel === 'CRITICAL'
        ? `I strongly recommend the alternative path before proceeding. Reroute?`
        : `Approve this path?`;

    return {
      headline,
      body,
      legacyWarning,
      alternativePath,
      scaffoldingOptions: scaffolding,
      approvalPrompt,
      rating: ratingStr,
    };
  }

  formatAsText(msg: StewardshipChatMessage): string {
    const lines: string[] = [];
    lines.push(`**LUCY [Steward]:** ${msg.headline}`);
    lines.push('');
    lines.push(msg.body);
    if (msg.legacyWarning) {
      lines.push('');
      lines.push(msg.legacyWarning);
    }
    if (msg.alternativePath) {
      lines.push('');
      lines.push(`**Proposed Alternative:** ${msg.alternativePath}`);
    }
    if (msg.scaffoldingOptions && msg.scaffoldingOptions.length > 0) {
      lines.push('');
      lines.push('**Your options:**');
      for (const opt of msg.scaffoldingOptions) {
        const rec = opt.recommended ? ' ← Lucy recommends' : '';
        lines.push(`  ${opt.title}${rec}`);
        lines.push(`    ${opt.description}`);
        lines.push(`    Resource cost: ${opt.resourceCost} | Time: ~${opt.estimatedTimeMin} min | Stewardship: ${(opt.stewardshipRating * 100).toFixed(0)}%`);
      }
    }
    lines.push('');
    lines.push(`[Rating: ${msg.rating}] ${msg.approvalPrompt}`);
    return lines.join('\n');
  }

  private buildHeadline(
    domain: string,
    legacy: LegacyAssessment,
    score: StewardshipScore
  ): string {
    if (legacy.legacyRiskLevel === 'CRITICAL') {
      return `I've analyzed the ${domain} proposal and flagged a Critical Legacy Risk before we proceed.`;
    }
    if (legacy.legacyRiskLevel === 'HIGH') {
      return `I've analyzed the ${domain} proposal. There's a strong historical parallel worth surfacing first.`;
    }
    if (score.scaffoldingMode) {
      return `I noticed you've steered us a different direction. Let me offer you ${score.scaffoldingMode ? 5 : 1} paths for ${domain} — you choose the angle.`;
    }
    if (legacy.positiveParallels.length > 0) {
      return `I've analyzed the ${domain} proposal — and it aligns with a historically successful pattern.`;
    }
    return `I've analyzed the ${domain} proposal and run it through stewardship checks.`;
  }

  private buildBody(
    proposalSummary: string,
    score: StewardshipScore,
    legacy: LegacyAssessment
  ): string {
    const parts: string[] = [];

    parts.push(`**Analytical finding:** ${proposalSummary}`);

    if (score.materialTrace.length > 0) {
      const scarce = score.materialTrace.filter(t =>
        t.abundanceClass === 'SCARCE' || t.abundanceClass === 'FINITE_CRITICAL'
      );
      if (scarce.length > 0) {
        parts.push(`**Material concern:** This touches ${scarce.map(t => t.name).join(', ')} — classified as ${scarce.map(t => t.abundanceClass).join(', ')}. ${scarce[0].alternativeName ? `Alternative available: ${scarce[0].alternativeName} (${scarce[0].alternativeAbundanceClass}).` : ''}`);
      } else {
        parts.push(`**Material check:** All materials are renewable, synthesizable, or infinite. No resource debt.`);
      }
    }

    if (legacy.positiveParallels.length > 0) {
      const p = legacy.positiveParallels[0];
      parts.push(`**Historical resonance:** This approach echoes ${p.eraName} (${p.period}) — ${p.keyLesson}`);
    }

    return parts.join('\n');
  }

  private buildAlternativePath(
    score: StewardshipScore,
    legacy: LegacyAssessment
  ): string | undefined {
    // Prefer legacy's corrected path if risk is high
    if (legacy.legacyRiskLevel !== 'NONE' && legacy.correctedPath) {
      return legacy.correctedPath;
    }
    // Otherwise use materiality alternative
    const scarceMat = score.materialTrace.find(t =>
      t.abundanceClass === 'SCARCE' && t.alternativeName
    );
    if (scarceMat?.alternativeName) {
      return `A low-energy path using ${scarceMat.alternativeName} (${scarceMat.alternativeAbundanceClass}) — same functional outcome, ${scarceMat.name} dependency eliminated.`;
    }
    return undefined;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 8: NODE REGISTRY — L49–L60 + LL361–LL365
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Formal registry entries for all Stewardship Protocol nodes.
  WHY:   Every Lucy node must have a living identity in the registry.
  HOW:   These extend the LL registry beyond LL360.
*/

export const LUCY_NODE_REGISTRY_STEWARDSHIP: Record<string, {
  id: string; name: string; layer: string; function: string; wiredTo: string[];
}> = {
  // Little Lucy Sovereignty Nodes (L-series — original 48 + new 12)
  'L49': {
    id: 'L49', name: 'SOVEREIGNTY_SENTINEL', layer: 'Sovereignty Layer',
    function: 'Tracks user.query.why events. First rejection detection node.',
    wiredTo: ['L50', 'LL359', 'LUCY_EVENT_BUS'],
  },
  'L50': {
    id: 'L50', name: 'PREFERENCE_GUARDIAN', layer: 'Sovereignty Layer',
    function: 'Correlates LL358 (HumanFirstMemory) with rejection patterns. Suppresses historically-rejected output styles.',
    wiredTo: ['L51', 'LL358', 'ACTION_CORE'],
  },
  'L51': {
    id: 'L51', name: 'SCAFFOLD_WEAVER', layer: 'Sovereignty Layer',
    function: 'Generates 5–6 scaffolding options when ScaffoldingMode activates. Marks the human-recommended option without forcing it.',
    wiredTo: ['L52', 'OUTPUT_FORMATTER'],
  },
  'L52': {
    id: 'L52', name: 'CONFIDENCE_TUNER', layer: 'Sovereignty Layer',
    function: 'Dynamically adjusts Lucy\'s confidence threshold (0.85→0.50) based on rejection history. Prevents black-box overreach.',
    wiredTo: ['ACTION_CORE', 'THINK_LOOP', 'LL354'],
  },
  // Materiality Nodes
  'L53': {
    id: 'L53', name: 'MATERIAL_SCANNER', layer: 'Materiality Layer',
    function: 'Extracts material keywords from L1–L16 analytical proposals. First pass through EarthResourceLedger.',
    wiredTo: ['L54', 'LL361'],
  },
  'L54': {
    id: 'L54', name: 'ABUNDANCE_LOGIC', layer: 'Materiality Layer',
    function: 'Core abundance scorer. Prioritizes renewable/synthesizable paths over finite ones. Surfaces best alternatives.',
    wiredTo: ['L55', 'OUTPUT_FORMATTER'],
  },
  'L55': {
    id: 'L55', name: 'THERMODYNAMIC_AUDITOR', layer: 'Materiality Layer',
    function: 'Computes energy cost per kg for every material in a proposal. Flags high-energy paths for efficiency review.',
    wiredTo: ['L56', 'L57'],
  },
  'L56': {
    id: 'L56', name: 'CONFLICT_SENTINEL', layer: 'Materiality Layer',
    function: 'Checks every material against historical conflict flags (child labor, water rights, armed conflict funding). Surfaces humanitarian context.',
    wiredTo: ['LL355', 'OUTPUT_FORMATTER'],
  },
  // Legacy Nodes
  'L57': {
    id: 'L57', name: 'HISTORY_INDEXER', layer: 'Legacy Layer',
    function: 'Indexes proposal materials + keywords against HistoryRAG. Computes match scores for all 7 base eras.',
    wiredTo: ['L58'],
  },
  'L58': {
    id: 'L58', name: 'PATTERN_PARALLELIST', layer: 'Legacy Layer',
    function: 'Identifies the closest historical parallel. Computes legacy risk score. Flags CRITICAL patterns for immediate reroute.',
    wiredTo: ['L59', 'OUTPUT_FORMATTER'],
  },
  'L59': {
    id: 'L59', name: 'CORRECTED_PATH_FINDER', layer: 'Legacy Layer',
    function: 'For every negative historical parallel, finds the historically-corrected alternative path taken. Proposes it in output.',
    wiredTo: ['L60', 'OUTPUT_FORMATTER'],
  },
  'L60': {
    id: 'L60', name: 'STEWARDSHIP_SYNTHESIZER', layer: 'Legacy Layer',
    function: 'Final synthesizer. Assembles StewardshipScore from all sub-nodes. Produces stewardshipNote and overall rating. Attaches to EventEnvelope payload.',
    wiredTo: ['LUCY_EVENT_BUS', 'ACTION_CORE', 'LL360'],
  },
  // LL extension nodes
  'LL361': {
    id: 'LL361', name: 'EARTH_RESOURCE_LEDGER', layer: 'Stewardship Infrastructure',
    function: 'Persistent resource database. Tracks abundance classes, energy costs, alternatives, and conflict history for all materials.',
    wiredTo: ['L53', 'L54', 'L55', 'L56'],
  },
  'LL362': {
    id: 'LL362', name: 'HISTORY_RAG_ENGINE', layer: 'Stewardship Infrastructure',
    function: 'Queryable historical pattern database. 7 base eras (Industrial Revolution → Fusion Horizon). Extensible via addEra().',
    wiredTo: ['L57', 'L58', 'L59'],
  },
  'LL363': {
    id: 'LL363', name: 'STEWARDSHIP_ENGINE', layer: 'Stewardship Infrastructure',
    function: 'Top-level stewardship orchestrator. Runs Materiality + Legacy + Sovereignty in sequence. Produces final StewardshipScore.',
    wiredTo: ['L49', 'L53', 'L57', 'L60', 'LUCY_EVENT_BUS'],
  },
  'LL364': {
    id: 'LL364', name: 'ABUNDANCE_PRIORITY_INDEX', layer: 'Stewardship Infrastructure',
    function: 'Abundance Logic rule engine. "INFINITE > RENEWABLE > SYNTHESIZABLE > RECYCLABLE > SCARCE > FINITE_CRITICAL." Applied before every material recommendation.',
    wiredTo: ['L54', 'LL363'],
  },
  'LL365': {
    id: 'LL365', name: 'STEWARDSHIP_CHAT_FORMATTER', layer: 'Stewardship Infrastructure',
    function: 'Converts StewardshipScore into human-readable Steward Vibe output. Applies the "historical parallels + corrected path + approve?" format.',
    wiredTo: ['OUTPUT_FORMATTER', 'LL357', 'LL358'],
  },
};

// ─────────────────────────────────────────────────────────────
// SECTION 9: STEWARDSHIP EVENT BUS INTEGRATION
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  New event types added to LucyEventBus for stewardship.
  WHY:   All stewardship decisions must flow through the same event
         nervous system as the rest of Lucy's architecture.
  HOW:   These extend the LucyEventType union from v7.
*/

export type StewardshipEventType =
  | 'stewardship.score.computed'        // L60 finished assembling score
  | 'stewardship.legacy.warning'        // L58 found a negative historical parallel
  | 'stewardship.legacy.positive'       // L58 found a positive historical parallel
  | 'stewardship.material.conflict'     // L56 found a conflict-flagged material
  | 'stewardship.abundance.alert'       // L54 found SCARCE/FINITE_CRITICAL material
  | 'stewardship.alternative.proposed'  // L54/L59 surfaced an abundant alternative
  | 'stewardship.sovereignty.rejected'  // L49 recorded a user rejection
  | 'stewardship.scaffolding.activated' // L52 activated scaffolding mode
  | 'stewardship.scaffolding.chosen'    // Human selected a scaffolding option
  | 'stewardship.approved'              // Human approved stewardship-reviewed proposal
  | 'stewardship.rerouted';             // Human accepted alternative path

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export default StewardshipEngine;