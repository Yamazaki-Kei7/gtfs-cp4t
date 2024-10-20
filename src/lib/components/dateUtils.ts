import Holidays from 'date-holidays';
import { toZonedTime } from 'date-fns-tz';

// date-holidaysのインスタンスを作成（日本の祝日を設定）
const hd = new Holidays('JP');

// 日付が祝日かどうかを確認する関数
function isHoliday(date: Date): boolean {
    // 日付を日本時間に変換
    const japanTimezone = 'Asia/Tokyo';
    const japanDate = toZonedTime(date, japanTimezone);

    // date-holidaysで祝日を判定
    const holiday = hd.isHoliday(japanDate);
    return holiday ? true : false;
}

// 日付の種類を判定する関数
export function determineDayType(date: Date): string {
    // 日付を日本時間に変換
    const japanTimezone = 'Asia/Tokyo';
    const japanDate = toZonedTime(date, japanTimezone);

    const dayOfWeek = japanDate.getDay(); // 0 = 日曜, 1 = 月曜, ..., 6 = 土曜
    const holiday = isHoliday(date);
    console.log('Holiday:', holiday);

    if (dayOfWeek === 0 || holiday) {
        return '日曜または祝日';
    } else if (dayOfWeek === 6) {
        return '土曜';
    } else {
        return '平日';
    }
}