
import { GoogleGenAI, Type } from "@google/genai";
import { UserChoices, RecipeResult } from "../types";

// Always use process.env.API_KEY directly to initialize GoogleGenAI.
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

/**
 * Fetches ingredient and sauce suggestions based on user input.
 */
export const fetchSuggestions = async (ingredients: string) => {
  try {
    const ai = getAI();
    const prompt = `사용자가 입력한 재료: "${ingredients}". 
    이 재료들과 아주 잘 어울리는 신선한 부재료 6개와 필수 양념 6개를 한국 요리 트렌드에 맞춰서 추천해줘.`;

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

    // Directly access the .text property from GenerateContentResponse as per guidelines.
    const jsonStr = response.text?.trim() || '{"subIngredients":[], "sauces":[]}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Suggestions Error:", error);
    return { subIngredients: [], sauces: [] };
  }
};

/**
 * Generates a full recipe based on user choices using the Gemini 3 Pro model.
 */
export const generateRecipe = async (choices: UserChoices): Promise<RecipeResult> => {
  const ai = getAI();
  const prompt = `
    당신은 세계적인 미슐랭 셰프이자 친절한 요리 선생님입니다. 
    다음 조건에 맞는 최고의 레시피를 작성하세요:
    - 주재료 및 부재료: ${choices.ingredients}
    - 선택한 양념: ${choices.sauces.join(', ')}
    - 상황: ${choices.partner}를 위한 ${choices.theme}
    - 가용 도구: ${choices.tools.join(', ')}
    - 조리 수준: ${choices.level}

    [출력 가이드라인]
    1. dishName: 창의적이고 먹음직스러운 이름
    2. comment: 이 요리를 추천하는 이유와 기대되는 맛 (따뜻한 문체)
    3. easyRecipe: 조리 도구를 활용한 효율적인 요리법 (HTML <ol><li> 구조)
    4. gourmetRecipe: 맛의 깊이를 더하는 셰프의 팁이 포함된 요리법 (HTML <ol><li> 구조)
    5. similarRecipes: 재료를 활용한 다른 아이디어 2개
    6. referenceLinks: 관련 정보 (제목과 URL 형식)
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dishName: { type: Type.STRING },
          comment: { type: Type.STRING },
          easyRecipe: { type: Type.STRING },
          gourmetRecipe: { type: Type.STRING },
          similarRecipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          },
          referenceLinks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING }
              }
            }
          }
        },
        required: ["dishName", "comment", "easyRecipe", "gourmetRecipe", "similarRecipes", "referenceLinks"]
      }
    }
  });

  // Directly access the .text property from GenerateContentResponse as per guidelines.
  const jsonStr = response.text?.trim() || '{}';
  return JSON.parse(jsonStr);
};
