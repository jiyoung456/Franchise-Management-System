## Production Infrastructure & Deployment 가이드

**우리 프로젝트의 공식 인프라 구조 및 배포 표준 문서**입니다.  
팀원은 반드시 본 가이드를 기준으로 개발/배포를 진행해야 합니다.

---

# 1. 아키텍처 개요

## 최종 인프라 구성
Frontend  →  S3 + CloudFront  
Backend   →  EC2 + Docker (Spring Boot)  
Database  →  RDS PostgreSQL  
CI/CD     →  GitHub Actions  
DB 관리   →  Flyway Migration  

---

# 2. 전체 아키텍처 흐름

> User
> ↓
> CloudFront (CDN)
> ↓
> S3 (React 정적 파일)
> ↓
> EC2 (Docker Spring Boot API)
> ↓
> RDS (PostgreSQL)

---

# 3. 기술 스택

## Frontend
- React (Vite)
- S3
- CloudFront

## Backend
- Spring Boot
- Docker
- EC2

## Database
- PostgreSQL (RDS)
- Flyway

## CI/CD
- GitHub Actions
- GHCR (Docker Registry)

---

# 4. 환경 구분

| 환경 | 용도 | DB |
|--------|-----------|-----------|
| local | 개발 | Docker PostgreSQL |
| prod | 실제 서비스 | AWS RDS |

---

# 5. 로컬 개발 방법

## DB 실행
```bash
cd franchise/infra/db
docker compose up -d
```

## Backend 실행
```bash
cd franchise/back
./gradlew bootRun
```

## 특징
- 각자 로컬 DB 사용
- Flyway로 자동 스키마 생성
- 더미 데이터 포함

---

# 6. Production 배포 구조

## Backend
- EC2 + Docker 컨테이너 실행
- GitHub Actions 자동 배포

## Database
- RDS PostgreSQL
- EC2에서만 접근 가능

## Frontend
- S3 정적 호스팅
- CloudFront CDN

---

# 7. 배포 프로세스 (공식 절차)

## 순서
1. RDS 생성
2. EC2 + Docker 수동 배포 1회 성공
3. GitHub Actions CI/CD 연결
4. HTTPS/ALB 설정 (선택)
5. S3 + CloudFront 프론트 배포

---

# 8. 브랜치 전략

| 브랜치 | 역할 |
|-----------|----------------|
| main | Production 배포 전용 |
| feature/* | 개발 작업 |
| dev (선택) | 통합 테스트 |

⚠️ Production 배포는 main push만 허용

---

# 9. CI/CD 흐름

> main push
> ↓
> GitHub Actions build
> ↓
> Docker image build
> ↓
> GHCR push
> ↓
> EC2 pull & docker compose up

자동 배포되므로 **EC2 수동 작업 금지**

---

# 10. DB 운영 규칙

## ❌ 금지
- pgAdmin 직접 수정
- RDS 직접 접속 수정
- 기존 Migration 수정
- 테이블 수동 변경

## ✅ 필수
- 모든 변경은 Flyway SQL 파일로 생성
- 새 파일만 추가 (V3__, V4__, ...)
예시:
V3__add_event_table.sql
V4__seed_demo_data.sql

---

# 11. 더미 데이터 정책

우리 서비스는 실제 데이터가 없으므로 **더미 데이터 기반 운영**

규칙:
- Production에서도 더미 사용
- 더미 변경 시 새 Migration 생성
- 기존 seed 수정 금지

예시:
V10__reset_and_seed_demo.sql

---

# 12. 팀 역할 분담

## Backend
- API 개발
- Flyway 관리
- Dockerfile

## Frontend
- React 개발
- S3 배포
- API 연결

## Infra/DevOps
- RDS
- EC2
- CI/CD
- 배포 관리

---

# 13. Production 접근 정책

## RDS
- Public 접근 ❌
- EC2만 접근 가능

## EC2
- SSH: 팀원 IP만 허용
- 8080: ALB 또는 내부만 허용

## HTTPS
- ALB + ACM 적용 권장

---

# 14. 절대 지켜야 할 규칙

🚨 아래는 위반 시 장애 발생 가능

- EC2에서 직접 코드 수정 금지
- 수동 배포 금지
- RDS 직접 수정 금지
- Migration 수정 금지
- main 브랜치 직접 실험 금지

---

# 15. 한 줄 요약

Docker = 실행  
Flyway = DB 변경 관리  
GitHub Actions = 배포 자동화  
RDS = 운영 DB  
S3/CloudFront = 프론트 CDN  

---







