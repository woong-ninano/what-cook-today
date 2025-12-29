
import { GoogleGenAI, Type } from "@google/genai";
import { UserChoices, RecipeResult } from "../types";

// AI 인스턴스 생성
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * AI 응답 텍스트에서 순수 JSON 부분만 추출하는 헬퍼 함수
 */
const parseSafeJSON = (text: string | undefined): any => {
  if (!text) return null;
  try {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parsing Error. Original text:", text);
    return null;
  }
};

export const fetchSeasonalIngredients = async (excluded: string[] = []) => {
  const currentMonth = new Date().getMonth() + 1;
  const ai = getAI();
  const prompt = `대한민국의 ${currentMonth}월에 가장 맛있는 제철 식재료 8개를 알려줘. 
  이미 추천한 재료들(${excluded.join(', ')})은 제외해줘. 
  각 재료별로 한 줄 요약(맛이나 영양)을 포함해줘. JSON 형식으로만 응답해줘.`;

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
    const result = parseSafeJSON(response.text);
    return result?.items || [];
  } catch (e) {
    console.error("Seasonal items fetch failed", e);
    return [];
  }
};

export const fetchConvenienceTopics = async (excluded: string[] = [], category: 'meal' | 'snack' = 'meal') => {
  const ai = getAI();
  const now = new Date();
  const hour = now.getHours();
  let timeContext = hour >= 5 && hour < 11 ? "아침" : hour < 14 ? "점심" : hour < 17 ? "오후" : hour < 22 ? "저녁" : "야식";
  
  const prompt = `편의점 재료 꿀조합 레시피 6개를 추천해줘. 카테고리: ${category === 'meal' ? '식사' : '간식'}. 시간대: ${timeContext}. 제외할 재료: ${excluded.join(', ')}. JSON 형식 { items: [{ name, desc }] } 로 반환해.`;
  
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
    const result = parseSafeJSON(response.text);
    return result?.items || [];
  } catch (e) {
    console.error("Convenience topics fetch failed", e);
    return [];
  }
};

export const fetchSuggestions = async (ingredients: string) => {
  try {
    const ai = getAI();
    const prompt = `재료: "${ingredients}". 이 재료들과 어울리는 부재료 6개, 양념 6개를 한국어로 추천해줘. JSON 형식으로 반환해.`;
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
    const result = parseSafeJSON(response.text);
    return result || { subIngredients: [], sauces: [] };
  } catch (error) {
    console.error("Suggestions fetch failed", error);
    return { subIngredients: [], sauces: [] };
  }
};

export const generateRecipe = async (choices: UserChoices, isRegenerate: boolean = false): Promise<RecipeResult> => {
  const ai = getAI();
  
  // 모드별 지침 강화
  let modeInstruction = "";
  if (choices.mode === 'fridge') {
    modeInstruction = "냉장고에 남은 재료들을 남김없이 활용하면서도 맛의 조화를 이루는 '파먹기' 레시피를 제안해줘.";
  } else if (choices.mode === 'seasonal') {
    modeInstruction = "지금이 아니면 맛보기 힘든 제철 식재료의 풍미와 영양을 극대화하는 품격 있는 레시피를 제안해줘.";
  } else if (choices.mode === 'convenience') {
    modeInstruction = "편의점에서 쉽게 구할 수 있는 가공식품과 간편식을 조합해 만드는 놀라운 '꿀조합' 퓨전 레시피를 제안해줘.";
  }

  const prompt = `
  [Mission: ${choices.mode.toUpperCase()} MODE RECIPE GENERATION]
  지침: ${modeInstruction}
  
  재료 현황:
  - 주재료: ${choices.ingredients}
  - 양념/소스: ${choices.sauces.join(', ') || '기본 양념'}
  - 요리 스타일: ${choices.cuisine}
  - 함께 먹는 사람: ${choices.partner}
  - 상황/테마: ${choices.theme}
  - 사용자 요리 수준: ${choices.level}
  
  ${isRegenerate ? "참고: 이전에 제안했던 것과는 완전히 다른 새로운 아이디어의 레시피를 제안해줘." : ""} 

  [요구사항]
  1. 모든 응답은 친절한 한국어로 작성해.
  2. dishName은 매력적인 요리 이름을 지어줘.
  3. ingredientsList는 반드시 <ul><li> 태그를 사용한 HTML 형식이어야 해.
  4. easyRecipe와 gourmetRecipe는 각각 5~7단계 정도의 상세 조리법을 HTML <ol><li> 태그 형식으로 작성해.
  5. similarRecipes는 3가지를 추천해줘.
  `;

  try {
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
                properties: { title: { type: Type.STRING }, reason: { type: Type.STRING } },
                required: ["title", "reason"]
              }
            },
            referenceLinks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, url: { type: Type.STRING } },
                required: ["title", "url"]
              }
            }
          },
          required: ["dishName", "comment", "ingredientsList", "easyRecipe", "gourmetRecipe", "similarRecipes", "referenceLinks"]
        }
      }
    });

    const result = parseSafeJSON(response.text);
    if (!result) throw new Error("AI 응답 파싱 실패");
    return result;
  } catch (error) {
    console.error("Recipe generation failed", error);
    throw error;
  }
};

export const generateDishImage = async (dishName: string): Promise<string | undefined> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [{ 
          text: `Professional high-end food photography of ${dishName}. Studio lighting, extremely appetizing, macro shot, blurred background, vibrant natural colors. No text, no watermark.` 
        }] 
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
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
