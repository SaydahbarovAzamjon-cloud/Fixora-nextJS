# Prompt: FixoraB — getTechnicians / Search uchun backend kamchiliklarni tekshirish va to'g'rilash

FixoraF frontend tomonida P3-05 (Search Results page, `/search`) implement qilindi. Bu sahifa `getTechnicians(input: TechniciansInquiry!)` GraphQL query'siga tayanadi (schema: `docs/schema.gql`, `Users` type, `User` type). Local backend ishlamagani sababli quyidagi nuqtalar tasdiqlanmagan — shularni tekshirib, kerak bo'lsa to'g'rila:

1. **`getTechnicians` resolver/service mavjudligi va to'liqligi**
   - `getTechnicians(input: TechniciansInquiry!)` query backendda implement qilinganmi? Qaysi fayl(lar)da (resolver, service, model)?
   - `TechniciansInquiry.search` ichidagi `deviceCategory`, `isOnline`, `minAverageRating`, `text`, `userLocation` filtrlarning har biri haqiqatan DB query/aggregation'da ishlatiladimi, yoki ba'zilari schema'da e'lon qilingan-u, lekin resolver'da e'tiborga olinmaydimi?
   - `text` filtri qaysi maydonlarda (masalan `specialty`, `shopName`, service title'lari) qidiradi? Frontend "Service" filtrida iPhone/MacBook → `deviceCategory`, "screen repair"/"battery issue"/"water damage" kabi so'zlar → `text` sifatida yuboriladi — bu backend tomonda kutilgan natijani berishini tekshir.
   - `metaCounter[0].total` to'g'ri umumiy sonni qaytaradimi (pagination uchun)?

2. **`User` modelidagi technician maydonlari real ma'lumot bilan to'ladimi**
   - `averageRating`, `reviewCount`, `completedJobsCount`, `badgeLevel`, `specialty`, `shopName`, `userLocation`, `isOnline` — bularning har biri haqiqiy DB qiymatlariga asoslanganmi, yoki hali stub/null/hardcoded qiymatlarmi?
   - Agar hisoblanadigan maydonlar bo'lsa (masalan `averageRating`, `completedJobsCount`, `reviewCount`), qaysi aggregation/hisoblash logikasi orqali to'ldiriladi?

3. **`services` maydoni (`UserServiceItem { title, basePrice }`)**
   - `getTechnicians` javobida `services { title basePrice }` to'g'ri populate bo'ladimi? Frontend bu massivdan eng kichik `basePrice`'ni "From $X" narx sifatida ko'rsatadi — agar `services` bo'sh yoki noto'g'ri bo'lsa, narx umuman ko'rsatilmaydi.

4. **Yetishmayotgan maydonlar — qo'shish kerakmi yoki frontend placeholder bilan qoladimi?**
   - **Response time** — schema'da hech qanday "javob vaqti" maydoni yo'q. Frontend hozir statik `"~15m response"` matnini ko'rsatyapti. Agar backendda bunday metrika (masalan o'rtacha javob vaqti) hisoblash mumkin bo'lsa — qo'shish kerakmi yoki MVP uchun placeholder qoldirish ma'qulmi, qaror ber/tavsiya ber.
   - **Review/sharh ma'lumotlari** — `reviewCount` bor, lekin alohida sharh matni, sharh muallifi ismi, sana kabi struktura (`Review` type, `getTechnicianReviews` query) bormi? Bu Part 2 (Technician Profile page) uchun zarur — agar yo'q bo'lsa, qaysi schema/resolver/model qo'shilishi kerakligini taklif qil.

5. **Geo search + shop coordinates (MAP-01) — FixoraB implement qilindi**
   - `User.shopLatitude`, `User.shopLongitude` — technician shop coords for map pins
   - `TISearch.latitude`, `longitude`, `radiusKm` — radius filter (default 10 km); geo active bo'lsa `userLocation` regex o'tkazib yuboriladi
   - Seed: `apps/fixora-api/scripts/backfill-shop-coordinates.mjs` — mavjud technicianlar uchun Seoul-area demo coords
   - Frontend: `LocationCard` Kakao Map + orange technician pins; setup: `docs/KAKAO_MAP_SETUP.md`

## Kutilgan natija
Har bir band bo'yicha: **to'liq implement qilingan / qisman (schema'da bor-u, resolver'da ishlamaydi) / umuman yo'q** deb belgila, fayl:line referencelar bilan. Agar tuzatish kerak bo'lsa — minimal, mavjud konventsiyalarga mos patch taklif qil (hali hech narsani o'zgartirma, faqat audit va tavsiya).
