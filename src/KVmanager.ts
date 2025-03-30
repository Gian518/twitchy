/**
 * This is the entry point for KV namespaces where we store Twitch tokens.
 */

import { getEnv } from "./store"
import { TwitchTokenResponse } from "./types"

/**
 * Store credentials inside KV spacenames for future use
 */
export const saveCredentials = async (tokenData: TwitchTokenResponse, chatId: string) => {
    const env = getEnv()

    if (!env || !env.OAUTH_TOKEN || !env.OAUTH_REFRESH_TOKENS) {
        throw new Error("Env not initialized")
    }

    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token

    await env.OAUTH_TOKEN.put(chatId, accessToken)
    await env.OAUTH_REFRESH_TOKENS.put(chatId, refreshToken)

    return {
        accessToken,
        refreshToken
    }
}

/**
 * Get credentials from KV spacenames for future use
 */
export const getCredentials = async (chatId: string): Promise<{ accessToken: string, refreshToken: string }> => {
    const env = getEnv()


    if (!env || !env.OAUTH_TOKEN || !env.OAUTH_REFRESH_TOKENS) {
        throw new Error("Env not initialized")
    }

    const accessToken = await env.OAUTH_TOKEN.get(chatId) || ''
    const refreshToken = await env.OAUTH_REFRESH_TOKENS.get(chatId) || ''

    return {
        accessToken,
        refreshToken
    }
}