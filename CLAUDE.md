# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

宇硕复盘系统 (Yushuo Review System) - A stock trading review and analysis platform built with React + Supabase. The system provides member-based access to trading analysis tools, sector rhythm analysis, and psychological assessment systems.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 5173, auto-opens browser)
npm run dev

# Type checking (use before committing)
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite 5 (with SWC)
- **Backend**: Supabase (authentication + database)
- **Routing**: React Router v6
- **Encryption**: CryptoJS (for nickname hashing)

### Authentication System

The app uses a **nickname-based authentication** system instead of traditional email/password:

1. **Pseudo-Email Generation** (`src/utils/nicknameToEmail.ts`):
   - User provides WeChat nickname during registration
   - System generates a pseudo-email: `u_{SHA1_hash_24chars}@wx.local`
   - This allows Supabase's email-based auth without requiring real emails

2. **User Roles**:
   - **Regular Members**: Access to member dashboard and trading tools
   - **Admins**: Full access including user management and review dashboards

3. **Access Control**:
   - Managed via `access_grants` table with expiration dates
   - `UserGate` component checks authorization and routes accordingly
   - `ProtectedRoute` component wraps protected pages

### Database Schema

Key tables in Supabase:
- **profiles**: User profiles (id, wechat_nickname, is_admin, created_at)
- **access_grants**: Member access permissions (user_id, expires_at, duration_key, granted_by)
- **review_records**: Trading review entries
- **trading_records**: Individual trade records linked to reviews

### Routing Structure

- `/login` → SimpleLogin (main entry point)
- `/register` → User registration with WeChat nickname
- `/gate` → UserGate (authorization checkpoint, routes to /member or /admin)
- `/member` → MemberDashboard (member landing page with external links)
- `/app` → AppContainer (trading review system)
- `/admin` → AdminDashboard (user management)
- `/admin/reviews` → ReviewDashboard (view all user reviews)
- `/admin/login` → AdminLogin (separate admin login)

### External Integrations

The MemberDashboard (`src/pages/MemberDashboard.tsx`) provides access to external systems:
- **市场情绪周期分析** (Review System): Internal `/app` route
- **宇硕板块节奏** (Sector Analysis): `https://bk.yushuo.click`
- **心理评估系统** (Psychology): `https://xinli.yushuo.click`

### State Management

Uses React Context API (`src/context/AuthProvider.tsx`):
- Provides `useAuth()` hook for accessing session, user, profile, and loading state
- Automatically refreshes profile data when user changes
- Handles Supabase auth state changes

### Environment Configuration

Required environment variables (create `.env.local`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=your_admin_password
VITE_FAKE_EMAIL_DOMAIN=wx.local
```

**Note**: The app has fallback hardcoded values in `src/lib/supabaseClient.ts` but environment variables take precedence.

### Key Components

- **ProtectedRoute**: Wrapper for authenticated routes, supports `adminOnly` prop
- **GrantModal**: Admin component for granting user access with duration selection
- **DeleteConfirm**: Confirmation dialog for user deletion
- **DurationSelect**: Dropdown for selecting access duration periods

### Duration System

Access grants use predefined durations (`src/utils/duration.ts`):
- Predefined: 1天, 7天, 1月, 1年, 终身
- Custom: Admin can set specific expiration dates
- `calcExpiry()` function calculates expiration timestamp based on duration key

## Tushare API Integration Context

The project references Tushare Pro API documentation for stock data:
- Tushare Token (5000 credits): `2876ea85cb005fb5fa17c809a98174f2d5aae8b1f830110a5ead6211`
- Relevant APIs:
  - Daily data (doc_id=298)
  - Sector data (doc_id=350, 351, 347)
  - Market indicators (doc_id=362, 363)

This context is used for future data fetching and reorganization features.

## Development Notes

### When Modifying External Links
External system URLs are in `src/pages/MemberDashboard.tsx`. Common typo: `bk.yuhsuo.click` (wrong) vs `bk.yushuo.click` (correct).

### When Working with Auth
- Always use `useAuth()` hook to access current user state
- Check both `session` (for auth status) and `profile` (for user data)
- Admin status is in `profile.is_admin`, not in session

### When Adding Protected Routes
1. Wrap route component with `<ProtectedRoute>` in `App.tsx`
2. Use `adminOnly` prop if route requires admin access
3. Add corresponding path to route structure

### TypeScript Types
- Database types: `src/types/db.ts`
- Review system types: `src/types/review.ts`
- Supabase types are imported from `@supabase/supabase-js`

### Styling
- Uses Tailwind CSS utility classes
- Global styles in `src/styles.css`
- Legacy HTML pages in `public/legacy/` use separate CSS files
