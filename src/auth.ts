/**
 * LINE WORKS API サービスアカウント認証モジュール
 * JWTを生成してアクセストークンを取得する
 */

/** 認証に必要な設定情報 */
export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  serviceAccount: string;
  privateKey: string;
  scope: string;
  targetUserId?: string;
}

/** アクセストークンのレスポンス */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/** JWT Header */
interface JwtHeader {
  alg: string;
  typ: string;
}

/** JWT Payload */
interface JwtPayload {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
}

/**
 * Base64URL エンコード
 * @param data - エンコードする文字列
 * @returns Base64URLエンコードされた文字列
 */
export function base64UrlEncode(data: string): string {
  const base64 = Utilities.base64Encode(data, Utilities.Charset.UTF_8);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * バイト配列をBase64URLエンコード
 * @param bytes - エンコードするバイト配列
 * @returns Base64URLエンコードされた文字列
 */
export function base64UrlEncodeBytes(bytes: number[]): string {
  const base64 = Utilities.base64Encode(bytes);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * JWTを生成する
 * @param config - 認証設定
 * @returns 署名付きJWT文字列
 */
export function createJwt(config: AuthConfig): string {
  const header: JwtHeader = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    iss: config.clientId,
    sub: config.serviceAccount,
    iat: now,
    exp: now + 3600, // 1時間後
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;

  // 秘密鍵で署名（RSA-SHA256）
  const signature = Utilities.computeRsaSha256Signature(signatureInput, config.privateKey);
  const signatureEncoded = base64UrlEncodeBytes(signature);

  return `${signatureInput}.${signatureEncoded}`;
}

/**
 * アクセストークンを取得する
 * @param config - 認証設定
 * @returns アクセストークン
 */
export function getAccessToken(config: AuthConfig): string {
  const jwt = createJwt(config);
  const tokenEndpoint = "https://auth.worksmobile.com/oauth2/v2.0/token";

  const payload = {
    assertion: jwt,
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: config.scope,
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: payload,
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(tokenEndpoint, options);
  const statusCode = response.getResponseCode();

  if (statusCode !== 200) {
    const errorBody = response.getContentText();
    throw new Error(`アクセストークン取得失敗: ${statusCode} - ${errorBody}`);
  }

  const result: TokenResponse = JSON.parse(response.getContentText());
  return result.access_token;
}

/**
 * スクリプトプロパティから認証設定を取得する
 * @returns 認証設定
 */
export function getAuthConfigFromProperties(): AuthConfig {
  const props = PropertiesService.getScriptProperties();
  const clientId = props.getProperty("CLIENT_ID");
  const clientSecret = props.getProperty("CLIENT_SECRET");
  const serviceAccount = props.getProperty("SERVICE_ACCOUNT");
  const privateKey = props.getProperty("PRIVATE_KEY");
  const scope = props.getProperty("SCOPE") || "calendar,user.read";
  const targetUserId = props.getProperty("TARGET_USER_ID") || undefined;

  if (!clientId || !clientSecret || !serviceAccount || !privateKey) {
    throw new Error(
      "必要なプロパティが設定されていません。" +
        "CLIENT_ID, CLIENT_SECRET, SERVICE_ACCOUNT, PRIVATE_KEY を設定してください。"
    );
  }

  return {
    clientId,
    clientSecret,
    serviceAccount,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    scope,
    targetUserId,
  };
}
