# Snaptastic Implementation Plan - Livestream Tasks

## Overview
This document outlines the implementation plan for completing the Snaptastic landing page and building the dashboard for photo restoration. This plan is designed to be executed step-by-step during the livestream.

**Brand:** Snaptastic
**Domain:** snaptastic.ai ($79/year)
**Tagline:** "Bring grandpa back to life in just one click"

## Assets Available
- **Before/After Photos:** 16 pairs in `/beforeafterphotos/` directory
  - `before1.jpg` → `after1.png` through `before16.jpg` → `after16.png`
- **API Documentation:** `GEMINI_API_DOCS.md` with Gemini 2.5 Flash integration details
- **Restoration Prompt:** Pre-configured prompt for optimal photo restoration

---

## Phase 1: Landing Page Enhancement

### Goal
Create a stunning landing page with video hero section and before/after gallery to showcase photo restoration.

### Tasks

#### 1.1 Implement Serene Hero Section with Video Background
**Source:** Use the hero section from `NEW Landing Page/app/page.tsx` as the template

**Features:**
- Fullscreen video background (your before/after transformation video hosted on Cloudflare)
- Black overlay for text readability
- Clean navigation bar with glassmorphism effect
- Large, elegant typography

**Content Updates:**
- **Logo/Brand:** "Snaptastic" (replace "Calm")
- **Hero Heading:** "Bring grandpa back to life in just one click"
- **Subheading:** "Transform your old, faded photos into stunning high-resolution memories with AI-powered restoration in seconds"
- **CTA Button:** "Start Restoring Free" or "Try Your First Photo Free"
- **Navigation Links:**
  - "How It Works"
  - "Pricing"
  - "Examples"
  - "Sign In"

**Video Setup:**
- Replace video source with your Cloudflare R2 URL
- Keep `autoPlay`, `muted`, `loop`, `playsInline` attributes
- Video should show before/after transformation animation

**Styling:**
- Keep the serene, elegant aesthetic
- Use serif fonts for headings (Playfair Display or similar)
- Sans-serif for body text (Inter or similar)
- White text on dark overlay

#### 1.2 Create Before/After Gallery Component
**File:** `components/homepage/before-after-gallery.tsx`

**Features:**
- Responsive grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Interactive comparison slider for each photo pair
- Hover effects or click to toggle between before/after
- Lazy loading for performance
- Use shadcn/ui components for consistent styling

**Component Structure:**
```tsx
// Suggested structure:
- BeforeAfterGallery (parent component)
  - BeforeAfterCard (individual comparison card)
    - Image comparison slider or toggle
    - Labels: "Before" and "After"
```

**Technical Requirements:**
- Import all 16 photo pairs from `/beforeafterphotos/`
- Use Next.js Image component for optimization
- Add proper alt text for accessibility
- Responsive design using Tailwind CSS

#### 1.3 Integrate Components into Landing Page
**File:** `app/page.tsx`

**Actions:**
- Replace existing hero section with the new Serene Hero section (video background)
- Add the `BeforeAfterGallery` component below the hero
- Position before pricing section
- Add section heading: "See the Magic in Action"
- Add supporting copy highlighting the transformation quality

**Updated Page Structure:**
```tsx
<>
  <SereneHeroSection /> {/* NEW - with video background */}
  <BeforeAfterGallery /> {/* NEW - 16 photo examples */}
  <PricingTable subscriptionDetails={subscriptionDetails} />
  <FooterSection />
</>
```

**Note:** The Serene Hero already includes navigation, so remove duplicate nav components

#### 1.4 Styling and Polish
- Add section background (subtle gradient or pattern)
- Ensure proper spacing between sections
- Test responsive behavior on all breakpoints
- Add smooth transitions and animations

---

## Phase 2: Dashboard Development

### Goal
Build a simple, intuitive dashboard for photo restoration projects with drag-and-drop upload, restoration processing, and export capabilities.

### Tasks

#### 2.1 Dashboard Layout with Left Navigation
**File:** `app/dashboard/layout.tsx` (may need modification)

**Features:**
- Left sidebar navigation showing:
  - List of restoration projects (user-created)
  - "New Project" button
  - Each project shows:
    - Project name (editable)
    - Number of photos
    - Status indicator (in progress, completed)
- Main content area for selected project view
- Responsive: sidebar collapses on mobile

**Navigation Structure:**
```
+ New Project
----
📁 Wedding Photos (3 photos)
📁 Family Album (7 photos)
📁 Grandma's Collection (2 photos) ← Active
```

#### 2.2 Database Schema for Projects
**File:** `db/schema.ts`

**New Tables:**

```typescript
// restoration_projects table
- id (uuid, primary key)
- userId (string, foreign key to user.id)
- name (string)
- createdAt (timestamp)
- updatedAt (timestamp)

// restoration_photos table
- id (uuid, primary key)
- projectId (uuid, foreign key to restoration_projects.id)
- originalImageUrl (string) // R2 URL
- restoredImageUrl (string, nullable) // R2 URL after restoration
- upscaledImageUrl (string, nullable) // R2 URL after upscaling
- geminiTaskId (string, nullable) // Gemini API task ID
- upscaleTaskId (string, nullable) // Magnific API task ID
- status (enum: 'uploaded', 'processing', 'completed', 'failed')
- createdAt (timestamp)
- updatedAt (timestamp)

// user_credits table (NEW - for credit system)
- id (uuid, primary key)
- userId (string, unique, foreign key to user.id)
- credits (integer, default: 3) // Available credits
- lifetimeCreditsUsed (integer, default: 0) // Total credits ever used
- lifetimeCreditsAdded (integer, default: 3) // Total credits ever added (starts with signup bonus)
- createdAt (timestamp)
- updatedAt (timestamp)

// credit_transactions table (NEW - for audit trail)
- id (uuid, primary key)
- userId (string, foreign key to user.id)
- amount (integer) // Positive for additions, negative for deductions
- type (enum: 'signup_bonus', 'subscription_purchase', 'restore_photo', 'export_photo')
- photoId (uuid, nullable, foreign key to restoration_photos.id) // For restore/export actions
- description (string) // Human-readable description
- createdAt (timestamp)
```

**Actions:**
1. Add schema definitions to `db/schema.ts`
2. Run `npx drizzle-kit generate` to create migrations
3. Run `npx drizzle-kit push` to apply to database

#### 2.3 Project Management API Routes

**File:** `app/api/projects/route.ts`
- POST: Create new project
- GET: List all user's projects

**File:** `app/api/projects/[projectId]/route.ts`
- GET: Get project details with photos
- PATCH: Update project name
- DELETE: Delete project (and associated photos)

**File:** `app/api/projects/[projectId]/photos/route.ts`
- POST: Add photos to project (upload to R2)
- DELETE: Remove photo from project

#### 2.4 Credit System Implementation

**Overview:**
Simple credit-based monetization system to control usage and drive subscriptions.

**Credit Economics:**
- New users get 3 free credits on signup
- 1 credit = 1 photo restoration (Gemini API call)
- 1 credit = 1 photo export/upscale (Magnific API call)
- Monthly subscription: 50 credits for $19.99

**File:** `lib/credits.ts` (NEW)

**Core Functions:**
```typescript
// Get user's current credit balance
async function getUserCredits(userId: string): Promise<number>

// Check if user has sufficient credits
async function hasCredits(userId: string, amount: number): Promise<boolean>

// Deduct credits and log transaction
async function deductCredits(
  userId: string,
  amount: number,
  type: 'restore_photo' | 'export_photo',
  photoId: string,
  description: string
): Promise<{ success: boolean, newBalance: number }>

// Add credits (for purchases/subscriptions)
async function addCredits(
  userId: string,
  amount: number,
  type: 'signup_bonus' | 'subscription_purchase',
  description: string
): Promise<{ success: boolean, newBalance: number }>

// Get credit transaction history
async function getCreditHistory(userId: string): Promise<Transaction[]>
```

**File:** `app/api/credits/route.ts` (NEW)
- GET: Get user's credit balance and recent transactions

**File:** `app/api/credits/purchase/route.ts` (NEW)
- POST: Purchase credit bundle via Polar.sh
- Create checkout session for 50 credits ($19.99)

**Signup Bonus Logic:**
**File:** Modify Better Auth webhook handler in `lib/auth.ts`
- On user creation, automatically:
  1. Create `user_credits` record with 3 credits
  2. Create `credit_transactions` record for signup bonus

**Restore Photo Credit Check:**
**File:** `app/api/restore/route.ts` (MODIFY)
```typescript
// Before processing restoration:
1. Check if user has >= 1 credit
2. If not, return 402 (Payment Required) error with upgrade message
3. If yes, deduct 1 credit and log transaction
4. Proceed with Gemini API call
5. If API call fails, refund the credit
```

**Export Photo Credit Check:**
**File:** `app/api/export/route.ts` (MODIFY)
```typescript
// Before upscaling:
1. Check if user has >= 1 credit
2. If not, return 402 error with upgrade message
3. If yes, deduct 1 credit and log transaction
4. Proceed with Magnific API call
5. If API call fails, refund the credit
```

**UI Components:**

**File:** `app/dashboard/_components/credit-balance.tsx` (NEW)
- Display in dashboard header/navbar
- Shows: "Credits: 7" with icon
- Click to view transaction history
- "Buy More" button linking to pricing

**File:** `app/dashboard/_components/credit-gate-modal.tsx` (NEW)
- Modal shown when user tries action without credits
- Message: "You need 1 credit to restore this photo"
- "Buy Credits" CTA button
- Shows pricing: 50 credits for $19.99

**File:** `components/pricing-card-credits.tsx` (NEW)
- Pricing card for credit bundle
- "50 Credits - $19.99/month"
- "~$0.40 per photo restoration + export"
- Checkout button via Polar.sh

#### 2.5 Project List Component
**File:** `app/dashboard/_components/project-list.tsx`

**Features:**
- Display all user projects
- Click to select/view project
- Visual indicator for active project
- Show project metadata (photo count, date)
- "New Project" button with dialog/modal
- Loading states and error handling

#### 2.6 Drag-and-Drop Upload Interface
**File:** `app/dashboard/_components/photo-upload-zone.tsx`

**Features:**
- Drag-and-drop zone using `react-dropzone` or similar
- File type validation (jpg, jpeg, png)
- File size validation (e.g., max 10MB per file)
- Multiple file upload support
- Upload progress indicators
- Preview thumbnails after upload
- Integration with R2 storage (reuse existing `/api/upload-image` logic)

**Flow:**
1. User drags/selects files
2. Files upload to R2 via API
3. Create database records in `restoration_photos` table
4. Display uploaded photos in project view

#### 2.7 Photo Grid Display
**File:** `app/dashboard/_components/photo-grid.tsx`

**Features:**
- Grid layout showing all photos in selected project
- Each photo card shows:
  - Thumbnail preview
  - Status badge (uploaded, processing, completed, failed)
  - Actions menu (download, delete, view full size)
- Select all / batch selection capability
- Sort options (date, status)

#### 2.8 Restore Functionality
**File:** `app/api/restore/route.ts`

**Features:**
- POST endpoint accepting photo ID(s) or project ID
- Batch processing support (process all photos in project)
- For each photo:
  1. Fetch original image URL from database
  2. Call Gemini 2.5 Flash API with restoration prompt
  3. Store task ID in database
  4. Update photo status to 'processing'
- Return task IDs to client

**File:** `app/dashboard/_components/restore-button.tsx`
- "Restore" button in project view
- "Restore Selected" for batch operations
- Shows processing state (spinner, count of processing photos)
- Polling or webhook logic to check task completion

#### 2.9 Gemini API Integration Service
**File:** `lib/gemini-service.ts`

**Functions:**
```typescript
// Submit restoration task
async function restorePhoto(imageUrl: string): Promise<{ taskId: string }>

// Check task status
async function checkTaskStatus(taskId: string): Promise<{
  status: string,
  generatedUrls: string[]
}>

// Poll until completion
async function waitForRestoration(taskId: string): Promise<string[]>
```

**Implementation Details:**
- Use the restoration prompt from docs
- Handle API errors and retries
- Support webhook callbacks (optional for async processing)
- Store API key in environment variable: `FREEPIK_API_KEY`

#### 2.10 Task Status Polling/Webhook System
**Options:**

**Option A: Client-side Polling**
- Client polls `/api/restore/status/[taskId]` endpoint every 2-5 seconds
- API route checks Gemini status and updates database
- Once complete, fetch restored image URLs

**Option B: Server-side Webhooks**
- Configure webhook URL in Gemini API requests
- Create `/api/webhooks/gemini` endpoint
- Webhook updates database when restoration completes
- Client uses Server-Sent Events or WebSocket to get updates

**Recommended:** Start with Option A (simpler), implement Option B for production scale

#### 2.11 Export Functionality with Automatic Upscaling
**File:** `app/dashboard/_components/export-options.tsx`

**Features:**
- Export individual restored photo (automatically upscales first)
- Export all restored photos in project (batch upscale + zip)
- Export button shows processing states:
  - "Export" → "Upscaling..." → "Downloading..."
- Download triggers automatic upscaling workflow if not already upscaled
- Progress indicator during upscaling (can take 10-30 seconds)

**Export Workflow:**
1. User clicks "Export" button
2. Check if photo already has `upscaledImageUrl` in database
3. If not upscaled:
   - Submit to Magnific API with optimal settings
   - Poll for completion (show progress UI)
   - Save upscaled URL to database and R2
4. If already upscaled or once complete:
   - Fetch upscaled image from R2
   - Trigger browser download

**API Route:** `app/api/export/route.ts`
- POST: Trigger upscale + export for photo ID(s)
- Checks upscale status, initiates if needed
- Returns download URLs once ready

**API Route:** `app/api/export/batch/route.ts`
- POST: Batch upscale all photos in project
- Creates zip file with all upscaled images
- Uses `archiver` library for zip generation

#### 2.12 Magnific Upscaling API Integration
**File:** `lib/magnific-service.ts`

**Functions:**
```typescript
// Submit upscaling task with optimized settings for photo restoration
async function upscalePhoto(imageUrl: string): Promise<{ taskId: string }>

// Check upscaling task status
async function checkUpscaleStatus(taskId: string): Promise<{
  status: string,
  generatedUrls: string[]
}>

// Poll until upscaling completes
async function waitForUpscale(taskId: string): Promise<string[]>
```

**Implementation Details:**
- Use recommended settings for photo restoration:
  ```typescript
  {
    sharpen: 10,
    smart_grain: 5,
    ultra_detail: 40,
    flavor: "photo",
    scale_factor: 4
  }
  ```
- Handle API errors and retries
- Same polling pattern as Gemini API
- Store upscaled images to R2 after completion
- Uses same API key as Gemini: `FREEPIK_API_KEY`

**API Route:** `app/api/upscale/route.ts`
- POST: Submit photo(s) for upscaling
- Takes photo ID or array of IDs
- Fetches restored image URLs from database
- Submits to Magnific API
- Updates database with upscale task IDs

**API Route:** `app/api/upscale/status/[taskId]/route.ts`
- GET: Check upscaling task status
- Polls Magnific API
- Updates database when complete
- Saves upscaled image to R2

---

## Phase 3: Testing and Polish

### Tasks

#### 3.1 End-to-End Testing Flow
1. Create new project
2. Upload multiple photos via drag-and-drop
3. Click "Restore" button
4. Monitor restoration progress
5. View restored photos in grid
6. Click "Export" on a photo
7. Monitor automatic upscaling progress
8. Download high-resolution upscaled image
9. Export all photos in batch (zip file)
10. Delete photos and projects

#### 3.2 Error Handling
- Network errors during upload/API calls
- API rate limits or failures
- Invalid file formats
- Storage quota limits
- Display user-friendly error messages
- Add retry logic where appropriate

#### 3.3 Loading States
- Skeleton loaders for project list
- Upload progress bars
- Processing indicators on photo cards
- Disable buttons during operations

#### 3.4 Responsive Design
- Test all layouts on mobile, tablet, desktop
- Ensure drag-and-drop works on touch devices
- Optimize image sizes for different viewports

#### 3.5 Performance Optimization
- Lazy load photo thumbnails
- Paginate project list if many projects
- Debounce polling requests
- Optimize R2 image delivery (CDN, compression)

---

## Environment Variables Required

Add to `.env.local`:

```bash
# Existing variables (already configured)
DATABASE_URL=
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
OPENAI_API_KEY=
CLOUDFLARE_ACCOUNT_ID=
R2_UPLOAD_IMAGE_ACCESS_KEY_ID=
R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY=
R2_UPLOAD_IMAGE_BUCKET_NAME=

# New variables for Freepik AI APIs (Gemini + Magnific)
FREEPIK_API_KEY=your_freepik_api_key_here  # Used for both Gemini restoration and Magnific upscaling

# Optional: Webhook URLs for async callbacks
NEXT_PUBLIC_GEMINI_WEBHOOK_URL=https://yourdomain.com/api/webhooks/gemini
NEXT_PUBLIC_MAGNIFIC_WEBHOOK_URL=https://yourdomain.com/api/webhooks/magnific
```

---

## Implementation Order for Livestream

### Recommended Sequence:

1. **Landing Page First** (Quicker win, showcases the product)
   - Create `BeforeAfterGallery` component
   - Integrate into landing page
   - Test and polish

2. **Database Schema** (Foundation for dashboard)
   - Add tables for projects, photos, and credits
   - Run migrations

3. **Credit System** (Monetization foundation)
   - Create credit service (`lib/credits.ts`)
   - Add signup bonus logic to auth
   - Build credit balance UI component
   - Create credit API routes

4. **Project Management** (Core dashboard structure)
   - Create project list component
   - Build API routes for CRUD operations
   - Add left navigation

5. **Photo Upload** (Essential functionality)
   - Drag-and-drop component
   - R2 integration
   - Photo grid display

6. **Restoration Processing with Credit Gating** (The main feature)
   - Gemini API integration
   - Add credit check before restoration
   - Restore button and status polling
   - Update UI with restored images

7. **Upscaling Integration** (Quality enhancement)
   - Magnific API integration
   - Upscale service and API routes
   - Status polling for upscaling tasks

8. **Export with Upscaling & Credit Gating** (Completion of user flow)
   - Export button with automatic upscaling
   - Add credit check before export/upscale
   - Download functionality
   - Batch export with zip file creation

9. **Polish** (Final touches)
   - Error handling
   - Loading states for credit checks
   - Credit gate modals
   - Responsive testing

---

## Technical Dependencies to Install

```bash
# For drag-and-drop (if not already installed)
npm install react-dropzone

# For creating zip files in export
npm install archiver @types/archiver

# For image comparison slider (optional, for landing page)
npm install react-compare-image
# OR
npm install react-compare-slider
```

---

## Notes for Livestream

- **Brand:** Snaptastic (snaptastic.ai domain - $79/year)
- **Tagline:** "Bring grandpa back to life in just one click"
- **Before/After Photos Location:** `/beforeafterphotos/` (16 pairs ready)
- **Hero Video:** Upload your before/after transformation video to Cloudflare R2 before livestream
  - Use the same R2 bucket as photo storage
  - Get public URL and replace in hero section video source
- **Hero Template:** `NEW Landing Page/app/page.tsx` has the Serene Hero section ready to adapt
- **API Docs Reference:** `GEMINI_API_DOCS.md` (includes both Gemini & Magnific)
- **Restoration Prompt:** Already defined in API docs
- **Existing Auth/Storage:** Reuse patterns from current dashboard (chat, upload pages)
- **Credit System:**
  - 3 free credits on signup
  - 1 credit per restoration (Gemini)
  - 1 credit per export/upscale (Magnific)
  - 50 credits for $19.99/month subscription
  - High margins: ~$0.40 per photo (restore + export)
- **Polar.sh Integration:** Already set up for subscriptions, extend for credit purchases

---

## Future Enhancements (Post-Livestream)

- Before/After comparison slider in dashboard
- Photo history/versioning (multiple restoration attempts)
- Batch editing controls (crop, rotate before restore)
- Social sharing of restorations
- Gallery view for all user restorations
- Usage analytics (photos restored per month)
- Email notifications when batch processing completes
- Webhook-based processing for better scalability
- Caching layer for frequently accessed images

---

## Success Criteria

✅ Landing page displays 16 before/after examples beautifully
✅ Users get 3 free credits on signup
✅ Credit balance visible in dashboard
✅ Users can create projects and label them
✅ Drag-and-drop photo upload works smoothly
✅ Restoration requires 1 credit (gated appropriately)
✅ Restoration button triggers Gemini API successfully
✅ Photos show processing status in real-time
✅ Export requires 1 credit (gated appropriately)
✅ Export automatically upscales photos with Magnific API
✅ Users can download high-resolution upscaled photos individually or in batch
✅ Upscaling progress shown with loading indicators
✅ Users without credits see "Buy Credits" modal
✅ Credit purchase flow works via Polar.sh (50 credits for $19.99)
✅ Error handling provides clear feedback
✅ Responsive design works on all devices

---

## Quick Reference: Key Files to Create/Modify

**New Components:**
- `components/homepage/before-after-gallery.tsx`
- `app/dashboard/_components/project-list.tsx`
- `app/dashboard/_components/photo-upload-zone.tsx`
- `app/dashboard/_components/photo-grid.tsx`
- `app/dashboard/_components/restore-button.tsx`
- `app/dashboard/_components/export-options.tsx`
- `app/dashboard/_components/credit-balance.tsx` (NEW - credit system)
- `app/dashboard/_components/credit-gate-modal.tsx` (NEW - credit system)
- `components/pricing-card-credits.tsx` (NEW - credit system)

**New API Routes:**
- `app/api/projects/route.ts`
- `app/api/projects/[projectId]/route.ts`
- `app/api/projects/[projectId]/photos/route.ts`
- `app/api/credits/route.ts` (NEW - credit system)
- `app/api/credits/purchase/route.ts` (NEW - credit system)
- `app/api/restore/route.ts` (includes credit check)
- `app/api/restore/status/[taskId]/route.ts`
- `app/api/upscale/route.ts`
- `app/api/upscale/status/[taskId]/route.ts`
- `app/api/export/route.ts` (includes credit check)
- `app/api/export/batch/route.ts`
- `app/api/webhooks/gemini/route.ts` (optional)

**New Services:**
- `lib/credits.ts` (NEW - credit system)
- `lib/gemini-service.ts`
- `lib/magnific-service.ts`

**Modified Files:**
- `app/page.tsx` (add gallery section)
- `db/schema.ts` (add project/photo/credit tables)
- `app/dashboard/layout.tsx` (add left navigation + credit balance)
- `lib/auth.ts` (add signup bonus for credits)

**New Dashboard Page:**
- `app/dashboard/projects/page.tsx` (main project view)
- `app/dashboard/projects/[projectId]/page.tsx` (individual project)

---

Good luck with the livestream! 🎥✨
