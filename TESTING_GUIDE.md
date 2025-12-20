# Floor Plan Upload System - Testing Guide

## Overview
This guide explains how to test the floor plan upload system using the mock AI service before the Gemini API is available.

---

## Quick Start

1. **Navigate to Page 3**: Scroll down or click the navigation button from Page 2
2. **Upload a floor plan**: Any image will work for testing
3. **Click "Analyze Floor Plan"**: The mock AI will process it
4. **Review results**: Based on the mock scenario configured

---

## Changing Test Scenarios

To test different outcomes, edit the `MOCK_SCENARIO` constant in:
```
src/services/mockFloorPlanAI.ts
```

### Available Scenarios

#### 1. Success Scenario ✅
```typescript
const MOCK_SCENARIO: MockScenario = 'success';
```

**What happens:**
- Analysis succeeds
- Detects compass marker
- Identifies 5 rooms:
  - Living Room
  - Master Bedroom
  - Kitchen
  - Bathroom
  - Study
- Proceeds to room confirmation step

**Use this to test:**
- Room name editing
- Photo upload for each room
- Adding custom rooms
- Progress tracking

---

#### 2. No Compass Scenario ❌
```typescript
const MOCK_SCENARIO: MockScenario = 'no-compass';
```

**What happens:**
- Analysis fails
- Error: "No compass or direction marker detected"
- Returns to upload step

**Use this to test:**
- Error message display
- User guidance for fixing the issue
- Re-upload flow

---

#### 3. Poor Quality Scenario ❌
```typescript
const MOCK_SCENARIO: MockScenario = 'poor-quality';
```

**What happens:**
- Analysis fails
- Error: "Image quality is too low"
- Returns to upload step

**Use this to test:**
- Quality validation feedback
- User instructions for better images
- Re-upload flow

---

#### 4. Unrecognizable Scenario ❌
```typescript
const MOCK_SCENARIO: MockScenario = 'unrecognizable';
```

**What happens:**
- Analysis fails
- Error: "Unable to recognize this as a valid floor plan"
- Returns to upload step

**Use this to test:**
- Handling of invalid uploads
- User guidance for proper floor plans
- Re-upload flow

---

## Testing Checklist

### Upload Step
- [ ] Drag and drop file works
- [ ] Click to browse works
- [ ] File preview displays correctly
- [ ] Requirements list is visible
- [ ] File type validation works (try uploading .txt file)
- [ ] File size validation works (if you have a large file)
- [ ] "Analyze" button only appears after upload
- [ ] "Re-upload" button works

### Analysis Step
- [ ] Loading animation displays
- [ ] Progress bar animates smoothly
- [ ] Progress messages update
- [ ] Processing takes ~2 seconds (configurable in mockFloorPlanAI.ts)

### Success Flow
- [ ] Transitions to rooms step
- [ ] Correct number of rooms displayed
- [ ] Room names are editable
- [ ] Clicking edit icon allows name change
- [ ] Pressing Enter saves name
- [ ] Clicking outside saves name
- [ ] Photo upload button works for each room
- [ ] Photo uploaded state shows correctly
- [ ] "Add Custom Room" button works
- [ ] Progress counter updates correctly
- [ ] "Continue" button is always enabled
- [ ] "Upload New Floor Plan" resets everything

### Error Flow
- [ ] Error message displays clearly
- [ ] Error icon shows
- [ ] Returns to upload step after delay
- [ ] Can upload new image
- [ ] Previous image is cleared

### Mobile Responsiveness
- [ ] Layout works on mobile (< 640px)
- [ ] Layout works on tablet (640px - 1024px)
- [ ] Layout works on desktop (> 1024px)
- [ ] Touch interactions work on mobile
- [ ] Buttons are appropriately sized for touch

---

## Common Test Workflows

### Happy Path Test
1. Upload any image
2. Set scenario to `'success'`
3. Click "Analyze Floor Plan"
4. Wait for analysis
5. Edit a room name
6. Upload photos for 2-3 rooms
7. Add a custom room
8. Upload photo for custom room
9. Click "Continue"

### Error Recovery Test
1. Upload any image
2. Set scenario to `'no-compass'`
3. Click "Analyze Floor Plan"
4. See error message
5. Wait for return to upload
6. Change scenario to `'success'`
7. Upload new image
8. Click "Analyze Floor Plan"
9. Verify success flow

### Edge Cases
1. **Upload very small image**: Should work
2. **Upload very large image**: Should show error if > 10MB
3. **Upload PDF**: Should work (preview might not show)
4. **Upload wrong file type**: Should show error
5. **Edit room name to empty**: Should allow (user choice)
6. **Add many custom rooms**: Should handle gracefully

---

## Switching to Real Gemini API

When your Gemini API is ready:

1. Create `src/services/realFloorPlanAI.ts`
2. Implement the same interface:
   ```typescript
   export async function analyzeFloorPlan(
       request: FloorPlanAnalysisRequest
   ): Promise<FloorPlanAnalysisResponse>
   ```
3. Update import in `HouseDetailsSection.tsx`:
   ```typescript
   // Change from:
   import { analyzeFloorPlan } from '../services/mockFloorPlanAI';
   
   // To:
   import { analyzeFloorPlan } from '../services/realFloorPlanAI';
   ```

That's it! No other code changes needed.

---

## Troubleshooting

### Issue: Analysis never completes
**Solution**: Check browser console for errors. Verify `PROCESSING_DELAY` in mockFloorPlanAI.ts isn't too high.

### Issue: Rooms don't appear after success
**Solution**: Verify the mock response includes rooms array. Check browser console.

### Issue: Photo upload doesn't work
**Solution**: Check browser console for file validation errors. Ensure you're uploading image files.

### Issue: Translations missing
**Solution**: Verify i18n config.ts has all required keys. Check browser console for missing translation warnings.

---

## Mock API Configuration

You can customize the mock behavior in `src/services/mockFloorPlanAI.ts`:

```typescript
// Change processing time (milliseconds)
const PROCESSING_DELAY = 2000; // 2 seconds

// Add more rooms to success scenario
rooms: [
    { id: '1', name: 'Living Room', confidence: 0.95 },
    { id: '2', name: 'Master Bedroom', confidence: 0.92 },
    // Add more rooms here...
]

// Customize error messages
errorMessage: 'Your custom error message here'
```

---

## Next Steps

After testing with mock data:
1. Collect user feedback on the flow
2. Refine UI based on feedback
3. Prepare real Gemini API integration
4. Test with real API
5. Deploy to production
