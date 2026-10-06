export async function graphqlFetch(accessToken: string, query: string, variables?: Record<string, unknown>) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "User-Agent": "GitFit-App",
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error("GraphQL HTTP Error:", response.status, text)
    // Carry the status so callers can tell an expired token (401) or rate limit apart
    throw Object.assign(new Error(`GitHub API returned ${response.status}: ${text.slice(0, 200)}`), {
      status: response.status,
    })
  }

  const json = await response.json()
  if (json.errors) {
    console.error("GraphQL Logic Error:", json.errors)
    throw new Error(json.errors[0]?.message || "GraphQL error")
  }

  return json.data
}
