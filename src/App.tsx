import { useState, useEffect } from 'react';
import { Navbar, type TabType } from './components/Navbar';
import { FinoraSidebar } from './components/FinoraSidebar';
import { LandingPage } from './components/LandingPage';
import { LivePersonDashboard } from './components/LivePersonDashboard';
import { QueryStudio } from './components/QueryStudio';
import { PipelineFlowchart } from './components/PipelineFlowchart';
import { FinancialReportView } from './components/FinancialReportView';
import { StepDetailsDrawer } from './components/StepDetailsDrawer';
import { DatabaseInspector } from './components/DatabaseInspector';
import { FormulaSandbox } from './components/FormulaSandbox';
import { ArchitectureDocView } from './components/ArchitectureDocView';
import { AuthModal } from './components/AuthModal';

import { FinoraProvider, useFinora } from './data/FinoraContext';
import { FinoraOnboarding } from './components/FinoraOnboarding';
import { FinancialCommandCenter } from './components/FinancialCommandCenter';
import { TransactionsView } from './components/TransactionsView';
import { SpendingIntelligenceView } from './components/SpendingIntelligenceView';
import { BudgetManagementView } from './components/BudgetManagementView';
import { InvestmentsPortfolioView } from './components/InvestmentsPortfolioView';
import { StockMarketView } from './components/StockMarketView';
import { MutualFundView } from './components/MutualFundView';
import { GoalPlanner } from './components/GoalPlanner';
import { FinoraCopilotView } from './components/FinoraCopilotView';
import { FinancialMirrorAndHealthView } from './components/FinancialMirrorAndHealthView';
import { FinoraToolsAndReportsView } from './components/FinoraToolsAndReportsView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { AIModePlanStudio } from './components/AIModePlanStudio';
import { DeveloperPortal } from './components/DeveloperPortal';

import { TaxPlanner } from './components/TaxPlanner';
import { DebtPayoffStudio } from './components/DebtPayoffStudio';
import { PortfolioRebalancer } from './components/PortfolioRebalancer';

import type { 
  PipelineStepId, 
  PipelineStepState, 
  FullPipelineExecution 
} from './types/pipeline';
import { MOCK_FINANCIAL_DATABASE } from './data/mockDatabase';
import { 
  INITIAL_STEP_STATES, 
  detectIntent, 
  executeDatabaseQuery, 
  calculateFinancialMetrics, 
  createStructuredContext, 
  runLLMReasoning, 
  generateFinancialExplanation 
} from './engine/pipelineEngine';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'developer'>('login');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [question, setQuestion] = useState<string>(
    'Am I on track to retire at 55 with my current portfolio net worth, liquid savings, and $3,500 monthly investment contribution?'
  );

  const handleOpenAuthModal = (tab: 'login' | 'signup' | 'developer') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const [dbState, setDbState] = useState(MOCK_FINANCIAL_DATABASE);

  const [currentExecution, setCurrentExecution] = useState<FullPipelineExecution>({
    id: `exec_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    question: question,
    steps: { ...INITIAL_STEP_STATES },
    isExecuting: false,
    activeStepId: null,
  });

  const [inspectedStepId, setInspectedStepId] = useState<PipelineStepId | null>(null);

  useEffect(() => {
    handleRunPipeline();
  }, []);

  const handleRunPipeline = async () => {
    if (currentExecution.isExecuting || !question.trim()) return;

    const execId = `exec_${Date.now()}`;

    const resetSteps = Object.keys(INITIAL_STEP_STATES).reduce((acc, key) => {
      const stepKey = key as PipelineStepId;
      acc[stepKey] = { ...INITIAL_STEP_STATES[stepKey], status: 'idle', durationMs: undefined };
      return acc;
    }, {} as Record<PipelineStepId, PipelineStepState>);

    const newExec: FullPipelineExecution = {
      id: execId,
      timestamp: new Date().toLocaleTimeString(),
      question: question,
      steps: resetSteps,
      isExecuting: true,
      activeStepId: 'user_question',
    };

    setCurrentExecution(newExec);

    const updateStep = (
      stepId: PipelineStepId, 
      status: PipelineStepState['status'], 
      durationMs?: number, 
      outputSummary?: string
    ) => {
      setCurrentExecution((prev) => ({
        ...prev,
        activeStepId: status === 'running' ? stepId : prev.activeStepId,
        steps: {
          ...prev.steps,
          [stepId]: {
            ...prev.steps[stepId],
            status,
            durationMs,
            outputSummary,
          },
        },
      }));
    };

    updateStep('user_question', 'running');
    await new Promise((r) => setTimeout(r, 120));
    updateStep('user_question', 'completed', 120, 'Captured inquiry parameters');

    updateStep('intent_detection', 'running');
    await new Promise((r) => setTimeout(r, 220));
    const intent = detectIntent(question);
    updateStep('intent_detection', 'completed', 220, `Detected: ${intent.intentCode}`);

    updateStep('identify_required_data', 'running');
    await new Promise((r) => setTimeout(r, 150));
    updateStep('identify_required_data', 'completed', 150, 'Mapped user_profiles, accounts, holdings, liabilities');

    updateStep('query_database', 'running');
    await new Promise((r) => setTimeout(r, 280));
    const dbResult = executeDatabaseQuery(intent, dbState);
    updateStep('query_database', 'completed', 280, `Fetched ${dbResult.rowCount} DB records in ${dbResult.executionTimeMs}ms`);

    updateStep('calculate_metrics', 'running');
    await new Promise((r) => setTimeout(r, 200));
    const metrics = calculateFinancialMetrics(intent, dbResult.data);
    updateStep('calculate_metrics', 'completed', 200, `Computed Net Worth: $${metrics.netWorth.toLocaleString()}, Sharpe: ${metrics.portfolioSharpeRatio}, DTI: ${metrics.debtToIncomeRatio}%`);

    updateStep('create_structured_context', 'running');
    await new Promise((r) => setTimeout(r, 140));
    const structuredContext = createStructuredContext(intent, dbResult, metrics);
    updateStep('create_structured_context', 'completed', 140, 'Synthesized prompt context payload');

    updateStep('llm_reasoning', 'running');
    const llmResponse = await runLLMReasoning(structuredContext);
    updateStep('llm_reasoning', 'completed', llmResponse.reasoningTimeMs, `LLM reasoned with model ${llmResponse.modelUsed} (${llmResponse.totalTokens} tokens)`);

    updateStep('financial_explanation', 'running');
    await new Promise((r) => setTimeout(r, 180));
    const explanation = generateFinancialExplanation(intent, metrics);
    updateStep('financial_explanation', 'completed', 180, 'Generated report & scenario guidance');

    setCurrentExecution((prev) => ({
      ...prev,
      intent,
      dbResult,
      metrics,
      structuredContext,
      llmResponse,
      explanation,
      isExecuting: false,
      activeStepId: null,
      steps: {
        ...prev.steps,
      }
    }));
  };

  const totalDuration = Object.values(currentExecution.steps).reduce(
    (acc, step) => acc + (step.durationMs || 0),
    0
  );

  const { setProfile, profile } = useFinora();

  // Show full screen without sidebar on landing and initial onboarding wizard
  const isFullScreenView = activeTab === 'landing' || activeTab === 'onboarding';

  return (
    <div className="min-h-screen bg-[#F6F6F2] text-[#101A15] font-sans selection:bg-[#1F7A52] selection:text-white flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isExecuting={currentExecution.isExecuting}
        activeStepName={
          currentExecution.activeStepId
            ? currentExecution.steps[currentExecution.activeStepId]?.title
            : undefined
        }
        onOpenAuthModal={handleOpenAuthModal}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 flex w-full">
        {/* PERSISTENT 11-ITEM SIDEBAR (VISIBLE ON DESKTOP & MOBILE DRAWER ON DASHBOARD/APP VIEWS) */}
        {!isFullScreenView && (
          <FinoraSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <main className={`flex-1 w-full overflow-x-hidden ${isFullScreenView ? '' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'}`}>
          {/* 0. LANDING PAGE */}
          {activeTab === 'landing' && (
            <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-20">
              <LandingPage 
                onOpenStudio={() => setActiveTab('dashboard')} 
                onOpenDashboard={() => setActiveTab('dashboard')}
                onOpenAuthModal={handleOpenAuthModal}
              />
            </div>
          )}

          {/* ONBOARDING FLOW */}
          {activeTab === 'onboarding' && (
            <div className="max-w-5xl mx-auto px-4 py-8">
              <FinoraOnboarding onComplete={() => setActiveTab('dashboard')} />
            </div>
          )}

          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <FinancialCommandCenter onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {/* 2. TRANSACTIONS & STATEMENT IMPORT */}
          {activeTab === 'transactions' && (
            <TransactionsView />
          )}

          {/* 3. EXPENSES & SPENDING INTELLIGENCE */}
          {activeTab === 'spending' && (
            <SpendingIntelligenceView />
          )}

          {/* 4. BUDGET MANAGEMENT */}
          {activeTab === 'budget' && (
            <BudgetManagementView />
          )}

          {/* 5. INVESTMENTS & PORTFOLIO ALLOCATION */}
          {activeTab === 'investments' && (
            <InvestmentsPortfolioView onNavigate={(tab) => setActiveTab(tab as TabType)} />
          )}

          {/* 6. STOCK MARKET INTELLIGENCE */}
          {activeTab === 'stock-market' && (
            <StockMarketView />
          )}

          {/* 7. MUTUAL FUNDS TRACKER */}
          {activeTab === 'mutual-funds' && (
            <MutualFundView />
          )}

          {/* 8. SMART FINANCIAL GOALS */}
          {activeTab === 'goals' && (
            <GoalPlanner />
          )}

          {/* 9. AI FINANCIAL ASSISTANT */}
          {activeTab === 'finance-ai' && (
            <FinoraCopilotView initialMode="general" />
          )}

          {/* 10. FINANCIAL REPORTS & EXPORTS */}
          {activeTab === 'reports' && (
            <FinoraToolsAndReportsView initialTab="reports" />
          )}

          {/* 11. PROFILE & SETTINGS */}
          {activeTab === 'settings' && (
            <ProfileSettingsView />
          )}

          {/* AUXILIARY & LEGACY VIEWS */}
          {activeTab === 'ai-plan' && <AIModePlanStudio />}
          {activeTab === 'ai-spender' && <FinoraCopilotView initialMode="spender" />}
          {activeTab === 'financial-mirror' && <FinancialMirrorAndHealthView initialTab="mirror" />}
          {activeTab === 'financial-health' && <FinancialMirrorAndHealthView initialTab="health" />}
          {activeTab === 'net-worth' && <FinancialMirrorAndHealthView initialTab="networth" />}
          {activeTab === 'simulator' && <FinoraToolsAndReportsView initialTab="simulator" />}
          {activeTab === 'calendar' && <FinoraToolsAndReportsView initialTab="calendar" />}
          {activeTab === 'tax' && <TaxPlanner />}
          {activeTab === 'debt' && <DebtPayoffStudio />}
          {activeTab === 'rebalance' && <PortfolioRebalancer />}

          {activeTab === 'live-dashboard' && (
            <LivePersonDashboard dbState={dbState} setDbState={setDbState} />
          )}

          {activeTab === 'studio' && (
            <div className="space-y-8">
              <QueryStudio
                question={question}
                setQuestion={setQuestion}
                onRunPipeline={handleRunPipeline}
                isExecuting={currentExecution.isExecuting}
                activeStepName={
                  currentExecution.activeStepId
                    ? currentExecution.steps[currentExecution.activeStepId]?.title
                    : undefined
                }
                executionTimeTotal={currentExecution.isExecuting ? undefined : totalDuration}
              />

              <PipelineFlowchart
                steps={currentExecution.steps}
                activeStepId={currentExecution.activeStepId}
                onSelectStep={(stepId) => setInspectedStepId(stepId)}
              />

              {currentExecution.explanation && currentExecution.metrics && (
                <FinancialReportView
                  explanation={currentExecution.explanation}
                  metrics={currentExecution.metrics}
                  question={currentExecution.question}
                />
              )}
            </div>
          )}

          {activeTab === 'database' && (
            <DatabaseInspector dbState={dbState} setDbState={setDbState} />
          )}

          {activeTab === 'formulas' && <FormulaSandbox />}

          {activeTab === 'architecture' && <ArchitectureDocView />}

          {activeTab === 'developer' && <DeveloperPortal />}
        </main>
      </div>

      <StepDetailsDrawer
        stepId={inspectedStepId}
        onClose={() => setInspectedStepId(null)}
        execution={currentExecution}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onLoginSuccess={(userName, isDev, needsOnboarding) => {
          if (isDev) {
            setActiveTab('developer');
          } else if (needsOnboarding || !profile.isOnboarded) {
            setActiveTab('onboarding');
          } else {
            setActiveTab('dashboard');
          }
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <FinoraProvider>
      <AppContent />
    </FinoraProvider>
  );
}

export default App;
