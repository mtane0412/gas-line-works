/**
 * LINE WORKS Directory API モジュール
 * ユーザー情報の取得を行う
 */

import { LINEWORKS_API_BASE_URL } from "./constants";

/** ユーザー名 */
export interface UserName {
  lastName?: string;
  firstName?: string;
  phoneticLastName?: string;
  phoneticFirstName?: string;
}

/** ユーザー情報 */
export interface User {
  userId: string;
  email?: string;
  userName?: UserName;
  userExternalKey?: string;
  employmentTypeId?: string;
  searchable?: boolean;
  leaveOfAbsence?: boolean;
  suspended?: boolean;
}

/** ユーザー一覧レスポンス */
export interface UsersResponse {
  users: User[];
  responseMetaData?: {
    nextCursor?: string;
  };
}


/**
 * ユーザー一覧を取得する
 * @param accessToken - アクセストークン
 * @param cursor - ページネーション用カーソル（省略可）
 * @returns ユーザー一覧レスポンス
 */
export function getUsers(accessToken: string, cursor?: string): UsersResponse {
  let url = `${LINEWORKS_API_BASE_URL}/users`;

  if (cursor) {
    url += `?cursor=${encodeURIComponent(cursor)}`;
  }

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
    throw new Error(`ユーザー一覧取得失敗: ${statusCode} - ${errorBody}`);
  }

  return JSON.parse(response.getContentText());
}

/**
 * すべてのユーザーを取得する（ページネーション対応）
 * @param accessToken - アクセストークン
 * @returns すべてのユーザーの配列
 */
export function getAllUsers(accessToken: string): User[] {
  const allUsers: User[] = [];
  let cursor: string | undefined;

  do {
    const response = getUsers(accessToken, cursor);
    allUsers.push(...response.users);
    cursor = response.responseMetaData?.nextCursor;

    // Rate limit対策: 1秒待機
    if (cursor) {
      Utilities.sleep(1000);
    }
  } while (cursor);

  return allUsers;
}

/**
 * ユーザー情報を整形して文字列として返す
 * @param user - ユーザーオブジェクト
 * @returns 整形されたユーザー文字列
 */
export function formatUser(user: User): string {
  const name = user.userName
    ? `${user.userName.lastName || ""} ${user.userName.firstName || ""}`.trim()
    : "名前なし";

  return `${user.userId} | ${user.email || "メールなし"} | ${name}`;
}

/**
 * ユーザー一覧をログに表示する
 * @param users - ユーザー配列
 */
export function logUsers(users: User[]): void {
  if (users.length === 0) {
    Logger.log("ユーザーがいません。");
    return;
  }

  Logger.log(`=== ${users.length}人のユーザー ===`);
  Logger.log("userId | email | name");
  Logger.log("-".repeat(60));

  for (const user of users) {
    const formatted = formatUser(user);
    Logger.log(formatted);
  }
}
