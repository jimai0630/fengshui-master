import type { FloorPlanAnalysisRequest, FloorPlanAnalysisResponse } from '../types/floorPlan';

// Configuration: Set to true to use mock API, false for real Gemini API
export const USE_MOCK_API = true;

// Mock scenario selector for testing different outcomes
type MockScenario = 'success' | 'no-compass' | 'poor-quality' | 'unrecognizable';

// Change this to test different scenarios
const MOCK_SCENARIO: MockScenario = 'success';

// Simulated processing delay (in milliseconds)
const PROCESSING_DELAY = 2000;

/**
 * Mock AI service that simulates Gemini API responses
 * This allows full testing before the real API is available
 */
export async function analyzeFloorPlan(
    request: FloorPlanAnalysisRequest
): Promise<FloorPlanAnalysisResponse> {
    console.log('🤖 Mock AI: Analyzing floor plan...', request);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, PROCESSING_DELAY));

    // Return different responses based on scenario
    const response = getMockResponse(MOCK_SCENARIO);

    console.log('🤖 Mock AI: Analysis complete', response);

    return response;
}

/**
 * Get mock response based on scenario
 */
function getMockResponse(scenario: MockScenario): FloorPlanAnalysisResponse {
    switch (scenario) {
        case 'success':
            return {
                success: true,
                hasCompass: true,
                imageQuality: 'good',
                rooms: [
                    { id: '1', name: 'Living Room', confidence: 0.95 },
                    { id: '2', name: 'Master Bedroom', confidence: 0.92 },
                    { id: '3', name: 'Kitchen', confidence: 0.88 },
                    { id: '4', name: 'Bathroom', confidence: 0.85 },
                    { id: '5', name: 'Study', confidence: 0.80 }
                ]
            };

        case 'no-compass':
            return {
                success: false,
                hasCompass: false,
                imageQuality: 'good',
                rooms: [],
                errorMessage: 'No compass or direction marker detected. Please upload a floor plan with clear directional markings (North arrow).'
            };

        case 'poor-quality':
            return {
                success: false,
                hasCompass: true,
                imageQuality: 'poor',
                rooms: [],
                errorMessage: 'Image quality is too low to accurately identify rooms. Please upload a clearer, higher resolution floor plan.'
            };

        case 'unrecognizable':
            return {
                success: false,
                hasCompass: false,
                imageQuality: 'unrecognizable',
                rooms: [],
                errorMessage: 'Unable to recognize this as a valid floor plan. Please upload an official floor plan from property documents, online listings, or architectural drawings.'
            };

        default:
            return {
                success: false,
                hasCompass: false,
                imageQuality: 'unrecognizable',
                rooms: [],
                errorMessage: 'Unknown error occurred. Please try again.'
            };
    }
}

/**
 * Helper function to validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a JPG, PNG, or PDF file.'
        };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size too large. Please upload a file smaller than 10MB.'
        };
    }

    return { valid: true };
}
