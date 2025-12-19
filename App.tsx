
import React, { useState } from 'react';
import { Step, UserChoices, RecipeResult } from './types';
import Header from './components/Header';
import WelcomeStep from './components/steps/WelcomeStep';
import TaskSelectionStep from './components/steps/TaskSelectionStep';
import IngredientsStep from './components/steps/IngredientsStep';
import SuggestionStep from './components/steps/SuggestionStep';
import PreferencesStep from './components/steps/PreferencesStep';
import EnvironmentStep from './components/steps/EnvironmentStep';
import LoadingStep from './components/steps/LoadingStep';
import ResultView from './components/ResultView';
import { generateRecipe, fetchSuggestions } from './services/gemini';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Welcome);
  const [choices, setChoices] = useState<UserChoices>({
    ingredients: '',
    sauces: [],
    partner: '👤 혼밥',
    theme: '🍚 든든한 한끼',
    tools: [],
    level: 'Lv.2 기본적인 건 해요'
  });
  const [suggestions, setSuggestions] = useState<{subIngredients: string[], sauces: string[]}>({
    subIngredients: [],
    sauces: []
  });
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleNext = () => setStep(prev => (prev + 1) as Step);
  const handleBack = () => setStep(prev => (prev - 1) as Step);

  const goToSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const data = await fetchSuggestions(choices.ingredients);
      setSuggestions(data);
      setStep(Step.Suggestions);
    } catch (err) {
      console.error(err);
      setStep(Step.Suggestions); // 에러나도 일단 넘어감 (기본 목록이라도 보여주기 위해)
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const startGeneration = async () => {
    setStep(Step.Loading);
    setError(null);
    try {
      const recipe = await generateRecipe(choices);
      setResult(recipe);
      setStep(Step.Result);
    } catch (err: any) {
      setError(err.message || '문제가 발생했습니다. 다시 시도해 주세요.');
      setStep(Step.Welcome);
    }
  };

  const renderStep = () => {
    if (isLoadingSuggestions) return <div className="py-20 text-center font-black text-2xl animate-pulse">마스터가 재료를 고민 중입니다...</div>;

    switch (step) {
      case Step.Welcome:
        return <WelcomeStep onNext={handleNext} />;
      case Step.TaskSelection:
        return <TaskSelectionStep onNext={handleNext} onBack={handleBack} />;
      case Step.Ingredients:
        return <IngredientsStep choices={choices} setChoices={setChoices} onNext={goToSuggestions} onBack={handleBack} />;
      case Step.Suggestions:
        return <SuggestionStep choices={choices} setChoices={setChoices} suggestions={suggestions} onNext={handleNext} onBack={handleBack} />;
      case Step.Preferences:
        return <PreferencesStep choices={choices} setChoices={setChoices} onNext={handleNext} onBack={handleBack} />;
      case Step.Environment:
        return <EnvironmentStep choices={choices} setChoices={setChoices} onGenerate={startGeneration} onBack={handleBack} />;
      case Step.Loading:
        return <LoadingStep />;
      case Step.Result:
        return result ? <ResultView result={result} onReset={() => setStep(Step.Welcome)} /> : null;
      default:
        return null;
    }
  };

  // 특정 단계에서는 헤더를 숨김
  const showHeader = step !== Step.Suggestions && step !== Step.Loading && step !== Step.Result;

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-md bg-white shadow-2xl min-h-dvh flex flex-col border-x border-gray-100">
        {showHeader && <Header />}
        <main className="flex-1 p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-lg font-bold">
              ⚠️ {error}
            </div>
          )}
          {renderStep()}
        </main>
      </div>
    </div>
  );
};

export default App;
