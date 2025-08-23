export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ----- CORS -----
    const origin = request.headers.get("Origin") || "*";
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }


    if (url.pathname === "/" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          message: "✅ Cloudflare Worker is running!",
          endpoints: ["/server-time", "/score-places"]
        }),
        {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": origin
          }
        }
      );
    }

    // ----- API 1: GET /server-time -----
    if (url.pathname === "/server-time" && request.method === "GET") {
      return new Response(JSON.stringify({ time: new Date().toISOString() }), {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": origin
        }
      });
    }

    // ----- API 2: POST /score-places -----
    if (url.pathname === "/score-places" && request.method === "POST") {
      try {
        const body = await request.json();
        const places = body.places || [];
        const results = places.map(p => {
          const rating = p.rating ?? 0;
          const distance = p.distance ?? 1000;
          const score = rating * 0.7 + (1000 - distance) / 1000 * 0.3;
          return { ...p, score: Number(score.toFixed(3)) };
        }).sort((a, b) => b.score - a.score);

        return new Response(JSON.stringify({ results }), {
          headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": origin
          }
        });
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Access-Control-Allow-Origin": origin }
        });
      }
    }


    return new Response(
      JSON.stringify({ error: "Not Found" }),
      {
        status: 404,
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": origin }
      }
    );
  }
};
