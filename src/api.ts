/**
 * This file contains the API functions for interacting with Twitch's OAuth and user APIs.
 */

import { getEnv } from "./store"
import { getCredentials, saveCredentials } from "./KVmanager"
import { IOAuthLogin, TwitchSubscription, TwitchTokenResponse, TwitchTokenValidationResponse, TwitchUser } from "./types"

/* AUTHORIZATION */
const authUrl = 'https://id.twitch.tv/oauth2'

/**
 * Get tokens from Twitch API, either by authorization code or refresh token.
 */
export const oauthLogin = async ({ grantType, code, refreshToken }: IOAuthLogin): Promise<TwitchTokenResponse> => {
    const env = getEnv()

    const body = new URLSearchParams({
        client_id: env.TWITCH_CLIENT_ID,
        client_secret: env.TWITCH_CLIENT_SECRET,
        grant_type: grantType,
    })
    if (code) {
        body.append('code', code)
    }
    if (grantType == 'authorization_code') {
        body.append('redirect_uri', env.OAUTH_REDIRECT_URI)
    }
    if (grantType == 'refresh_token') {
        body.append('refresh_token', refreshToken)
    }
    const response = await fetch(authUrl + '/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
    })

    return await response.json()
}

/**
 * Validate token and refresh if necessary, then return the most updated ones.
 */
export const getTokens = async (chatId: string): Promise<{ accessToken: string | false, refreshToken: string | false }> => {
    const { accessToken, refreshToken } = await getCredentials(chatId)

    // User is not present in KV
    if (!accessToken || !refreshToken) {
        return {
            accessToken: false,
            refreshToken: false
        }
    }

    const response = await fetch(authUrl + '/validate', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
    if (response.status == 200) {
        // Tokens are still valid, return them after checking that the user is valid
        const data: TwitchTokenValidationResponse = await response.json()
        if (data.user_id) {
            return {
                accessToken,
                refreshToken
            }
        } else {
            throw new Error("Invalid user")
        }
    } else {
        // Tokens are not valid, refresh them
        const tokenData = await oauthLogin({ grantType: 'refresh_token', refreshToken: refreshToken })
        const credentials = await saveCredentials(tokenData, chatId)
        return {
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken
        }
    }
}

/* TWITCH API */
const baseUrl = 'https://api.twitch.tv/helix'

/**
 * Get user info from Twitch API
 */
export const getUsers = async (chatId: string, ids?: string[]): Promise<TwitchUser[]> => {
    const env = getEnv()

    const { accessToken } = await getTokens(chatId)
    if (!accessToken) {
        return []
    }

    const url = new URL(baseUrl + '/users')
    if (ids) {
        ids.map((id) => url.searchParams.append('id', id))
    }
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': env.TWITCH_CLIENT_ID || '',
        },
    })

    if (response.status == 200) {
        const users = await response.json() as { data: TwitchUser[] }
        return users.data
    } else {
        return []
    }
}

/**
 * Check user subscription to a broadcaster (channel)
 */
export const checkUserSubscription = async (chatId: string, userId: string): Promise<TwitchSubscription | false> => {
    const env = getEnv()

    const { accessToken } = await getTokens(chatId)
    if (!accessToken) {
        return false
    }

    const url = new URL(baseUrl + '/subscriptions/user')
    url.searchParams.append('broadcaster_id', env.BROADCASTER_ID)
    url.searchParams.append('user_id', userId)
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': env.TWITCH_CLIENT_ID || '',
        },
    })
    if (response.status === 401 || response.status === 404) {
        console.log('User is not subscribed or not authorized', response)
        return false
    } else {
        const sub = await response.json() as { data: TwitchSubscription[] }
        return sub.data[0]
    }
}