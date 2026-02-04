/**
 * SEO Architecte - Single Agent Runner
 * 
 * Lance un agent spécifique de manière isolée.
 * 
 * Usage: npx ts-node .agent/seo-architecte/scripts/run-agent.ts <agent-name>
 * 
 * Agents disponibles:
 * - strategic: Strategic Analyzer (Agent 1)
 * - cluster: Cluster Architect (Agent 2)
 * - content: Content Designer (Agent 3)
 * - technical: Technical Optimizer (Agent 4)
 * - snippet: Snippet Master (Agent 5)
 * - authority: Authority Builder (Agent 6)
 * - coordinator: Coordinator (Agent 7)
 * - competitor: Competitor Analyzer (Agent 8)
 * - serp: SERP Analyzer (nouveau)
 * - sge: SGE Optimizer
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES Module support - create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually if it exists
const envPath = path.join(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            const [, key, value] = match;
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    }
}

const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');
const INPUTS_DIR = path.join(__dirname, '..', 'inputs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUTS_DIR)) {
    fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

const AGENTS = {
    strategic: { name: 'Strategic Analyzer', output: '01-strategic-analysis.json', deps: [] },
    cluster: { name: 'Cluster Architect', output: '02-cluster-architecture.json', deps: ['strategic'] },
    content: { name: 'Content Designer', output: '03-content-table.json', deps: ['strategic', 'cluster'] },
    technical: { name: 'Technical Optimizer', output: '04-technical-optimization.json', deps: ['cluster'] },
    snippet: { name: 'Snippet Master', output: '05-snippet-strategy.json', deps: ['content'] },
    authority: { name: 'Authority Builder', output: '06-authority-strategy.json', deps: ['strategic'] },
    sge: { name: 'SGE Optimizer', output: '07-sge-optimization.json', deps: ['strategic', 'content'] },
    competitor: { name: 'Competitor Analyzer', output: '08-competitor-analysis.json', deps: ['strategic'] },
    coordinator: { name: 'Coordinator', output: '09-coordinator-summary.json', deps: ['all'] },
    serp: { name: 'SERP Analyzer', output: '10-serp-analysis.json', deps: ['cluster'] },
    roi: { name: 'ROI Predictor', output: '11-roi-predictions.json', deps: ['content', 'strategic'] },
    compintel: { name: 'Competitive Intelligence', output: '12-competitive-intel.json', deps: ['strategic'] },
} as const;

type AgentName = keyof typeof AGENTS;

function loadOutput(name: string): unknown {
    const outputPath = path.join(OUTPUTS_DIR, name);
    if (!fs.existsSync(outputPath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
}

function saveOutput(name: string, data: unknown): void {
    const outputPath = path.join(OUTPUTS_DIR, name);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Sauvegardé: ${outputPath}`);
}

function loadBrief(): string {
    const briefPath = path.join(INPUTS_DIR, 'brief.md');
    if (!fs.existsSync(briefPath)) {
        throw new Error(`Brief non trouvé: ${briefPath}`);
    }
    return fs.readFileSync(briefPath, 'utf-8');
}

async function runAgent(agentName: AgentName): Promise<void> {
    const agent = AGENTS[agentName];
    const startTime = Date.now();

    console.log(`\n🔄 Lancement: ${agent.name}...`);

    // Check dependencies
    for (const dep of agent.deps) {
        if (dep === 'all') continue;
        const depAgent = AGENTS[dep as AgentName];
        if (depAgent && !fs.existsSync(path.join(OUTPUTS_DIR, depAgent.output))) {
            throw new Error(`Dépendance manquante: ${dep}. Lance d'abord: npx ts-node run-agent.ts ${dep}`);
        }
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Clé API Gemini non trouvée');
    }

    // Initialize Gemini
    const { initializeGemini } = await import('../../../src/services/GeminiService');
    const { initializeGroundedGemini } = await import('../../../src/services/GroundedGeminiService');
    initializeGemini(apiKey);
    initializeGroundedGemini(apiKey);

    const brief = loadBrief();
    let result: unknown;

    switch (agentName) {
        case 'strategic': {
            const { runStrategicAnalyzer } = await import('../../../src/services/agents/StrategicAnalyzerAgent');
            result = await runStrategicAnalyzer(brief);
            break;
        }
        case 'cluster': {
            const { runClusterArchitect } = await import('../../../src/services/agents/ClusterArchitectAgent');
            const strategic = loadOutput('01-strategic-analysis.json');
            result = await runClusterArchitect(brief, strategic as Parameters<typeof runClusterArchitect>[1]);
            break;
        }
        case 'content': {
            const { runContentDesigner } = await import('../../../src/services/agents/ContentDesignerAgent');
            const strategic = loadOutput('01-strategic-analysis.json');
            const cluster = loadOutput('02-cluster-architecture.json');
            result = await runContentDesigner(
                brief,
                strategic as Parameters<typeof runContentDesigner>[1],
                cluster as Parameters<typeof runContentDesigner>[2]
            );
            break;
        }
        case 'technical': {
            const { runTechnicalOptimizer } = await import('../../../src/services/agents/TechnicalOptimizerAgent');
            const cluster = loadOutput('02-cluster-architecture.json');
            result = await runTechnicalOptimizer(brief, cluster as Parameters<typeof runTechnicalOptimizer>[1]);
            break;
        }
        case 'snippet': {
            const { runSnippetMaster } = await import('../../../src/services/agents/SnippetMasterAgent');
            const content = loadOutput('03-content-table.json');
            result = await runSnippetMaster(brief, content as Parameters<typeof runSnippetMaster>[1]);
            break;
        }
        case 'authority': {
            const { runAuthorityBuilder } = await import('../../../src/services/agents/AuthorityBuilderAgent');
            const strategic = loadOutput('01-strategic-analysis.json');
            result = await runAuthorityBuilder(brief, strategic as Parameters<typeof runAuthorityBuilder>[1]);
            break;
        }
        case 'sge': {
            const { runSGEOptimizer, enrichArticlesWithSGE } = await import('../../../src/services/agents/SGEOptimizerAgent');
            const strategic = loadOutput('01-strategic-analysis.json');
            const content = loadOutput('03-content-table.json') as { tableauContenu: Parameters<typeof runSGEOptimizer>[2] };
            const optimizations = await runSGEOptimizer(
                brief,
                strategic as Parameters<typeof runSGEOptimizer>[1],
                content.tableauContenu
            );
            const enriched = enrichArticlesWithSGE(content.tableauContenu, optimizations);
            result = { articles: enriched };
            break;
        }
        case 'competitor': {
            const { runCompetitorAnalyzer } = await import('../../../src/services/agents/CompetitorAnalyzerAgent');
            const strategic = loadOutput('01-strategic-analysis.json') as { contexteBusiness?: { secteur?: string } };
            const competitors = brief.match(/https?:\/\/[^\s]+/g) || [];
            result = await runCompetitorAnalyzer(
                competitors.slice(0, 5),
                brief,
                strategic?.contexteBusiness?.secteur || ''
            );
            break;
        }
        case 'coordinator': {
            const { runCoordinator } = await import('../../../src/services/agents/CoordinatorAgent');
            result = await runCoordinator(
                brief,
                loadOutput('01-strategic-analysis.json') as Parameters<typeof runCoordinator>[1],
                loadOutput('02-cluster-architecture.json') as Parameters<typeof runCoordinator>[2],
                loadOutput('03-content-table.json') as Parameters<typeof runCoordinator>[3],
                loadOutput('04-technical-optimization.json') as Parameters<typeof runCoordinator>[4],
                loadOutput('05-snippet-strategy.json') as Parameters<typeof runCoordinator>[5],
                loadOutput('06-authority-strategy.json') as Parameters<typeof runCoordinator>[6],
                loadOutput('08-competitor-analysis.json') as Parameters<typeof runCoordinator>[7]
            );
            break;
        }
        case 'serp': {
            const { runSERPAnalyzer } = await import('../../../src/services/agents/SERPAnalyzerAgent');
            const cluster = loadOutput('02-cluster-architecture.json') as { clusters?: Array<{ motsCles: string[] }> };
            const keywords = cluster?.clusters?.flatMap(c => c.motsCles?.slice(0, 3) || []).slice(0, 15) || [];
            result = await runSERPAnalyzer(keywords, brief, cluster as Parameters<typeof runSERPAnalyzer>[2]);
            break;
        }
        case 'roi': {
            const { runROIPredictor } = await import('../../../src/services/agents/ROIPredictorAgent');
            const content = loadOutput('03-content-table.json') as { tableauContenu: Parameters<typeof runROIPredictor>[0] };
            const strategic = loadOutput('01-strategic-analysis.json');
            result = await runROIPredictor(
                content.tableauContenu,
                strategic as Parameters<typeof runROIPredictor>[1],
                500 // Default conversion value
            );
            break;
        }
        case 'compintel': {
            const { runCompetitiveIntelligence } = await import('../../../src/services/agents/CompetitiveIntelAgent');
            const strategic = loadOutput('01-strategic-analysis.json');
            const competitors = brief.match(/https?:\/\/[^\s]+/g) || [];
            result = await runCompetitiveIntelligence(
                competitors.slice(0, 5),
                brief,
                strategic as Parameters<typeof runCompetitiveIntelligence>[2]
            );
            break;
        }
        default:
            throw new Error(`Agent inconnu: ${agentName}`);
    }

    saveOutput(agent.output, result);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ ${agent.name} terminé en ${duration}s`);
}

// Main
const agentArg = process.argv[2] as AgentName | undefined;

if (!agentArg || !AGENTS[agentArg]) {
    console.log(`
Usage: npx ts-node run-agent.ts <agent>

Agents disponibles:
${Object.entries(AGENTS).map(([key, val]) => `  - ${key}: ${val.name}`).join('\n')}
  `);
    process.exit(1);
}

runAgent(agentArg).catch(err => {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
});
