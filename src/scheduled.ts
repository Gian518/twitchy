import { checkUserSubscription, getUsers } from "./api"
import { translate } from "./middlewares/i18n"
import { getBot, getEnv } from "./store"
import { LocalesEnum } from "./types"

export const checkMemberships = async () => {
    const bot = getBot()
    if (!bot) {
        throw new Error("Bot not initialized")
    }

    const env = getEnv()
    if (!env.BROADCASTER_LOGIN || !env.GROUP_ID) {
        throw new Error("Broadcaster login or Group ID not set")
    }

    let invalidUsers: string[] = [] // Users with a sub that has expired from more than 3 days
    let recentlyExpiredUsers: string[] = [] // Users with a sub that has expired in the last 3 days

    const kvUsers = await env.OAUTH_TOKEN.list()
    const users = kvUsers.keys.map((kvItem) => kvItem.name)
    // For some unknown reason, if you use .forEach on .list array or even on a simple array,
    // the iteration is interrupted when doing a KV operation. We'll just use an old-school C-style for loop.
    for (const chatId of users) {
        if (!chatId) return

        try {
            const expiredDate = await env.RECENTLY_EXPIRED.get(chatId)
            if (expiredDate) {
                await env.RECENTLY_EXPIRED.delete(chatId)
            }
            const twitchResponse = await getUsers(chatId)
            console.log("Pushing:", chatId, twitchResponse)
            if (twitchResponse.length === 0) {
                console.log("No users found for", chatId)
                return
            }

            if (twitchResponse.length > 0) {
                const [twitchUser] = twitchResponse
                const sub = await checkUserSubscription(chatId, twitchUser.id)
                if (!sub) {
                    if (expiredDate) {
                        const now = new Date()
                        const expiration = new Date(expiredDate)
                        if (expiration > new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)) {
                            // If the sub has expired more than 3 days ago, mark it as invalid
                            invalidUsers.push(chatId)
                        } else {
                            // If the sub has expired in the last 3 days, mark it as recently expired
                            recentlyExpiredUsers.push(chatId)
                        }
                    } else {
                        // If the sub has never been checked, mark it as recently expired
                        recentlyExpiredUsers.push(chatId)
                        env.RECENTLY_EXPIRED.put(chatId, new Date().toISOString())
                    }

                }
            } else {
                // If the user is not found on Twitch, mark it as invalid
                invalidUsers.push(chatId)
            }
        } catch (error) {
            console.log("Error during checkMemberships:", error)
        }
    }

    const founder = (await bot.api.getChatAdministrators(env.GROUP_ID)).find(admin => admin.status == 'creator')
    const founderLanguage = founder?.user.language_code as LocalesEnum || 'en'

    // Create the report
    let reply = translate(founderLanguage || 'en', 'scheduled.todaytitle')

    // Ban users with expired or invalid subscriptions
    invalidUsers.forEach(async (chatId, index) => {
        const { user } = await bot.api.getChatMember(env.GROUP_ID, parseInt(chatId))
        await bot.api.unbanChatMember(env.GROUP_ID, parseInt(chatId))
        await env.OAUTH_TOKEN.delete(chatId)
        reply += (user.username ? ("@" + user.username) : user.first_name) + (index < invalidUsers.length - 1 ? ', ' : '')
    })
    if (invalidUsers.length == 0) {
        reply += translate(founderLanguage || 'en', 'scheduled.nobanstoday') + '\n\n'
    }
    reply += '\n\n'

    // Send warnings to users with recently expired subscriptions
    if (recentlyExpiredUsers.length > 0) {
        reply += translate(founderLanguage || 'en', 'scheduled.warningtitle')
    }
    recentlyExpiredUsers.forEach(async (chatId, index) => {
        const { user } = await bot.api.getChatMember(env.GROUP_ID, parseInt(chatId))
        reply += (user.username ? ("@" + user.username) : user.first_name) + (index < recentlyExpiredUsers.length - 1 ? ', ' : '')
    })

    await bot.api.sendMessage(
        env.GROUP_ID,
        reply,
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    (invalidUsers.length > 0 || recentlyExpiredUsers.length > 0) ?
                        [{
                            text: translate(founderLanguage || 'en', 'scheduled.renewsub'),
                            url: 'https://twitch.tv/' + env.BROADCASTER_LOGIN + '/subscribe'
                        }]
                        : []
                ]
            }
        }
    )

}