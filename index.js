import { ChatGPTUnofficialProxyAPI } from 'chatgpt';
import line from '@line/bot-sdk';
import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

const api = new ChatGPTUnofficialProxyAPI({
  accessToken: process.env.OPEN_AI_TOKEN,
});

const handleEvent = async (event) => {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const res = await api.sendMessage(event.message.text)
  const echo = { type: "text", text: res.text };
  return client.replyMessage(event.replyToken, echo);
};

app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.get('/hello', (req, res) => {
  res.send('Hello')
})

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
