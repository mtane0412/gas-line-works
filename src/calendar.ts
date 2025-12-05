/**
 * LINE WORKS カレンダーAPI モジュール
 * 予定の取得・操作を行う
 */

import { LINEWORKS_API_BASE_URL } from "./constants";

/** 日時情報 */
export interface DateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

/** 予定の詳細情報 */
export interface EventComponent {
  eventId: string;
  summary: string;
  description?: string;
  start: DateTime;
  end: DateTime;
  location?: string;
  transparency?: string;
  visibility?: string;
  recurrence?: string[];
  status?: string;
}

/** 予定レスポンス */
export interface CalendarEvent {
  eventId: string;
  calendarId: string;
  eventComponents: EventComponent[];
}

/** 予定一覧レスポンス */
export interface CalendarEventsResponse {
  events: CalendarEvent[];
  responseMetaData?: {
    nextCursor?: string;
  };
}

/** 予定取得オプション */
export interface GetEventsOptions {
  fromDateTime: string;
  untilDateTime: string;
  limit?: number;
}


/**
 * 基本カレンダーの予定一覧を取得する
 * @param accessToken - アクセストークン
 * @param userId - ユーザーID（"me"でサービスアカウント自身）
 * @param options - 取得オプション
 * @returns 予定一覧
 */
export function getCalendarEvents(
  accessToken: string,
  userId: string,
  options: GetEventsOptions
): CalendarEventsResponse {
  const queryParams: string[] = [
    `fromDateTime=${encodeURIComponent(options.fromDateTime)}`,
    `untilDateTime=${encodeURIComponent(options.untilDateTime)}`,
  ];

  if (options.limit) {
    queryParams.push(`limit=${options.limit}`);
  }

  const url = `${LINEWORKS_API_BASE_URL}/users/${userId}/calendar/events?${queryParams.join("&")}`;

  const fetchOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "get",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, fetchOptions);
  const statusCode = response.getResponseCode();

  if (statusCode !== 200) {
    const errorBody = response.getContentText();
    throw new Error(`カレンダー予定取得失敗: ${statusCode} - ${errorBody}`);
  }

  return JSON.parse(response.getContentText());
}

/**
 * ISO8601形式の日時文字列を生成する
 * @param date - Dateオブジェクト
 * @returns ISO8601形式の文字列
 */
export function toIso8601(date: Date): string {
  return date.toISOString();
}

/**
 * 今日の開始時刻を取得（00:00:00）
 * @returns 今日の開始時刻
 */
export function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
}

/**
 * 今日の終了時刻を取得（23:59:59）
 * @returns 今日の終了時刻
 */
export function getTodayEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
}

/**
 * 予定を整形して文字列として返す
 * @param event - 予定オブジェクト
 * @returns 整形された予定文字列
 */
export function formatEvent(event: CalendarEvent): string {
  const lines: string[] = [];

  for (const component of event.eventComponents) {
    const startStr = component.start.dateTime || component.start.date || "不明";
    const endStr = component.end.dateTime || component.end.date || "不明";
    const status = component.transparency === "TRANSPARENT" ? "[空き]" : "[予定あり]";

    lines.push(`${status} ${component.summary}`);
    lines.push(`  開始: ${startStr}`);
    lines.push(`  終了: ${endStr}`);

    if (component.location) {
      lines.push(`  場所: ${component.location}`);
    }

    if (component.description) {
      lines.push(`  説明: ${component.description}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * 予定一覧をコンソールに表示する
 * @param events - 予定一覧レスポンス
 */
export function logEvents(events: CalendarEventsResponse): void {
  if (events.events.length === 0) {
    console.log("予定がありません。");
    Logger.log("予定がありません。");
    return;
  }

  console.log(`=== ${events.events.length}件の予定 ===\n`);
  Logger.log(`=== ${events.events.length}件の予定 ===`);

  for (const event of events.events) {
    const formatted = formatEvent(event);
    console.log(formatted);
    Logger.log(formatted);
  }
}
