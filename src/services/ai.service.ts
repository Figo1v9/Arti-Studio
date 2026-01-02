
import { CATEGORIES } from '@/types/gallery';

// ============================================
// AI Provider Configuration
// ============================================

// Gemini Config
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
const BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
const GEMINI_API_URL = `${BASE_URL}/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Groq Config
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Available AI Providers
export type AIProvider = 'gemini' | 'groq';

export const AI_PROVIDERS: { id: AIProvider; name: string; available: boolean }[] = [
    { id: 'gemini', name: 'Google Gemini', available: !!GEMINI_API_KEY },
    { id: 'groq', name: 'Groq (Llama 3.3)', available: !!GROQ_API_KEY },
];

// ============================================
// Response Types
// ============================================

interface GeminiResponse {
    candidates?: {
        content: {
            parts: { text: string }[];
        };
    }[];
    error?: {
        message: string;
    };
}

interface GroqResponse {
    choices?: {
        message: {
            content: string;
        };
    }[];
    error?: {
        message: string;
    };
}

// ============================================
// Smart Tags Generation
// ============================================

/**
 * Generate smart tags based on the prompt and optionally the image
 * @param prompt - The user's prompt description
 * @param imageBase64 - Optional base64 encoded image (only works with Gemini)
 * @param availableCategories - Available categories to choose from
 * @param provider - Which AI provider to use (default: gemini)
 * @returns Array of up to 4 relevant tags
 */
export const generateSmartTags = async (
    prompt: string,
    imageBase64?: string,
    availableCategories?: { id: string, label: string }[],
    provider: AIProvider = 'gemini'
): Promise<{ tags: string[], title: string, category: string }> => {
    try {
        const categoriesToUse = availableCategories || CATEGORIES;
        const categoriesWithLabels = categoriesToUse.map(c => `"${c.id}" (${c.label})`).join(', ');

        const systemPrompt = `You are an expert SEO specialist for a digital art gallery.
Analyze the provided prompt ${imageBase64 ? 'and the attached image ' : ''}to create metadata that maximizes search visibility and click-through rates.

Return a valid JSON object with the following structure:
{
  "title": "Your SEO friendly title here (max 60 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "category": "category_id"
}

Rules:
- Title: Descriptive, engaging, include main subject + art style. Max 60 chars. No filler words.
- Tags: Exactly 4 high-volume, relevant keywords.
- Category: Choose exactly ONE from this provided list based on the prompt's content: [${categoriesWithLabels}].
  - Analyze the prompt deeply. If it mentions christmas, winter, or santa, pick the 'christmas' category if available.
  - If it's a photo or realistic, pick 'photography' if available.
  - If it's 3D, pick '3d-render' if available.
  - If strictly nothing fits, fallback to 'art' or 'design'.
- Response MUST be pure JSON.`;

        // Choose provider
        if (provider === 'groq' && GROQ_API_KEY) {
            return await generateWithGroq(prompt, systemPrompt, categoriesToUse);
        } else {
            return await generateWithGemini(prompt, systemPrompt, imageBase64, categoriesToUse);
        }

    } catch (error) {
        console.error('Error generating tags:', error);
        return { title: '', tags: [], category: 'art' };
    }
};

// ============================================
// Gemini Provider
// ============================================

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

async function generateWithGemini(
    prompt: string,
    systemPrompt: string,
    imageBase64: string | undefined,
    categoriesToUse: { id: string, label: string }[]
): Promise<{ tags: string[], title: string, category: string }> {
    const parts: GeminiPart[] = [
        { text: systemPrompt },
        { text: `\n\nPrompt: ${prompt}` }
    ];

    if (imageBase64) {
        const match = imageBase64.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
            parts.push({
                inlineData: {
                    mimeType: match[1],
                    data: match[2]
                }
            });
        } else {
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            });
        }
    }

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseAIResponse(text, categoriesToUse);
}

// ============================================
// Groq Provider
// ============================================

async function generateWithGroq(
    prompt: string,
    systemPrompt: string,
    categoriesToUse: { id: string, label: string }[]
): Promise<{ tags: string[], title: string, category: string }> {
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Prompt: ${prompt}` }
            ],
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Groq API error:', errorData);
        throw new Error(errorData.error?.message || 'Groq API request failed');
    }

    const data: GroqResponse = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    const text = data.choices?.[0]?.message?.content || '';
    return parseAIResponse(text, categoriesToUse);
}

// ============================================
// Response Parser
// ============================================

function parseAIResponse(
    text: string,
    categoriesToUse: { id: string, label: string }[]
): { tags: string[], title: string, category: string } {
    try {
        // Clean up any potential markdown formatting
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(cleanJson);

        // Validate category
        const suggestedCategory = result.category && categoriesToUse.some(c => c.id === result.category)
            ? result.category
            : (categoriesToUse[0]?.id || 'art');

        return {
            title: result.title || '',
            tags: Array.isArray(result.tags)
                ? result.tags.map((t: string) => t.toLowerCase().trim()).slice(0, 4)
                : [],
            category: suggestedCategory
        };
    } catch (parseError) {
        console.error('Failed to parse AI response:', text);
        return { title: '', tags: [], category: 'art' };
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Convert File to base64 for Gemini API
 */
export const fileToBase64ForGemini = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Get available AI provider (first one that has API key)
 */
export const getDefaultProvider = (): AIProvider => {
    if (GEMINI_API_KEY) return 'gemini';
    if (GROQ_API_KEY) return 'groq';
    return 'gemini';
};
