// 本命星计算工具

/**
 * 计算年份各位数字之和（递归相加直到得到个位数）
 */
function sumDigitsRecursively(num: number): number {
    if (num < 10) return num;
    
    const sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    return sumDigitsRecursively(sum);
}

/**
 * 计算本命星数字
 * @param birthYear 出生年份（例如：1987）
 * @param gender 性别（'男' 或 '女'）
 * @returns 本命星数字（1-9）
 */
export function calculateBenmingStarNo(birthYear: number, gender: '男' | '女'): number {
    const yearSum = sumDigitsRecursively(birthYear);
    
    if (gender === '男') {
        // 男性：11 - 年份各位数字之和
        let result = 11 - yearSum;
        // 如果结果大于9，继续递归相加
        if (result > 9) {
            result = sumDigitsRecursively(result);
        }
        // 如果结果为0或负数，加9使其在1-9范围内
        if (result <= 0) {
            result += 9;
        }
        return result;
    } else {
        // 女性：4 + 年份各位数字之和
        let result = 4 + yearSum;
        // 如果结果大于9，继续递归相加
        if (result > 9) {
            result = sumDigitsRecursively(result);
        }
        return result;
    }
}

/**
 * 本命星名称映射表
 */
const BENMING_STAR_NAMES: Record<number, string> = {
    1: '一白贪狼星',
    2: '二黑巨门星',
    3: '三碧禄存星',
    4: '四绿文曲星',
    5: '五黄廉贞星',
    6: '六白武曲星',
    7: '七赤破军星',
    8: '八白左辅星',
    9: '九紫右弼星'
};

/**
 * 获取本命星名称
 * @param starNo 本命星数字（1-9）
 * @returns 本命星名称
 */
export function getBenmingStarName(starNo: number): string {
    return BENMING_STAR_NAMES[starNo] || '';
}

/**
 * 从出生日期字符串计算本命星信息
 * @param birthDate 出生日期字符串（格式：YYYY-MM-DD）
 * @param gender 性别（'男' 或 '女'）
 * @returns 本命星数字和名称
 */
export function calculateBenmingFromDate(birthDate: string, gender: '男' | '女'): {
    starNo: number;
    starName: string;
} {
    const year = parseInt(birthDate.split('-')[0]);
    const starNo = calculateBenmingStarNo(year, gender);
    const starName = getBenmingStarName(starNo);
    
    return { starNo, starName };
}

