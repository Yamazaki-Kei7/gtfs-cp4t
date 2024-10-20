// APIのURL
const apiUrl = 'https://api.national-holidays.jp/';

// 日付が祝日かどうかをAPIから確認する関数
async function fetchHoliday(date: Date): Promise<boolean> {
    // オプションを設定して年月日を取得
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月は0から始まるため、1を加える
    const day = date.getDate().toString().padStart(2, '0');

    // yyyymmdd形式で結合
    const dateStr = `${year}-${month}-${day}`;

    try {
        const response = await fetch(`${apiUrl}${dateStr}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.isHoliday; // APIのレスポンスに応じて適切に変更
    } catch (error) {
        console.error('Error:', error);
        return false; // エラーが発生した場合は祝日ではないとみなす
    }
}

export async function determineDayType(date: Date): Promise<string> {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isHoliday = await fetchHoliday(date);
    console.log('Holiday: ' + isHoliday);

    if (dayOfWeek === 0 || isHoliday) {
        return '日曜または祝日';
    } else if (dayOfWeek === 6) {
        return '土曜';
    } else {
        return '平日';
    }
}
