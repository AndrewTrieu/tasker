import https from "https";

export const handler = async (event: any): Promise<any> => {
  const postData = JSON.stringify({
    username:
      event.request.userAttributes["preferred_username"] || event.userName,
    cognitoId: event.userName,
  });

  const options = {
    hostname: process.env.API_URL,
    port: 443,
    path: "/users",
    method: "POST",
    headers: {
      "Content-category": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const responseBody = new Promise((resolve, reject) => {
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

  return event;
};
