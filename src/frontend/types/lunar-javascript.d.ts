declare module 'lunar-javascript' {
    export class Lunar {
        constructor(date: Date);

        // Static methods
        static fromDate(date: Date): Lunar;

        // Instance methods
        getYear(): number;
        getMonth(): number;
        getDay(): number;
        getYearInChinese(): string;
        getMonthInChinese(): string;
        getDayInChinese(): string;
        getYearInGanZhi(): string;
        getMonthInGanZhi(): string;
        getDayInGanZhi(): string;
        getTimeInGanZhi(): string;
        getYearShengXiao(): string;
        getYearNaYin(): string;
        getMonthNaYin(): string;
        getDayNaYin(): string;
        getTimeNaYin(): string;
        getEightChar(): string;
        // Add other methods as needed
        [key: string]: unknown;
    }

    export class Solar {
        constructor(year: number, month: number, day: number);
        getLunar(): Lunar;
        // Add other methods as needed
        [key: string]: unknown;
    }
}
