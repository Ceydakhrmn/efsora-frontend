# Reports & Dashboard i18n Analysis

## 1. REPORTS PAGE COMPONENT
**File:** [frontend/src/pages/ReportsPage.tsx](frontend/src/pages/ReportsPage.tsx)

The Reports page displays department-based inventory and user reports using Recharts for visualizations. It properly uses the i18n system.

### Features:
- Department summary cards (users, assets, value, departments)
- Department comparison bar chart
- Category breakdown pie chart
- Status breakdown pie chart
- Role distribution pie chart
- Department detail table with export functionality

---

## 2. DASHBOARD COMPONENTS
Located in: `frontend/src/components/dashboard/`

### Component Files:
1. **[StatCard.tsx](frontend/src/components/dashboard/StatCard.tsx)** - Reusable stat card component (✓ No hardcoded text)
2. **[DepartmentChart.tsx](frontend/src/components/dashboard/DepartmentChart.tsx)** - Users by department bar chart
3. **[RegistrationTrend.tsx](frontend/src/components/dashboard/RegistrationTrend.tsx)** - Registration trend line chart
4. **[RecentUsers.tsx](frontend/src/components/dashboard/RecentUsers.tsx)** - Recent users card (✓ Uses i18n)
5. **[AssetCategoryChart.tsx](frontend/src/components/dashboard/AssetCategoryChart.tsx)** - Asset category pie chart
6. **[AssetStatusChart.tsx](frontend/src/components/dashboard/AssetStatusChart.tsx)** - Asset status pie chart
7. **[AssetValueChart.tsx](frontend/src/components/dashboard/AssetValueChart.tsx)** - Asset value bar chart
8. **[SecurityDashboard.tsx](frontend/src/components/dashboard/SecurityDashboard.tsx)** - Security stats (✓ Uses i18n)

### Dashboard Page:
**File:** [frontend/src/pages/DashboardPage.tsx](frontend/src/pages/DashboardPage.tsx)

Main dashboard with filter controls and multiple chart sections.

---

## 3. HARDCODED TURKISH TEXT IN REPORTS/CHARTS

### AssetCategoryChart.tsx
| Line | Hardcoded Text | English Translation |
|------|---|---|
| 48, 60 | "Kategori Dağılımı" | "Category Distribution" |
| 51 | "Veri yok" | "No data" |

### AssetStatusChart.tsx
| Line | Hardcoded Text | English Translation |
|------|---|---|
| 48 | "Durum Dağılımı" | "Status Distribution" |
| 51 | "Veri yok" | "No data" |

### AssetValueChart.tsx
| Line | Hardcoded Text | English Translation |
|------|---|---|
| 54, 66 | "Kategori Bazlı Değer (₺)" | "Category-Based Value (₺)" |
| 57 | "Değer verisi yok" | "No value data" |

### CATEGORY_LABELS Object (AssetCategoryChart.tsx & AssetValueChart.tsx)
```typescript
const CATEGORY_LABELS: Record<string, string> = {
  HARDWARE: 'Donanım',
  SOFTWARE_LICENSE: 'Yazılım Lisansı',
  API_SUBSCRIPTION: 'API Aboneliği',
  SAAS_TOOL: 'SaaS Araç',
  OFFICE_EQUIPMENT: 'Ofis Ekipmanı',
}
```

### STATUS_CONFIG Object (AssetStatusChart.tsx)
```typescript
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktif', color: '#10b981' },
  maintenance: { label: 'Bakımda', color: '#f59e0b' },
  expired: { label: 'Süresi Doldu', color: '#ef4444' },
  retired: { label: 'Hurdaya Çıktı', color: '#6b7280' },
}
```

---

## 4. HARDCODED ENGLISH TEXT IN DASHBOARD COMPONENTS

### DepartmentChart.tsx (CustomTooltip)
| Line | Hardcoded Text | Turkish Translation |
|------|---|---|
| 19 | "users" | "kullanıcı" |
| 22 | "of total" | "toplam kullanıcının" |

### RegistrationTrend.tsx (CustomTooltip)
| Line | Hardcoded Text | Turkish Translation |
|------|---|---|
| 17 | "registrations" | "kayıt" |
| 21 | "vs prev month" | "önceki aya karşı" |

### DashboardPage.tsx (Filter Options)
| Line | Hardcoded Text | Turkish Translation |
|------|---|---|
| 117 | "Monthly" | "Aylık" |
| 118 | "Yearly" | "Yıllık" |
| 119 | "Custom range" | "Özel Aralık" |
| 89 | "Custom range" (fallback) | "Özel Aralık" |

### DashboardPage.tsx (Asset Stats Section)
| Line | Hardcoded Text | Turkish Translation |
|------|---|---|
| 235 | "Süresi Dolacak" (hardcoded Turkish) | "Expiring Soon" |
| 246 | "Toplam Değer" (hardcoded Turkish) | "Total Value" |

---

## 5. CURRENT i18n SETUP

### i18n Configuration
**File:** [frontend/src/i18n/index.ts](frontend/src/i18n/index.ts)

- **Language Support:** Turkish (tr) and English (en)
- **Implementation:** Context-based with `useI18n()` hook
- **Default Language:** Turkish
- **Translation Files:**
  - [frontend/src/i18n/tr.ts](frontend/src/i18n/tr.ts) - Turkish translations
  - [frontend/src/i18n/en.ts](frontend/src/i18n/en.ts) - English translations

### Available Translation Keys Structure:
```typescript
{
  common: { save, cancel, delete, edit, ... }
  auth: { login, register, email, password, ... }
  nav: { dashboard, users, assets, activityLog, reports, ... }
  dashboard: { title, welcome, totalUsers, activeUsers, ... }
  users: { title, addUser, editUser, deleteUser, ... }
  assets: { title, addAsset, editAsset, ... }
  settings: { title, theme, changePassword, ... }
  activityLog: { title, subtitle, noActivity, ... }
  security: { title, successLogins, failedLogins, ... }
  reports: { title, subtitle, department, totalUsers, ... }
  bulkImport: { title, description, dropzone, ... }
}
```

### Reports i18n Keys:
**Both [tr.ts](frontend/src/i18n/tr.ts) and [en.ts](frontend/src/i18n/en.ts) include:**
- `reports.title` ✓
- `reports.subtitle` ✓
- `reports.department` ✓
- `reports.departments` ✓
- `reports.allDepartments` ✓
- `reports.totalUsers` ✓
- `reports.activeUsers` ✓
- `reports.users` ✓
- `reports.assets` ✓
- `reports.totalAssets` ✓
- `reports.activeAssets` ✓
- `reports.maintenanceAssets` ✓
- `reports.expiredAssets` ✓
- `reports.totalValue` ✓
- `reports.assigned` ✓
- `reports.unassigned` ✓
- `reports.active` ✓
- `reports.inactive` ✓
- `reports.expiringSoon` ✓
- `reports.deptComparison` ✓
- `reports.categoryBreakdown` ✓
- `reports.statusBreakdown` ✓
- `reports.roleDistribution` ✓
- `reports.departmentReport` ✓
- `reports.export` ✓
- `reports.exported` ✓

---

## 6. FILES CONTAINING HARDCODED TURKISH/ENGLISH STRINGS

### Priority List (Needs i18n fixes):

1. **[frontend/src/components/dashboard/AssetCategoryChart.tsx](frontend/src/components/dashboard/AssetCategoryChart.tsx)**
   - Turkish: "Kategori Dağılımı", "Veri yok"
   - CATEGORY_LABELS object (hardcoded Turkish)

2. **[frontend/src/components/dashboard/AssetStatusChart.tsx](frontend/src/components/dashboard/AssetStatusChart.tsx)**
   - Turkish: "Durum Dağılımı", "Veri yok"
   - STATUS_CONFIG object (hardcoded Turkish)

3. **[frontend/src/components/dashboard/AssetValueChart.tsx](frontend/src/components/dashboard/AssetValueChart.tsx)**
   - Turkish: "Kategori Bazlı Değer (₺)", "Değer verisi yok"
   - CATEGORY_LABELS object (hardcoded Turkish)

4. **[frontend/src/components/dashboard/DepartmentChart.tsx](frontend/src/components/dashboard/DepartmentChart.tsx)**
   - English: "users", "of total" (in CustomTooltip)

5. **[frontend/src/components/dashboard/RegistrationTrend.tsx](frontend/src/components/dashboard/RegistrationTrend.tsx)**
   - English: "registrations", "vs prev month" (in CustomTooltip)

6. **[frontend/src/pages/DashboardPage.tsx](frontend/src/pages/DashboardPage.tsx)**
   - English: "Monthly", "Yearly", "Custom range" (filter options)
   - Turkish: "Süresi Dolacak", "Toplam Değer" (hardcoded despite using i18n elsewhere)

---

## SUMMARY TABLE

| Component | File | Issues | Type |
|---|---|---|---|
| AssetCategoryChart | dashboard/AssetCategoryChart.tsx | 3 hardcoded Turkish strings + labels object | Turkish |
| AssetStatusChart | dashboard/AssetStatusChart.tsx | 2 hardcoded Turkish strings + status object | Turkish |
| AssetValueChart | dashboard/AssetValueChart.tsx | 2 hardcoded Turkish strings + labels object | Turkish |
| DepartmentChart | dashboard/DepartmentChart.tsx | 2 hardcoded English strings in tooltip | English |
| RegistrationTrend | dashboard/RegistrationTrend.tsx | 2 hardcoded English strings in tooltip | English |
| DashboardPage | pages/DashboardPage.tsx | 5 hardcoded strings (3 English, 2 Turkish) | Mixed |
| ReportsPage | pages/ReportsPage.tsx | ✓ Properly uses i18n | None |
| RecentUsers | dashboard/RecentUsers.tsx | ✓ Uses i18n | None |
| SecurityDashboard | dashboard/SecurityDashboard.tsx | ✓ Uses i18n | None |
| StatCard | dashboard/StatCard.tsx | ✓ No hardcoded text | None |

---

## TRANSLATION STRINGS NEEDED

### For Adding to i18n Files (tr.ts & en.ts):

```typescript
dashboard: {
  // ... existing keys ...
  assetCategoryLabel: 'Category Distribution' / 'Kategori Dağılımı',
  noData: 'No data' / 'Veri yok', // May already exist in common
  assetValueLabel: 'Category-Based Value' / 'Kategori Bazlı Değer',
  noValueData: 'No value data' / 'Değer verisi yok',
  statusDistribution: 'Status Distribution' / 'Durum Dağılımı',
  tooltipUsers: 'users' / 'kullanıcı',
  tooltipOfTotal: 'of total' / 'toplam kullanıcının',
  tooltipRegistrations: 'registrations' / 'kayıt',
  tooltipPrevMonth: 'vs prev month' / 'önceki aya karşı',
  filterMonthly: 'Monthly' / 'Aylık',
  filterYearly: 'Yearly' / 'Yıllık',
  filterCustomRange: 'Custom range' / 'Özel Aralık',
  expiringAssets: 'Expiring Soon' / 'Süresi Dolacak',
}

categories: {
  HARDWARE: 'Hardware' / 'Donanım',
  SOFTWARE_LICENSE: 'Software License' / 'Yazılım Lisansı',
  API_SUBSCRIPTION: 'API Subscription' / 'API Aboneliği',
  SAAS_TOOL: 'SaaS Tool' / 'SaaS Araç',
  OFFICE_EQUIPMENT: 'Office Equipment' / 'Ofis Ekipmanı',
}

assetStatus: {
  active: 'Active' / 'Aktif',
  maintenance: 'Maintenance' / 'Bakımda',
  expired: 'Expired' / 'Süresi Doldu',
  retired: 'Retired' / 'Hurdaya Çıktı',
}
```

---

## RECOMMENDATIONS

1. **Move category labels to i18n** - Create a new `categories` section in both tr.ts and en.ts
2. **Move status labels to i18n** - Create a new `assetStatus` section or add to existing `assets` section
3. **Add tooltip translations** - Add missing dashboard tooltip strings to i18n
4. **Add filter labels to i18n** - Move filter option labels (Monthly, Yearly, Custom range)
5. **Standardize hardcoded text** - Audit all components for missed hardcoded strings
6. **Use useI18n hook consistently** - Ensure all dashboard components properly import and use `useI18n()`
