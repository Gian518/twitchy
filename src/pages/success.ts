import header from "./header"
import { LocalesEnum } from "../types"
import { translate } from "../middlewares/i18n"

export default (lang: LocalesEnum) => {
    return `
        <!DOCTYPE html>
        <head>
            ${header}
            <title>${translate(lang, "success.title")}</title>

            <script>
                window.onload = function () {
                    window.close()
                }
            </script>
        </head>

        <body>
            <div class="position-absolute top-0 start-0 p-2 bounce"><i class="bi bi-arrow-up" style="font-size: 2rem;"></i></div>
            <div class="container w-100 h-100 d-flex flex-column justify-content-center align-items-center mt-5">
                <i class="bi bi-cloud-check text-success" style="font-size: 6rem"></i>
                <h1 class="text-center">${translate(lang, "success.title")}</h1>
                <p class="mt-2 text-center">${translate(lang, "success.message")}</p>
            </div>
        </body>

        </html>
    `
}