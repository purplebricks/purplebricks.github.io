---
layout: news_item
title: 'Hackathon - Writing a property search chat bot in a day'
date: 2018-06-14 09:00:00
author: carlhartshorn
category: programming
tags: [hackathon, azure, chat bot, azure bot service, cognitive services, luis, ai]
showExcerpt: true
screenText: "<p>&#62;Property</p><p>&#62;Search</p><p>&#62;Chat Bot</p>"
---

We held our first hackathon in February!
This post presents one submission; a property search chat bot.<!--more-->

<br>
<br>

## The Hackathon
Innovation was the theme of our first hackathon. Teams had two weeks to formulate their idea and research their approach. One of the challenging aspects of the hackathon was its duration - twelve hours.

## Property Search Chat Bot
The team I was part of decided to try and produce a chat bot, with the aim of interfacing with our property search API. We'd settled on using Azure Bot Service, and the Microsoft Cognitive Service LUIS for natural language understanding.

### Web App Bot
Our first step was to create the Web App Bot using Azure Bot Service.

![Creating a new Web App Bot in Azure](/assets/2018-06/create-web-app-bot.png)

For this project, we knew we wanted to use LUIS for natural language understanding, and Azure does present a "Language understanding" bot template. One of the first stumbling blocks we hit was in attempting to create a bot with this template, and the permissions required to do so.

To work around this, we decided to use the Basic C# template to get started.

Once the Web App Bot had been created, we could immediately interact with it using the "Test in Web Chat" functionality in the Azure portal.

Azure Bot Service has the concept of Channels. Channels are ways in which the user can interact with the bot, some examples of which are Skype, Telegram and Slack. For this project, we used the Web Chat channel, which allows for an iframe containing the chat window to be placed in to a web page.

![Configuring the Web Chat channel in Azure](/assets/2018-06/web-chat-channel.png)

### LUIS
LUIS, or Language Understanding Intelligent Service is one of the cognitive services provided by Microsoft which provides natural language understanding of both text and speech.

In LUIS, there is the concept of Intents, Entities and Utterances. An Utterance is a stream of natural language provided by the user, for example "how warm will it be today in Solihull". The Intent behind this utterance may be `CheckTemperature`. An Entity can be described as a piece of information we want to pick out of an utterance. In this example, `Place` could be an entity, and in the utterance this would match to Solihull.

Once the Intents and any Entities have been defined, LUIS is then trained with example utterances, and can be tested with new utterances to check that the correct intent is identified.

For our application, we developed a single intent: `Search`. We began with simple utterances and commenced by iteratively training the model and building upon it with new entities. Finally, we landed on three entities: `Place`, `PropertyType` and `SearchType`.

![Training utterances for the Search intent in LUIS](/assets/2018-06/luis-search-intent.png)

### Bringing it Together
With the Web App Bot set up and the LUIS model trained, the next step was to bring it all together. In the Bot Management menu for the Web App Bot in Azure is a "Build" item, in which is the option to download the source code for the bot. As the Basic bot template creates a working bot, this allowed us to download a functioning application and get started very quickly.

The `Microsoft.Bot.Builder` package contains a `Dialogs` namespace, in which exist a number of classes to work with LUIS (as this appears to be a common use case for bots). We created a `LuisDialog`, which contained methods decorated with `LuisIntent` attributes:
```
[LuisIntent("Search")]
public async Task SearchIntent(IDialogContext context, LuisResult result)
```

<br>

In this method, (which is hit when the bot receives a message during the LuisDialog, which matches the Search intent) the `LuisResult` gives us access to the captured entities. Leveraging this, we were able to use these entities' values to build a search query, and direct this at our existing Property Search API. For example, the utterance "I'm looking to buy a flat in Solihull" would yield entities `Place = Solihull`, `PropertyType = Flat` and `SearchType = Buy`, whose values could then be used as filters in the Property Search API call.

To surface the results to the user in an appealing and interactive manner, we pulled in the [Microsoft.AdaptiveCards](https://github.com/Microsoft/AdaptiveCards) NuGet package (v0.5.1 at the time of the hackathon). The AdaptiveCards project aims to create a framework for card content that is consistent, and a single bot application targeting different channels is the perfect use case.

Finally, we created a React component for a modal popup in which to surface the chat window, and injected in to it the aforementioned iframe.

## The Result
As 9PM loomed, we'd consumed a large amount of coffee, and landed on a working proof of concept chat bot, pointing at our UK Property Search API, and had added support for speech interaction using the [Browser-provided speech](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-webchat-speech?view=azure-bot-service-3.0#browser-provided-speech) functionality included in the [Microsoft Bot Framework Web Chat Control](https://github.com/Microsoft/BotFramework-WebChat).

![The resulting chat bot](/assets/2018-06/result.png)
