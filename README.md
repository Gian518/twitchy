# Twitchy - A Telegram Bot for Twitch Subscriptions Management

Welcome to the Twitchy repository! This project is a Telegram bot designed to manage subscriptions for private Telegram groups. Twitchy can log the user in via Twitch and check the subscription to a specific Twitch channel.

## ⚠️ Actively under development ⚠️

Even if the bot has some functionalities, it's still under development and is not currently ready for a production environment. I suggest you to wait a bit more, but you can still clone the repo and play with it.

## Features

- **Twitch OAuth authorization**: Uses [Authorization code grant flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow) to make login and manages automatically token validation and refresh process.
- **Subscription management**: Checks subscription when the user joins the group and periodically (every day) to verify renewals.
- **Twitch API Integration**: Uses Twitch's OAuth and user APIs to manage subscriptions and fetch user information.
- **Cloudflare Workers**: The project is built with Workers, a powerful platform by Cloudflare: serverless, easily to deploy and - _most importantly_ - **Free!**

## Getting started

### Prerequisites

- Node 16.17.0+
- Cloudflare account
- Twitch Application with Client ID and Secret
- Telegram bot token

### Installation

1. Clone the repo
2. Install dependencies:

```shell
npm i
```

3. Set up environment variables:

    - For local development: rename or copy and rename `.dev.vars-example` to `.dev.vars` and put your values inside.
    - For deployment: read about Secrets on the official [Cloudflare documentation](https://developers.cloudflare.com/workers/configuration/secrets/).

### Usage

1. Start the development server with:

```shell
npx wrangler dev
```

2. Deploy your app with:

```shell
npx wrangler deploy
```

## Configuration

- **Twitch API**: Create a Twitch Application on [Twitch Developer](https://dev.twitch.tv). It's free of charge and you don't need to be an organization to create it. After creating the application, take note of the Client ID and create a new Client Secret.
- **Telegram bot**: Contact [@BotFather](https://telegram.me/BotFather) on Telegram. Create a new bot with the /newbot command and follow the instructions. Take note of the Token.
- **Cloudflare Worker**: Sign up for a free [Cloudflare account](https://dash.cloudflare.com/sign-up). Follow the instructions on the official documentation to create your Worker by using [Wrangler CLI](https://developers.cloudflare.com/workers/get-started/guide/) or by using [Cloudflare Dashboard](https://developers.cloudflare.com/workers/get-started/dashboard/).

## Code structure

The project is organized into multiple files, each serving a specific purpose:

- **src/index.ts**: Entry point of the application where the Worker logic resides.
- **src/api.ts**: Contains functions for interacting with Twitch's API.
- **src/auth.ts**: Handles user first authentication and group invitations.
- **src/KVmanager.ts**: Manages key-value storage operations.
- **src/store.ts**: Provides utility functions to get environment variables and other configurations.

## Todo list

- [ ] Cron trigger for daily subscription check
- [ ] ~~i18n integration with [Internationalization plugin](https://grammy.dev/plugins/i18n)~~
- [x] i18n custom middleware
- [ ] /logout command
- [ ] Document environment variables
- [ ] Create a [Deploy with Workers button](https://developers.cloudflare.com/workers/tutorials/deploy-button/) for GitHub
- [ ] A mini website for the _average user_ to deploy the Worker without any help by a developer

## Credits

- Entirely written in [TypeScript](https://www.typescriptlang.org)
- Telegram bot integration by [grammY](https://grammy.dev/)
- Chat Members Plugin by [chat-members](https://github.com/grammyjs/chat-members)
- Cloudflare Workers by [Cloudflare](https://developers.cloudflare.com/workers/)

## Special thanks

- [@kowalsk7cc](https://github.com/kowalski7cc) for suggesting me to try Cloudflare Workers for this work.
- [@frederic.henri](https://medium.com/@frederic.henri) for [this guide](https://medium.com/@frederic.henri/authenticate-your-users-on-3rd-party-services-using-oauth-within-your-telegram-bot-b0003764e83e) and [this guide](https://medium.com/@frederic.henri/conversation-telegram-bot-with-grammy-deployed-on-cloudflare-8f691515c365).

![Made in Europe logo](.github/images/eu.svg)

## License

[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
