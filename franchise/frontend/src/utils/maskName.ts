/**
 * 이름의 중간 글자를 별표(*)로 마스킹합니다.
 * 예: "홍길동" -> "홍*동", "김철수" -> "김*수", "이순신" -> "이*신"
 * 2글자인 경우: "김철" -> "김*"
 * 1글자인 경우: "김" -> "김" (마스킹 안함)
 */
export function maskName(name: string): string {
    if (!name) return '';

    const length = name.length;

    if (length === 1) {
        return name;
    } else if (length === 2) {
        return name[0] + '*';
    } else {
        // 3글자 이상인 경우 중간 글자들을 별표로
        const firstChar = name[0];
        const lastChar = name[length - 1];
        const middleStars = '*'.repeat(length - 2);
        return firstChar + middleStars + lastChar;
    }
}
