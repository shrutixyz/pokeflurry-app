import "./createPost.js";

import { Devvit, useState } from "@devvit/public-api";

// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: "initialData";
      data: { username: string; currentCounter: number };
    }
  | {
      type: "setCounter";
      data: { newCounter: number };
    }
  | {
      type: "updateCounter";
      data: { currentCounter: number };
    }
  |  {
      type: "changeScreen"
      data: { screen: string };
    };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: "Webview Example",
  height: "tall",
  render: (context) => {
    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? "anon";
    });

    // Load latest counter from redis with `useAsync` hook
    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      return Number(redisCount ?? 0);
    });

    // Create a reactive state for web view visibility
    const [webviewVisible, setWebviewVisible] = useState(false);

    // When the web view invokes `window.parent.postMessage` this function is called
    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case "setCounter":
          await context.redis.set(
            `counter_${context.postId}`,
            msg.data.newCounter.toString()
          );
          context.ui.webView.postMessage("myWebView", {
            type: "updateCounter",
            data: {
              currentCounter: msg.data.newCounter,
            },
          });
          setCounter(msg.data.newCounter);
          break;
        case "changeScreen":
          if (msg.data.screen == "home") {
            setWebviewVisible(false);
          }

        case "initialData":
        case "updateCounter":
          break;

        default:
          throw new Error(`Unknown message type: ${msg satisfies never}`);
      }
    };

    // When the button is clicked, send initial data to web view and show it
    const onShowWebviewClick = () => {
      setWebviewVisible(true);
      context.ui.webView.postMessage("myWebView", {
        type: "initialData",
        data: {
          username: username,
          currentCounter: counter,
        },
      });
    };

    // Render the custom post type
    return (
      <vstack grow padding="small">
        <text>{`iswebview: ${webviewVisible}`}</text>
        <zstack
          width="100%"
          grow={!webviewVisible}
          height={!webviewVisible ? "100%" : "0%"}
          backgroundColor="#316BB3"
        >
          <image
            url="bg.png"
            resizeMode="cover"
            imageHeight="256px"
            imageWidth="256px"
            width="100%"
            height="100%"
          />
          <vstack
            width="100%"
            height="100%"
            alignment="center"
            gap="large"
            padding="medium"
          >
            <vstack width="100%" alignment="center" gap="none">
              <image
                url="logo.png"
                imageWidth="621px"
                imageHeight="167.5px"
                width="100%"
                resizeMode="fit"
              />
            </vstack>
            <button
              appearance="primary"
              size="large"
              minWidth="128px"
              icon="play-fill"
              onPress={() => {
                onShowWebviewClick();
              }}
            >
              {"play"}
            </button>
          </vstack>
        </zstack>
        <vstack grow={webviewVisible} height={webviewVisible ? "100%" : "0%"}>
          <vstack
            border="thick"
            borderColor="black"
            height={webviewVisible ? "100%" : "0%"}
          >
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height={webviewVisible ? "100%" : "0%"}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
