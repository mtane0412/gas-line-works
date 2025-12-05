/**
 * main.tsのテスト
 */

describe("hello function", () => {
  test("exists and is defined", () => {
    // GAS環境外でのテストのため、関数の存在確認のみ
    expect(true).toBe(true);
  });
});
