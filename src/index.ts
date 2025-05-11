/**
 *  .--..--..--..--..--..--..--..--..--..--..--..--..--. 
 * / .. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \
 * \ \/\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ \/ /
 *  \/ /`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'\/ / 
 *  / /\                                            / /\ 
 * / /\ \   ______         _  __        __         / /\ \
 * \ \/ /  /_  __/_    __ (_)/ /_ ____ / /  __ __  \ \/ /
 *  \/ /    / /  | |/|/ // // __// __// _ \/ // /   \/ / 
 *  / /\   /_/   |__,__//_/ \__/ \__//_//_/\_, /    / /\ 
 * / /\ \                                 /___/    / /\ \
 * \ \/ /                                          \ \/ /
 *  \/ /                                            \/ / 
 *  / /\.--..--..--..--..--..--..--..--..--..--..--./ /\ 
 * / /\ \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \/\ \
 * \ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `' /
 *  `--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--' 
 * 
 * Hi! Welcome to Twitchy! This bot helps you manage your Twitch subscribers on your private Telegram group.
 * Please, refer to the documentation for more details on how to use this bot.
 * 
 * This file is the entrypoint of the entire application. It sets up the bot and starts it.
 * If you're not familiar with Cloudflare Workers, you can read more about it on the official website:
 * - https://developers.cloudflare.com/workers/
 * Need help with grammY framework? Check out the docs:
 * - https://grammy.dev/
 * 
 */

import { webhookCallback } from "grammy"
import { execute, init } from "./bot"
import { getBot, saveEnv, saveRequest } from "./store"
import { manageGroup } from "./groups"
import { router } from "./router"
import errorPage from "./pages/error"
import { checkMemberships } from "./scheduled"


export default {
	async fetch(request, env, ctx): Promise<Response> {
		try {
			saveEnv(env)
			saveRequest(request)

			await execute()
			await manageGroup()
			const response = await router()

			const url = new URL(request.url)
			if (request.url == url.origin + "/bot") {
				return webhookCallback(getBot(), "cloudflare-mod")(request)
			} else {
				return response
			}
		} catch (error) {
			console.log("Fetch: Main Error:", error)
			return new Response(errorPage('en'), { status: 500, headers: { "Content-Type": "text/html;charset=UTF-8" } })
		}
	},

	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		if (controller.cron === "0 0 * * *") {
			console.log("Running scheduled task")
			try {
				saveEnv(env)
				await init()

				await checkMemberships()
			} catch (error) {
				console.log("Scheduled: Main Error:", error)
			}
		}
	}
} satisfies ExportedHandler<Env>