# AI agent - FAST api 서버
   
AI agent용 서버 프로젝트이다.
   
해당 문서는 Python FastAPI 서버 실행을 위한 사전 준비 설명문이다.   
   
---

## 1. 개발 및 디버그 환경 준비

FastAPI 서버를 실행하기 위해서는 Python 실행 환경과 코드 편집 도구가 먼저 준비되어야 한다.

### 1-1. 필수 프로그램 확인

* 아나콘다(Anaconda)가 설치되어 있어야 한다
  Python 실행 환경과 패키지 관리 목적이다.

   
* Visual Studio Code(VS Code)가 설치되어 있어야 한다
  코드 작성 및 디버깅에 사용한다.
   
   
* VS Code에 Python 확장 프로그램이 설치되어 있어야 한다
  Microsoft에서 제공하는 Python Extension이 필요하다.
   
   
* 아나콘다를 방금 설치했다면 VS Code를 완전히 종료 후 재실행해야 한다
  인터프리터 목록이 정상적으로 갱신되기 위함이다.

---

## 2. Python 인터프리터 선택

FastAPI 서버는 올바른 Python 인터프리터가 선택되어 있어야 정상 실행된다.

1. VS Code를 연다
2. 화면 맨 위의 검색창을 누른 후 Show and Run Commands를 클릭한다
3. Python: Select Interpreter 메뉴를 선택한다
4. Python 3.13.5 (base)를 선택한다
   경로 예시: `~\anaconda\python.exe`

터미널 창에서 $ source ~/anaconda3/Scripts/activate base 가 나오면 인터프리터 환경 구성에 성공한 것이다

---

## 3. 필수 라이브러리 및 모듈 구성

FastAPI 서버 코드에서 기본적으로 사용되는 모듈 구성이다. 아래 모듈들이 설치되어 있고, 버전 충돌을 방지하기 위해 최신 버전으로 유지하는 것이 좋다.

```python
from fastapi import APIRouter, Request
import os
from dotenv import load_dotenv
from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel
import json
import google.generativeai as genai
```

각 모듈의 역할은 다음과 같다.

* fastapi: API 서버 프레임워크
* uvicorn: ASGI 서버 실행용
* python-dotenv: 환경 변수(.env) 로딩
* pydantic: 요청 및 응답 데이터 검증
* google-generativeai: Gemini API 호출용 SDK
* datetime, typing, json: 데이터 처리용 표준 라이브러리

### 3-1. pip로 모듈 업그레이드

이미 설치된 패키지를 포함해 필요한 모듈들을 최신 버전으로 업그레이드하려면 아래 명령어를 터미널에서 실행한다.

```
pip install --upgrade fastapi uvicorn python-dotenv pydantic google-generativeai
```

### 3-2. conda로 모듈 업그레이드

conda 환경을 사용하는 경우 conda-forge 채널 기준으로 업그레이드한다.

```
conda update -c conda-forge fastapi uvicorn python-dotenv pydantic google-generativeai
```

업그레이드 후에는 VS Code에서 선택된 Python 인터프리터가 해당 환경을 가리키고 있는지 확인해야 한다.

---

## 4. Gemini API 키 발급

Gemini API는 Google AI Studio에서 발급받을 수 있다. FastAPI 서버에서 LLM 호출 시 사용된다.

### 4-1. 발급 절차

1. Google AI Studio 접속 후 Google 계정으로 로그인
2. 좌측 사이드바에서 Get API key 선택
3. 기존 프로젝트 선택 또는 Create API key in new project 클릭
4. Create API key 버튼을 눌러 키 생성

무료 티어 범위 내에서 사용 가능하다.

---

## 5. API 키를 환경 변수로 설정

보안을 위해 API 키는 코드에 직접 작성하지 않고 환경 변수로 관리한다.

### 5-1. .env 파일 설정

프로젝트 루트에 `.env` 파일을 생성한다.    
   
해당 파일에 다음 내용을 저장한다

```
GOOGLE_API_KEY=발급받은 api 키
GEMINI_MODEL_NAME = gemini-2.5-flash
PROMPT_VERSION = 0.0.1
```
   
* GOOGLE_API_KEY : 제미나이 llm 모델 api 키이다
* GEMINI_MODEL_NAME : 사용할 llm 모델의 이름이다
* PROMPT_VERSION : 프롬프트 버전 설정이다   
    
python-dotenv를 통해 서버 실행 시 자동으로 로드된다.


> **!주의!**   
>
> api 키를 env 파일에 저장 후 환경을 실행하면 IDE가 자동으로 Windows 환경변수에 해당 api key 값을 저장한다   
>    
> api 키 사용량이 끝나 새로운 키를 발급 받았다면,   
>    
> *반드시*      
> 
> 환경변수에서 api 키 변수를 삭제하고 재부팅 후 env 파일에 키를 저장하여라
---

## 6. FastAPI 서버 실행

모든 준비가 끝난 후 VSCode의 하단에 터미널을 열고,    
uvicorn을 통해 서버를 실행한다.

실행 경로 : `Franchise-Management-System/franchise/agent`

```
uvicorn agent.main:app --reload
```

* agent.main: FastAPI 앱이 정의된 모듈 경로
* app: FastAPI 인스턴스 이름
* --reload: 코드 변경 시 서버 자동 재시작 옵션

정상 실행 시 로컬 서버가 기동되며 API 요청을 받을 수 있다.
