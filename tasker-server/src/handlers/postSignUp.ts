import https from "https";
import path from "path";

const API_BASE_URL = process.env.API_BASE_URL || "";

export const handler = async (event: any): Promise<any> => {
  const postData = JSON.stringify({
    username:
      event.request.userAttributes["preferred_username"] || event.userName,
    cognitoId: event.userName,
  });

  console.log(postData);

  const options = {
    hostname: API_BASE_URL ? new URL(API_BASE_URL).hostname : "",
    port: 443,
    path: API_BASE_URL
      ? path.join(new URL(API_BASE_URL).pathname, "/users")
      : "",
    method: "POST",
    headers: {
      "Content-category": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "Allow-Control-Allow-Origin": "*",
    },
  };

  const responseBody = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      let responseBody = "";
      res.on("data", (chunk) => (responseBody += chunk));
      res.on("end", () => resolve(responseBody));
    });
    req.on("error", (error) => reject(error));
    req.write(postData);
    req.end();
  });

  console.log(responseBody);

  return event;
};
