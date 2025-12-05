/**
 * LINE WORKS API連携のメインエントリーポイント
 * サービスアカウント認証でカレンダーの予定を取得してconsole表示する
 */

import { getAccessToken, getAuthConfigFromProperties } from "./auth";
import {
  getCalendarEvents,
  getTodayStart,
  getTodayEnd,
  toIso8601,
  logEvents,
} from "./calendar";
import { getAllUsers, logUsers } from "./user";

/**
 * 動作確認用の関数
 * GASエディタから実行してconsoleに出力を表示
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hello(): void {
  console.log("Hello from LINE WORKS API project!");
  Logger.log("Logger: Hello from LINE WORKS API project!");
}

/**
 * 今日のカレンダー予定を取得して表示する
 * GASエディタから実行する
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fetchTodayEvents(): void {
  try {
    console.log("認証情報を取得中...");
    const config = getAuthConfigFromProperties();

    if (!config.targetUserId) {
      throw new Error(
        "TARGET_USER_IDが設定されていません。カレンダー取得にはTARGET_USER_IDが必要です。"
      );
    }

    console.log("アクセストークンを取得中...");
    const accessToken = getAccessToken(config);
    console.log("アクセストークン取得成功");

    const fromDateTime = toIso8601(getTodayStart());
    const untilDateTime = toIso8601(getTodayEnd());

    console.log(`予定を取得中... (${fromDateTime} 〜 ${untilDateTime})`);

    const events = getCalendarEvents(accessToken, config.targetUserId, {
      fromDateTime,
      untilDateTime,
    });

    logEvents(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`エラー: ${message}`);
    Logger.log(`エラー: ${message}`);
  }
}

/**
 * 指定した期間のカレンダー予定を取得して表示する
 * @param fromDate - 開始日（省略時は今日）
 * @param untilDate - 終了日（省略時は今日）
 */
function fetchEventsForPeriod(fromDate?: Date, untilDate?: Date): void {
  try {
    const config = getAuthConfigFromProperties();

    if (!config.targetUserId) {
      throw new Error(
        "TARGET_USER_IDが設定されていません。カレンダー取得にはTARGET_USER_IDが必要です。"
      );
    }

    const accessToken = getAccessToken(config);

    const from = fromDate || getTodayStart();
    const until = untilDate || getTodayEnd();

    const events = getCalendarEvents(accessToken, config.targetUserId, {
      fromDateTime: toIso8601(from),
      untilDateTime: toIso8601(until),
    });

    logEvents(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`エラー: ${message}`);
    Logger.log(`エラー: ${message}`);
  }
}

/**
 * 今週のカレンダー予定を取得して表示する
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fetchThisWeekEvents(): void {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // 週の開始（日曜日）
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  // 週の終了（土曜日）
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  console.log(`今週の予定を取得中...`);
  fetchEventsForPeriod(weekStart, weekEnd);
}

/**
 * ユーザー一覧を取得して表示する
 * GASエディタから実行する
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fetchUserList(): void {
  try {
    console.log("認証情報を取得中...");
    const config = getAuthConfigFromProperties();

    console.log("アクセストークンを取得中...");
    const accessToken = getAccessToken(config);
    console.log("アクセストークン取得成功");

    console.log("ユーザー一覧を取得中...");
    const users = getAllUsers(accessToken);

    logUsers(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`エラー: ${message}`);
    Logger.log(`エラー: ${message}`);
  }
}
