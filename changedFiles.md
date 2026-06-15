# Changed Files

> Qo'lda yuritiladigan o'zgarishlar jurnali (git o'rniga).
> Har bir o'zgarish fayl bo'yicha guruhlangan: `-` olib tashlangan qator, `+` qo'shilgan qator.
> **Har safar kod o'zgarganda bu fayl yangilanadi.**

**Oxirgi yangilanish:** 2026-06-16

---

## 1. `libs/components/layout/LayoutAuth.tsx`

### Hydration fix — `<title>` bitta matn node bo'lishi kerak
Sabab: ikki bola (`{...}` + matn) `<!-- -->` separator yasaydi → `<title>` ichida hydration mismatch → butun sahifa client'da qayta render → `<img> in <div>` xatosi.

```diff
- <title>{t(pageTitleKey)} | Fixora</title>
+ <title>{`${t(pageTitleKey)} | Fixora`}</title>
```

---

## 2. `libs/components/auth/TechIdUpload.tsx`

### 2a. Hydration fix + preview state olib tashlandi
Sabab: `loadTechDraft()` render paytida `sessionStorage` o'qiydi (server'da `null`, client'da preview bor) → birinchi client render server bilan mos kelmaydi. Preview butunlay olib tashlandi.

```diff
- const draft = loadTechDraft();
- const [fileName, setFileName] = useState(draft?.idFileName ?? '');
- const [previewUrl, setPreviewUrl] = useState(draft?.idPreviewDataUrl ?? '');
- const [isImage, setIsImage] = useState(!!draft?.idPreviewDataUrl);
- const [loading, setLoading] = useState(false);
-
- useEffect(() => {
-   return () => {
-     if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
-   };
- }, [previewUrl]);
+ const [fileName, setFileName] = useState('');
+ const [loading, setLoading] = useState(false);
+
+ // Restore the saved draft only after mount so SSR and the first client
+ // render match (sessionStorage is unavailable during SSR).
+ useEffect(() => {
+   const draft = loadTechDraft();
+   if (!draft) return;
+   setFileName(draft.idFileName ?? '');
+ }, []);
```

### 2b. `persistFile` + `handleFile` — dataURL/FileReader olib tashlandi
```diff
- const persistFile = (file: File, dataUrl?: string) => {
+ const persistFile = (file: File) => {
    const current = loadTechDraft();
    if (!current?.email || !current?.fullName) return;
    saveTechDraft({
      ...current,
      idFileName: file.name,
-     idPreviewDataUrl: dataUrl,
    });
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
-
-   if (file.type.startsWith('image/')) {
-     const reader = new FileReader();
-     reader.onload = () => {
-       const dataUrl = typeof reader.result === 'string' ? reader.result : '';
-       setPreviewUrl(dataUrl);
-       setIsImage(true);
-       persistFile(file, dataUrl);
-     };
-     reader.readAsDataURL(file);
-     return;
-   }
-
-   setPreviewUrl('');
-   setIsImage(false);
-   persistFile(file);
+   persistFile(file);
  };
```

### 2c. Render — preview `<img>` olib tashlandi, fayl nomi ko'rsatiladi
```diff
- <div className={`auth-tech__upload ${previewUrl ? 'auth-tech__upload--has-image' : ''}`} ...>
-   {previewUrl && isImage ? (
-     <img src={previewUrl} alt="" className="auth-tech__upload-preview" />
-   ) : (
-     <>
-       <CloudUploadOutlined />
-       <strong>{t('tech.idUpload')}</strong>
-       <span>{fileName || t('tech.idHint')}</span>
-     </>
-   )}
- </div>
- {fileName && !isImage && (
-   <p className="auth-tech__file-name">{fileName}</p>
- )}
+ <div className="auth-tech__upload" ...>
+   <CloudUploadOutlined />
+   <strong>{t('tech.idUpload')}</strong>
+   <span>{fileName || t('tech.idHint')}</span>
+ </div>
```

---

## 3. `libs/components/auth/TechOnboardingStep1.tsx`

### 3a. Hydration fix + photo preview state olib tashlandi
```diff
- const draft = loadTechDraft();
  const fileRef = useRef<HTMLInputElement>(null);
- const [fullName, setFullName] = useState(draft?.fullName ?? '');
- const [email, setEmail] = useState(draft?.email ?? '');
- const [phone, setPhone] = useState(draft?.phone ?? '');
- const [photoPreview, setPhotoPreview] = useState(draft?.photoDataUrl ?? '');
- const [photoFileName, setPhotoFileName] = useState(draft?.photoFileName ?? '');
+ const [fullName, setFullName] = useState('');
+ const [email, setEmail] = useState('');
+ const [phone, setPhone] = useState('');
+ const [photoFileName, setPhotoFileName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

+ // Restore the saved draft only after mount so SSR and the first client
+ // render match (sessionStorage is unavailable during SSR).
+ useEffect(() => {
+   const draft = loadTechDraft();
+   if (!draft) return;
+   setFullName(draft.fullName ?? '');
+   setEmail(draft.email ?? '');
+   setPhone(draft.phone ?? '');
+   setPhotoFileName(draft.photoFileName ?? '');
+ }, []);
-
- useEffect(() => {
-   return () => {
-     if (photoPreview.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
-   };
- }, [photoPreview]);
```

### 3b. `handlePhoto` — FileReader/dataURL olib tashlandi
```diff
  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
-
-   const reader = new FileReader();
-   reader.onload = () => {
-     const dataUrl = typeof reader.result === 'string' ? reader.result : '';
-     setPhotoPreview(dataUrl);
-     setPhotoFileName(file.name);
-     const current = loadTechDraft();
-     saveTechDraft({
-       fullName: current?.fullName ?? fullName,
-       email: current?.email ?? email,
-       phone: current?.phone ?? phone,
-       photoFileName: file.name,
-       photoDataUrl: dataUrl,
-       idFileName: current?.idFileName,
-       idPreviewDataUrl: current?.idPreviewDataUrl,
-     });
-   };
-   reader.readAsDataURL(file);
+   setPhotoFileName(file.name);
+   const current = loadTechDraft();
+   saveTechDraft({
+     fullName: current?.fullName ?? fullName,
+     email: current?.email ?? email,
+     phone: current?.phone ?? phone,
+     photoFileName: file.name,
+     idFileName: current?.idFileName,
+   });
  };
```

### 3c. `handleContinue` — dataURL maydonlari va `photoPreview` dep olib tashlandi
```diff
    saveTechDraft({
      fullName,
      email,
      phone,
      photoFileName: photoFileName || current?.photoFileName,
-     photoDataUrl: photoPreview || current?.photoDataUrl,
      idFileName: current?.idFileName,
-     idPreviewDataUrl: current?.idPreviewDataUrl,
    });
    router.push('/register/technician/id');
- }, [fullName, email, phone, photoFileName, photoPreview, router]);
+ }, [fullName, email, phone, photoFileName, router]);
```

### 3d. Render — photo preview `<img>` olib tashlandi, fayl nomi ko'rsatiladi
```diff
- <div className={`auth-tech__photo ${photoPreview ? 'auth-tech__photo--has-image' : ''}`} ...>
-   {photoPreview ? (
-     <img src={photoPreview} alt="" className="auth-tech__photo-preview" />
-   ) : (
-     <>
-       <AddAPhotoOutlined />
-       <span>{t('tech.photoUpload')}</span>
-     </>
-   )}
- </div>
+ <div className="auth-tech__photo" ...>
+   <AddAPhotoOutlined />
+   <span>{photoFileName || t('tech.photoUpload')}</span>
+ </div>
```

---

# Technician section — pixel-perfect redesign (2026-06-16)

Barcha texnik (technician) sahifalari dizayn rasmlariga 1:1 moslashtirildi.
**Faqat vizual qatlam** oʻzgardi — barcha GraphQL query/mutation, hook, state,
routing, permission saqlandi. Umumiy oʻzgarishlar: emoji ikonlar → MUI `*Outlined`
ikonlar; inline-style → class-based + alohida SCSS.

## Index — oʻzgargan fayllar va qatorlar

| # | Fayl | Tur | Qatorlar | Nima oʻzgardi |
|---|------|-----|----------|---------------|
| 1 | `pages/technician/dashboard.tsx` | rewrite | 510 (butun fayl) | emoji→ikon, stat-karta ikon oʻngga, grid 2-qator + full-width Reviews |
| 2 | `pages/technician/requests/index.tsx` | rewrite | 366 (butun fayl) | DeviceGlyph, filtrlar, detail rating/warranty/photos, sticky action bar |
| 3 | `pages/technician/jobs/index.tsx` | rewrite | 320 (butun fayl) | status filter chiplar+sanoq, vertikal timeline, sticky action bar |
| 4 | `pages/technician/messages/index.tsx` | rewrite | 253 (butun fayl) | chat UI (conv list + bubbles + composer) |
| 5 | `pages/technician/notifications/index.tsx` | fix + rewrite | 150 (butun fayl) | L49 sintaksis tuzatildi, soʻng Notification Center |
| 6 | `pages/technician/profile/index.tsx` | rewrite | 391 (butun fayl) | header/stories/tablar + Overview/Services/Portfolio/Reviews |
| 7 | `pages/technician/analytics/index.tsx` | rewrite | 286 (butun fayl) | 6 KPI + 4 chart + Top Clients (recharts) |
| 8 | `pages/technician/earnings/index.tsx` | rewrite | 307 (butun fayl) | 4 stat + 2 chart + transactions + payout history (query saqlandi) |
| 9 | `libs/components/technician/Header.tsx` | rewrite | 142 (butun fayl) | ikonlar; "Sign Out" → logout; ishlatilmagan scss import olib tashlandi |
| 10 | `libs/components/technician/TechnicianSidebar.tsx` | rewrite | 122 (butun fayl) | ikonlar; Settings/Help qoʻshildi; oddiy badge; user-card |
| 11 | `scss/pc/technician/technician-dashboard.scss` | edit | 1319 (turli joylar) | layout offset, sidebar/header/stat/quick-action/grid qoidalari |
| 12 | `scss/pc/technician/technician-requests.scss` | edit | 580 (turli joylar) | right-pane flex, badge, device-icon, +actionbar (L495), rating/photos |
| 13 | `scss/pc/technician/technician-jobs.scss` | append | L583–1040 | yangi `.fixora-jobs-*` bloki |
| 14 | `scss/pc/technician/technician-messages.scss` | append | L533–979 | yangi `.fixora-msg-*` bloki |
| 15 | `scss/pc/technician/technician-notifications.scss` | append | L327–531 | yangi `.fixora-notif-*` bloki |
| 16 | `scss/pc/technician/technician-profile.scss` | append | L305–1098 | `.fixora-pp-*` (header/stories/tabs + Trust/Spec L666 + Services/Port/Reviews L773) |
| 17 | `scss/pc/technician/technician-analytics.scss` | **NEW** | 360 | `.fixora-an-*` |
| 18 | `scss/pc/technician/technician-earnings.scss` | **NEW** | 483 | `.fixora-ea-*` |
| 19 | `scss/pc/main.scss` | edit | L54, L55 | 2 ta import qoʻshildi (analytics, earnings) |

---

## Tafsilot (fayl boʻyicha)

### 1. `pages/technician/dashboard.tsx` — butun fayl qayta yozildi
```diff
- const DEVICE_ICON = { IPHONE:'📱', ... }; deviceIcon()
+ const DeviceIcon = ({type}) => <Smartphone/Tablet/Laptop/Watch/Build Outlined/>
- quick actions: "⚡ New Quote" (emoji matn)
+ <BoltOutlined/> + <span>New Quote</span> (Check/Calendar/NorthEast); ikon 20px
- stat-card: icon CHAPDA, "📈 +x% vs last week"
+ stat-card: __top(label + icon OʻNGDA), value, <TrendingUpOutlined/> yashil "+x"
- request/job device emoji; job-status pill bg; ⭐ repeat; 📈 earnings
+ <DeviceIcon/>; job-status oddiy rangli matn; 5× <StarOutlined/>; schedule clock/check
- grid: __left[Incoming Requests, Active Jobs] | __right[Earnings, Schedule, Reviews]
+ grid (2x2): Incoming Requests | Active Jobs / Weekly Earnings | Today's Schedule
+ Recent Reviews — grid'dan tashqarida, full-width
```

### 2. `pages/technician/requests/index.tsx` — butun fayl qayta yozildi
```diff
- emoji (🔍 ⚡ 💬 × time), #ID format, filtrlar All/Urgent/Medium/Low/...
+ MUI ikonlar; reqCode "REQ-XXXX"; filtrlar All/Urgent/Nearby/High Budget/iPhone/MacBook/iPad
+ detail: rating row, location, warranty, chips (camera "3 photos" + price)
+ "Damage Photos (3)" placeholder grid; action tugmalar → pastki sticky bar
  (GET_INCOMING_REQUESTS + ACCEPT/REJECT mutation saqlandi)
```

### 3. `pages/technician/jobs/index.tsx` — butun fayl qayta yozildi
```diff
- inline-style + gorizontal stepper + emoji
+ status filter chiplar (All Jobs/Diagnosing/In Progress/Parts Ordered/Ready for Pickup) + sanoq
+ job kartasi (device ikon, ism, model, status, gradient progress %, price, due)
+ right: meta + status pill + 3 info-karta + vertikal Repair Timeline (RadioButtonChecked/Unchecked)
+ pastki sticky "Mark Repair Complete" bar
  (GET_MY_BOOKINGS + ACCEPTED/IN_PROGRESS filtri saqlandi)
+ placeholder: granular status/progress/timeline vaqtlari bookingStatus dan derivatsiya
```

### 4. `pages/technician/messages/index.tsx` — butun fayl qayta yozildi
```diff
- inline-style conv list + "Select a conversation" 💬
+ 5 suhbat (JOB/REQ kod, online nuqta, unread), chat header (call/video/more)
+ context banner, xabar bubble'lari (out=orange, in=dark + avatar + ✓✓), composer
+ ishlaydigan local send (Enter=send, Shift+Enter=newline)
```

### 5. `pages/technician/notifications/index.tsx` — build-fix + butun fayl qayta yozildi
```diff
- <div style({ fontSize: 20 }}>   // L49 — JSX sintaksis xatosi build'ni toʻxtatardi
+ <div style={{ fontSize: 20 }}>
... soʻngra:
+ Notification Center: "{n} new" badge, "Mark all as read" (ishlaydi), filter chiplar
+ gradient ikon plitka + rangli action link; unread chap aksent + bg
```

### 6. `pages/technician/profile/index.tsx` — butun fayl qayta yozildi
```diff
- markaziy avatar + About + Skills chiplar
+ header (AK avatar+online, Verified, role, location, 4 stat, Message Me/View Live Profile)
+ "Repair Stories" (Add Story + 6 rangli story doira)
+ tablar (Overview/Services/Portfolio/Reviews — ishlaydi)
+ Overview: About + Trust & Credentials + Specializations
+ Services (6 karta, POPULAR), Portfolio (6 ish), Reviews (4.9 summary + distribution + sharhlar)
```

### 7. `pages/technician/analytics/index.tsx` — butun fayl qayta yozildi
```diff
- 3 KPI + bitta Rating LineChart
+ Header + 7D/30D/3M/Year toggle; 6 KPI karta
+ Jobs vs Revenue (ComposedChart, custom tooltip), Repairs by Device (donut + barlar)
+ Revenue by Repair Type (BarChart, rangli Cell), Rating Trend (AreaChart), Top Clients (5 karta)
```

### 8. `pages/technician/earnings/index.tsx` — butun fayl qayta yozildi
```diff
- 3 stat + Weekly Area + Daily Bar + transactions <table>
+ Header + range toggle + Request Payout; 4 stat karta
+ Daily Earnings (AreaChart, custom tooltip), Monthly Payouts (BarChart, May orange/Jun blue)
+ Transactions (filter chiplar + status badge), Payout History (Available Balance + ro'yxat)
  GET_MY_BOOKINGS + totalEarnings/monthlyEarnings SAQLANDI (real>0 boʻlsa koʻrsatiladi, aks holda dizayn)
```

### 9. `libs/components/technician/Header.tsx` — butun fayl qayta yozildi
```diff
- 🔍 ⚡ 💬 🔔 ⚙️ › (emoji); ishlatilmagan technician-header.module.scss import
+ Search/Add/ChatBubble/NotificationsNone/Settings/KeyboardArrowDown (MUI)
+ "Sign Out" dropdown → onClick={handleLogout}
```

### 10. `libs/components/technician/TechnicianSidebar.tsx` — butun fayl qayta yozildi
```diff
- nav emoji (📊📬💼💬🔔👤📈💰), inline-style, footer 2-status pill, 🚪 Logout
+ MUI outlined nav ikonlar; bottom-nav (Settings/Help & Support); oddiy raqamli badge
+ bitta status pill; user-card (AK / Alex Kim, chevron)
```

### 11. `scss/pc/technician/technician-dashboard.scss` — turli joylarda tahrir
```diff
+ .fixora-technician-main-wrapper { padding-top: 60px; }   // fixed header offset
  .fixora-technician-sidebar: +__status/__section-label/__nav-badge/__bottom-nav/__user-card*
- .fixora-technician-sidebar__nav-item--active::before (chap chiziq) olib tashlandi
  .fixora-tech-stat-card: flex-column + __top; stat-icon variantlariga color
  .fixora-tech-stat-change: emoji ::before olib tashlandi → yashil .__up + svg
  .fixora-tech-urgency-badge: lowercase; .fixora-tech-job-status: pill→matn
  .fixora-tech-dashboard__grid { + align-items: start; }
  .fixora-tech-dashboard__welcome { + gap; >div:first-child min-width:0 }
  .fixora-tech-quick-action { min-width 80→104, flex-shrink:0, span nowrap, svg flex-shrink:0 }
```

### 12. `scss/pc/technician/technician-requests.scss` — turli joylarda tahrir
```diff
  .fixora-requests-right { + display:flex; flex-direction:column }   // scroll + sticky bar
  .fixora-requests-detail { padding 24→26px 32px; max-width olib tashlandi }
  .fixora-req-urgency-badge: kichik pill → uppercase matn; --lg pill saqlandi
  .fixora-requests-detail__device-icon { background → orange tint }
+ __rating/__warranty/__loc/__chip(svg)/__photos/__photo
+ .fixora-requests-actionbar (L495)  // sticky pastki bar
  .fixora-request-card__time: svg rangi
```

### 13. `scss/pc/technician/technician-jobs.scss` — qoʻshildi (L583–1040)
```
+ .fixora-jobs-page/-left/-filterbar/-filter, .fixora-job-card(+progress/bar/due),
  .fixora-jobs-right/-detail/-infocard, .fixora-jobs-timeline(-card/-tl-step), -actionbar/-btn
  (eski .fixora-active-jobs-* klasslar tegilmadi)
```

### 14. `scss/pc/technician/technician-messages.scss` — qoʻshildi (L533–979)
```
+ .fixora-msg-page/-left/-search/-conv-list/-conv, -chat(header/context/body),
  -icon-btn, -row/-bubble, -composer(+hint)
  (eski .fixora-messages-* / .fixora-conversation-list tegilmadi)
```

### 15. `scss/pc/technician/technician-notifications.scss` — qoʻshildi (L327–531)
```
+ .fixora-notif-page/-header/-markall/-filters/-filter/-section-label/-list/-card
```

### 16. `scss/pc/technician/technician-profile.scss` — qoʻshildi (L305–1098)
```
L305–664  : .fixora-pp-page/-header(avatar/online/stats/stat/btn), -stories(-card/-story), -tabs/-tab, -panel
L666–771  : .fixora-pp-row, -creds/-cred, -specs/-spec   (Overview Trust & Credentials / Specializations)
L773–1098 : .fixora-pp-services/-service, -portfolio/-port, -reviews/-rsummary/-rbar/-review
```

### 17. `scss/pc/technician/technician-analytics.scss` — YANGI fayl (360 qator)
```
+ .fixora-an-page/-header/-range, -kpis/-kpi, -row/-card, -chart/-legend/-tooltip,
  -donut/-devlist/-devrow, -rating, -clients/-client
```

### 18. `scss/pc/technician/technician-earnings.scss` — YANGI fayl (483 qator)
```
+ .fixora-ea-page/-header/-range/-payout-btn, -stats/-stat, -row/-card,
  -legend/-bignum/-chart/-tooltip, -txfilters/-txfilter/-txlist/-tx,
  -seeall/-balance/-payouts/-payout
```

### 19. `scss/pc/main.scss` — 2 import qoʻshildi
```diff
  @import '/scss/pc/technician/technician-profile.scss';
+ @import '/scss/pc/technician/technician-analytics.scss';   // L54
+ @import '/scss/pc/technician/technician-earnings.scss';    // L55
  @import '/scss/pc/technician/technician-settings.scss';
```
