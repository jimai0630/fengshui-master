// User Data Service - 管理用户数据缓存和幂等性校验

import type {
    UserEssentialData,
    UserCompleteData,
    UserDataCache,
    LayoutGridResponse,
    EnergySummaryResponse,
    FullReportResponse
} from '../types/dify';

const STORAGE_KEY_PREFIX = 'fengshui_';
const CACHE_EXPIRY_DAYS = 30; // 缓存有效期30天

/**
 * 生成简单哈希值（用于幂等性校验）
 */
function simpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * 计算必要信息的哈希值
 */
export function hashEssentialData(data: UserEssentialData): string {
    const essentialString = `${data.birthDate}|${data.gender}|${data.floorPlanFileId}`;
    return simpleHash(essentialString);
}

/**
 * 保存用户数据缓存
 */
export function saveUserDataCache(cache: UserDataCache): void {
    try {
        const key = `${STORAGE_KEY_PREFIX}user_cache`;
        localStorage.setItem(key, JSON.stringify(cache));
    } catch (error) {
        console.error('Failed to save user data cache:', error);
    }
}

/**
 * 获取用户数据缓存
 */
export function getUserDataCache(): UserDataCache | null {
    try {
        const key = `${STORAGE_KEY_PREFIX}user_cache`;
        const cached = localStorage.getItem(key);

        if (!cached) return null;

        const cache: UserDataCache = JSON.parse(cached);

        // 检查缓存是否过期
        const now = Date.now();
        const expiryTime = cache.lastUpdated + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        if (now > expiryTime) {
            // 缓存已过期，清除
            clearUserDataCache();
            return null;
        }

        return cache;
    } catch (error) {
        console.error('Failed to get user data cache:', error);
        return null;
    }
}

/**
 * 清除用户数据缓存
 */
export function clearUserDataCache(): void {
    try {
        const key = `${STORAGE_KEY_PREFIX}user_cache`;
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Failed to clear user data cache:', error);
    }
}

/**
 * 检查是否需要重新调用API（幂等性校验）
 * @param essentialData 必要信息
 * @param step 步骤名称（'step1', 'step2', 'step3'）
 * @returns 如果需要调用API返回null，否则返回缓存结果
 */
export function checkIdempotency(
    essentialData: UserEssentialData,
    step: 'step1' | 'step2' | 'step3'
): any | null {
    const cache = getUserDataCache();

    if (!cache) return null;

    const currentHash = hashEssentialData(essentialData);

    // 如果必要信息发生变化，需要重新调用
    if (cache.essentialHash !== currentHash) {
        return null;
    }

    // 返回对应步骤的缓存结果
    switch (step) {
        case 'step1':
            return cache.step1Result || null;
        case 'step2':
            return cache.step2Result || null;
        case 'step3':
            return cache.step3Result || null;
        default:
            return null;
    }
}

/**
 * 缓存步骤结果
 */
export function cacheStepResult(
    essentialData: UserEssentialData,
    userData: UserCompleteData,
    step: 'step1' | 'step2' | 'step3',
    result: LayoutGridResponse | EnergySummaryResponse | FullReportResponse,
    conversationId?: string
): void {
    const currentHash = hashEssentialData(essentialData);
    let cache = getUserDataCache();

    // 如果没有缓存或哈希值不匹配，创建新缓存
    if (!cache || cache.essentialHash !== currentHash) {
        cache = {
            essentialHash: currentHash,
            userData: userData,
            conversationId: conversationId,
            lastUpdated: Date.now()
        };
    }

    // 更新对应步骤的结果
    switch (step) {
        case 'step1':
            cache.step1Result = result as LayoutGridResponse;
            break;
        case 'step2':
            cache.step2Result = result as EnergySummaryResponse;
            break;
        case 'step3':
            cache.step3Result = result as FullReportResponse;
            break;
    }

    // 更新conversationId（如果提供）
    if (conversationId) {
        cache.conversationId = conversationId;
    }

    cache.lastUpdated = Date.now();
    saveUserDataCache(cache);
}

/**
 * 获取conversation ID
 */
export function getConversationId(): string | undefined {
    const cache = getUserDataCache();
    return cache?.conversationId;
}

/**
 * 保存conversation ID
 */
export function saveConversationId(conversationId: string): void {
    const cache = getUserDataCache();
    if (cache) {
        cache.conversationId = conversationId;
        cache.lastUpdated = Date.now();
        saveUserDataCache(cache);
    }
}

/**
 * 获取完整的用户数据
 */
export function getCompleteUserData(): UserCompleteData | null {
    const cache = getUserDataCache();
    return cache?.userData || null;
}

/**
 * 更新用户数据（不影响缓存的API结果）
 */
export function updateUserData(userData: Partial<UserCompleteData>): void {
    const cache = getUserDataCache();
    if (cache) {
        cache.userData = { ...cache.userData, ...userData };
        cache.lastUpdated = Date.now();
        saveUserDataCache(cache);
    }
}

