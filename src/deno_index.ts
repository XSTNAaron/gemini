const GEMINI_API_KEY = "AQ.Ab8RN6J34INdHoMCLMC07xrTh66o42I4TCDGF_2ZheU6atsHNw";

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // 首页测试
  if (req.method === "GET" && url.pathname === "/") {
    return new Response("ok");
  }

  // OpenAI 兼容接口
  if (
    req.method === "POST" &&
    url.pathname === "/v1/chat/completions"
  ) {
    try {
      const body = await req.json();

      const messages = body.messages || [];

      const userText = messages
        .map((message: any) => {
          if (typeof message.content === "string") {
            return message.content;
          }

          return "";
        })
        .filter(Boolean)
        .join("\n");

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
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

      if (!response.ok) {
        return Response.json(data, {
          status: response.status,
        });
      }

      const answer =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "";

      return Response.json({
        id: "chatcmpl-gemini",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gemini-3.8-flash",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: answer,
            },
            finish_reason: "stop",
          },
        ],
      });
    } catch (error) {
      return Response.json(
        {
          error: {
            message: error instanceof Error
              ? error.message
              : "Unknown error",
          },
        },
        {
          status: 500,
        }
      );
    }
  }

  return new Response("ok");
}

Deno.serve(handleRequest);
