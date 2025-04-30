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

    if (!env || !env.OAUTH_TOKEN) {
        throw new Error("Env not initialized")
    }

    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token

    // Store both access and refresh tokens in the same key reduces the number of KV operations
    // and avoids the risk of reaching the rate limit of Cloudflare.
    await env.OAUTH_TOKEN.put(chatId, accessToken + ' ' + refreshToken)

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


    if (!env || !env.OAUTH_TOKEN) {
        throw new Error("Env not initialized")
    }

    const tokens = await env.OAUTH_TOKEN.get(chatId)
    if (!tokens) {
        return {
            accessToken: '',
            refreshToken: ''
        }
    }

    const [accessToken, refreshToken] = tokens.split(' ')

    return {
        accessToken,
        refreshToken
    }
}