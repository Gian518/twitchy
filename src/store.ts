/**
 * This is a variable store!
 * 
 * If you're familiar with React, this is similar to a state manager, like Redux or MobX.
 * This is, of course, a really simple approach, but it's perfect for a serverless application like Cloudflare Workers.
 * 
 * Here, we're using it to store environment variables, request objects, and the Telegram bot instance.
 */

import { TelegramBot } from "./types"

let env: Env
let request: Request
let bot: TelegramBot

/**
 * Save environment variables to use in other modules
 */
export const saveEnv = (e: Env) => {
    env = e
}

/**
 * Get environment variables
 */
export const getEnv = () => {
    return env
}

/**
 * Save URL request
 */
export const saveRequest = (r: Request) => {
    request = r
}

/**
 * Get URL request
 */
export const getRequest = () => {
    return request
}

/**
 * Save Telegram bot
 */
export const saveBot = (b: TelegramBot) => {
    bot = b
}

/**
 * Get Telegram bot
 */
export const getBot = () => {
    return bot
}