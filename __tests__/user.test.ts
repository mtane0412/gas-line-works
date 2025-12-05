/**
 * user.tsのテスト
 * ユーザー情報のフォーマットをテストする
 */

import { formatUser, User } from "../src/user";

describe("formatUser", () => {
  test("ユーザー情報を整形した文字列を返す", () => {
    const user: User = {
      userId: "user123",
      email: "user@example.com",
      userName: {
        lastName: "山田",
        firstName: "太郎",
      },
    };

    const result = formatUser(user);

    expect(result).toContain("user123");
    expect(result).toContain("user@example.com");
    expect(result).toContain("山田 太郎");
  });

  test("メールがない場合は「メールなし」と表示する", () => {
    const user: User = {
      userId: "user456",
      userName: {
        lastName: "佐藤",
        firstName: "花子",
      },
    };

    const result = formatUser(user);

    expect(result).toContain("メールなし");
  });

  test("名前がない場合は「名前なし」と表示する", () => {
    const user: User = {
      userId: "user789",
      email: "noname@example.com",
    };

    const result = formatUser(user);

    expect(result).toContain("名前なし");
  });

  test("姓のみの場合は姓だけ表示する", () => {
    const user: User = {
      userId: "user101",
      email: "lastname@example.com",
      userName: {
        lastName: "鈴木",
      },
    };

    const result = formatUser(user);

    expect(result).toContain("鈴木");
  });
});
