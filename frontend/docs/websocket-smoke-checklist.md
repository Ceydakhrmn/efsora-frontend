# WebSocket Smoke Checklist

Bu kontrol listesi, bildirim altyapisinda temel davranislarin bozulmadigini hizlica dogrulamak icin kullanilir.

## Kapsam

- Dosyalar:
  - `src/lib/websocket.ts`
  - `src/hooks/useNotifications.ts`
- Hedef:
  - Tekrarlayan bildirim (duplicate) olmamasi
  - Baglanti yasam dongusunun dogru yonetilmesi (connect/disconnect/reconnect)
  - Birden fazla tuketicide erken disconnect olmamasi

## On Kosullar

1. Backend ayakta olmali ve WebSocket endpoint'i erisilebilir olmali.
2. Gecerli bir kullanici ile giris yapilmis olmali.
3. Bildirim olusturabilecek bir aksiyon veya test endpoint'i hazir olmali.

## Adimlar

1. Login ol ve uygulamayi ac.
- Beklenen: Konsolda baglanti hatasi olmadan bildirim altyapisi aktif olur.

2. Bildirim panelini ac-kapat ve sayfa rotalari arasinda gez.
- Beklenen: Baglanti kopmadan devam eder.

3. Yeni bir bildirim tetikle.
- Beklenen: Bildirim tek kez gorunur, ayni event iki kez dusmez.

4. Ayni anda bildirimleri gosteren iki UI tuketicisini acik tut (ornek: panel + merkez).
- Beklenen: Tek baglanti uzerinden akis surer, erken disconnect olmaz.

5. Logout ol.
- Beklenen: WebSocket baglantisi kapanir ve yeni event alinmaz.

6. Tekrar login ol.
- Beklenen: Baglanti yeniden kurulur, yeni bildirimler normal sekilde gelir.

## Basarisizlik Durumunda

- Browser Console loglarini al.
- Network tabinda `ws` veya SockJS isteklerini kontrol et.
- Son commit ile bir onceki commit arasinda sadece websocket farkini karsilastir.

## Not

Bu liste manuel smoke test icindir; her release oncesi en az bir kez uygulanmasi onerilir.
