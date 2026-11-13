# Graph Report - Site  (2026-11-12)

## Corpus Check
- 358 files · ~342,678 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1881 nodes · 4074 edges · 157 communities (83 shown, 58 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6e000734`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site-accounts.ts
- assinaturas.ts
- NewsletterAgenda.tsx
- arquivo.ts
- social.ts
- terra.ts
- SiteShell.tsx
- requireAuth
- terra-news.ts
- devDependencies
- compilerOptions
- app/page.tsx
- hasPermission
- news-data.ts
- newsletter-ads.ts
- useAuth
- NewsForm.tsx
- partilhado.ts
- supabase.ts
- Spinner.tsx
- radio-types.ts
- redes-sociais/page.tsx
- pagina-inicial/page.tsx
- PartilhadoPasta.tsx
- resetAntiSpam
- agenda/route.ts
- admin/newsletter/route.ts
- getAllPosts
- redaccao-mail.ts
- newsletter-reads.ts
- AuthContext.tsx
- newsletter.ts
- adminCacheSet
- noticias-email.ts
- stats/route.ts
- Regras do projecto Revista Terra
- DashboardContent.tsx
- admin/noticias-email/route.ts
- runDueSchedules
- partilhado-tipos.ts
- setup-selfhosted.js
- Skeleton.tsx
- parse-wordpress.js
- config-status.ts
- weather.ts
- app/layout.tsx
- migrate-images-to-supabase.js
- trafego/page.tsx
- relatorios/page.tsx
- isUuid
- RecentNews.tsx
- noticias-docx.ts
- dependencies
- refreshSite
- data.tsx
- importar-noticias-terra.js
- migrate-posts-to-supabase.js
- utilizadores/page.tsx
- home-sections/route.ts
- admin/upload/route.ts
- Cambio.tsx
- Nota de reunião: Revista Terra, o que falta decidir
- migrate-real-images.js
- donationContext.tsx
- podcasts/[slug]/page.tsx
- PreviewFrames.tsx
- HomeSeccoesPage
- import.js
- sync-live-news.mjs
- admin/noticias/page.tsx
- AdminShell.tsx
- news/list/route.ts
- partilhado/zip/route.ts
- import-all-news.js
- migrar-imagens-noticias.js
- sync-news-to-supabase.js
- app/radio/page.tsx
- social-links.ts
- ensure-admin.js
- extract-backup-images.js
- AuthDialogContext.tsx
- Breadcrumb.tsx
- compress-image.ts
- README.md
- check-sync.js
- cleanup-duplicates.js
- recuperar-senha/nova/page.tsx
- ImageEditor.tsx
- HeroSlider/index.tsx
- store
- postcss.config.mjs
- robots.ts
- PreviewMediaPage.tsx
- PreviewNewsPage.tsx
- PreviewProfilePage.tsx
- Breadcrumb/index.tsx
- EventDetail/index.tsx
- HeroSub/index.tsx
- menu.ts
- vercel.json
- axios
- check-next.sh
- CLAUDE.md
- clsx
- cropperjs
- date-fns
- dotenv
- eslint.config.mjs
- fflate
- framer-motion
- gray-matter
- @iconify/react
- imapflow
- @imgly/background-removal
- lucide-react
- mailparser
- mammoth
- next
- next.config.ts
- next-themes
- nextjs-toploader
- nodemailer
- onnxruntime-web
- react
- react-cropper
- react-quill-new
- read-excel-file
- remark
- remark-html
- sanitize-html
- sharp
- @supabase/supabase-js
- tailwind-merge
- @tiptap/pm
- @tiptap/react
- @tiptap/starter-kit
- @types/sanitize-html
- xml2js
- mammoth-browser.d.ts
- extendedConfig.ts
- tailwind.config.ts

## God Nodes (most connected - your core abstractions)
1. `requireAuth()` - 112 edges
2. `Spinner()` - 35 edges
3. `GREEN` - 31 edges
4. `useAuth()` - 27 edges
5. `getAllPosts` - 24 edges
6. `hasPermission()` - 23 edges
7. `serverDb()` - 22 edges
8. `syncMailbox()` - 22 edges
9. `Sidebar()` - 21 edges
10. `SiteShell()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `AdminPageRedirect()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/(admin)/admin/page.tsx → src/context/AuthContext.tsx
- `PartilhadoPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/(admin)/admin/partilhado/page.tsx → src/context/AuthContext.tsx
- `MeuPerfilPage()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/(admin)/admin/perfil/page.tsx → src/context/AuthContext.tsx
- `POST()` --calls--> `cookieOptions()`  [EXTRACTED]
  src/app/api/auth/logout/route.ts → src/lib/local-session.ts
- `Categorias()` --calls--> `loadCategories()`  [EXTRACTED]
  src/app/categorias/page.tsx → src/lib/terra-news.ts

## Import Cycles
- None detected.

## Communities (157 total, 58 thin omitted)

### Community 0 - "site-accounts.ts"
Cohesion: 0.06
Nodes (73): GET(), PERMISSIONS, POST(), STATUSES, dynamic, POST(), POST(), supabaseAdmin (+65 more)

### Community 1 - "assinaturas.ts"
Cohesion: 0.07
Nodes (56): Aba, Assinante, SubscricoesPage(), GET(), PERMISSIONS, PUT(), GET(), PERMISSIONS (+48 more)

### Community 2 - "NewsletterAgenda.tsx"
Cohesion: 0.06
Nodes (57): fmt(), fmtDay(), NewsletterPage(), QueueItem, SendRecord, Subscriber, Summary, AdminSelect() (+49 more)

### Community 3 - "arquivo.ts"
Cohesion: 0.07
Nodes (56): dynamic, POST(), DELETE(), dynamic, GET(), PATCH(), PERMS, POST() (+48 more)

### Community 4 - "social.ts"
Cohesion: 0.08
Nodes (55): dynamic, GET(), maxDuration, POST(), dynamic, GET(), maxDuration, PUT() (+47 more)

### Community 5 - "terra.ts"
Cohesion: 0.09
Nodes (39): HeaderAtual(), HeaderBarra(), HeaderButtons(), Conta, HeaderConta(), HeaderModelo(), HeaderSwitch(), HeaderTools() (+31 more)

### Community 6 - "SiteShell.tsx"
Cohesion: 0.07
Nodes (29): metadata, Categorias(), metadata, revalidate, metadata, canais, metadata, Cotacoes() (+21 more)

### Community 7 - "requireAuth"
Cohesion: 0.08
Nodes (33): POST(), markRemoved(), POST(), supabaseAdmin, GET(), StorageItem, supabaseAdmin, walk() (+25 more)

### Community 8 - "terra-news.ts"
Cohesion: 0.10
Nodes (31): BASE, dynamic, GET(), Categoria(), generateMetadata(), revalidate, metadata, Noticias() (+23 more)

### Community 9 - "devDependencies"
Cohesion: 0.05
Nodes (40): autoprefixer, eslint, eslint-config-next, allowScripts, protobufjs@7.6.5, sharp@0.34.5, unrs-resolver@1.12.2, devDependencies (+32 more)

### Community 10 - "compilerOptions"
Cohesion: 0.05
Nodes (37): dom, dom.iterable, esnext, .next-build/dev/types/**/*.ts, .next-build/types/**/*.ts, .next-check/dev/types/**/*.ts, .next-check/types/**/*.ts, .next/dev/types/**/*.ts (+29 more)

### Community 11 - "app/page.tsx"
Cohesion: 0.09
Nodes (25): buildSet(), Home(), metadata, revalidate, metadata, ColumnistItem, Columnists(), SOCIALS (+17 more)

### Community 12 - "hasPermission"
Cohesion: 0.12
Nodes (26): listLibraryImages(), repairNewsImage(), NewsRepairPage(), getDisplayName(), isOpinion(), opinionIn(), POST(), refreshPublicPages() (+18 more)

### Community 13 - "news-data.ts"
Cohesion: 0.12
Nodes (29): ARCHIVE_PAGE_SIZE, Category, CATEGORY_LABELS, categoryLabel(), cleanContent(), cleanImageUrl(), FEATURED_SLIDES, fromLocalData() (+21 more)

### Community 14 - "newsletter-ads.ts"
Cohesion: 0.14
Nodes (27): DELETE(), dynamic, fail(), GET(), PATCH(), POST(), dynamic, GET() (+19 more)

### Community 15 - "useAuth"
Cohesion: 0.12
Nodes (20): ArquivoPage(), limitWords(), ArquivoFolders(), FOLDER_COLORS, FolderActions, FolderInfo, GaleriaInner(), MediaGaleria() (+12 more)

### Community 16 - "NewsForm.tsx"
Cohesion: 0.09
Nodes (23): AdFields(), ChosenImage, ImageChooser(), uploadToLibrary(), CATEGORIES, catKey(), loadRichEditor(), NewsForm() (+15 more)

### Community 17 - "partilhado.ts"
Cohesion: 0.16
Nodes (27): dynamic, GET(), maxDuration, PERMS, POST(), antivirusConfigured(), scanBuffer(), ScanResult (+19 more)

### Community 18 - "supabase.ts"
Cohesion: 0.12
Nodes (12): StorageFile, NewsItem, NewsItem, NewsItem, StorageFile, ROLES, ROLES, AuthCallbackPage() (+4 more)

### Community 19 - "Spinner.tsx"
Cohesion: 0.09
Nodes (12): Data, Entry, ESTADO, Item, NewsItem, NewsItem, AdminPageRedirect(), MeuPerfilPage() (+4 more)

### Community 20 - "radio-types.ts"
Cohesion: 0.18
Nodes (22): novoId(), RadioAdminPage(), GET(), PERMISSIONS, PUT(), Radio(), RadioGrelha(), defaultSlots() (+14 more)

### Community 21 - "redes-sociais/page.tsx"
Cohesion: 0.09
Nodes (19): ComentariosPage(), Comment, Status, TABS, Campo, Cartao, CARTOES, Conn (+11 more)

### Community 22 - "pagina-inicial/page.tsx"
Cohesion: 0.17
Nodes (23): CategoryOption, fieldSide, LABEL, parse(), State, defaultHomeCategories(), defaultHomeLayout(), defaultHomeOptions() (+15 more)

### Community 23 - "PartilhadoPasta.tsx"
Cohesion: 0.11
Nodes (17): FOLDERS, Overview, PartilhadoPage(), ArquivoTabs(), DocViewer(), fileUrl(), Props, View (+9 more)

### Community 24 - "resetAntiSpam"
Cohesion: 0.15
Nodes (17): RecuperarSenhaPage(), submit(), AntiSpamFields(), resetAntiSpam(), Window, CommentForm(), submit(), approvedComments() (+9 more)

### Community 25 - "agenda/route.ts"
Cohesion: 0.22
Nodes (21): anyDate(), DELETE(), dynamic, fail(), future(), GET(), maxDuration, PATCH() (+13 more)

### Community 26 - "admin/newsletter/route.ts"
Cohesion: 0.19
Nodes (20): DELETE(), dynamic, GET(), dynamic, maxDuration, POST(), mailConfigured(), addSubscribers() (+12 more)

### Community 27 - "getAllPosts"
Cohesion: 0.19
Nodes (13): BlogHead(), generateMetadata(), Props, BlogList(), LatestBlog(), BlogCard(), Blog(), Blog (+5 more)

### Community 28 - "redaccao-mail.ts"
Cohesion: 0.16
Nodes (18): dynamic, GET(), maxDuration, collectFiles(), downloadMailFile(), fetchNewsMails(), listMailFiles(), MailAttachment (+10 more)

### Community 29 - "newsletter-reads.ts"
Cohesion: 0.18
Nodes (16): dynamic, GET(), dynamic, GET(), page(), dynamic, GET(), BUCKET() (+8 more)

### Community 30 - "AuthContext.tsx"
Cohesion: 0.22
Nodes (15): LoginPage(), RegisterPage(), AuthContext, AuthContextType, AuthProvider(), getSupabase(), User, AppUser (+7 more)

### Community 31 - "newsletter.ts"
Cohesion: 0.18
Nodes (18): openMailer(), abs(), activeBySlot(), ALL_DAYS, longDate(), deliver(), digestEmail(), esc() (+10 more)

### Community 32 - "adminCacheSet"
Cohesion: 0.22
Nodes (13): ColunistaDashboardPage(), Item, MeusArtigosPage(), NewsItem, STATUS, ArtigosDeOpiniaoPage(), NewsItem, STATUS (+5 more)

### Community 33 - "noticias-email.ts"
Cohesion: 0.19
Nodes (17): plainText, BUCKET(), createOne(), db(), EmailSettings, insertNews(), key(), KNOWN (+9 more)

### Community 34 - "stats/route.ts"
Cohesion: 0.24
Nodes (14): dayOf(), dynamic, ENGINES, GET(), Hit, top(), db(), deviceOf() (+6 more)

### Community 35 - "Regras do projecto Revista Terra"
Cohesion: 0.12
Nodes (14): Revista Terra, 10. Autoria dos commits e deploys, 11. Mensagens de commit, 12. Tipo de letra, 1. Branches, 2. Deploy e commits, 3. Consistência com o layout em produção, 4. Títulos nos cards (+6 more)

### Community 36 - "DashboardContent.tsx"
Cohesion: 0.20
Nodes (5): ActivityItem, DashboardContent(), Stats, RolePreviewPanel(), RolePreviewPanelProps

### Community 37 - "admin/noticias-email/route.ts"
Cohesion: 0.26
Nodes (13): dynamic, GET(), maxDuration, POST(), dynamic, GET(), maxDuration, loadEmailLog() (+5 more)

### Community 38 - "runDueSchedules"
Cohesion: 0.16
Nodes (12): dynamic, GET(), maxDuration, dynamic, GET(), maxDuration, dynamic, GET (+4 more)

### Community 39 - "partilhado-tipos.ts"
Cohesion: 0.18
Nodes (13): classify(), DOC_EXT, FolderId, FOLDERS, IMG_EXT, isFolder(), ZIP_EXT, extractZip() (+5 more)

### Community 40 - "setup-selfhosted.js"
Cohesion: 0.22
Nodes (13): admin, adminEmail, { createClient }, ensureAdmin(), ensureBucket(), ensureEcUser(), ensureSiteRow(), findUser() (+5 more)

### Community 41 - "Skeleton.tsx"
Cohesion: 0.19
Nodes (5): INITIAL_CATEGORIES, INITIAL_TAGS, SkeletonContent(), SkeletonHeader(), SkeletonMediaGrid()

### Community 42 - "parse-wordpress.js"
Cohesion: 0.15
Nodes (12): analysis, categories, categoryMatches, fs, imagesData, itemMatches, linkMatch, pagesData (+4 more)

### Community 43 - "config-status.ts"
Cohesion: 0.31
Nodes (11): dynamic, GET(), CONFIG_AREAS, ConfigArea, ConfigItem, configMissing(), cron(), has() (+3 more)

### Community 44 - "weather.ts"
Cohesion: 0.22
Nodes (10): GET(), Ctx, WeatherCtx, WeatherProvider(), Day, loadWeather(), Now, parseWeather() (+2 more)

### Community 45 - "app/layout.tsx"
Cohesion: 0.21
Nodes (7): metadata, RevealOnView(), HitTracker(), NewsletterPulse(), Ctx, RadioCtx, RadioProvider()

### Community 46 - "migrate-images-to-supabase.js"
Cohesion: 0.23
Nodes (11): compressImage(), { createClient }, downloadImage(), fs, http, https, migrateImages(), path (+3 more)

### Community 47 - "trafego/page.tsx"
Cohesion: 0.30
Nodes (9): DEVICES, duration(), Period, Stats, TrafegoPage(), Row, TrafegoPaisesPage(), countryFlag() (+1 more)

### Community 48 - "relatorios/page.tsx"
Cohesion: 0.23
Nodes (8): DEVICE_LABEL, RANGES, Stats, day(), NewsletterReport(), pct(), Send, short()

### Community 49 - "isUuid"
Cohesion: 0.26
Nodes (10): GET(), supabaseAdmin, allowedHosts(), dynamic, GET(), isUuid(), db(), loadNews() (+2 more)

### Community 50 - "RecentNews.tsx"
Cohesion: 0.24
Nodes (5): RecentNews(), RecentSet, ShareBar(), ShareLink(), shareNetworks()

### Community 51 - "noticias-docx.ts"
Cohesion: 0.26
Nodes (11): clean(), decode(), DocPhoto, entities, esc(), FIELDS, fold(), ParsedNews (+3 more)

### Community 52 - "dependencies"
Cohesion: 0.18
Nodes (11): aos, next-auth, dependencies, aos, next-auth, react-dom, @tiptap/core, @tiptap/extension-image (+3 more)

### Community 53 - "refreshSite"
Cohesion: 0.24
Nodes (8): POST(), supabaseAdmin, ALLOWED_STATUS, POST(), supabaseAdmin, dynamic, GET(), refreshSite()

### Community 54 - "data.tsx"
Cohesion: 0.22
Nodes (6): CauseData, Eventdata, footerLinks, helpdata, menuItems, Reviews

### Community 55 - "importar-noticias-terra.js"
Cohesion: 0.20
Nodes (5): { createClient }, dados, fs, GRAVAR, sb

### Community 56 - "migrate-posts-to-supabase.js"
Cohesion: 0.29
Nodes (9): categoryMap, cleanCDATA(), { createClient }, fs, generateSlug(), migratePosts(), parseDate(), path (+1 more)

### Community 57 - "utilizadores/page.tsx"
Cohesion: 0.29
Nodes (7): hasLevel(), ROLES, UserItem, UsersAdminPage(), SkeletonTableRow(), Avatar(), initialsOf()

### Community 58 - "home-sections/route.ts"
Cohesion: 0.24
Nodes (9): BASE, categoryOptions(), dynamic, GET(), isObj(), POST(), homeCategories, homeLayout (+1 more)

### Community 59 - "admin/upload/route.ts"
Cohesion: 0.29
Nodes (8): ALLOWED_BUCKETS, baseName(), clean(), IMAGE_TYPES, POST(), supabaseAdmin, compressImageBuffer(), MAX_IMAGE_BYTES

### Community 60 - "Cambio.tsx"
Cohesion: 0.29
Nodes (7): GET(), Cambio(), MOEDAS, ORDEM, Cambio, CAMBIO_MOEDAS, loadCambio()

### Community 61 - "Nota de reunião: Revista Terra, o que falta decidir"
Cohesion: 0.22
Nodes (8): 1. Domínio, 2. E-mails, 3. Antivírus dos anexos, 4. Planos e preços, 5. Publicidade da newsletter, Como está hoje (temporário, só para testes e proposta), Nota de reunião: Revista Terra, o que falta decidir, O que fazemos assim que decidirem

### Community 62 - "migrate-real-images.js"
Cohesion: 0.31
Nodes (8): axios, { createClient }, fs, migrateAllMedia(), normalizeWpUrl(), path, sanitizeFilename(), supabase

### Community 63 - "donationContext.tsx"
Cohesion: 0.28
Nodes (3): DonationContextType, DonationFormContext, DonationProviderProps

### Community 64 - "podcasts/[slug]/page.tsx"
Cohesion: 0.39
Nodes (7): find(), generateMetadata(), generateStaticParams(), Pod, Podcast(), slugOf(), PodcastPlayer()

### Community 65 - "PreviewFrames.tsx"
Cohesion: 0.28
Nodes (6): metadata, ALL, GROUPS, pathOf(), PHONES, PreviewFrames()

### Community 66 - "HomeSeccoesPage"
Cohesion: 0.36
Nodes (8): HomeSeccoesPage(), save(), zoneBox(), isDefaultState(), sameCats(), sameLayout(), sameOptions(), zoneOf()

### Community 67 - "import.js"
Cohesion: 0.29
Nodes (5): { createClient }, crypto, fs, supabase, xml2js

### Community 68 - "sync-live-news.mjs"
Cohesion: 0.29
Nodes (5): NOT_NEWS, OUT, PAGE_SLUGS, pages, posts

### Community 69 - "admin/noticias/page.tsx"
Cohesion: 0.48
Nodes (6): CategoryOption, itemCategories(), NewsAdminPage(), NewsItem, seoChecks(), slugOf()

### Community 70 - "AdminShell.tsx"
Cohesion: 0.38
Nodes (4): AdminShell(), avisarNavegacao(), SidebarItem(), SidebarItemProps

### Community 71 - "news/list/route.ts"
Cohesion: 0.52
Nodes (6): adminSearchIndex, fold(), GET(), matches(), myAuthorName(), supabaseAdmin

### Community 72 - "partilhado/zip/route.ts"
Cohesion: 0.33
Nodes (6): dynamic, GET(), maxDuration, PERMS, POST(), openStoredZip()

### Community 73 - "import-all-news.js"
Cohesion: 0.40
Nodes (5): axios, { createClient }, importNews(), sanitizeFilename(), supabase

### Community 74 - "migrar-imagens-noticias.js"
Cohesion: 0.33
Nodes (5): APPLY, { createClient }, fs, path, sb

### Community 75 - "sync-news-to-supabase.js"
Cohesion: 0.33
Nodes (4): { createClient }, fs, path, supabase

### Community 76 - "app/radio/page.tsx"
Cohesion: 0.53
Nodes (4): metadata, nowOnAir(), RadioPlayer(), useRadio()

### Community 77 - "social-links.ts"
Cohesion: 0.40
Nodes (5): hasAnyProfile(), loadSocialLinks, NAMES, SocialLink, PROFILE_NETWORKS

### Community 78 - "ensure-admin.js"
Cohesion: 0.50
Nodes (4): { createClient }, findUserByEmail(), main(), supabase

### Community 79 - "extract-backup-images.js"
Cohesion: 0.40
Nodes (4): { execSync }, extractDir, fs, path

### Community 80 - "AuthDialogContext.tsx"
Cohesion: 0.40
Nodes (3): AuthDialogContext, AuthDialogContextType, AuthDialogProviderProps

### Community 83 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 89 - "store"
Cohesion: 0.83
Nodes (4): BUCKET(), db(), store(), read()

## Knowledge Gaps
- **578 isolated node(s):** `check-next.sh script`, `eslintConfig`, `fs`, `xml2js`, `{ createClient }` (+573 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 716 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **58 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireAuth()` connect `requireAuth` to `site-accounts.ts`, `assinaturas.ts`, `arquivo.ts`, `social.ts`, `terra-news.ts`, `hasPermission`, `newsletter-ads.ts`, `partilhado.ts`, `radio-types.ts`, `agenda/route.ts`, `admin/newsletter/route.ts`, `newsletter-reads.ts`, `stats/route.ts`, `admin/noticias-email/route.ts`, `config-status.ts`, `isUuid`, `refreshSite`, `home-sections/route.ts`, `admin/upload/route.ts`, `news/list/route.ts`, `partilhado/zip/route.ts`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `Spinner()` connect `Spinner.tsx` to `adminCacheSet`, `assinaturas.ts`, `DashboardContent.tsx`, `AdminShell.tsx`, `Skeleton.tsx`, `useAuth`, `NewsForm.tsx`, `supabase.ts`, `radio-types.ts`, `redes-sociais/page.tsx`, `pagina-inicial/page.tsx`, `PartilhadoPasta.tsx`, `AuthContext.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `getAllPosts` connect `news-data.ts` to `site-accounts.ts`, `news/list/route.ts`, `app/page.tsx`, `admin/newsletter/route.ts`, `newsletter-reads.ts`, `newsletter.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `check-next.sh script`, `eslintConfig`, `fs` to the rest of the system?**
  _578 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `site-accounts.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059207920792079205 - nodes in this community are weakly interconnected._
- **Should `assinaturas.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07122153209109731 - nodes in this community are weakly interconnected._
- **Should `NewsletterAgenda.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05706760316066725 - nodes in this community are weakly interconnected._