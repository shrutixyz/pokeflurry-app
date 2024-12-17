import { Devvit, useState } from "@devvit/public-api";

type WebViewMessage =
| {
  type: "initialData";
  data: { username: string; currentCounter: number };
}
  | { type: "setCounter"; data: { newCounter: number } }
  | { type: "changeScreen"; data: { screen: string } }
  | { type: "updateScore"; data: { username: string; score: number } };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: "Webview Example",
  height: "tall",
  render: (context) => {
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? "anon";
    });

    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      return Number(redisCount ?? 0);
    });

    const [currentScreen, setCurrentScreen] = useState<"home" | "game" | "leaderboard">("home");
    const [leaderboard, setLeaderboard] = useState<{ username: string; score: number }[]>([]);

    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case "setCounter":
          await context.redis.set(`counter_${context.postId}`, msg.data.newCounter.toString());
          setCounter(msg.data.newCounter);
          break;

        case "changeScreen":
          setCurrentScreen(msg.data.screen as "home" | "game" | "leaderboard");
          if (msg.data.screen === "leaderboard") {
            fetchLeaderboard();
          }
          break;

        case "updateScore":
          await saveOrUpdateScore(msg.data.username, msg.data.score);
          break;

        case "initialData":
          break;

        default:
          throw new Error(`Unknown message type: ${msg satisfies never}`);
      }
    };

    const saveOrUpdateScore = async (username: string, score: number): Promise<void> => {
      const currentScore = await context.redis.hGet("scores", username);
      const newScore = currentScore ? parseInt(currentScore) + score : score;
      await context.redis.hSet("scores", { [username]: newScore.toString() });
    };

    const fetchLeaderboard = async () => {
      const scores = await context.redis.hGetAll("scores");
      const sortedScores = Object.entries(scores || {})
        .map(([user, score]) => ({ username: user, score: parseInt(score) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      setLeaderboard(sortedScores);
    };

    const renderHomeScreen = () => (
      <zstack
          width="100%"
          backgroundColor="#316BB3"
          height="100%"
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
                context.ui.webView.postMessage("myWebView", {
                  type: "initialData",
                  data: {
                    username: username,
                    currentCounter: counter,
                  },
                });
                setCurrentScreen('game')
              }}
            >
              {"play"}
            </button>
          </vstack>
        </zstack>
        
    );

    const renderGameScreen = () => (
      <vstack
      border="thick"
      borderColor="black"
      height="100%"
    >
      <webview
        id="myWebView"
        url="page.html"
        onMessage={(msg) => onMessage(msg as WebViewMessage)}
        grow
      />
    </vstack>
    );

    const renderLeaderboardScreen = () => (
      <vstack gap="medium" alignment="center" padding="medium">
        <text size="large" weight="bold">Top 3 Players</text>
        {leaderboard.map((entry, index) => (
          <hstack gap="small">
            <text>{`${index + 1}. ${entry.username}`}</text>
            <text weight="bold">{entry.score}</text>
          </hstack>
        ))}
        <button
          appearance="secondary"
          onPress={() => setCurrentScreen("home")}
        >
          Back to Home
        </button>
      </vstack>
    );

    return (
      <vstack grow>
        {currentScreen === "home" && renderHomeScreen()}
        {currentScreen === "game" && renderGameScreen()}
        {currentScreen === "leaderboard" && renderLeaderboardScreen()}
      </vstack>
    );
  },
});

export default Devvit;
