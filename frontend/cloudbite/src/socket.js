import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { WS_BASE_URL } from "./config/apiBase";

let stompClient = null;
let subscriptionQueue = [];
const activeSubs = new Map();

const safeParse = (body) => {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

const subscribeToTopic = (topicId, onMessage) => {
  const destination = `/topic/orders/${topicId}`;

  if (activeSubs.has(destination)) {
    activeSubs.get(destination).unsubscribe();
    activeSubs.delete(destination);
  }

  const sub = stompClient.subscribe(destination, (message) => {
    const data = safeParse(message.body);
    if (data) onMessage(data);
  });

  activeSubs.set(destination, sub);
};

export const connectOrderSocket = (topicId, onMessage) => {
  if (stompClient?.connected) {
    subscribeToTopic(topicId, onMessage);
    return;
  }

  if (stompClient?.active) {
    subscriptionQueue.push({ topicId, onMessage });
    return;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    onConnect: () => {
      subscribeToTopic(topicId, onMessage);

      while (subscriptionQueue.length > 0) {
        const { topicId: queuedTopicId, onMessage: queuedHandler } = subscriptionQueue.shift();
        subscribeToTopic(queuedTopicId, queuedHandler);
      }
    },

    onStompError: (frame) => {
      console.error("STOMP error:", frame.headers?.message);
    },

    onWebSocketClose: () => {
      console.warn("WebSocket connection closed.");
    },
  });

  stompClient.activate();
};

export const disconnectSocket = () => {
  activeSubs.forEach((sub) => sub.unsubscribe());
  activeSubs.clear();
  subscriptionQueue = [];

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
