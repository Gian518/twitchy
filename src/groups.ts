import { chatMemberFilter } from "@grammyjs/chat-members"
import { checkUserSubscription, getUsers } from "./api"
import { getBot } from "./store"

/**
 * Manage the group settings and handle user join events.
 */
export const manageGroup = async () => {
    const bot = getBot()

    /* Group settings */
    const groups = bot.chatType(['group', 'supergroup'])

    /* Handle user join in group. Admins are not checked */
    groups.filter(chatMemberFilter('out', 'regular'), async (ctx) => {
        const chatId = ctx.chatId
        const userId = ctx.chatMember.new_chat_member.user.id
        if (!chatId || !userId) return

        const user = await getUsers(userId.toString())
        if (user.length === 0) {
            await bot.api.unbanChatMember(chatId, userId)
            return
        }
        const subscription = await checkUserSubscription(userId.toString(), user[0].id)
        if (!subscription) {
            await bot.api.unbanChatMember(chatId, userId)
        }
    })
}