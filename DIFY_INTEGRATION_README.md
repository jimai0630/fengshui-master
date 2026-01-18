# Dify Agent Integration Guide

## Overview

This document describes the integration of Dify Agent API into the Feng Shui application. The integration implements a 3-step workflow for generating personalized Feng Shui reports with idempotency checks to minimize API costs.

## Architecture

### Three-Step Workflow

1. **Step 1 (layout_grid)**: Upload floor plan → Get 9-palace room division
2. **Step 2 (energy_summary)**: Analyze energy → Display pentagon radar chart and brief summaries
3. **Step 3 (full_report)**: Generate complete report → Download PDF after payment

### Idempotency Strategy

The system implements idempotency checks to avoid redundant API calls:

**Essential Data** (triggers new API call if changed):
- Birth date (`birthDate`)
- Gender (`gender`)
- Floor plan file ID (`floorPlanFileId`)

**Non-essential Data** (doesn't trigger new API call):
- Nickname (`name`)
- Room photos (`roomPhotos`)
- Room name modifications

**How it works**:
1. Calculate hash of essential data
2. Check LocalStorage cache for matching hash
3. If found, use cached result; otherwise call API and cache result
4. Cache expires after 30 days

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_DIFY_API_KEY=your_dify_api_key_here
VITE_DIFY_BASE_URL=https://api.dify.ai/v1
```

**Important**: Never commit your API key to version control!

### 2. Install Dependencies

All dependencies are already included in `package.json`. Run:

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

## File Structure

### New Files Created

```
src/
├── services/
│   ├── difyService.ts          # Dify API integration
│   └── userDataService.ts      # Data caching and idempotency
├── utils/
│   └── benmingCalculator.ts    # Benming star calculation
└── types/
    └── dify.ts                 # TypeScript type definitions
```

### Modified Files

```
src/
├── components/
│   ├── HouseDetailsSection.tsx     # Step 1: Floor plan upload
│   ├── EnergyForecastSection.tsx   # Step 2: Energy analysis
│   └── PaymentModal.tsx            # Payment simulation
└── i18n/
    └── config.ts                   # Added translations
```

## API Integration Details

### File Upload

```typescript
import { uploadFile } from '../services/difyService';

const response = await uploadFile(file);
const fileId = response.id; // Use this for subsequent API calls
```

### Step 1: Layout Grid

```typescript
import { callLayoutGrid } from '../services/difyService';

const { result, conversationId } = await callLayoutGrid(
  userData,
  floorPlanFileId,
  floorPlanDescription
);

// result contains 9-palace room layout
// conversationId is used for subsequent calls
```

### Step 2: Energy Summary

```typescript
import { callEnergySummary } from '../services/difyService';

const { result, conversationId } = await callEnergySummary(
  userData,
  houseGridJson,
  roomPhotosDescription
);

// result contains:
// - scores_before: { love, wealth, career, health, luck }
// - scores_after: { love, wealth, career, health, luck }
// - summary_text: { love, wealth, career, health, luck }
```

### Step 3: Full Report

```typescript
import { callFullReport } from '../services/difyService';

const { result, conversationId } = await callFullReport(
  userData,
  houseGridJson,
  roomPhotosDescription,
  (progress) => console.log(progress) // Optional progress callback
);

// result contains:
// - report_content: Markdown text
// - pdf_base64: Base64 encoded PDF (if available)
```

## Data Flow

### Step 1 → Step 2

```typescript
// HouseDetailsSection collects data
const userData: UserCompleteData = {
  name, gender, birthDate,
  floorPlanFileId,
  houseGridJson, // From Step 1 API response
  roomPhotos,    // User uploaded photos
  conversationId, // From Step 1
  benmingStarNo,  // Calculated
  benmingStarName, // Calculated
  languageMode    // From i18n
};

// Navigate to ConsultationPage
navigate('/consultation', { state: userData });
```

### Step 2 → Step 3

```typescript
// EnergyForecastSection reads from route state or cache
const stateData = location.state as UserCompleteData;
const cachedData = getUserDataCache();
const userData = stateData || cachedData?.userData;

// Check idempotency before calling API
const cachedResult = checkIdempotency(essentialData, 'step2');
if (cachedResult) {
  // Use cached result
} else {
  // Call API and cache result
}
```

## Benming Star Calculation

The system automatically calculates the user's Benming Star based on birth year and gender:

**For Males**: `11 - (sum of birth year digits)`
**For Females**: `4 + (sum of birth year digits)`

Example:
- Male born in 1987: 11 - (1+9+8+7) = 11 - 25 = 11 - 7 = 4 → 四绿文曲星
- Female born in 1987: 4 + (1+9+8+7) = 4 + 25 = 4 + 7 = 11 = 2 → 二黑巨门星

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors**: Auto-retry up to 3 times with exponential backoff
2. **API Errors**: Display user-friendly error messages
3. **Parse Errors**: Fallback to error state with retry option
4. **File Upload Errors**: Validate file type/size before upload

## Testing

### Manual Testing Checklist

1. **Step 1 - Floor Plan Upload**
   - [ ] Upload valid floor plan image
   - [ ] Verify 9-palace room division displays
   - [ ] Edit room names
   - [ ] Upload room photos
   - [ ] Click "Continue" button

2. **Step 2 - Energy Analysis**
   - [ ] Verify radar chart displays with dynamic data
   - [ ] Check 5 dimension summaries are AI-generated
   - [ ] Test idempotency: refresh page, should use cache
   - [ ] Click "Generate Full Report"

3. **Step 3 - Payment & Report**
   - [ ] Payment modal opens
   - [ ] Simulate payment (2-second delay)
   - [ ] Report generation starts
   - [ ] PDF downloads automatically
   - [ ] Test idempotency: click button again, should download cached report

### Idempotency Testing

```typescript
// Test scenario 1: Same essential data
// 1. Complete Step 1 with birth date "1990-01-01", gender "男"
// 2. Navigate to Step 2 (should call API)
// 3. Refresh page (should use cache, no API call)
// 4. Go back and change room photo (non-essential)
// 5. Navigate to Step 2 again (should use cache)

// Test scenario 2: Changed essential data
// 1. Complete Step 1 with birth date "1990-01-01"
// 2. Navigate to Step 2 (should call API)
// 3. Go back and change birth date to "1991-01-01"
// 4. Navigate to Step 2 again (should call API again)
```

## Troubleshooting

### API Key Issues

**Problem**: "API call failed" error
**Solution**: 
1. Check `.env.local` file exists
2. Verify `VITE_DIFY_API_KEY` is set correctly
3. Restart development server after changing env vars

### CORS Issues

**Problem**: "Network error" or CORS blocked
**Solution**:
1. Verify Dify API endpoint allows your domain
2. Check browser console for specific CORS error
3. Contact Dify support if issue persists

### Cache Issues

**Problem**: Old data showing after changes
**Solution**:
```typescript
import { clearUserDataCache } from '../services/userDataService';
clearUserDataCache(); // Clear all cached data
```

### File Upload Issues

**Problem**: File upload fails
**Solution**:
1. Check file size (max 10MB)
2. Verify file type (JPG, PNG, PDF only)
3. Check network connection
4. Verify Dify API key has upload permissions

## Performance Considerations

### Optimization Strategies

1. **Caching**: All API responses cached in LocalStorage
2. **Retry Logic**: Failed requests auto-retry with backoff
3. **Progress Indicators**: Show loading states for better UX
4. **Lazy Loading**: Components load data only when needed

### Cost Control

The idempotency system significantly reduces API costs:

- **Without idempotency**: Every page refresh = new API call
- **With idempotency**: Only new essential data = new API call
- **Estimated savings**: 60-80% reduction in redundant calls

## Future Enhancements

1. **Backend Integration**: Replace LocalStorage with proper database
2. **Real Payment**: Integrate Stripe/PayPal
3. **Email Delivery**: Send reports via email
4. **Multi-language**: Support more languages beyond zh/en
5. **Report History**: Save and view past reports
6. **Social Sharing**: Share reports on social media

## Support

For issues or questions:
1. Check this README first
2. Review Dify API documentation
3. Check browser console for errors
4. Contact development team

## License

This integration is part of the Feng Shui application. All rights reserved.

