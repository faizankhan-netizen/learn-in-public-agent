/**
 * Tools — The agent's hands.
 * 
 * Each tool is a function the agent can call. The agent decides WHICH tool
 * to use and WHAT arguments to pass. This is what separates an agent from
 * a script — the LLM reasons about tool selection, not the programmer.
 * 
 * Architecture note: Zero dependencies. Uses Node.js native fetch().
 */

// ─────────────────────────────────────────────
// Tool: Fetch Hacker News trending stories
// ─────────────────────────────────────────────
async function fetchHNTrending(args = {}) {
  const count = args.count || 10;
  
  try {
    // HN API: get top story IDs, then fetch details for top N
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = await res.json();
    const topIds = storyIds.slice(0, count);

    const stories = await Promise.all(
      topIds.map(async (id) => {
        const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        const story = await storyRes.json();
        return {
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${id}`,
          score: story.score,
          comments: story.descendants || 0,
        };
      })
    );

    return {
      success: true,
      source: 'Hacker News',
      count: stories.length,
      stories: stories,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// Tool: Fetch Reddit AI/tech posts
// ─────────────────────────────────────────────
async function fetchRedditAI(args = {}) {
  const subreddit = args.subreddit || 'artificial';
  const count = args.count || 10;

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${count}`,
      { headers: { 'User-Agent': 'ContentEngine/1.0' } }
    );
    const data = await res.json();

    const posts = data.data.children.map((child) => ({
      title: child.data.title,
      url: `https://reddit.com${child.data.permalink}`,
      score: child.data.score,
      comments: child.data.num_comments,
      subreddit: child.data.subreddit,
    }));

    return {
      success: true,
      source: `Reddit r/${subreddit}`,
      count: posts.length,
      posts: posts,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// Tool: Fetch multiple subreddits at once
// ─────────────────────────────────────────────
async function fetchRedditMulti(args = {}) {
  const subreddits = args.subreddits || ['artificial', 'MachineLearning', 'LocalLLaMA'];
  const countPer = args.count || 5;

  const results = await Promise.all(
    subreddits.map((sub) => fetchRedditAI({ subreddit: sub, count: countPer }))
  );

  const allPosts = results
    .filter((r) => r.success)
    .flatMap((r) => r.posts)
    .sort((a, b) => b.score - a.score);

  return {
    success: true,
    source: `Reddit (${subreddits.join(', ')})`,
    count: allPosts.length,
    posts: allPosts,
  };
}

// ─────────────────────────────────────────────
// Tool: Get current date/time context
// ─────────────────────────────────────────────
function getCurrentContext() {
  const now = new Date();
  return {
    success: true,
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString(),
    dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
    timestamp: now.toISOString(),
  };
}

// ─────────────────────────────────────────────
// Tool: Fetch X Algorithm latest updates
// ─────────────────────────────────────────────
async function fetchXAlgorithmRepo() {
  try {
    // Fetch latest commits from the open-source X algorithm repository
    const res = await fetch('https://api.github.com/repos/xai-org/x-algorithm/commits?per_page=5', {
      headers: { 'User-Agent': 'ContentEngine/1.0' }
    });
    
    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.statusText}`);
    }

    const commits = await res.json();
    const latestUpdates = commits.map(c => ({
      message: c.commit.message,
      date: c.commit.author.date,
      author: c.commit.author.name
    }));

    return {
      success: true,
      source: 'GitHub (xai-org/x-algorithm)',
      updates: latestUpdates,
      strategy_note: 'Remember to apply X algorithm rules: 1) No external links in main tweet (put in replies), 2) End with questions to drive reply multipliers, 3) Use line breaks to increase read dwell time.'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────
// Tool Registry — the agent sees this list
// ─────────────────────────────────────────────
export const TOOLS = {
  fetchHNTrending: {
    fn: fetchHNTrending,
    description: 'Fetch top trending stories from Hacker News. Args: { count: number (default 10) }',
  },
  fetchRedditAI: {
    fn: fetchRedditAI,
    description: 'Fetch hot posts from a specific subreddit. Args: { subreddit: string (default "artificial"), count: number (default 10) }',
  },
  fetchRedditMulti: {
    fn: fetchRedditMulti,
    description: 'Fetch hot posts from multiple AI subreddits at once. Args: { subreddits: string[] (default ["artificial","MachineLearning","LocalLLaMA"]), count: number (default 5) }',
  },
  fetchXAlgorithmRepo: {
    fn: fetchXAlgorithmRepo,
    description: 'Fetch the latest code commits and updates from the open-source X algorithm repository (xai-org/x-algorithm). Useful for learning how the timeline ranking works.',
  },
  getCurrentContext: {
    fn: getCurrentContext,
    description: 'Get the current date, time, and day of week for context-aware content.',
  },
};

/**
 * Build the tool descriptions string for the system prompt.
 * The agent reads this to know what tools are available.
 */
export function getToolDescriptions() {
  return Object.entries(TOOLS)
    .map(([name, tool]) => `- ${name}: ${tool.description}`)
    .join('\n');
}
