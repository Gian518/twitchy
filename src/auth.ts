import { checkUserSubscription, getUsers, oauthLogin } from "./api"
import { getBot, getEnv, getRequest } from "./store"
import { saveCredentials } from "./KVmanager"
import success from "./pages/success"
import { translate } from "./middlewares/i18n"
import { LocalesEnum } from "./types"

/**
 * Authenticate the user with Twitch OAuth and save tokens to KV
 */
export const auth = async (): Promise<Response> => {
    const bot = getBot()
    const request = getRequest()
    const env = getEnv()

    // Fetch origin URL and parameters
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code || !state) {
        return new Response('Missing code or state', { status: 400 })
    }

    // Get chat ID and message ID from KV
    const mergedState = await env.OAUTH_STATES.get(state) as string
    const [chatId, msgId] = mergedState.split(' ')
    if (!chatId) {
        return new Response('Invalid or expired chat', { status: 400 })
    }

    // Delete the state from KV as it's no longer needed
    await env.OAUTH_STATES.delete(state)

    // Exchange code for tokens
    const tokenData = await oauthLogin({ grantType: 'authorization_code', code })

    // Get user info
    const userResponse = await getUsers(chatId, undefined, tokenData.access_token)
    const [user] = userResponse

    // Get user subscription
    const subscription = await checkUserSubscription(chatId, user.id, tokenData.access_token)

    try {
        // Get startup message from KV to delete it
        if (msgId) {
            await bot.api.deleteMessage(chatId, parseInt(msgId))
        }
    } catch (error) {
        // Silent fail if the message is already deleted or never existed
        console.log("Error deleting a startup message:", error)
    }

    const tgUser = await bot.api.getChatMember(env.GROUP_ID, parseInt(chatId))
    const userLanguage = tgUser.user.language_code as LocalesEnum || 'en'
    if (subscription) {
        // Save user credentials in KV
        await saveCredentials(tokenData, chatId)
        // Generate an invite link, limit to one user and valid for three days
        const link = await bot.api.createChatInviteLink(env.GROUP_ID, { expire_date: (Date.now() / 1000) + 259200, member_limit: 1 })
        await bot.api.sendMessage(chatId, translate(userLanguage, 'auth.success', { name: user.display_name }), {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[{ text: translate(userLanguage, 'auth.join'), url: link.invite_link }]],
            }
        })
    } else {
        // The user is not subscribed, send a message to invite them to subscribe
        await bot.api.sendMessage(chatId, translate(userLanguage, 'auth.notsubscribed', { name: user.display_name }), {
            reply_markup: {
                inline_keyboard: [[{ text: translate(userLanguage, 'auth.subscribe'), url: 'https://twitch.tv/' + env.BROADCASTER_LOGIN + '/subscribe' }]]
            }
        })
    }
    return new Response(success(userLanguage), { status: 200, headers: { "Content-Type": "text/html;charset=UTF-8" } })

}