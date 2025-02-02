const fetchPost = useCallback(async () => {
  try {
    const { author, id } = params;
    // Construct the full URI
    const postId = `at://${author}/app.bsky.feed.post/${id}`;
    const { data } = await agent.app.bsky.feed.getPostThread({
      uri: postId,
      depth: 1,
    });
    // ... rest of the code
  } catch (error) {
    console.error("Error fetching post:", error);
  }
  setIsLoading(false);
}, [params]); 