
import { GoogleGenAI, Type } from "@google/genai";
import { UserChoices, RecipeResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fetchSeasonalIngredients = async (excluded: string[] = []) => {
  const currentMonth = new Date().getMonth() + 1;
  const ai = getAI();
  const prompt = `대한민국의 ${currentMonth}월에 가장 맛있는 제철 식재료 8개를 알려줘. 
  이미 추천한 재료들(${excluded.join(', ')})은 제외해줘. 
  각 재료별로 한 줄 요약(맛이나 영양)을 포함해줘. JSON 형식으로 반환해.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  desc: { type: Type.STRING }
                },
                required: ["name", "desc"]
              }
            }
          },
          required: ["items"]
        }
      }
    });
    const jsonStr = response.text?.trim() || '{"items":[]}';
    return JSON.parse(jsonStr).items;
  } catch (e) {
    console.error("Seasonal items fetch failed", e);
    return [];
  }
};

export const fetchConvenienceTopics = async (excluded: string[] = [], category: 'meal' | 'snack' = 'meal') => {
  const ai = getAI();
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;

  let timeContext = hour >= 5 && hour < 11 ? "아침" : hour < 14 ? "점심" : hour < 17 ? "오후" : hour < 22 ? "저녁" : "야식";
  
  const prompt = `편의점 재료 꿀조합 레시피 6개를 추천해줘. 카테고리: ${category === 'meal' ? '식사' : '간식'}. 시간대: ${timeContext}. 제외: ${excluded.join(', ')}. JSON: { items: [{ name, desc }] }`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  desc: { type: Type.STRING }
                },
                required: ["name", "desc"]
              }
            }
          },
          required: ["items"]
        }
      }
    });
    return JSON.parse(response.text || '{"items":[]}').items;
  } catch (e) {
    return [];
  }
};

export const fetchSuggestions = async (ingredients: string) => {
  try {
    const ai = getAI();
    const prompt = `재료: "${ingredients}". 어울리는 부재료 6개, 양념 6개를 추천해줘.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            sauces: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["subIngredients", "sauces"]
        }
      }
    });
    return JSON.parse(response.text || '{"subIngredients":[], "sauces":[]}');
  } catch (error) {
    return { subIngredients: [], sauces: [] };
  }
};

export const generateRecipe = async (choices: UserChoices, isRegenerate: boolean = false): Promise<RecipeResult> => {
  const ai = getAI();
  const prompt = `[Mission] ${choices.mode} 모드 레시피 생성. 재료: ${choices.ingredients}, 스타일: ${choices.cuisine}, 대상: ${choices.partner}, 테마: ${choices.theme}, 난이도: ${choices.level}. ${isRegenerate ? "새로운 레시피로." : ""} 한국어로 JSON 반환.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dishName: { type: Type.STRING },
          comment: { type: Type.STRING },
          ingredientsList: { type: Type.STRING },
          easyRecipe: { type: Type.STRING },
          gourmetRecipe: { type: Type.STRING },
          similarRecipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, reason: { type: Type.STRING } }
            }
          },
          referenceLinks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, url: { type: Type.STRING } }
            }
          }
        },
        required: ["dishName", "comment", "ingredientsList", "easyRecipe", "gourmetRecipe", "similarRecipes", "referenceLinks"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateDishImage = async (dishName: string): Promise<string | undefined> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ 
          text: `A delicious, high-quality food photography of ${dishName}. Top-down view or 45-degree angle. Appetizing, vibrant colors. Studio lighting. No text overlay.` 
        }] 
      },
    });

    // 지침에 따라 모든 파트를 순회하여 이미지 데이터 추출
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error("Image generation failed", error);
    return undefined;
  }
};
