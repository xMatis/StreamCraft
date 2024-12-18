# Twitch Authentication API

API stworzone w Node.js, które umożliwia uwierzytelnianie użytkowników za pomocą Twitch.

---

## **Podstawowy URL**

```
http://localhost:3000/api
```

---

## **Wymagana autentykacja dostępu**

Każde żądanie do API wymaga dołączenia specjalnego tokenu autentykacji w nagłówku `Authorization` w formacie `Bearer <TWÓJ_TOKEN>`.

**Przykład**:

```http
Authorization: Bearer token_api
```

Jeśli token jest niepoprawny lub nie ma go w żądaniu, API zwróci odpowiedź z kodem HTTP 403 i komunikatem:

```json
{
  "success": false,
  "message": "Forbidden: Invalid or missing token"
}
```

## **Endpointy**

1. **Pobierz URL do logowania przez Twitch
   GET** `/auth/twitch`

Odpowiedź:

```json
{
  "authUrl": "https://id.twitch.tv/oauth2/authorize?client_id=twoj_client_id&redirect_uri=twoj_callback_url&response_type=code&scope=user_read"
}
```

Ten URL należy wykorzystać, aby przekierować użytkownika do logowania za pomocą Twitch.

2. **Callback autoryzacyjny Twitch**

GET `/auth/twitch/callback`

Ten endpoint jest automatycznie wywoływany przez Twitch po zakończeniu procesu logowania (udanym lub nie).

Odpowiedź w przypadku sukcesu:

```json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "id": "123456",
    "displayName": "TwitchUser",
    "profileImageUrl": "https://link.to/image.jpg"
  }
}
```

Odpowiedź w przypadku błędu:

```json
{
  "success": false,
  "message": "Authentication failed"
}
```

3. **Sprawdź status zalogowania**

GET `/auth/check`

Ten endpoint umożliwia sprawdzenie, czy użytkownik jest obecnie zalogowany.

Odpowiedź, jeśli użytkownik jest zalogowany:

```json
{
  "loggedIn": true,
  "user": {
    "id": "123456",
    "displayName": "TwitchUser",
    "profileImageUrl": "https://link.to/image.jpg"
  }
}
```

Odpowiedź, jeśli użytkownik nie jest zalogowany:

```json
{
  "loggedIn": false
}
```

4. **Wylogowanie**

POST `/auth/logout`

Wylogowuje aktualnie zalogowanego użytkownika.

Odpowiedź:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Jak korzystać z API

Przykład w PHP

```php
<?php
// Przykład: Pobieranie URL do logowania przez Twitch
$apiBase = 'http://localhost:3000/api';

// Krok 1: Pobierz URL do logowania
$response = file_get_contents("$apiBase/auth/twitch", false, stream_context_create([
    "http" => [
        "header" => "Authorization: Bearer twoj_unikalny_token_api"
    ]
]));
$data = json_decode($response, true);
$authUrl = $data['authUrl'];

// Przekieruj użytkownika do Twitch
header("Location: $authUrl");
exit;

// Krok 2: Po callbacku sprawdź status użytkownika
$response = file_get_contents("$apiBase/auth/check", false, stream_context_create([
    "http" => [
        "header" => "Authorization: Bearer twoj_unikalny_token_api"
    ]
]));
$userData = json_decode($response, true);

if ($userData['loggedIn']) {
    echo "Użytkownik jest zalogowany: " . $userData['user']['displayName'];
} else {
    echo "Użytkownik nie jest zalogowany.";
}
?>
```

## Zmienne środowiskowe

Utwórz plik `.env` w głównym katalogu projektu i skonfiguruj następujące zmienne:

```env
TWITCH_CLIENT_ID=twoj_twitch_client_id
TWITCH_CLIENT_SECRET=twoj_twitch_client_secret
TWITCH_CALLBACK_URL=http://localhost:3000/api/auth/twitch/callback
SESSION_SECRET=twoj_session_secret
API_ACCESS_TOKEN=twoj_unikalny_token_api
```

## Uwagi

- W środowisku produkcyjnym korzystaj z HTTPS.
- Upewnij się, że zmienna TWITCH_CALLBACK_URL jest poprawnie skonfigurowana w ustawieniach Twojej aplikacji Twitch.

## Licencja

Projekt udostępniany na licencji MIT.
