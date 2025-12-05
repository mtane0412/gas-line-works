/**
 * calendar.tsのテスト
 * 日付ユーティリティと予定フォーマットをテストする
 */

import {
  toIso8601,
  getTodayStart,
  getTodayEnd,
  formatEvent,
  CalendarEvent,
} from "../src/calendar";

describe("toIso8601", () => {
  test("DateオブジェクトをISO8601形式に変換する", () => {
    const date = new Date("2025-06-15T10:30:00Z");
    const result = toIso8601(date);

    expect(result).toBe("2025-06-15T10:30:00.000Z");
  });
});

describe("getTodayStart", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-06-15T14:30:45Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("今日の00:00:00を返す", () => {
    const result = getTodayStart();

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });
});

describe("getTodayEnd", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-06-15T14:30:45Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("今日の23:59:59を返す", () => {
    const result = getTodayEnd();

    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
  });
});

describe("formatEvent", () => {
  test("予定を整形した文字列を返す", () => {
    const event: CalendarEvent = {
      eventId: "event-123",
      calendarId: "calendar-456",
      eventComponents: [
        {
          eventId: "event-123",
          summary: "ミーティング",
          description: "週次ミーティング",
          start: { dateTime: "2025-06-15T10:00:00+09:00" },
          end: { dateTime: "2025-06-15T11:00:00+09:00" },
          location: "会議室A",
          transparency: "OPAQUE",
        },
      ],
    };

    const result = formatEvent(event);

    expect(result).toContain("[予定あり] ミーティング");
    expect(result).toContain("開始: 2025-06-15T10:00:00+09:00");
    expect(result).toContain("終了: 2025-06-15T11:00:00+09:00");
    expect(result).toContain("場所: 会議室A");
    expect(result).toContain("説明: 週次ミーティング");
  });

  test("空き時間の予定を正しく表示する", () => {
    const event: CalendarEvent = {
      eventId: "event-789",
      calendarId: "calendar-456",
      eventComponents: [
        {
          eventId: "event-789",
          summary: "作業時間",
          start: { dateTime: "2025-06-15T14:00:00+09:00" },
          end: { dateTime: "2025-06-15T15:00:00+09:00" },
          transparency: "TRANSPARENT",
        },
      ],
    };

    const result = formatEvent(event);

    expect(result).toContain("[空き] 作業時間");
  });

  test("終日予定（dateフィールド）を正しく表示する", () => {
    const event: CalendarEvent = {
      eventId: "event-all-day",
      calendarId: "calendar-456",
      eventComponents: [
        {
          eventId: "event-all-day",
          summary: "休暇",
          start: { date: "2025-06-15" },
          end: { date: "2025-06-16" },
        },
      ],
    };

    const result = formatEvent(event);

    expect(result).toContain("休暇");
    expect(result).toContain("開始: 2025-06-15");
    expect(result).toContain("終了: 2025-06-16");
  });

  test("場所や説明がない場合は省略する", () => {
    const event: CalendarEvent = {
      eventId: "event-simple",
      calendarId: "calendar-456",
      eventComponents: [
        {
          eventId: "event-simple",
          summary: "シンプルな予定",
          start: { dateTime: "2025-06-15T10:00:00+09:00" },
          end: { dateTime: "2025-06-15T11:00:00+09:00" },
        },
      ],
    };

    const result = formatEvent(event);

    expect(result).not.toContain("場所:");
    expect(result).not.toContain("説明:");
  });
});
