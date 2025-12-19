
import { GoogleGenAI, Type } from "@google/genai";
import { UserChoices, RecipeResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// 주재료에 따른 부재료 및 양념 추천 (Gemini 3 Flash 사용)
export const fetchSuggestions = async (ingredients: string) => {
  const prompt = `
    사용자가 입력한 주재료: "${ingredients}"
    이 재료들로 요리할 때 가장 잘 어울리는 '추천 부재료' 6개와 '추천 양념' 6개를 한국어로 제안해줘.
    시니어 사용자가 보기 좋게 아주 명확하고 친숙한 단어를 사용해줘.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subIngredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '추천 부재료 6개'
          },
          sauces: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '추천 양념 6개'
          }
        },
        required: ["subIngredients", "sauces"]
      }
    }
  });

  const text = response.text;
  if (!text) return { subIngredients: [], sauces: [] };
  return JSON.parse(text) as { subIngredients: string[], sauces: string[] };
};

export const generateRecipe = async (choices: UserChoices): Promise<RecipeResult> => {
  const prompt = `
    당신은 전 세계 모든 요리에 정통한 '전설적인 AI 요리 마스터'입니다. 
    한국인의 영혼을 가졌으며, 혁신적인 퓨전 요리를 창조하는 데 능숙합니다.
    시니어 사용자를 위해 글자 크기가 큰 레시피를 제공한다고 생각하고 내용을 구성하세요.

    [사용자 상황 데이터]
    - 주재료: ${choices.ingredients}
    - 보유 소스: ${choices.sauces.join(', ')}
    - 식사 대상: ${choices.partner}
    - 요리 테마: ${choices.theme}
    - 조리 도구: ${choices.tools.join(', ')}
    - 요리 실력: ${choices.level}

    [마스터 셰프의 지침]
    1. 요리 이름: 매력적이고 전문적인 이름.
    2. 레시피 본문: 반드시 1. 2. 3. 숫자를 붙인 <ol><li>...</li></ol> 형식.
    3. 설명: 시니어가 읽기 편하게 명확하고 따뜻한 말투.
    4. 유사 추천: 2가지 제안.
    5. 참고 링크: 구글/유튜브 검색 키워드 링크.
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
              },
              required: ["title", "reason"]
            }
          },
          referenceLinks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "url"]
            }
          }
        },
        required: ["dishName", "comment", "easyRecipe", "gourmetRecipe", "similarRecipes", "referenceLinks"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("마스터 셰프의 영감이 닿지 않았습니다.");
  
  return JSON.parse(text) as RecipeResult;
};
