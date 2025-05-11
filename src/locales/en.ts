export default {
    // Register commands
    "commands.start": "Start the bot and get an authentication link",
    "commands.me": "Get information about your Twitch account",
    "commands.botstats": "Get stat info about the bot. ⚠️ Available for group creators only ⚠️",
    "commands.help": "Get help with the bot",

    /** Commands **/
    // Start
    "start.alreadyauthorized": "You are already authorized to access the group. Join us with this invitation link!\n<i>Note that the link is valid for three days and limited to one access.</i>",
    "start.msg": "Hi! Login with Twitch to access the group.\n<i>The link expires in 5 minutes</i>",
    "start.login": "🟣 Login with Twitch",

    // Me
    "me.notprivate": "Hi {name}, please use this command in a private chat with me.",
    "me.loading": "Loading your info...",
    "me.info": "<b>Your info</b>:\n\n"
        + "Twitch username: {username}\n"
        + "E-Mail: {email}\n"
        + "ID: {id}\n"
        + "Subscribed: {subscribed}\n"
        + "{subInfo}",
    "me.subscribed": "Yes ✅",
    "me.notsubscribed": "No ❌",
    "me.tier": "Tier: {tier}\n",
    "me.gifted": "Is it a gift? {gifted}\n",
    "me.yes": "Yes\n",
    "me.no": "No\n",
    "me.subscribe": "💳 Subscribe now!",
    "me.notlogged": "It seems that you are not logged in. Please, use the /start command to login with Twitch.",
    "me.error": "Error while loading your info.",

    // Help
    "help.msg": "<b>Help</b>\n\n"
        + "/start - Login with Twitch\n"
        + "/me - Check your account info\n"
        + "/help - Show this help message\n\n"
        + "When you login with Twitch, you will obtain a unique link to access the group. Note that the link is strictly linked to your Twitch and Telegram accounts and doesn't work for other users.\n"
        + "You can stay in the group until you have a valid Twitch subscription.",

    /** Auth **/
    "auth.success": "Hi, {name}! Thank you for your sub! Here's your invitation link\n<i>Note that the link is valid for three days and limited to one access.</i>",
    "auth.notsubscribed": "Hi, {name}! If you want to access the exclusive group, please subscribe to the channel",
    "auth.join": "💬 Join the Group",
    "auth.subscribe": "💳 Subscribe now!",

    /** Success page **/
    "success.title": "Success!",
    "success.message": "If this window doesn't close automatically, you can manually close it now.",

    /** Error page **/
    "error.title": "Uh oh!",
    "error.message": "Something went wrong. Please try again later.",

    /** Scheduled **/
    "scheduled.todaytitle": "🧨 <b>Today's ban list:</b>\n",
    "scheduled.nobanstoday": "No one to ban today. Hurray! 🍾",
    "scheduled.warningtitle": "⚠️ <b>Users with expired subscriptions (three days maximum left to renew):</b>\n",
    "scheduled.renewsub": "💳 Renew your subscription now!",
}