"use server";

import axios from "axios";

const TELEGRAM_API_BASE_URL = "https://api.telegram.org";

type SendTelegramMessageParams = {
  botToken: string;
  chatId: string | number;
  message: string;
  /** SOCKS5-прокси в формате URL, например `socks5://user:pass@host:1080`. */
  proxyUrl?: string;
};

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
  };
  description?: string;
}

/**
 * Отправляет текстовое сообщение в Telegram через Bot API.
 * При переданном `proxyUrl` запрос идёт через SOCKS5-прокси.
 */
export async function sendTelegramMessage({ botToken, chatId, message, proxyUrl }: SendTelegramMessageParams): Promise<number> {
  const url = `${TELEGRAM_API_BASE_URL}/bot${botToken}/sendMessage`;

  const axiosConfig = proxyUrl
    ? {
        proxy: {
          protocol: "http",
          host: new URL(proxyUrl).hostname,
          port: parseInt(new URL(proxyUrl).port),
          auth: {
            username: new URL(proxyUrl).username,
            password: new URL(proxyUrl).password,
          },
        },
      }
    : {};

  try {
    const response = await axios.post<TelegramResponse>(
      url,
      {
        chat_id: chatId,
        text: message,
      },
      axiosConfig,
    );

    if (response.data.ok && response.data.result?.message_id !== undefined) {
      return response.data.result.message_id;
    } else {
      throw new Error(response.data.description ?? `Telegram API error: ${response.status}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Axios error: ${error.message}`);
    }
    throw error;
  }
}
