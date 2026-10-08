const GEMINI_API_KEY = "AQ.Ab8RN6K7vj0SdymANjZp9rkKDDIFuhff-bf7znLNsV5i10fpTA";

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    return new Response("ok");
  }

  if (
    req.method === "POST" &&
    url.pathname === "/v1/chat/completions"
  ) {
    const body = await req.json();

    const userText =
      body.messages?.[body.messages.length - 1]?.content || "";

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: userText,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "没有返回内容";

    return Response.json({
      id: "chatcmpl-demo",
      object: "chat.completion",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: answer,
          },
        },
      ],
    });
  }

  return new Response("Not Found", {
    status: 404,
  });
});
