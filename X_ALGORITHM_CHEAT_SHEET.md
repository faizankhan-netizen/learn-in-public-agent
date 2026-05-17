# The X Algorithm Cheat Sheet

> Synthesized from the open-source `xai-org/x-algorithm` repository.
> This document translates the actual code of X's recommendation engine into actionable rules for the @BuildWithFaizan account.

---

## The Ranking Multipliers (What X Rewards)

The algorithm assigns a specific weight to different user actions. If you want a post to go viral, you must optimize for these specific actions in this order:

1. **Replies (Huge Boost):** Getting someone to reply to your tweet is the strongest positive signal you can get. 
   * *Our Tactic:* End threads and tweets with a genuine question. Use the "Reply Ammunition" to spark debates in other people's threads.
2. **Retweets (Massive Boost):** Retweets amplify your reach exponentially across the "For You" timeline.
3. **Dwell Time (Hidden Metric):** The algorithm tracks exactly how many milliseconds someone spends looking at your post before scrolling. 
   * *Our Tactic:* Use line breaks (whitespace) in tweets. It forces the user to pause and read down the screen, artificially increasing dwell time.
4. **Media (Moderate Boost):** Tweets with images or videos rank significantly higher than text-only tweets.
   * *Our Tactic:* Post screenshots of code, VS Code setups, or architecture diagrams whenever possible.

---

## The Penalties (What X Punishes)

The algorithm will actively suppress ("shadowban" the reach of) your tweets if you trigger these penalties.

1. **External Links (Massive Penalty):** X wants to keep users on X. If your main tweet contains a link to GitHub, YouTube, or your blog, its reach will be severely throttled.
   * *Our Tactic:* If you have a link, write `[link in reply]` in the main tweet, and post the actual URL as a reply to yourself.
2. **Negative Feedback (Death Sentence):** If users click "Show less often," mute, or block you, the algorithm aggressively demotes your account.
   * *Our Tactic:* Avoid rage-bait, politics, or annoying formatting (like massive hashtag walls). Stay focused on genuine learning.
3. **Spam Behavior:** Posting 5 times in 10 minutes, or dropping the exact same reply on 20 different accounts.
   * *Our Tactic:* Maintain a steady cadence. Max 2-3 original posts per day, spaced out.

---

## The "Cluster" Effect

The algorithm groups accounts into "SimClusters" (communities of similar interests). It looks at who you follow, who follows you, and who you reply to.

* *Our Tactic:* By strictly following the "1-to-5 Rule" (replying to 5 big AI accounts for every 1 original post we make), we force the algorithm to place @BuildWithFaizan into the highly engaged "AI Builders / Learn in Public" cluster. Once we are in that cluster, X will naturally recommend our content to people interested in AI.

---
*Last Updated: 2026-05-17*
