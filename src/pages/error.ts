import { translate } from "../middlewares/i18n"
import { LocalesEnum } from "../types"
import header from "./header"

export default (lang: LocalesEnum) => {
    return `
        <head>
            ${header}
            <title>${translate(lang, "error.title")}</title>
        </head>

        <body>
            <div class="container w-100 h-100 d-flex flex-column justify-content-center align-items-center mt-5">
                <i class="bi bi-bandaid text-danger" style="font-size: 6rem"></i>
                <h1 class="text-center">${translate(lang, "error.title")}</h1>
                <p class="mt-2 text-center">${translate(lang, "error.message")}</p>
            </div>
        </body>

        </html>
    `
}