import {type Context, Devvit, type JobContext} from '@devvit/public-api'
import {Preview} from '../components/preview.js'
import {redisPostCountInc, redisPostCreate} from './redis.js'

export async function submitNewPost(
  ctx: Context | JobContext,
  ui: boolean
): Promise<void> {
  if (!ctx.subredditName) throw Error('no sub name')

  const matchSetNum = await redisPostCountInc(ctx.redis)

  // requires special permission: post as viewer.
  const post = await ctx.reddit.submitPost({
    preview: <Preview />,
    subredditName: ctx.subredditName,
    title: `Fiddlesticks Match #${matchSetNum}`
  })

  await redisPostCreate(ctx.redis, post, matchSetNum)

  // hack: JobContext has a ui member.
  if (ui && 'ui' in ctx) {
    ctx.ui.showToast({
      appearance: 'success',
      text: `Fiddlesticks match #${matchSetNum} set.`
    })
    ctx.ui.navigateTo(post)
  }
  console.log(
    `fiddlesticks match #${matchSetNum} set by ${ctx.userId ?? 'fiddlesticks-app'}`
  )
}
