import { type ChatMembersFlavor } from "@grammyjs/chat-members"
import { Api, Bot, Context, RawApi } from "grammy"

export type BotContext = Context & ChatMembersFlavor & I18nFlavor
export type TelegramBot = Bot<BotContext, Api<RawApi>>

export type LocalesEnum = keyof typeof import("./locales/index.ts").default
export type LocalesKey = keyof typeof import("./locales/index.ts").default[LocalesEnum]

export interface I18nFlavor {
    t: (key: LocalesKey, variables?: Record<string, any>) => string
}

interface IOAuthLoginAuth {
    grantType: 'authorization_code'
    code: string
    refreshToken?: undefined
}

interface IOAuthLoginRefresh {
    grantType: 'refresh_token'
    refreshToken: string
    code?: undefined
}

export type IOAuthLogin = IOAuthLoginAuth | IOAuthLoginRefresh

export interface TwitchTokenResponse {
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string[]
    token_type: string
}

export interface TwitchTokenValidationResponse {
    client_id: string
    login: string
    scopes: string[]
    user_id: string
    expires_in: number
}

export interface TwitchUser {
    id: string,
    login: string,
    display_name: string,
    type: string,
    broadcaster_type: string,
    description: string,
    profile_image_url: string,
    offline_image_url: string,
    view_count: number,
    email: string,
    created_at: string
}

export interface TwitchSubscription {
    broadcaster_id: string,
    broadcaster_login: string,
    broadcaster_name: string,
    gifter_id?: string,
    gifter_login?: string
    gifter_name?: string,
    is_gift: boolean,
    tier: "1000" | "2000" | "3000",
}