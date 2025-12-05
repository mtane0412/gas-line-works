/**
 * auth.tsのテスト
 * GAS環境のモックを使用してJWT生成とトークン取得をテストする
 */

import { base64UrlEncode, base64UrlEncodeBytes, createJwt, AuthConfig } from "../src/auth";

// GAS環境のモック
const mockUtilities = {
  base64Encode: jest.fn((data: string | number[]) => {
    if (typeof data === "string") {
      return Buffer.from(data).toString("base64");
    }
    return Buffer.from(data).toString("base64");
  }),
  Charset: {
    UTF_8: "UTF_8" as const,
  },
  computeRsaSha256Signature: jest.fn(() => [1, 2, 3, 4, 5]),
};

// グローバルにUtilitiesをモック
(global as unknown as { Utilities: typeof mockUtilities }).Utilities = mockUtilities;

describe("base64UrlEncode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("文字列をBase64URLエンコードする", () => {
    const input = '{"alg":"RS256","typ":"JWT"}';
    const result = base64UrlEncode(input);

    expect(mockUtilities.base64Encode).toHaveBeenCalledWith(input, "UTF_8");
    expect(result).not.toContain("+");
    expect(result).not.toContain("/");
    expect(result).not.toMatch(/=+$/);
  });

  test("Base64の特殊文字を正しく置換する", () => {
    // +, /, = を含むBase64を返すようにモック
    mockUtilities.base64Encode.mockReturnValueOnce("abc+def/ghi==");
    const result = base64UrlEncode("test");

    expect(result).toBe("abc-def_ghi");
  });
});

describe("base64UrlEncodeBytes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("バイト配列をBase64URLエンコードする", () => {
    const bytes = [1, 2, 3, 4, 5];
    const result = base64UrlEncodeBytes(bytes);

    expect(mockUtilities.base64Encode).toHaveBeenCalledWith(bytes);
    expect(result).not.toContain("+");
    expect(result).not.toContain("/");
    expect(result).not.toMatch(/=+$/);
  });
});

describe("createJwt", () => {
  const mockConfig: AuthConfig = {
    clientId: "test-client-id",
    clientSecret: "test-client-secret",
    serviceAccount: "test@example.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----",
    scope: "calendar",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("JWT形式の文字列を返す（header.payload.signature）", () => {
    const jwt = createJwt(mockConfig);

    const parts = jwt.split(".");
    expect(parts).toHaveLength(3);
  });

  test("正しいヘッダーを含むJWTを生成する", () => {
    mockUtilities.base64Encode.mockImplementation((data: string | number[]) => {
      if (typeof data === "string") {
        return Buffer.from(data).toString("base64");
      }
      return Buffer.from(data).toString("base64");
    });

    createJwt(mockConfig);

    // 最初の呼び出しはヘッダー
    const firstCall = mockUtilities.base64Encode.mock.calls[0];
    const header = JSON.parse(firstCall[0] as string);

    expect(header.alg).toBe("RS256");
    expect(header.typ).toBe("JWT");
  });

  test("正しいペイロードを含むJWTを生成する", () => {
    mockUtilities.base64Encode.mockImplementation((data: string | number[]) => {
      if (typeof data === "string") {
        return Buffer.from(data).toString("base64");
      }
      return Buffer.from(data).toString("base64");
    });

    createJwt(mockConfig);

    // 2番目の呼び出しはペイロード
    const secondCall = mockUtilities.base64Encode.mock.calls[1];
    const payload = JSON.parse(secondCall[0] as string);

    expect(payload.iss).toBe(mockConfig.clientId);
    expect(payload.sub).toBe(mockConfig.serviceAccount);
    expect(payload.iat).toBe(Math.floor(new Date("2025-01-01T00:00:00Z").getTime() / 1000));
    expect(payload.exp).toBe(payload.iat + 3600);
  });

  test("秘密鍵で署名を計算する", () => {
    createJwt(mockConfig);

    expect(mockUtilities.computeRsaSha256Signature).toHaveBeenCalledWith(
      expect.any(String),
      mockConfig.privateKey
    );
  });
});
