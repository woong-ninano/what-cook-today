
import React, { useState, useEffect } from 'react';
import { Step, UserChoices, RecipeResult, CommunityCache } from './types.ts';
import WelcomeStep from './components/steps/WelcomeStep.tsx';
import ModeSelectionStep from './components/steps/ModeSelectionStep.tsx';
import IngredientsStep from './components/steps/IngredientsStep.tsx';
import SeasonalStep from './components/steps/SeasonalStep.tsx';
import ConvenienceStep from './components/steps/ConvenienceStep.tsx';
import CuisineStep from './components/steps/CuisineStep.tsx';
import SuggestionStep from './components/steps/SuggestionStep.tsx';
import PreferencesStep from './components/steps/PreferencesStep.tsx';
import EnvironmentStep from './components/steps/EnvironmentStep.tsx';
import LoadingStep from './components/steps/LoadingStep.tsx';
import ResultView from './components/ResultView.tsx';
import CommunityView from './components/CommunityView.tsx';
import { generateRecipe, fetchSuggestions, fetchSeasonalIngredients, fetchConvenienceTopics, generateDishImage } from './services/gemini.ts';
import { saveRecipeToDB, supabase, fetchRecipeById } from './services/supabase.ts';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Welcome);
  const [activeTab, setActiveTab] = useState<'home' | 'community'>('home');
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Recipe Generation History
  const [recipeHistory, setRecipeHistory] = useState<RecipeResult[]>([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState<number>(-1);

  // Community Cache State
  const [communityCache, setCommunityCache] = useState<CommunityCache>({
    recipes: [],
    searchTerm: '',
    sortBy: 'latest',
    page: 0,
    hasMore: true,
    scrollPosition: 0
  });

  const [choices, setChoices] = useState<UserChoices>({
    mode: 'fridge', ingredients: '', sauces: [], cuisine: '자유 퓨전',
    partner: '👤 혼밥', theme: '🍚 든든한 한끼', tools: [], level: 'Lv.2 평범한 주부'
  });
  
  const [suggestions, setSuggestions] = useState({ subIngredients: [], sauces: [] });
  const [seasonalItems, setSeasonalItems] = useState<{name: string, desc: string}[]>([]);
  const [convenienceItems, setConvenienceItems] = useState<{name: string, desc: string}[]>([]);
  const [convenienceType, setConvenienceType] = useState<'meal' | 'snack'>('meal');

  useEffect(() => {
    // URL Sync
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setStep(event.state.step);
        setActiveTab(event.state.activeTab || 'home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Supabase Auth
    if (supabase) {
      (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
        setUser(session?.user ?? null);
      });
      (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null);
      });
    }

    // Restore from SessionStorage if login redirect happened
    const savedHistory = sessionStorage.getItem('recipe_restore_history');
    const savedIndex = sessionStorage.getItem('recipe_restore_index');
    if (savedHistory && savedIndex) {
      try {
        setRecipeHistory(JSON.parse(savedHistory));
        setCurrentRecipeIndex(parseInt(savedIndex, 10));
        setStep(Step.Result);
        setActiveTab('home');
        sessionStorage.removeItem('recipe_restore_history');
        sessionStorage.removeItem('recipe_restore_index');
      } catch (e) {}
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextStep: Step, nextTab: 'home' | 'community' = 'home', method: 'push' | 'replace' = 'push') => {
    setStep(nextStep);
    setActiveTab(nextTab);
    
    try {
      const url = `?tab=${nextTab}&step=${nextStep}`;
      const state = { step: nextStep, activeTab: nextTab };
      if (method === 'push') {
        window.history.pushState(state, '', url);
      } else {
        window.history.replaceState(state, '', url);
      }
    } catch (e) {}
  };

  const startGeneration = async (isRegen: boolean = false, overridePrompt?: string) => {
    navigateTo(Step.Loading, 'home', 'replace');
    try {
      const finalChoices = overridePrompt ? { ...choices, ingredients: overridePrompt, theme: choices.mode === 'convenience' ? '편의점 꿀조합' : choices.theme } : choices;
      const recipe = await generateRecipe(finalChoices, isRegen);
      
      let imageUrl: string | undefined = undefined;
      if (recipe.dishName) {
        imageUrl = await generateDishImage(recipe.dishName);
      }

      const savedData = await saveRecipeToDB({ ...recipe, imageUrl });
      const newResult = { 
        ...recipe, 
        imageUrl, 
        id: savedData?.id, 
        created_at: savedData?.created_at 
      };
      
      const newHistory = [...recipeHistory.slice(0, currentRecipeIndex + 1), newResult];
      setRecipeHistory(newHistory);
      setCurrentRecipeIndex(newHistory.length - 1);
      navigateTo(Step.Result, 'home', 'push');
    } catch (err) {
      console.error("Generation flow error:", err);
      alert("AI 셰프가 고민에 빠졌습니다. 잠시 후 다시 시도해 주세요!");
      navigateTo(Step.Welcome, 'home', 'replace');
    }
  };

  const handleCommunityRecipeSelect = async (liteRecipe: RecipeResult) => {
    if (!liteRecipe.id) return;
    setIsLoading(true);
    try {
      const fullRecipe = await fetchRecipeById(liteRecipe.id);
      if (fullRecipe) {
        setRecipeHistory([fullRecipe]);
        setCurrentRecipeIndex(0);
        navigateTo(Step.Result, 'home', 'push');
      } else {
        alert("레시피 상세 내용을 가져오지 못했습니다.");
      }
    } catch (err) {
      console.error("Community select error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSeasonalItems = async (isMore: boolean = false) => {
    setIsLoading(true);
    try {
      const excluded = isMore ? seasonalItems.map(i => i.name) : [];
      const items = await fetchSeasonalIngredients(excluded);
      if (isMore) setSeasonalItems(prev => [...prev, ...items]);
      else setSeasonalItems(items);
      setChoices(prev => ({ ...prev, mode: 'seasonal', ingredients: '' }));
      navigateTo(Step.SeasonalSelection, 'home');
    } catch (e) {} finally { setIsLoading(false); }
  };

  const loadConvenienceItems = async (type: 'meal' | 'snack', isMore: boolean = false) => {
    setIsLoading(true);
    try {
      const excluded = isMore ? convenienceItems.map(i => i.name) : [];
      const items = await fetchConvenienceTopics(excluded, type);
      if (isMore) setConvenienceItems(prev => [...prev, ...items]);
      else setConvenienceItems(items);
      setConvenienceType(type);
      setChoices(prev => ({ ...prev, mode: 'convenience' }));
      navigateTo(Step.ConvenienceSelection, 'home');
    } catch (e) {} finally { setIsLoading(false); }
  };

  const renderContent = () => {
    if (activeTab === 'community') {
      return (
        <CommunityView 
          onSelectRecipe={handleCommunityRecipeSelect} 
          user={user} 
          cache={communityCache}
          onUpdateCache={(update) => setCommunityCache(prev => ({ ...prev, ...update }))}
        />
      );
    }
    
    if (isLoading) return <LoadingStep customMessage="데이터를 불러오는 중입니다..." />;

    const result = currentRecipeIndex >= 0 ? recipeHistory[currentRecipeIndex] : null;

    switch (step) {
      case Step.Welcome: 
        return <WelcomeStep onNext={() => navigateTo(Step.ModeSelection, 'home')} />;
      
      case Step.ModeSelection: 
        return <ModeSelectionStep 
          onFridge={() => { setChoices(prev => ({ ...prev, mode: 'fridge' })); navigateTo(Step.Ingredients, 'home'); }} 
          onSeasonal={() => loadSeasonalItems()} 
          onConvenience={() => loadConvenienceItems('meal')} 
          onBack={() => navigateTo(Step.Welcome, 'home')} 
        />;
      
      case Step.Ingredients: 
        return <IngredientsStep 
          choices={choices} 
          setChoices={setChoices} 
          onNext={async () => { 
            setIsLoading(true); 
            try { 
              const data = await fetchSuggestions(choices.ingredients); 
              setSuggestions(data); 
              navigateTo(Step.Suggestions, 'home'); 
            } catch(e){} finally { setIsLoading(false); } 
          }} 
          onBack={() => navigateTo(Step.ModeSelection, 'home')} 
        />;

      case Step.SeasonalSelection:
        return <SeasonalStep 
          choices={choices} 
          setChoices={setChoices} 
          items={seasonalItems} 
          onNext={() => navigateTo(Step.Preferences, 'home')} 
          onBack={() => navigateTo(Step.ModeSelection, 'home')} 
          onMore={() => loadSeasonalItems(true)}
        />;

      case Step.ConvenienceSelection:
        return <ConvenienceStep 
          type={convenienceType} 
          items={convenienceItems} 
          onSelect={(name) => { setChoices(prev => ({ ...prev, ingredients: name })); navigateTo(Step.Preferences, 'home'); }} 
          onLoadMore={() => loadConvenienceItems(convenienceType, true)} 
          onLoadSnack={() => loadConvenienceItems('snack')} 
          onLoadMeal={() => loadConvenienceItems('meal')} 
          onBack={() => navigateTo(Step.ModeSelection, 'home')} 
        />;
      
      case Step.Suggestions: 
        return <SuggestionStep choices={choices} setChoices={setChoices} suggestions={suggestions} onNext={() => navigateTo(Step.Preferences, 'home')} onBack={() => navigateTo(Step.Ingredients, 'home')} />;
      
      case Step.Preferences: 
        return <PreferencesStep choices={choices} setChoices={setChoices} onNext={() => navigateTo(Step.Environment, 'home')} onBack={() => choices.mode === 'fridge' ? navigateTo(Step.Suggestions, 'home') : navigateTo(Step.ModeSelection, 'home')} />;
      
      case Step.Environment: 
        return <EnvironmentStep choices={choices} setChoices={setChoices} onGenerate={() => startGeneration()} onBack={() => navigateTo(Step.Preferences, 'home')} />;
      
      case Step.Result: 
        return result ? <ResultView result={result} user={user} canGoBack={currentRecipeIndex > 0} canGoForward={currentRecipeIndex < recipeHistory.length - 1} onReset={() => navigateTo(Step.Welcome, 'home')} onRegenerate={() => startGeneration(true)} onViewAlternative={(title) => startGeneration(false, title)} onGoBack={() => setCurrentRecipeIndex(prev => prev - 1)} onGoForward={() => setCurrentRecipeIndex(prev => prev + 1)} onSaveContext={() => {
          if (recipeHistory.length > 0) {
            sessionStorage.setItem('recipe_restore_history', JSON.stringify(recipeHistory));
            sessionStorage.setItem('recipe_restore_index', currentRecipeIndex.toString());
          }
        }} /> : null;
      
      case Step.Loading: 
        return <LoadingStep />;
      
      default: 
        return <WelcomeStep onNext={() => navigateTo(Step.ModeSelection, 'home')} />;
    }
  };

  return (
    <div className="min-h-dvh bg-[#F2F4F6] flex justify-center overflow-x-hidden">
      <div className="w-full max-w-lg bg-white min-h-dvh flex flex-col relative toss-card overflow-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-32 custom-scrollbar">
          {renderContent()}
        </main>
        <nav className="h-[86px] bg-white border-t border-slate-100 flex items-center justify-around fixed bottom-0 w-full max-w-lg z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] pb-2 rounded-t-[20px]">
          <button onClick={() => navigateTo(Step.Welcome, 'home')} className={`flex flex-col items-center gap-1.5 w-full h-full justify-center transition-all ${activeTab === 'home' ? 'text-[#ff5d01]' : 'text-slate-400'}`}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg><span className="text-[11px] font-bold">레시피 생성</span></button>
          <button onClick={() => navigateTo(Step.Community, 'community')} className={`flex flex-col items-center gap-1.5 w-full h-full justify-center transition-all ${activeTab === 'community' ? 'text-[#ff5d01]' : 'text-slate-400'}`}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span className="text-[11px] font-bold">커뮤니티</span></button>
        </nav>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }`}</style>
    </div>
  );
};

export default App;
