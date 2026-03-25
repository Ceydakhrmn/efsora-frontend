# Efsora Labs Backend

Efsora Labs Backend, Spring Boot tabanli bir REST API servisidir.
Kullanici yonetimi, JWT tabanli kimlik dogrulama ve refresh token akisi sunar.

## Proje Ne Ise Yarar?

- Kullanici kaydi ve giris islemleri
- JWT access token + refresh token yonetimi
- Kullanici CRUD endpoint'leri
- PostgreSQL ile kalici veri saklama
- Swagger/OpenAPI dokumantasyonu

## Gereksinimler

- Docker
- Docker Compose v2 (`docker compose`)

## Kurulum (Docker ile)

1. Ornek ortam degiskenlerini kopyala:

```bash
cp .env.example .env
```

2. `.env` dosyasinda en az su degerleri guncelle:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`

3. Sistemi ayaga kaldir:

```bash
cd backend
./mvnw clean package -DskipTests
cd ..
docker compose up --build -d
```

Not: Docker image artik backend jar dosyasini lokalde olusturulmus artifact'tan alir. Bu nedenle her kod degisikliginden sonra yukaridaki Maven komutunu tekrar calistirin.

4. Log kontrolu:

```bash
docker compose logs -f backend
```

5. Durdurma:

```bash
docker compose down
```

## Servisler

- Backend API: `http://localhost:8081`
- Frontend (Vite): `http://localhost:5173`
- Swagger UI: `http://localhost:8081/swagger-ui/index.html`
- PostgreSQL: `localhost:5432`

## API Endpoints

### Auth Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/test`

### Kullanici Endpoints

- `GET /api/kullanicilar`
- `GET /api/kullanicilar/{id}`
- `POST /api/kullanicilar`
- `PUT /api/kullanicilar/{id}`
- `DELETE /api/kullanicilar/{id}`
- `DELETE /api/kullanicilar/{id}/permanent`
- `GET /api/kullanicilar/active`
- `GET /api/kullanicilar/email/{email}`
- `GET /api/kullanicilar/departman/{departman}`
- `GET /api/kullanicilar/health`

## Ornek Login (curl)

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmet@test.com",
    "password": "Pass123!"
  }'
```

Basarili cevapta `token` ve `refreshToken` doner.

## Secret Yonetimi

Bu projede hassas bilgiler kaynak koddan ayrilmistir.

- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`

Degerler `.env` ve container environment uzerinden enjekte edilir. Bu nedenle `.env` dosyasini versiyon kontrolune eklemeyin.

## Notlar

- Veritabani baglantisi container icinde `postgres` host adi ile kurulur.
- Lokal (Docker disi) calistirma icin de env degiskenleri tanimlanmalidir.
