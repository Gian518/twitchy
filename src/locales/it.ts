export default {
    // Register commands
    "commands.start": "Avvia il bot e ottieni un link per autenticarti",
    "commands.me": "Ottieni informazioni sul tuo account Twitch",
    "commands.botstats": "Ottieni statistiche sul bot. ⚠️ Disponibile solo ai creatori del gruppo ⚠️",
    "commands.help": "Ottieni aiuto per il bot",

    // Start
    "start.alreadyauthorized": "Sei già autorizzato ad accedere al gruppo. Unisciti a noi con questo link di invito!\n<i>Nota che il link è valido per tre giorni e limitato a un accesso.</i>",
    "start.msg": "Ciao! Accedi con Twitch per entrare nel gruppo.\n<i>Il link scade in 5 minuti</i>",
    "start.login": "🟣 Login con Twitch",

    // Me
    "me.notprivate": "Ciao {name}, usa questo comando in una chat privata con me.",
    "me.loading": "Carico le tue informazioni...",
    "me.info": "<b>Le tue informazioni</b>:\n\n"
        + "Username Twitch: {username}\n"
        + "E-Mail: {email}\n"
        + "ID: {id}\n"
        + "Abbonato: {subscribed}\n"
        + "{subInfo}",
    "me.subscribed": "Sì ✅",
    "me.notsubscribed": "No ❌",
    "me.tier": "Livello: {tier}\n",
    "me.gifted": "È un regalo? {gifted}\n",
    "me.yes": "Sì\n",
    "me.no": "No\n",
    "me.subscribe": "💳 Abbonati ora!",
    "me.notlogged": "Sembra che tu non sia autenticato. Usa il comando /start per accedere con Twitch.",
    "me.error": "Si è verificato un rrore durante il caricamento delle tue informazioni.",

    // Help
    "help.msg": "<b>Aiuto</b>\n\n"
        + "/start - Accedi con Twitch\n"
        + "/me - Controlla le informazioni sul tuo account\n"
        + "/help - Mostra questo messaggio di aiuto\n\n"
        + "Quando effetti il login con Twitch, otterrai un link univoco per accedere al gruppo. Nota che il link è strettamente collegato ai tuoi account di Twitch e di Telegram e non funzionerà con altri utenti.\n"
        + "Puoi rimanere nel gruppo fino a quando avrai un abbonamento Twitch valido.",

    /** Auth **/
    "auth.success": "Ciao, {name}! Grazie per il tuo abbonamento! Ecco il tuo link di invito\n<i>Nota che il link è valido per tre giorni ed è limitato a un solo accesso.</i>",
    "auth.notsubscribed": "Ciao, {name}! Se vuoi accedere al gruppo esclusivo, abbonati al canale",
    "auth.join": "💬 Unisciti al Gruppo",
    "auth.subscribe": "💳 Abbonati ora!",

    /** Success page **/
    "success.title": "Fatto!",
    "success.message": "Se questa finestra non si chiude automaticamente, puoi chiuderla ora manualmente.",

    /** Error page **/
    "error.title": "Oh no!",
    "error.message": "Qualcosa è andato storto. Riprova più tardi.",

    /** Scheduled **/
    "scheduled.todaytitle": "🧨 <b>Lista dei ban di oggi:</b>\n",
    "scheduled.nobanstoday": "Nessuno da bannare oggi. Yay! 🍾",
    "scheduled.warningtitle": "⚠️ <b>Utenti con abbonamenti scaduti (tre giorni massimi per rinnovare):</b>\n",
    "scheduled.renewsub": "💳 Rinnova il tuo abbonamento ora!",
}