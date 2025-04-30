import { auth } from "./auth"
import { getEnv, getRequest } from "./store"

export const router = async () => {
    const request = getRequest()
    const env = getEnv()

    // Handle OAuth callback from Twitch
    if (request.url.includes('/api/auth/callback/twitch')) {
        const response = await auth()
        return response
    }

    return Response.redirect('https://twitch.tv/' + env.BROADCASTER_LOGIN, 302)
}