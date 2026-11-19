import React, { useState } from 'react';
import '../landing.css';
import { useFinora } from '../data/FinoraContext';

interface LandingPageProps {
  onOpenStudio?: () => void;
  onOpenDashboard?: () => void;
  onOpenAuthModal?: (tab: 'login' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenStudio, onOpenDashboard, onOpenAuthModal }) => {
  const { profile } = useFinora();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSideNav, setActiveSideNav] = useState<string>('Overview');

  // AI Categorizer Widget State
  const [queryText, setQueryText] = useState<string>('Starbucks Coffee & Bagel ₹480');
  const [classifiedData, setClassifiedData] = useState<{
    category: string;
    type: string;
    confidence: number;
    tip: string;
    color: string;
  }>({
    category: 'Food & Dining',
    type: 'Discretionary Lifestyle',
    confidence: 99.2,
    tip: 'Daily small treats accumulate. Cutting 2 times a week saves ~₹3,840/mo.',
    color: '#0E2A1E',
  });

  // Health Score Widget State
  const [savingsRate, setSavingsRate] = useState<number>(30);
  const [emergencyMonths, setEmergencyMonths] = useState<number>(6);
  const [investmentPercent, setInvestmentPercent] = useState<number>(25);
  const [dtiRatio, setDtiRatio] = useState<number>(15);

  // Scenario Matrix State
  const [selectedScenario, setSelectedScenario] = useState<'fire' | 'property' | 'balanced'>('fire');

  // SIP Simulator State
  const [amt, setAmt] = useState<number>(10000);
  const [yrs, setYrs] = useState<number>(10);
  const [ret, setRet] = useState<number>(12);
  const [step, setStep] = useState<number>(0);

  // Currency Formatter
  const inr = (n: number) => {
    const rounded = Math.round(n);
    const s = String(rounded);
    let last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    if (rest) last3 = ',' + last3;
    return '₹' + rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last3;
  };

  // AI Categorizer Handler
  const handleCategorize = (textToTest: string) => {
    const lower = textToTest.toLowerCase();
    if (lower.includes('sip') || lower.includes('nifty') || lower.includes('stock') || lower.includes('fund')) {
      setClassifiedData({
        category: 'Investments',
        type: 'Wealth Building Asset',
        confidence: 99.8,
        tip: 'Excellent habit! Compounding works best with consistency.',
        color: '#10B981',
      });
    } else if (lower.includes('uber') || lower.includes('flight') || lower.includes('petrol') || lower.includes('cab')) {
      setClassifiedData({
        category: 'Transport & Travel',
        type: 'Essential Mobility',
        confidence: 96.5,
        tip: 'Transport costs are within normal 12% spending bounds.',
        color: '#C98A2B',
      });
    } else if (lower.includes('rent') || lower.includes('electricity') || lower.includes('bill') || lower.includes('wifi')) {
      setClassifiedData({
        category: 'Bills & Utilities',
        type: 'Fixed Essential',
        confidence: 98.9,
        tip: 'Fixed monthly obligations are well-covered by primary income.',
        color: '#6366F1',
      });
    } else {
      setClassifiedData({
        category: 'Food & Dining',
        type: 'Discretionary Lifestyle',
        confidence: 97.4,
        tip: 'Small daily transactions. Consider setting a monthly dine-out cap.',
        color: '#107C47',
      });
    }
  };

  // Calculate Health Score (0 - 100)
  const calcHealthScore = () => {
    const score = Math.round(
      (savingsRate * 1.2) + 
      (emergencyMonths * 6) + 
      (investmentPercent * 0.8) - 
      (dtiRatio * 0.5)
    );
    return Math.min(100, Math.max(20, score));
  };

  const healthScore = calcHealthScore();

  // SIP Math Calculation
  const calculateSIP = () => {
    const P = amt;
    const Y = yrs;
    const r = ret / 100;
    const g = step / 100;
    const i = r / 12;

    let invested = 0;
    let value = 0;
    let contrib = P;

    for (let y = 0; y < Y; y++) {
      if (y > 0) contrib = contrib * (1 + g);
      for (let m = 0; m < 12; m++) {
        value = (value + contrib) * (1 + i);
        invested += contrib;
      }
    }

    const gain = Math.max(0, value - invested);
    const percentInvested = value > 0 ? Math.min(100, Math.max(0, Math.round((invested / value) * 100))) : 50;

    return {
      value,
      invested,
      gain,
      percentInvested,
      percentGain: 100 - percentInvested,
    };
  };

  const simResult = calculateSIP();

  return (
    <div className={`finora-landing ${darkMode ? 'dark-mode' : ''}`}>
      {/* HEADER */}
      <header>
        <div className="wrap nav">
          <a className="logo" href="#top">
            <span className="mark">F</span>
            <span>
              Finora<small>Understand today. Plan tomorrow.</small>
            </span>
          </a>

          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#ai-classifier">AI Categorizer</a></li>
            <li><a href="#health-index">Health Index</a></li>
            <li><a href="#simulator">SIP Simulator</a></li>
          </ul>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Dark Glass Mode"
            >
              {darkMode ? '☀️ Emerald' : '🌙 Dark Glass'}
            </button>

            {onOpenAuthModal && (
              <>
                <button 
                  className="btn btn-ghost"
                  onClick={() => onOpenAuthModal('login')}
                  style={{ border: '1px solid var(--line)', background: 'var(--white)', fontWeight: 700 }}
                >
                  Log In
                </button>
                <button 
                  className="btn btn-accent"
                  onClick={() => onOpenAuthModal('signup')}
                  style={{ fontWeight: 700 }}
                >
                  Sign Up
                </button>
              </>
            )}

            {onOpenDashboard && (
              <button className="btn btn-solid" style={{ background: '#10B981' }} onClick={onOpenDashboard}>
                Live Dashboard ⚡
              </button>
            )}

            {onOpenStudio && (
              <button className="btn btn-accent" onClick={onOpenStudio}>
                AI Studio
              </button>
            )}
            
            <button className="btn btn-solid" onClick={() => onOpenAuthModal ? onOpenAuthModal('signup') : (onOpenStudio ? onOpenStudio() : null)}>
              Get Started
            </button>

            <button
              className="menu-btn"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-nav open">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#ai-classifier" onClick={() => setMobileMenuOpen(false)}>AI Categorizer</a>
            <a href="#health-index" onClick={() => setMobileMenuOpen(false)}>Health Index</a>
            <a href="#simulator" onClick={() => setMobileMenuOpen(false)}>SIP Simulator</a>
            {onOpenStudio && (
              <button 
                className="btn btn-solid" 
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenStudio();
                }}
              >
                Launch AI Intelligence Studio ⚡
              </button>
            )}
          </div>
        )}
      </header>

      <main id="top">
        {/* HERO SECTION */}
        <div className="hero">
          <div className="hero-glow"></div>
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">
                <span className="dot"></span>Your money, your story, your AI insight
              </span>
              <h1>
                Understand Your Money.<br />Build Your Future.
              </h1>
              <p className="lede">
                Finora connects what you spend with what you save and invest — so your habits, your portfolio and your goals finally sit in one place, explained in plain language.
              </p>
              <div className="hero-cta">
                <button 
                  className="btn btn-solid btn-lg" 
                  onClick={onOpenStudio || (() => {
                    const el = document.getElementById('simulator');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  })}
                >
                  Get started for free
                </button>
                {onOpenStudio && (
                  <button className="btn btn-ghost btn-lg" onClick={onOpenStudio}>
                    Watch demo / Studio ⚡
                  </button>
                )}
              </div>

              <div className="pillars">
                <div>
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <h4>Track spending</h4>
                  <p>Know where your money actually goes.</p>
                </div>
                <div>
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 17l5-6 4 4 6-8" />
                    <path d="M18 7h3v3" />
                  </svg>
                  <h4>Analyse habits</h4>
                  <p>See the patterns behind numbers.</p>
                </div>
                <div>
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                  </svg>
                  <h4>Invest smarter</h4>
                  <p>Stocks and funds, measured properly.</p>
                </div>
                <div>
                  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="8" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <h4>Reach goals</h4>
                  <p>Check if today's pace gets you there.</p>
                </div>
              </div>
            </div>

            {/* DYNAMIC INTERACTIVE DASHBOARD PREVIEW MOCKUP */}
            <div className="mock">
              <div className="floating-pill-1">
                <span className="dot"></span> ⚡ AI Engine: Net Worth +12.4% YoY
              </div>

              <div className="panel app">
                <div className="side">
                  <div className="brand">
                    <span>F</span>Finora
                  </div>
                  {['Overview', 'Live Feed', 'AI Coach', 'Asset Matrix'].map((item) => (
                    <i
                      key={item}
                      className={activeSideNav === item ? 'on' : ''}
                      onClick={() => setActiveSideNav(item)}
                    >
                      {item}
                    </i>
                  ))}
                </div>

                <div className="body">
                  <div className="body-top">
                    <div>
                      <b>Dashboard ({activeSideNav})</b>
                      <em>Welcome back, {profile.name || 'User'}</em>
                    </div>
                    <span className="chip">This month ▾</span>
                  </div>

                  {activeSideNav === 'Overview' && (
                    <>
                      <div className="kpis">
                        <div className="kpi">
                          <span>Total balance</span>
                          <b className="num">₹2,45,600</b>
                          <span className="delta up">▲ 8.4% vs last month</span>
                          <svg className="spark" viewBox="0 0 100 26" preserveAspectRatio="none">
                            <polyline
                              points="0,20 14,17 28,19 42,12 56,14 70,8 84,9 100,3"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2.2"
                            />
                          </svg>
                        </div>
                        <div className="kpi">
                          <span>Total expenses</span>
                          <b className="num">₹45,680</b>
                          <span className="delta down">▼ 3.1% vs last month</span>
                          <svg className="spark" viewBox="0 0 100 26" preserveAspectRatio="none">
                            <polyline
                              points="0,8 14,12 28,7 42,15 56,11 70,17 84,14 100,19"
                              fill="none"
                              stroke="#E11D48"
                              strokeWidth="2.2"
                            />
                          </svg>
                        </div>
                        <div className="kpi">
                          <span>Investments</span>
                          <b className="num">₹3,75,200</b>
                          <span className="delta up">▲ 12.2% XIRR</span>
                          <svg className="spark" viewBox="0 0 100 26" preserveAspectRatio="none">
                            <polyline
                              points="0,22 14,18 28,20 42,13 56,15 70,9 84,6 100,4"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2.2"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="split">
                        <div className="donut">
                          <div>
                            <b className="num">₹45,680</b>
                            <span>spent</span>
                          </div>
                        </div>

                        <div className="legend">
                          <div>
                            <span className="legend-left">
                              <span className="sw" style={{ background: '#0B2319' }}></span>
                              <span>Food &amp; dining<s>₹14,180</s></span>
                            </span>
                            <b className="num">31%</b>
                          </div>
                          <div>
                            <span className="legend-left">
                              <span className="sw" style={{ background: '#10B981' }}></span>
                              <span>Shopping<s>₹10,050</s></span>
                            </span>
                            <b className="num">22%</b>
                          </div>
                          <div>
                            <span className="legend-left">
                              <span className="sw" style={{ background: '#7FBE9D' }}></span>
                              <span>Bills &amp; utilities<s>₹7,760</s></span>
                            </span>
                            <b className="num">17%</b>
                          </div>
                          <div>
                            <span className="legend-left">
                              <span className="sw" style={{ background: '#D97706' }}></span>
                              <span>Transport<s>₹6,850</s></span>
                            </span>
                            <b className="num">15%</b>
                          </div>
                          <div>
                            <span className="legend-left">
                              <span className="sw" style={{ background: '#D9DED9' }}></span>
                              <span>Others<s>₹6,840</s></span>
                            </span>
                            <b className="num">15%</b>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeSideNav === 'Live Feed' && (
                    <div style={{ padding: '12px 0', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                        <div><b>Nifty 50 Index Fund SIP</b><small style={{ display: 'block', color: 'var(--muted)' }}>Today, 09:30 AM · Auto-debit</small></div>
                        <span className="num up" style={{ fontWeight: 700 }}>+₹10,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                        <div><b>Swiggy Food Delivery</b><small style={{ display: 'block', color: 'var(--muted)' }}>Yesterday, 08:15 PM · Food & Dining</small></div>
                        <span className="num down" style={{ fontWeight: 700 }}>-₹640</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                        <div><b>Monthly Salary Credit</b><small style={{ display: 'block', color: 'var(--muted)' }}>1st Aug, 00:01 AM · Income</small></div>
                        <span className="num up" style={{ fontWeight: 700 }}>+₹72,000</span>
                      </div>
                    </div>
                  )}

                  {activeSideNav === 'AI Coach' && (
                    <div style={{ background: 'var(--leaf-soft)', padding: '16px', borderRadius: '12px', fontSize: '0.9rem' }}>
                      <b style={{ color: 'var(--leaf)', display: 'block', marginBottom: '6px' }}>🤖 Finora AI Advisor Note:</b>
                      <p style={{ color: 'var(--ink)', lineHeight: '1.5' }}>
                        "{profile.name ? profile.name.split(' ')[0] : 'User'}, your discretionary food spending fell by 3.1% this month. If you divert that saved ₹1,420 into your monthly SIP, your projected net worth at 55 increases by <strong>₹4,82,000</strong>!"
                      </p>
                    </div>
                  )}

                  {activeSideNav === 'Asset Matrix' && (
                    <div style={{ padding: '10px 0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ background: 'var(--paper)', padding: '12px', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Equity Allocation</span>
                          <b className="num" style={{ display: 'block', fontSize: '1.1rem' }}>64%</b>
                        </div>
                        <div style={{ background: 'var(--paper)', padding: '12px', borderRadius: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Debt & Cash</span>
                          <b className="num" style={{ display: 'block', fontSize: '1.1rem' }}>36%</b>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Worth Summary Panel */}
                  <div className="float">
                    <div className="float-top">
                      <span>Total Net Worth Portfolio</span>
                      <b className="num">₹6,20,800</b>
                    </div>
                    <ul>
                      <li>
                        <span>Mutual funds</span>
                        <b className="num">₹2,41,400</b>
                      </li>
                      <li>
                        <span>Stocks</span>
                        <b className="num">₹1,33,800</b>
                      </li>
                      <li>
                        <span>Cash &amp; savings</span>
                        <b className="num">₹2,45,600</b>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CREATIVE FEATURE 1: INTERACTIVE AI CATEGORY CLASSIFIER DEMO */}
        <section id="ai-classifier" style={{ background: 'var(--paper)', padding: '72px 0' }}>
          <div className="wrap">
            <div className="head">
              <h2>Try the Finora AI Categorizer Sandbox</h2>
              <p>Type any real transaction or click a sample below to see how Finora's deterministic rule engine instantly sorts and analyzes your money.</p>
            </div>

            <div className="ai-demo-card">
              <div className="ai-demo-grid">
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem' }}>Enter sample transaction:</label>
                  <div className="ai-input-box">
                    <input
                      type="text"
                      value={queryText}
                      onChange={(e) => {
                        setQueryText(e.target.value);
                        handleCategorize(e.target.value);
                      }}
                      placeholder="e.g. Starbucks coffee, Uber cab, Nifty 50 SIP..."
                    />
                    <button
                      className="btn btn-solid"
                      onClick={() => handleCategorize(queryText)}
                    >
                      Classify ⚡
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {['Starbucks Coffee ₹480', 'Nifty 50 Index SIP ₹10,000', 'Uber ride to Airport ₹1,250', 'WiFi Broadband Bill ₹999'].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => {
                          setQueryText(sample);
                          handleCategorize(sample);
                        }}
                        style={{
                          fontSize: '0.78rem',
                          padding: '4px 10px',
                          borderRadius: '100px',
                          border: '1px solid var(--line)',
                          background: 'var(--white)',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ai-result-badge">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>CLASSIFICATION RESULT</span>
                    <span style={{ fontSize: '0.78rem', background: 'var(--leaf-soft)', color: 'var(--leaf)', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                      {classifiedData.confidence}% Confidence
                    </span>
                  </div>

                  <h3 style={{ margin: '10px 0 4px', color: classifiedData.color }}>
                    {classifiedData.category}
                  </h3>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '12px' }}>
                    Tag: {classifiedData.type}
                  </div>

                  <div style={{ fontSize: '0.88rem', background: 'var(--paper)', padding: '12px', borderRadius: '8px', lineHeight: '1.5' }}>
                    💡 <strong>Smart AI Insight:</strong> {classifiedData.tip}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CREATIVE FEATURE 2: FINANCIAL HEALTH SCORE METER */}
        <section id="health-index" style={{ padding: '72px 0' }}>
          <div className="wrap">
            <div className="head">
              <h2>Your Financial Health Index Meter</h2>
              <p>Adjust your saving habits and debt metrics below to see your overall Financial Velocity Score update in real time.</p>
            </div>

            <div className="health-widget">
              <div className="health-grid">
                <div>
                  <div className="field">
                    <label>Monthly Savings Rate: <output>{savingsRate}%</output></label>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={savingsRate}
                      onChange={(e) => setSavingsRate(Number(e.target.value))}
                    />
                  </div>

                  <div className="field">
                    <label>Emergency Fund Coverage: <output>{emergencyMonths} Months</output></label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={emergencyMonths}
                      onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                    />
                  </div>

                  <div className="field">
                    <label>Monthly Investment Allocation: <output>{investmentPercent}%</output></label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={investmentPercent}
                      onChange={(e) => setInvestmentPercent(Number(e.target.value))}
                    />
                  </div>

                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Debt-To-Income (DTI) Ratio: <output>{dtiRatio}%</output></label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={dtiRatio}
                      onChange={(e) => setDtiRatio(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div 
                    className="score-circle" 
                    style={{ '--score-percent': `${healthScore}%` } as React.CSSProperties}
                  >
                    <div className="score-inner">
                      <b className="num">{healthScore}</b>
                      <span>HEALTH SCORE</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>
                      {healthScore >= 80 ? '🌟 Tier 1: Outstanding Wealth Velocity' : healthScore >= 60 ? '👍 Tier 2: Solid Financial Track' : '⚡ Tier 3: Needs Portfolio Rebalance'}
                    </h3>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '36ch', marginInline: 'auto' }}>
                      {healthScore >= 80 
                        ? 'Your compounding velocity is in the top 5% bracket! Excellent liquidity and investment ratio.' 
                        : 'Great foundation. Consider bumping your monthly SIP contribution by 5% to unlock Grade A status.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CREATIVE FEATURE 3: FINANCIAL FUTURE SCENARIO MATRIX */}
        <section className="paper" style={{ padding: '72px 0' }}>
          <div className="wrap">
            <div className="head">
              <h2>Compare Future Financial Paths</h2>
              <p>Pick a life goal scenario to visualize how allocation choices impact your long-term projected wealth.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
              <div
                onClick={() => setSelectedScenario('fire')}
                style={{
                  background: selectedScenario === 'fire' ? 'var(--forest)' : 'var(--white)',
                  color: selectedScenario === 'fire' ? '#fff' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <b style={{ fontSize: '1.05rem', display: 'block' }}>🚀 Path A: FIRE at 45</b>
                <span style={{ fontSize: '0.82rem', opacity: 0.8, display: 'block', marginTop: '4px' }}>
                  Aggressive ₹25,000/mo investment in low-cost index funds.
                </span>
              </div>

              <div
                onClick={() => setSelectedScenario('property')}
                style={{
                  background: selectedScenario === 'property' ? 'var(--forest)' : 'var(--white)',
                  color: selectedScenario === 'property' ? '#fff' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <b style={{ fontSize: '1.05rem', display: 'block' }}>🏠 Path B: Buy Dream Home</b>
                <span style={{ fontSize: '0.82rem', opacity: 0.8, display: 'block', marginTop: '4px' }}>
                  ₹15,000/mo home loan EMI + ₹10,000/mo SIP SIP.
                </span>
              </div>

              <div
                onClick={() => setSelectedScenario('balanced')}
                style={{
                  background: selectedScenario === 'balanced' ? 'var(--forest)' : 'var(--white)',
                  color: selectedScenario === 'balanced' ? '#fff' : 'var(--ink)',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <b style={{ fontSize: '1.05rem', display: 'block' }}>🌴 Path C: Travel & Balance</b>
                <span style={{ fontSize: '0.82rem', opacity: 0.8, display: 'block', marginTop: '4px' }}>
                  ₹10,000/mo investment + annual travel budget fund.
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '20px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {selectedScenario === 'fire' ? 'Projected FIRE Portfolio at Age 45' : selectedScenario === 'property' ? 'Projected Real Estate Equity + SIP Fund' : 'Projected Wealth & Travel Fund'}
                  </h3>
                  <small style={{ color: 'var(--muted)' }}>15-Year Projected Horizon @ 12% CAGR</small>
                </div>
                <b className="num" style={{ fontSize: '2rem', color: 'var(--leaf)' }}>
                  {selectedScenario === 'fire' ? '₹1.24 Crore' : selectedScenario === 'property' ? '₹85.4 Lakhs' : '₹52.1 Lakhs'}
                </b>
              </div>

              <div className="track" style={{ height: '14px' }}>
                <div 
                  className="fill" 
                  style={{ 
                    width: selectedScenario === 'fire' ? '92%' : selectedScenario === 'property' ? '68%' : '44%',
                    background: selectedScenario === 'fire' ? 'var(--leaf)' : selectedScenario === 'property' ? 'var(--amber)' : 'var(--indigo)'
                  }} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAND */}
        <div className="band">
          <div className="wrap">
            <div>
              <b className="num">8</b>
              <span>categories tracked automatically</span>
            </div>
            <div>
              <b className="num">2</b>
              <span>asset classes analysed</span>
            </div>
            <div>
              <b className="num">4</b>
              <span>steps from raw data to insight</span>
            </div>
            <div>
              <b className="num">1</b>
              <span>place for spending, saving, investing</span>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features">
          <div className="wrap">
            <div className="head">
              <h2>Everything you need to take control of your finances</h2>
              <p>Four capabilities that work together — the spending side informs the investing side, and both feed your goals.</p>
            </div>

            <div className="feat">
              <article className="card">
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="M3 10h18M7 15h4" />
                </svg>
                <h3>Spending intelligence</h3>
                <p>
                  Add expenses by hand or import a bank statement from Excel or CSV. Finora sorts each transaction into a category and shows the pattern in charts and summaries.
                </p>
                <div className="tags">
                  <span className="tag">Food</span>
                  <span className="tag">Shopping</span>
                  <span className="tag">Travel</span>
                  <span className="tag">Bills</span>
                  <span className="tag">Entertainment</span>
                  <span className="tag">Education</span>
                  <span className="tag">Healthcare</span>
                  <span className="tag">Subscriptions</span>
                </div>
              </article>

              <article className="card">
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19V5M4 19h16" />
                  <path d="M8 15l4-5 3 3 5-7" />
                </svg>
                <h3>Financial behaviour analysis</h3>
                <p>
                  Finora reads your activity for recurring purchases, weekend spikes, creeping subscriptions and the split between essential and discretionary spending — then says what it means in one line.
                </p>
                <div className="bars">
                  <div className="bar">
                    <span>Essentials</span>
                    <span className="track">
                      <i className="fill" style={{ width: '63%' }}></i>
                    </span>
                    <b className="num">63%</b>
                  </div>
                  <div className="bar">
                    <span>Lifestyle</span>
                    <span className="track">
                      <i className="fill" style={{ width: '24%', background: '#7FBE9D' }}></i>
                    </span>
                    <b className="num">24%</b>
                  </div>
                  <div className="bar">
                    <span>Recurring</span>
                    <span className="track">
                      <i className="fill" style={{ width: '13%', background: '#D97706' }}></i>
                    </span>
                    <b className="num">13%</b>
                  </div>
                </div>
              </article>

              <article className="card">
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v18M5 8l7-5 7 5" />
                  <circle cx="12" cy="15" r="4" />
                </svg>
                <h3>Investment intelligence</h3>
                <p>
                  Track stocks and mutual funds together: portfolio value, returns, volatility, allocation, sector exposure, SIP performance and how concentrated you are in any one holding.
                </p>
                <div className="tags">
                  <span className="tag">Returns</span>
                  <span className="tag">Risk &amp; volatility</span>
                  <span className="tag">Allocation</span>
                  <span className="tag">Sector exposure</span>
                  <span className="tag">SIP tracking</span>
                  <span className="tag">Fund comparison</span>
                </div>
              </article>

              <article className="card">
                <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l3 2" />
                </svg>
                <h3>Financial goals</h3>
                <p>
                  Set a goal — emergency fund, a course, a trip, a vehicle, long-term wealth — and Finora checks whether your current saving and investing pace actually gets you there in time.
                </p>
                <div className="bars">
                  <div className="bar">
                    <span>Emergency fund</span>
                    <span className="track">
                      <i className="fill" style={{ width: '78%' }}></i>
                    </span>
                    <b className="num">78%</b>
                  </div>
                  <div className="bar">
                    <span>Higher studies</span>
                    <span className="track">
                      <i className="fill" style={{ width: '41%', background: '#7FBE9D' }}></i>
                    </span>
                    <b className="num">41%</b>
                  </div>
                  <div className="bar">
                    <span>New bike</span>
                    <span className="track">
                      <i className="fill" style={{ width: '22%', background: '#D97706' }}></i>
                    </span>
                    <b className="num">22%</b>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* SIP SIMULATOR */}
        <section className="paper" id="simulator">
          <div className="wrap">
            <div className="head">
              <h2>Test a decision before you make it</h2>
              <p>
                Move the sliders to see what a monthly investment could grow into. The maths is the standard SIP future-value formula — nothing is guaranteed, and the return you pick is an assumption, not a promise.
              </p>
            </div>

            <div className="sim">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="field">
                  <label htmlFor="amt">
                    Monthly investment <output id="amtOut">{inr(amt)}</output>
                  </label>
                  <input
                    type="range"
                    id="amt"
                    min="1000"
                    max="50000"
                    step="500"
                    value={amt}
                    onChange={(e) => setAmt(Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="yrs">
                    Time period <output id="yrsOut">{yrs} {yrs === 1 ? 'year' : 'years'}</output>
                  </label>
                  <input
                    type="range"
                    id="yrs"
                    min="1"
                    max="30"
                    step="1"
                    value={yrs}
                    onChange={(e) => setYrs(Number(e.target.value))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="ret">
                    Assumed annual return <output id="retOut">{ret}%</output>
                  </label>
                  <input
                    type="range"
                    id="ret"
                    min="4"
                    max="18"
                    step="0.5"
                    value={ret}
                    onChange={(e) => setRet(Number(e.target.value))}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="step">
                    Annual step-up in contribution <output id="stepOut">{step}%</output>
                  </label>
                  <input
                    type="range"
                    id="step"
                    min="0"
                    max="20"
                    step="1"
                    value={step}
                    onChange={(e) => setStep(Number(e.target.value))}
                  />
                </div>
              </form>

              <div className="result">
                <small>Estimated value at the end</small>
                <div className="big num">{inr(simResult.value)}</div>
                <small>
                  {inr(simResult.invested)} invested · {inr(simResult.gain)} estimated growth
                </small>

                <div className="stack" aria-hidden="true">
                  <i
                    style={{
                      background: 'var(--forest)',
                      width: `${simResult.percentInvested}%`,
                    }}
                  ></i>
                  <i
                    style={{
                      background: 'var(--emerald)',
                      width: `${simResult.percentGain}%`,
                    }}
                  ></i>
                </div>

                <div className="breakdown">
                  <div>
                    <span>Total invested</span>
                    <b className="num">{inr(simResult.invested)}</b>
                  </div>
                  <div>
                    <span>Estimated growth</span>
                    <b className="num">{inr(simResult.gain)}</b>
                  </div>
                </div>

                <p className="disclaimer">
                  Calculated as a monthly compounded SIP: each contribution grows for the months remaining. Real returns vary, markets fall as well as rise, and Finora does not forecast or guarantee performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CLOSE CTA */}
        <div className="close">
          <div className="wrap">
            <h2>Start with one month of data</h2>
            <p>
              Import a single statement and Finora will show you the shape of your money — categories, patterns, and what changing one habit would be worth.
            </p>
            <button 
              className="btn btn-solid btn-lg" 
              onClick={onOpenStudio || (() => {
                const el = document.getElementById('simulator');
                el?.scrollIntoView({ behavior: 'smooth' });
              })}
            >
              Get started for free
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="wrap fgrid">
          <a className="logo" href="#top">
            <span className="mark">F</span>
            <span>Finora</span>
          </a>
          <nav>
            <a href="#features">Features</a>
            <a href="#ai-classifier">AI Categorizer</a>
            <a href="#health-index">Health Index</a>
            <a href="#simulator">SIP Simulator</a>
            <a href="#top">Privacy</a>
          </nav>
          <span>Finora is an analysis tool, not investment advice.</span>
        </div>
      </footer>
    </div>
  );
};
