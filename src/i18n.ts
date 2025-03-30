import { Context, MiddlewareFn, NextFunction } from "grammy"
import { BotContext, I18nFlavor, LocalesEnum, LocalesKey } from "./types"
import locales from "./locales"

/**
 * i18n middleware for grammY
 * The official i18n plugin by grammY cannot be used, since it requires a real Node environment and cannot be used in Cloudflare Workers.
 * This middleware provides a simple way to translate messages using a dictionary stored in memory.
 * It also supports dynamic variables in the translations, which are replaced with the values provided in the `variables` object.
 * 
 * Load your locales in the `locales` directory using this structure:
 * .
 * ├── index.ts
 * └── locales/
 *     ├── index.ts
 *     ├── it.ts
 *     ├── en.ts
 *     ├── fr.ts
 *     └── de.ts
 * Note that the locales are loaded dynamically from the `locales` directory and merged into a single object inside the `locales/index.ts` file.
 * This is useful to generate dynamic types for the translations and to avoid typos in the translation keys.
 * Note also that we use .ts files instead of .ftl ones for the same reason that we don't use the official plugin:
 * Cloudflare Workers don't run a real Node environment, so we cannot load files using the `fs` module.
 * 
 * @param {Object} options - The options for the i18n middleware
 * @param {LocalesEnum} options.defaultLocale - The default locale to use if no locale is specified in the Telegram message
 */
export default ({ defaultLocale }: { defaultLocale: LocalesEnum }): MiddlewareFn<BotContext> => {



    return async (ctx: Context & I18nFlavor, next: NextFunction): Promise<void> => {
        /**
         *  Get the translation for the locale passed by Telegram
         * @param key The key of the translation to get
         * @param variables The variables to replace in the translation
         * @returns The translated string
         */
        ctx.t = (key, variables) => {
            return translate(ctx.from?.language_code as LocalesEnum || defaultLocale, key, variables)
        }
        await next()
    }
}

/**
 * Get the translation for the given locale and key
 * @param locale The locale to use. Defaults to the bot's default locale if not provided
 * @param key The key of the translation to get
 * @param variables The variables to replace in the translation
 * @returns The translated string
 */
export const translate = (locale: LocalesEnum, key: LocalesKey, variables?: Record<string, any>) => {
    const translated = locales[locale][key]
    if (variables) {
        return Object.keys(variables).reduce((acc, cur) => {
            return acc.replace(`{${cur}}`, variables[cur])
        }, translated)
    }
    return translated
}