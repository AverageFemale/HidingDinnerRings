import { StaticAuthProvider, RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { ApiClient } from "@twurple/api";
import * as dotenv from "dotenv";
dotenv.config();
import * as fs from 'fs';
async function main() {
  console.log("Started")
  const accessToken = process.env["accessToken"];
  const clientId = process.env["id"]
  const authProvider = new StaticAuthProvider(clientId, accessToken);
  //const authProvider = new RefreshingAuthProvider({ clientId,clientSecret})
  //await authProvider.addUserForToken({accessToken,refreshToken}, ['chat']);
  const channels = ["hdr_8wastaken"];
  let streamers = new Map();
  streamers.set("hdr_8wastaken", true);
  const chatClient = new ChatClient( {
    authProvider,
    channels: channels,
    isAlwaysMod: true,
  });
  const apiClient = new ApiClient({authProvider});
  chatClient.onConnect(() => {
    console.log(`Connected to: ${channels.join(", ")}.`);
    channels.forEach((e) => {
      chatClient.say(`#${e}`, "Back online. [Automated Message]")
    })
  });
  const bot = await apiClient.users.getUserByName("AverageFemale_")
  
  
  chatClient.onMessage(async (channel, user, text, msg) => {
    const bool = streamers.get(channel);
    const args = text.split(" ").slice(1)
    if (
      user.toLowerCase() == "averagefemale_" ||
      channels.includes(user.toLowerCase())
    ) {
      if (text.toLowerCase() == "!toggle on") {
        if (bool) return chatClient.say(channel, "Already on. [Automated Response]", {replyTo: msg});
        streamers.set(channel, true);
        return chatClient.say(channel, "Turned on. [Automated Response]", {replyTo: msg,});
      } else if (text.toLowerCase() == "!toggle off") {
        if (!bool) return chatClient.say(channel, "Already off. [Automated Response]", {replyTo: msg,});
        streamers.set(channel, false);
        return chatClient.say(channel, "Turned off. [Automated Response]", {replyTo: msg,});
      }
      if (text.toLowerCase().startsWith("!loop")) {
        const amount = parseInt(args.shift());
        const message = args.filter((v) => v != amount.toString());
        for (var i = 0; i < amount; i++) {
          chatClient.say(channel, message.join(" "));
        }
      }
      if (text.toLowerCase().startsWith("!eval")) {
        const random = Math.random();
        const streamer = await apiClient.users.getUserByName(channel);
        try {
          const results = eval(args.join(" "));
          console.log(results);
          chatClient.say(channel, `Success! ${random > 0.1 ? "Kappa": "KappaPride"}`);
        } catch (e) {
          console.error(e);
          chatClient.say(channel, `Error! ${random > 0.1 ? "FallCry": "WutFace"}`);
        }
      }
    }
    if (!bool) return;
    if (
      /[a-zA-Z]+[_][0-9]+|[aA-zZ]+[0-9]+|[a-zA-Z]+[_]+[aA-zZ]+[0-9]+|[aA-zZ]+[_]+[aA-zZ]+/g.test(text.toLowerCase()) &&
      !/je_remy|hdr_|haz3|cheer[0-9]+|@[aA-zZ]+|![aA-zZ]+/g.test(text.toLowerCase()) &&
      !msg.isCheer &&
      !msg.isReply &&
      !msg.userInfo.isMod &&
      !msg.userInfo.isBroadcaster &&
      !/redeem|sub/g.test(text.toLowerCase()) &&
      !["streamelements","nightbot"].includes(user) &&
      msg.emoteOffsets.size == 0
    ) {
      const message = `Oh hello! I see your username and I just wanted to inform you on how the point system works. Basically, you get 10 points every 10 minutes, with these points you can redeem robux. Every 10 points is basically 1 robux. When you're ready to redeem all you have to do is show HDR your points by doing !points and then he'll ask you for your username and donate to you, after that he'll remove the points. [Automated Response]`;
      chatClient.say(channel, message, {replyTo: msg});
    }
  });
  await chatClient.connect();
}

main();
