import { translate } from "./middlewares/i18n"
import locales from "./locales"
import { getBot } from "./store"
import { LocalesEnum } from "./types"

export const commands = async () => {
    const bot = getBot()
    if (!bot) {
        throw new Error("Bot not initialized")
    }

    (Object.keys(locales) as Array<LocalesEnum>).forEach(async (locale) => {
        const commands = [
            { command: "start", description: translate(locale, 'commands.start') },
            { command: "me", description: translate(locale, 'commands.me') },
            { command: "botstats", description: translate(locale, 'commands.botstats') },
            { command: "help", description: translate(locale, 'commands.help') }
        ]
        await bot.api.setMyCommands(commands, { language_code: locale })
    })
}