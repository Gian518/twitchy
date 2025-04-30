import { Context, MiddlewareFn, NextFunction } from "grammy";
import { BotContext, IBroadcasterFlavor } from "../types";
import { getEnv } from "../store";

/**
 * Middleware to manage broadcaster operations
 */
export default (): MiddlewareFn<BotContext> => {

    return async (ctx: Context & IBroadcasterFlavor, next: NextFunction): Promise<void> => {
        const env = getEnv()

        /**
         * Check if the user is the broadcaster
         * @returns true if the user is the broadcaster, false otherwise
         */
        ctx.isBroadcaster = () => {
            const broadcasterId = env.TELEGRAM_BROADCASTER_ID
            if (!broadcasterId) throw new Error("TELEGRAM_BROADCASTER_ID is not set")
            return ctx.from?.id === parseInt(broadcasterId)
        }

        await next()
    }

}