# 🥘 웅아! 오늘 뭐 해먹지? (What to cook?)

> **Google Gemini AI 기반의 개인 맞춤형 퓨전 레시피 & 편의점 꿀조합 추천 서비스**  
> 냉장고 속 재료부터 편의점 간식까지, AI 셰프가 당신만을 위한 요리를 제안합니다.

![Version](https://img.shields.io/badge/version-1.5.2-orange)
![React](https://img.shields.io/badge/React-19.0-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)

---

## 📖 프로젝트 소개

**"오늘 뭐 먹지?"** 매일 반복되는 고민을 해결하기 위해 탄생했습니다.  
단순한 레시피 검색이 아니라, 사용자가 가진 재료와 상황(혼밥, 안주, 다이어트 등)을 고려하여 **Generative AI(Gemini)**가 실시간으로 세상에 없던 창의적인 레시피를 생성해줍니다.

특히 **자취생을 위한 편의점 꿀조합** 모드와 **커뮤니티 기능**을 통해 서로의 레시피를 공유하고 평가할 수 있습니다.

## ✨ 주요 기능

### 1. 3가지 추천 모드
- **🧊 냉장고 파먹기:** 현재 냉장고에 있는 재료를 입력하면 최적의 메뉴를 추천합니다.
- **🌿 제철 요리 추천:** 현재 시즌에 가장 맛있는 식재료를 기반으로 건강한 요리를 제안합니다.
- **🏪 편의점 꿀조합:** 
  - **식사 모드:** 자취생을 위한 든든한 한 끼 (마크정식 스타일 등)
  - **간식 모드:** 당 충전을 위한 디저트 및 스낵 조합 추천

### 2. AI 셰프의 맞춤형 레시피 생성
- **Gemini 3 Flash** 모델을 활용한 초고속 레시피 생성
- **Gemini 2.5 Flash Image** 모델을 활용한 고퀄리티 요리 예상 이미지 생성
- **이중 레시피 제공:** 누구나 따라 할 수 있는 '간편 조리법' vs 맛을 극대화하는 '셰프의 킥'

### 3. 디테일한 사용자 맞춤 설정
- **함께 먹는 사람:** 혼밥, 가족, 연인, 친구 등
- **요리 테마:** 술안주, 해장, 다이어트, 든든한 한 끼
- **요리 스타일:** 한식, 양식, 중식, 퓨전 등
- **요리 레벨:** 요린이부터 주방의 고수까지 난이도 조절

### 4. 커뮤니티 & 유틸리티
- **소셜 로그인:** Google 계정 연동
- **레시피 평가:** 직접 만들어보고 '성공😋' 또는 '실패🥲' 투표 및 별점 부여
- **댓글 소통:** 레시피에 대한 팁과 후기 공유
- **PDF 저장:** 마음에 드는 레시피를 PDF로 다운로드하여 소장

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework:** React 19, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Toss UI 스타일의 깔끔한 디자인)
- **State Management:** React Hooks

### AI & Backend
- **AI Model:** Google Gemini API (`gemini-3-flash-preview`, `gemini-2.5-flash-image`)
- **Backend & Auth:** Supabase (PostgreSQL, Authentication)
- **Deployment:** Vercel

### Libraries
- `html2canvas`, `jspdf`: 레시피 PDF 저장 기능
- `@google/genai`: Gemini API 연동 SDK

## 🚀 설치 및 실행 방법

이 프로젝트를 로컬에서 실행하려면 다음 단계가 필요합니다.

### 1. 레포지토리 클론
```bash
git clone https://github.com/your-username/what-to-cook.git
cd what-to-cook
