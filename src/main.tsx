import { Devvit, useState, useAsync } from "@devvit/public-api";

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
    const { data: leaderboardData, loading, error } = useAsync<{ username: string; score: number }[]>(async () => {
      const scores = await context.redis.hGetAll("scores");
      const sortedScores = Object.entries(scores || {})
        .map(([user, score]) => ({ username: user, score: parseInt(score) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      return sortedScores;
    });  // Fetch leaderboard only once when the component mounts

    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case "setCounter":
          await context.redis.set(`counter_${context.postId}`, msg.data.newCounter.toString());
          setCounter(msg.data.newCounter);
          break;

        case "changeScreen":
          setCurrentScreen(msg.data.screen as "home" | "game" | "leaderboard");
          if (msg.data.screen === "leaderboard") {
            console.log("here");
            // Trigger leaderboard data fetch when the screen is changed
            leaderboardData && setLeaderboard(leaderboardData);
          }
          break;

        case "updateScore":
          await saveOrUpdateScore(msg.data.username, msg.data.score);
          break;

        case "initialData":
          break;

        default:
          throw new Error(`Unknown message type: ${msg}`);
      }
    };

    const saveOrUpdateScore = async (username: string, score: number): Promise<void> => {
      const currentScore = await context.redis.hGet("scores", username);
      // const newScore = currentScore ? parseInt(currentScore) + score : score;
      let newScore = score;
      if(currentScore){
        if(parseInt(currentScore)>newScore){
          newScore = parseInt(currentScore)
        }
      }
      // const newScore = currentScore>score?curr;
      console.log(newScore, username)
      await context.redis.hSet("scores", { [username]: newScore.toString() });
    };

    const renderHomeScreen = () => (
      <zstack width="100%" backgroundColor="#316BB3" height="100%">
        <image
          url="bg.png"
          resizeMode="cover"
          imageHeight="256px"
          imageWidth="256px"
          width="100%"
          height="100%"
        />
        <vstack width="100%" height="100%" alignment="center middle" gap="large" padding="medium">
          <vstack width="100%" alignment="center" gap="none">
            <image url="logo.png" imageWidth="621px" imageHeight="167.5px" width="100%" resizeMode="fit" />
          </vstack>
          <hstack width="100%" alignment="center middle">
          <button
            appearance="success"
            size="large"
            minWidth="128px"
            icon="play-fill"
            onPress={() => {
              context.ui.webView.postMessage("myWebView", {
                type: "initialData",
                data: { username: username, currentCounter: counter },
              });
              setCurrentScreen('game');
            }}
          >
            {"Play   Game"}
            
          </button>
          <spacer size="large"></spacer>
          <button
            appearance="success"
            size="large"
            minWidth="128px"
            icon="dashboard"
            onPress={() => {
              setCurrentScreen('leaderboard');
            }}
          >
            {"Leaderboard"}
          </button>
          </hstack>
        </vstack>
      </zstack>
    );

    const renderGameScreen = () => (
      <vstack border="thick" borderColor="black" height="100%">
        <webview
          id="myWebView"
          url="page.html"
          onMessage={(msg) => onMessage(msg as WebViewMessage)}
          grow
        />
      </vstack>
    );

    const rankComponents = (
      username: string,
      correctAnswers: number,
      index: number
    ) => {
      return (
        <vstack width="100%">
          <spacer size="small"></spacer>
          <hstack
            padding="small"
            backgroundColor="#153864"
            cornerRadius="small"
            width="100%"
            height="40px"
            alignment="center middle"
          >
            <spacer size="small"></spacer>
            <hstack width="30%">
              <text size="medium">{index}</text>
              <spacer size="small"></spacer>
              <zstack cornerRadius="full" alignment="center middle">
                <image
                  url="reddit-bg.png"
                  resizeMode="cover"
                  imageHeight="24px"
                  imageWidth="24px"
                  width="24px"
                  height="24px"
                />
              </zstack>
              <spacer size="small"></spacer>
              <text size="medium" alignment="center middle">
                {username}
              </text>
            </hstack>
            <spacer size="large"></spacer>
            <hstack width="50%">
              <vstack alignment="center middle">
                <text size="large" color="#FFCB05" weight="bold">
                  {correctAnswers}
                </text>
                <text size="xsmall">Pokemons collected</text>
              </vstack>
            </hstack>
            <spacer size="large"></spacer>
          </hstack>
          <spacer size="small"></spacer>
        </vstack>
      );
    };

    const renderLeaderboardScreen = () => (
      <vstack gap="medium" width="100%" height="100%" alignment="start" padding="medium" backgroundColor="#316BB3">
         <hstack padding="medium">
          <icon
            name="back"
            color="#E3E1DE"
            size="medium"
            onPress={() => {
              setCurrentScreen("home");
            }}
          ></icon>
          <spacer size="medium"></spacer>
          <text size="large" color="#E3E1DE" weight="bold">
            Leaderboard
          </text>
        </hstack>
        <text
              color="#FFCB05"
              weight="bold"
              alignment="middle center"
              width="100%"
            >
              Are you at the top?
            </text>
        {loading ? (
          <text color="#FF8232">Loading leaderboard...</text>
        ) : error ? (
          <text color="#FF3232">Error loading leaderboard.</text>
        ) : leaderboardData && leaderboardData.length > 0 ? (
          leaderboardData.map((entry, index) => (
            rankComponents(entry.username, entry.score, index+1)
          ))
        ) : (
          <text color="#E3E1DE">No scores available yet!</text>
        )}
        
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
