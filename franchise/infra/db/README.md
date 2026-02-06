## Backend DB (PostgreSQL + Docker) 협업 가이드

---

## 1. 개요

본 프로젝트는 **Spring Boot 백엔드 + PostgreSQL 데이터베이스** 구조로 구성되어 있습니다.  
팀원 간 **동일한 DB 환경**을 유지하기 위해 **Docker 기반 로컬 DB 환경**을 사용합니다.

> ⚠️ 현재는 **배포 단계가 아닌 개발 단계**입니다.  
> 팀원 각자가 **자신의 로컬 PC에서 독립적으로 개발**할 수 있도록 구성되어 있으며,  
> 향후 배포 단계에서는 DB 구성 방식이 변경될 수 있습니다.

---

## 2. Docker로 DB를 구성한 이유

### 개발 단계에서의 목적
- 팀원별 OS / 개발 환경 차이로 인한 DB 이슈 제거
- 동일한 스키마와 더미데이터 기반 개발
- 빠른 개발 및 안정적인 로컬 환경 유지

### 현재 구조의 특징
- 각 팀원은 **로컬 PC에서 Docker로 PostgreSQL 실행**
- DB 컨테이너는 **공유 서버가 아님**
- DB 구조 및 데이터는 **Git + Migration(Flyway)** 으로 동기화

> 즉,  
> **각자 로컬 DB + 동일한 구조** 방식입니다.

---

## 3. 프로젝트 디렉토리 구조
```text
Franchise-Management-System/
└─ franchise/
   ├─ back/        # Spring Boot (Gradle)
   ├─ front/       # React
   └─ infra/
      └─ db/
         └─ docker-compose.yml
```
---

## 4. 팀원별 사전 준비 (최초 1회)

### 4.1 Docker Desktop 설치
- https://www.docker.com/products/docker-desktop/
- 설치 후 Docker Desktop 실행 상태 유지

### 4.2 Git 설치
- https://git-scm.com/

### 4.3 pgAdmin
- PostgreSQL DB 구조 확인용
- https://www.pgadmin.org/download/

---

## 5. 레포지토리 클론
```bash
git clone https://github.com/jiyoung456/Franchise-Management-System.git
cd Franchise-Management-System/franchise
```
---

## 6. 로컬 PostgreSQL 실행 (Docker)

### 6.1 docker-compose 위치
franchise/infra/db/docker-compose.yml

### 6.2 컨테이너 실행
```bash
cd franchise/infra/db
docker compose up -d
```


### 6.3 실행 확인
```bash
docker ps
```

`franchise-postgres` 컨테이너가 실행 중이면 정상입니다.

---

## 7. pgAdmin 연결 방법 (선택)

pgAdmin → **Register Server**

| 항목 | 값 |
|---|---|
| Host | localhost |
| Port | 5433 |
| Database | franchise |
| Username | franchise_user |
| Password | franchise_pass |

---

## 8. DB 관리 원칙 (중요)

### ❌ 하지 말아야 할 것
- pgAdmin에서 직접 테이블 생성 / 수정
- 이미 실행된 migration 파일 수정
- 팀원마다 다른 DB 구조 사용

### ✅ 반드시 지켜야 할 것
- 모든 DB 변경은 **Migration(SQL)** 으로만 관리
- Git을 통해 팀원 간 변경 사항 공유

---

## 9. Migration 구조 (Flyway)

### 9.1 Migration 위치
back/src/main/resources/db/migration/

### 9.2 파일 네이밍 규칙

| 파일명 | 역할 |
|---|---|
| `V1__create_users_and_stores.sql` | 테이블 생성 |
| `V2__seed_users_and_stores.sql` | 더미데이터 삽입 |
| `V3__*.sql` | 이후 스키마 변경 |

> ⚠️ 이미 실행된 V 파일은 **절대 수정하지 않습니다.**

---

## 10. 백엔드 실행 (Migration 자동 적용)

### IntelliJ 실행
- `BackendApplication.java` 실행

### 터미널 실행
```bash
cd franchise/back
./gradlew bootRun
```

### 실행 시 자동 처리 흐름
1. Docker PostgreSQL 연결
2. Flyway Migration 실행
3. 테이블 생성 및 더미데이터 삽입
4. 로컬 DB 사용 가능 상태

---

## 11. 현재 방식의 한계와 향후 계획

### 현재 (개발 단계)
- 각 팀원 로컬 DB 사용
- Docker + Migration 기반
- 빠른 개발과 안정성 우선

### 향후 (배포 단계)
- 공용 DB 서버 또는 클라우드 DB 사용 가능성
- Docker Compose 구조 변경
- 환경별 DB 분리 (`dev / prod`)
- 더미데이터 제외한 Migration 구성

> 본 문서는 **현재 개발 단계 기준**이며,  
> 배포 단계에서는 일부 내용이 변경될 수 있습니다.

---

## 12. 한 줄 요약

> **Docker는 DB 실행용,  
> Migration은 DB 변경 관리용,  
> Git은 팀원 동기화용입니다.**

---

## 13. 참고 사항
- DB 구조 변경 시 반드시 **새 Migration 파일 생성**
- 팀원 간 합의 없이 DB 구조 변경 금지


