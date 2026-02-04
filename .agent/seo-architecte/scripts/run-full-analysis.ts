/**
 * SEO Architecte - Full Analysis Script
 * 
 * Ce script lance l'analyse SEO complète en utilisant tous les agents
 * dans le bon ordre de dépendance.
 * 
 * Usage: npx ts-node .agent/seo-architecte/scripts/run-full-analysis.ts
 */

import * as fs from 'fs';
import * as path from 'path';

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
const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUTS_DIR)) {
    fs.mkdirSync(OUTPUTS_DIR, { recursive: true });
}

interface AnalysisConfig {
    projectName: string;
    businessDescription: string;
    competitors: string[];
    apiKey: string;
}

async function loadConfig(): Promise<AnalysisConfig> {
    const briefPath = path.join(INPUTS_DIR, 'brief.md');

    if (!fs.existsSync(briefPath)) {
        throw new Error(`
❌ Brief non trouvé!

Crée le fichier: ${briefPath}
Utilise le template dans WORKFLOW.md
    `);
    }

    const brief = fs.readFileSync(briefPath, 'utf-8');
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('❌ Clé API Gemini non trouvée dans .env');
    }

    // Extract project name from brief
    const projectNameMatch = brief.match(/\*\*Nom du projet\*\*:\s*(.+)/);
    const projectName = projectNameMatch ? projectNameMatch[1].trim() : 'Unnamed Project';

    // Extract competitors from brief
    const competitorMatches = brief.match(/https?:\/\/[^\s]+/g) || [];

    return {
        projectName,
        businessDescription: brief,
        competitors: competitorMatches.slice(0, 5), // Max 5 competitors
        apiKey
    };
}

function loadPrompt(name: string): string {
    const promptPath = path.join(PROMPTS_DIR, `${name}.md`);
    if (!fs.existsSync(promptPath)) {
        console.warn(`⚠️ Prompt ${name}.md non trouvé, utilisation du prompt par défaut`);
        return '';
    }
    return fs.readFileSync(promptPath, 'utf-8');
}

function saveOutput(name: string, data: unknown): void {
    const outputPath = path.join(OUTPUTS_DIR, `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Sauvegardé: ${outputPath}`);
}

function logStep(step: string, status: 'start' | 'done' | 'error' = 'start'): void {
    const icons = { start: '🔄', done: '✅', error: '❌' };
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    console.log(`\n${icons[status]} [${timestamp}] ${step}`);
}

async function runFullAnalysis(): Promise<void> {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🚀 SEO ARCHITECTE - ANALYSE COMPLÈTE                 ║
╚════════════════════════════════════════════════════════════════╝
  `);

    try {
        // Load configuration
        logStep('Chargement de la configuration...');
        const config = await loadConfig();
        logStep(`Projet: ${config.projectName}`, 'done');

        // Initialize Gemini
        logStep('Initialisation de Gemini API...');
        // Import dynamically to avoid issues if run from different contexts
        const { initializeGemini } = await import('../../../src/services/GeminiService');
        const { initializeGroundedGemini } = await import('../../../src/services/GroundedGeminiService');

        initializeGemini(config.apiKey);
        initializeGroundedGemini(config.apiKey);
        logStep('Gemini initialisé', 'done');

        // AGENT 1: Strategic Analyzer
        logStep('Agent 1: Strategic Analyzer...');
        const { runStrategicAnalyzer } = await import('../../../src/services/agents/StrategicAnalyzerAgent');
        const strategicResult = await runStrategicAnalyzer(config.businessDescription);
        saveOutput('01-strategic-analysis', strategicResult);
        logStep('Analyse stratégique terminée', 'done');

        // AGENT 2: Cluster Architect
        logStep('Agent 2: Cluster Architect...');
        const { runClusterArchitect } = await import('../../../src/services/agents/ClusterArchitectAgent');
        const clusterResult = await runClusterArchitect(config.businessDescription, strategicResult);
        saveOutput('02-cluster-architecture', clusterResult);
        logStep('Architecture clusters terminée', 'done');

        // PARALLEL AGENTS: 3, 4, 5, 6
        logStep('Agents 3-6: Exécution parallèle...');

        const { runContentDesigner } = await import('../../../src/services/agents/ContentDesignerAgent');
        const { runTechnicalOptimizer } = await import('../../../src/services/agents/TechnicalOptimizerAgent');
        const { runSnippetMaster } = await import('../../../src/services/agents/SnippetMasterAgent');
        const { runAuthorityBuilder } = await import('../../../src/services/agents/AuthorityBuilderAgent');

        const [contentResult, technicalResult, snippetResult, authorityResult] = await Promise.all([
            runContentDesigner(config.businessDescription, strategicResult, clusterResult),
            runTechnicalOptimizer(config.businessDescription, clusterResult),
            runSnippetMaster(config.businessDescription, { tableauContenu: [], planningPublication: [] }),
            runAuthorityBuilder(config.businessDescription, strategicResult)
        ]);

        saveOutput('03-content-table', contentResult);
        saveOutput('04-technical-optimization', technicalResult);
        saveOutput('05-snippet-strategy', snippetResult);
        saveOutput('06-authority-strategy', authorityResult);
        logStep('Agents parallèles terminés', 'done');

        // AGENT SGE: SGE Optimizer
        logStep('Agent SGE: Optimisation AI Overviews...');
        const { runSGEOptimizer, enrichArticlesWithSGE } = await import('../../../src/services/agents/SGEOptimizerAgent');
        const sgeOptimizations = await runSGEOptimizer(config.businessDescription, strategicResult, contentResult.tableauContenu);
        const enrichedContent = enrichArticlesWithSGE(contentResult.tableauContenu, sgeOptimizations);
        saveOutput('07-sge-optimization', { articles: enrichedContent });
        logStep('Optimisation SGE terminée', 'done');

        // AGENT 8: Competitor Analyzer (if competitors provided)
        let competitorResult = null;
        if (config.competitors.length > 0) {
            logStep('Agent 8: Competitor Analyzer...');
            const { runCompetitorAnalyzer } = await import('../../../src/services/agents/CompetitorAnalyzerAgent');
            competitorResult = await runCompetitorAnalyzer(
                config.competitors,
                config.businessDescription,
                strategicResult.contexteBusiness?.secteur || ''
            );
            saveOutput('08-competitor-analysis', competitorResult);
            logStep('Analyse concurrentielle terminée', 'done');
        }

        // AGENT 7: Coordinator (Final synthesis)
        logStep('Agent 7: Coordinator (Synthèse finale)...');
        const { runCoordinator } = await import('../../../src/services/agents/CoordinatorAgent');
        const coordinatorResult = await runCoordinator(
            config.businessDescription,
            strategicResult,
            clusterResult,
            contentResult,
            technicalResult,
            snippetResult,
            authorityResult,
            competitorResult
        );
        saveOutput('09-coordinator-summary', coordinatorResult);
        logStep('Synthèse finale terminée', 'done');

        // Generate full report
        logStep('Génération du rapport complet...');
        generateFullReport(config.projectName, {
            strategic: strategicResult,
            cluster: clusterResult,
            content: contentResult,
            technical: technicalResult,
            snippet: snippetResult,
            authority: authorityResult,
            competitor: competitorResult,
            coordinator: coordinatorResult
        });
        logStep('Rapport généré', 'done');

        console.log(`
╔════════════════════════════════════════════════════════════════╗
║           ✅ ANALYSE TERMINÉE AVEC SUCCÈS                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║   📁 Résultats: .agent/seo-architecte/outputs/                  ║
║   📄 Rapport: full-report.md                                    ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
    `);

    } catch (error) {
        logStep(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
        console.error(error);
        process.exit(1);
    }
}

function generateFullReport(projectName: string, results: Record<string, unknown>): void {
    const reportPath = path.join(OUTPUTS_DIR, 'full-report.md');
    const timestamp = new Date().toLocaleString('fr-FR');

    const report = `# 📊 Rapport SEO Complet - ${projectName}

**Généré le:** ${timestamp}

---

## 📋 Résumé Exécutif

${(results.coordinator as { synthese?: string })?.synthese || 'Synthèse non disponible'}

---

## 🎯 Quick Wins (Actions Prioritaires)

${((results.coordinator as { quickWins?: Array<{ titre: string; description: string }> })?.quickWins || [])
            .map((qw, i) => `${i + 1}. **${qw.titre}**: ${qw.description}`)
            .join('\n')}

---

## 🏗️ Architecture des Clusters

${((results.cluster as { clusters?: Array<{ nom: string; funnel: string; description: string }> })?.clusters || [])
            .map(c => `### ${c.nom} (${c.funnel})\n${c.description}`)
            .join('\n\n')}

---

## 📝 Tableau de Contenu (${((results.content as { tableauContenu?: unknown[] })?.tableauContenu || []).length} articles)

| # | Titre | Cluster | Intent | Score |
|---|-------|---------|--------|-------|
${((results.content as { tableauContenu?: Array<{ titreH1: string; cluster: string; intent: string; score: { prioriteGlobale?: number } }> })?.tableauContenu || [])
            .map((a, i) => `| ${i + 1} | ${a.titreH1} | ${a.cluster} | ${a.intent} | ${a.score?.prioriteGlobale || 'N/A'} |`)
            .join('\n')}

---

## 📁 Fichiers Générés

- \`01-strategic-analysis.json\`
- \`02-cluster-architecture.json\`
- \`03-content-table.json\`
- \`04-technical-optimization.json\`
- \`05-snippet-strategy.json\`
- \`06-authority-strategy.json\`
- \`07-sge-optimization.json\`
- \`08-competitor-analysis.json\`
- \`09-coordinator-summary.json\`
`;

    fs.writeFileSync(reportPath, report, 'utf-8');
}

// Run the analysis
runFullAnalysis();
