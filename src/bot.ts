import { Bot, MemorySessionStorage } from "grammy"
import { chatMembers } from "@grammyjs/chat-members"
import { getEnv, getRequest, saveBot } from "./store"
import { checkUserSubscription, getUsers } from "./api"
import { BotContext } from "./types"
import { ChatMember } from "grammy/types"
import { commands } from "./commands"
import i18n from "./middlewares/i18n"
import broadcaster from "./middlewares/broadcaster"
import { getCredentials } from "./KVmanager"

/**
 * Initial bot setup and webhook configuration
 * @param noRequest - Skip the request handling for cron jobs and only initialize the bot
 */
export const init = async (noRequest?: boolean) => {
    const env = getEnv()
    const request = !noRequest && getRequest()

    const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN, {
        botInfo: {
            id: parseInt(env.BOT_ID),
            is_bot: true,
            first_name: env.BOT_NAME,
            username: env.BOT_USERNAME,
            can_join_groups: true,
            can_read_all_group_messages: false,
            supports_inline_queries: false,
            can_connect_to_business: false,
            has_main_web_app: false
        }
    })
    if (request && !noRequest) {
        const url = new URL(request.url)
        bot.api.setWebhook(`${url.origin}/bot`, { allowed_updates: ['chat_member', 'message', 'chat_join_request', 'my_chat_member', 'callback_query'] })
    }

    /* Middlewares */
    const adapter = new MemorySessionStorage<ChatMember>()
    const localization = i18n({ defaultLocale: 'en' })
    const broadcasterMiddleware = broadcaster()
    bot.use(chatMembers(adapter), localization, broadcasterMiddleware)
    saveBot(bot)


    /* Register commands */
    await commands()

    return bot
}

/**
 * Run the Telegram bot
 */
export const execute = async () => {
    const env = getEnv()
    const request = getRequest()
    const bot = await init()
    const url = new URL(request.url)

    /* Start the bot and generate an OAuth link for the user */
    bot.command("start", async (ctx) => {

        if (ctx.chat.type == 'private') {
            const chatId = ctx.chat.id.toString()

            const { accessToken } = await getCredentials(ctx.chat.id.toString())
            if (accessToken) {
                const twitchResponse = await getUsers(chatId)
                if (twitchResponse.length > 0) {
                    const [twitchUser] = twitchResponse
                    const sub = await checkUserSubscription(chatId, twitchUser.id)
                    if (sub) {
                        const link = await bot.api.createChatInviteLink(env.GROUP_ID, { expire_date: (Date.now() / 1000) + 259200, member_limit: 1 })
                        await ctx.reply(ctx.t('start.alreadyauthorized'), {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [[{ text: ctx.t('auth.join'), url: link.invite_link }]],
                            }
                        })
                        return
                    }
                }
            }

            const state = crypto.randomUUID()

            // Generate the Twitch OAuth URL
            const authUrl = new URL('https://id.twitch.tv/oauth2/authorize')
            authUrl.searchParams.append('client_id', env.TWITCH_CLIENT_ID)
            authUrl.searchParams.append('redirect_uri', url.origin + '/api/auth/callback/twitch')
            authUrl.searchParams.append('response_type', 'code')
            authUrl.searchParams.append('scope', 'user:read:email user:read:subscriptions')
            authUrl.searchParams.append('state', state)

            // Using webapp, instead of a classic URL, allows the user to login without leaving the Telegram app.
            // This is necessary because the Twitch app on Android does not handle redirects correctly, causing the OAuth flow to fail.
            const msg = await ctx.reply(ctx.t('start.msg'), {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: ctx.t('start.login'), web_app: { url: authUrl.toString() } }]],
                },
            })

            // Store state and startup message in KV with 5 minute expiration
            // Using a single entry for chat ID and message ID decreases the number of KV operations
            // and reduce the risk of reaching the rate limit of the KV store.
            await env.OAUTH_STATES.put(state, chatId + ' ' + msg.message_id.toString(), {
                expirationTtl: 300
            })
        }
    })

    /* Show Twitch user info */
    bot.command("me", async (ctx) => {
        const chatId = ctx.chat.id.toString()
        if (ctx.chat.type != 'private') {
            await ctx.reply(ctx.t('me.notprivate', { name: (ctx.from?.username ? ("@" + ctx.from?.username) : ctx.from?.first_name) }))
            return
        }

        const msg = await ctx.reply(ctx.t('me.loading'))

        try {
            const twitchResponse = await getUsers(chatId)
            if (twitchResponse.length > 0) {
                const [twitchUser] = twitchResponse
                const sub = await checkUserSubscription(chatId, twitchUser.id)

                let subInfo = ''
                if (sub) {
                    subInfo = ctx.t('me.tier', { tier: sub.tier.substring(0, 1) }) + ctx.t('me.gifted', { gifted: sub.is_gift ? ctx.t('me.yes') : ctx.t('me.no') })
                }

                const replyMessage = ctx.t('me.info', {
                    username: twitchUser.display_name,
                    email: twitchUser.email || 'N/A',
                    id: twitchUser.id,
                    subscribed: sub ? ctx.t('me.subscribed') : ctx.t('me.notsubscribed'),
                    subInfo: subInfo
                })
                if (twitchUser.profile_image_url) {
                    await bot.api.editMessageMedia(
                        chatId,
                        msg.message_id,
                        { type: 'photo', media: twitchUser.profile_image_url, caption: replyMessage, parse_mode: 'HTML' },
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    !sub ?
                                        [{ text: ctx.t('me.subscribe'), url: 'https://twitch.tv/' + env.BROADCASTER_LOGIN + '/subscribe' }]
                                        : []
                                ]
                            }
                        }
                    )
                } else {
                    await bot.api.editMessageText(chatId, msg.message_id, replyMessage, { parse_mode: 'HTML' })
                }
            } else {
                await bot.api.editMessageText(chatId, msg.message_id, ctx.t('me.notlogged'))
            }
        } catch (error) {
            console.log("Error in /me command:", error)
            await bot.api.editMessageText(chatId, msg.message_id, ctx.t('me.error'))
        }
    })

    bot.command("help", async (ctx) => {
        await ctx.reply(ctx.t('help.msg'), { parse_mode: 'HTML' })
    })

    bot.command('botstats', async (ctx) => {

        if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') {
            await ctx.reply("This command is available only in groups.")
            return
        }

        const requestedBy = await bot.api.getChatMember(ctx.chat.id, ctx.from?.id!)
        if (requestedBy.status != 'creator') {
            // Silent return for non-creator users
            return
        }

        const msg = await ctx.reply('Wait a moment, fetching stats...')

        let reply = "<b>Bot info</b>"
        // General bot info
        const botUser = await bot.api.getChatMember(ctx.chat.id, (await bot.api.getMe()).id)
        reply += '\n\n<i>General info</i>'
        reply += '\nUsername: ' + botUser.user.username
        reply += '\nIs admin: ' + (botUser.status === 'administrator' ? '✅' : '❌')
        const admins = await bot.api.getChatAdministrators(ctx.chat.id)
        if (botUser.status === 'administrator') {
            const botAdmin = admins.find(admin => admin.user.id === botUser.user.id)
            if (botAdmin?.status === 'administrator') {
                reply += '\nCustom name: ' + (botUser.custom_title || 'None')
                reply += '\n\n<i>Permissions</i>'
                reply += '\ncan_be_edited: ' + (botAdmin.can_be_edited ? '✅' : '❌')
                reply += '\ncan_change_info: ' + (botAdmin.can_change_info ? '✅' : '❌')
                reply += '\ncan_delete_messages: ' + (botAdmin.can_delete_messages ? '✅' : '❌')
                reply += '\ncan_delete_stories: ' + (botAdmin.can_delete_stories ? '✅' : '❌')
                reply += '\ncan_edit_messages: ' + (botAdmin.can_edit_messages ? '✅' : '❌')
                reply += '\ncan_edit_stories: ' + (botAdmin.can_edit_stories ? '✅' : '❌')
                reply += '\ncan_invite_users: ' + (botAdmin.can_invite_users ? '✅' : '❌')
                reply += '\ncan_manage_chat: ' + (botAdmin.can_manage_chat ? '✅' : '❌')
                reply += '\ncan_manage_topics: ' + (botAdmin.can_manage_topics ? '✅' : '❌')
                reply += '\ncan_manage_video_chats: ' + (botAdmin.can_manage_video_chats ? '✅' : '❌')
                reply += '\ncan_pin_messages: ' + (botAdmin.can_pin_messages ? '✅' : '❌')
                reply += '\ncan_post_messages: ' + (botAdmin.can_post_messages ? '✅' : '❌')
                reply += '\ncan_post_stories: ' + (botAdmin.can_post_stories ? '✅' : '❌')
                reply += '\ncan_promote_members: ' + (botAdmin.can_promote_members ? '✅' : '❌')
                reply += '\ncan_restrict_members: ' + (botAdmin.can_restrict_members ? '✅' : '❌')
            }
        } else {
            reply += '\n⚠️ Bot must be admin to operate in this chat. ⚠️'
        }
        // Other admins
        reply += '\n\n<i>Other admins</i>'
        admins.forEach((admin) => {
            if (admin.user.id != botUser.user.id && (admin.status === 'administrator' || admin.status === 'creator')) {
                reply += '\n' + (admin.user.is_bot ? '🤖' : '👤') + admin.user.username
            }
        })
        // Broadcaster info
        reply += '\n\n<i>Broadcaster info</i>'
        reply += '\nUsername: ' + env.BROADCASTER_LOGIN
        reply += '\nID: ' + env.BROADCASTER_ID

        // KV
        reply += '\n\n<i>KV namespaces</i>'
        reply += '\nOAUTH_STATES: ' + (!!env.OAUTH_STATES ? '✅' : '❌')
        reply += '\nOAUTH_TOKEN: ' + (!!env.OAUTH_TOKEN ? '✅' : '❌')

        // Hook info
        const webhookInfo = await bot.api.getWebhookInfo()
        reply += '\n\n<i>Webhook info</i>'
        reply += '\nWebhook URL: ' + url.origin
        reply += '\nAllowed updates: ' + webhookInfo.allowed_updates
        if (webhookInfo.last_error_message) {
            reply += '\nLast error: ' + webhookInfo.last_error_message
            reply += '\nLast error date (Epoch): ' + webhookInfo.last_error_date!
        }

        await bot.api.editMessageText(ctx.chat.id, msg.message_id, 'Sent in private.')
        await bot.api.sendMessage(requestedBy.user.id, reply, { parse_mode: 'HTML' })

    })
}