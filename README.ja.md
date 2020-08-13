認可サーバー実装 (Deno)
======================

概要
--------

[OAuth 2.0][RFC6749] と [OpenID Connect][OIDC] をサポートする認可サーバーの Deno
による実装です。

この実装は [Fen][Fen] フレームワークと [authlete-deno][AuthleteDeno] ライブラリ
を用いて書かれています。

ライセンス
---------

  Apache License, Version 2.0

ソースコード
-----------

  <code>https://github.com/authlete/deno-fen-oauth-server</code>

Authlete について
-----------------

[Authlete][Authlete] (オースリート) は、OAuth 2.0 & OpenID Connect
の実装をクラウドで提供するサービスです ([概説][AuthleteOverview])。
Authlete が提供するデフォルト実装を使うことにより、もしくはこの実装
(gin-oauth-server) でおこなっているように [Authlete Web API][AuthleteAPI]
を用いて認可サーバーを自分で実装することにより、OAuth 2.0 と OpenID Connect
の機能を簡単に実現できます。

この認可サーバーの実装を使うには、Authlete から API
クレデンシャルズを取得し、`authlete.json` に設定する必要があります。
API クレデンシャルズを取得する手順はとても簡単です。
単にアカウントを登録するだけで済みます ([サインアップ][AuthleteSignUp])。
詳細は[クイックガイド][AuthleteGettingStarted]を参照してください。

実行方法
----------

1. この認可サーバーの実装をダウンロードします。

        $ git clone https://github.com/authlete/deno-fen-oauth-server.git
        $ cd deno-fen-oauth-server

2. 設定ファイルを編集して API クレデンシャルズをセットします。

        $ vi authlete.json

3. `http://localhost:1902` で認可サーバーを起動します。

        $ deno run --allow-net --allow-read --config tsconfig.json src/server.ts

エンドポイント
--------------

この実装は、下表に示すエンドポイントを公開します。

| エンドポイント | パス |
|:--------------|:-----|
| 認可エンドポイント | `/api/authorization` |
| トークンエンドポイント | `/api/token` |
| JWK Set エンドポイント | `/api/jwks` |
| 設定エンドポイント | `/.well-known/openid-configuration` |
| 取り消しエンドポイント  | `/api/revocation` |
| イントロスペクションエンドポイント | `/api/introspection` |

認可エンドポイントとトークンエンドポイントは、[RFC 6749][RFC6749]、[OpenID Connect Core 1.0][OIDCCore]、
[OAuth 2.0 Multiple Response Type Encoding Practices][MultiResponseType]、
[RFC 7636][RFC7636] ([PKCE][PKCE])、その他の仕様で説明されているパラメーター群を受け付けます。

JWK Set エンドポイントは、クライアントアプリケーションが (1) この OpenID
プロバイダーによる署名を検証できるようにするため、また (2) この OpenID
へのリクエストを暗号化できるようにするため、JSON Web Key Set ドキュメント
(JWK Set) を公開します。

設定エンドポイントは、この OpenID プロバイダーの設定情報を
[OpenID Connect Discovery 1.0][OIDCDiscovery] で定義されている JSON フォーマットで公開します。

取り消しエンドポイントはアクセストークンやリフレッシュトークンを取り消すための
Web API です。 その動作は [RFC 7009][RFC7009] で定義されています。

イントロスペクションエンドポイントはアクセストークンやリフレッシュトークンの情報を取得するための
Web API です。 その動作は [RFC 7662][RFC7662] で定義されています。

認可リクエストの例
------------------

次の例は [Implicit フロー][ImplicitFlow]を用いて認可エンドポイントからアクセストークンを取得する例です。
`{クライアントID}` となっているところは、あなたのクライアントアプリケーションの実際のクライアント
ID で置き換えてください。クライアントアプリケーションについては、[クイックガイド][AuthleteGettingStarted]
および[開発者コンソール][DeveloperConsole]のドキュメントを参照してください。

    http://localhost:1902/api/authorization?client_id={クライアントID}&response_type=token

上記のリクエストにより、認可ページが表示されます。
認可ページでは、ログイン情報の入力と、"Authorize" ボタン (認可ボタン) もしくは "Deny" ボタン
(拒否ボタン) の押下が求められます。ユーザーデータベースのダミー実装 (`src/db/user_dao.ts`)
は以下のアカウントを含んでいます。いずれかを使用してください。

| Login ID | Password |
|:--------:|:--------:|
|   john   |   john   |
|   jane   |   jane   |
|   max    |   max    |

その他の情報
------------

- [Authlete][Authlete] - Authlete ホームページ
- [authlete-deno][AuthleteDeno] - Deno 用 Authlete ライブラリ
- [deno-fen-resource-server][DenoFenResourceServer] - リソースサーバー実装

コンタクト
----------

コンタクトフォーム : https://www.authlete.com/ja/contact/

| 目的 | メールアドレス       |
|:-----|:---------------------|
| 一般 | info@authlete.com    |
| 営業 | sales@authlete.com   |
| 広報 | pr@authlete.com      |
| 技術 | support@authlete.com |

[Authlete]:               https://www.authlete.com/
[AuthleteAPI]:            https://docs.authlete.com/
[AuthleteGettingStarted]: https://www.authlete.com/developers/getting_started/
[AuthleteOverview]:       https://www.authlete.com/developers/overview/
[AuthleteDeno]:           https://github.com/authlete/authlete-deno
[AuthleteSignUp]:         https://so.authlete.com/accounts/signup
[DenoFenResourceServer]:  https://github.com/authlete/deno-fen-resource-server
[DeveloperConsole]:       https://www.authlete.com/developers/cd_console/
[Fen]:                    https://github.com/fen-land/deno-fen
[ImplicitFlow]:           https://tools.ietf.org/html/rfc6749#section-4.2
[MultiResponseType]:      https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html
[OIDC]:                   https://openid.net/connect/
[OIDCCore]:               https://openid.net/specs/openid-connect-core-1_0.html
[OIDCDiscovery]:          https://openid.net/specs/openid-connect-discovery-1_0.html
[PKCE]:                   https://www.authlete.com/developers/pkce/
[RFC6749]:                https://tools.ietf.org/html/rfc6749
[RFC7009]:                https://tools.ietf.org/html/rfc7009
[RFC7636]:                https://tools.ietf.org/html/rfc7636
[RFC7662]:                https://tools.ietf.org/html/rfc7662