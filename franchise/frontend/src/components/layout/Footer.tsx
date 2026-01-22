export function Footer() {
    return (
        <footer className="w-full bg-gray-50 py-8 border-t border-gray-200 mt-auto">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <div className="flex justify-center space-x-6 mb-4 text-sm text-gray-600 font-medium">
                    <span className="cursor-pointer hover:text-[#2CA4D9]">개인정보 처리방침</span>
                    <span className="text-gray-300">|</span>
                    <span className="cursor-pointer hover:text-gray-900">이용약관</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                    <p>
                        <span className="font-bold text-gray-500">(주)알피자</span>
                        <span className="mx-2">|</span>
                        경기도 성남시 분당구 불정로 90 (정자동)
                        <span className="mx-2">|</span>
                        대표자명 : 김피자
                    </p>
                    <p>
                        사업자등록번호 : 102-81-42945
                        <span className="mx-2">|</span>
                        통신판매업신고 : 2026-경기성남-0048
                    </p>
                    <p className="pt-2 text-[10px] text-gray-300">
                        © 2026 Alpizza Corp. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
