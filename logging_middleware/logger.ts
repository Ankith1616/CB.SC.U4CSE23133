import axios from "axios";

const LOG_API = "http://20.207.122.201/evaluation-service/logs";

export async function Log(
  stack: string,
  level: string,
  packageName: string,
  message: string
) {
  try {
    await axios.post(
      LOG_API,
      {
        stack,
        level,
        package: packageName,
        message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_TOKEN",
        },
      }
    );
  } catch (err: any) {
    console.error(err.message);
  }
}