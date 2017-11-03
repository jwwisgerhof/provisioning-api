// @flow
import type { $Request, $Response } from "express";
import { ApiUser } from "../../database/models";

// Middleware for api auth
export default async (req: $Request, res: $Response, next: () => void) => {
  if (req.originalUrl.startsWith("/sp/")) {
    next();
  } else {
    // Check if we have received an authorization header
    if (
      req.headers.authorization === undefined ||
      req.headers.authorization.includes("ApiKey") === false
    ) {
      return res.status(403).json({
        status: 403,
        message: "No authorization headers provided",
      });
    }

    // Check if we received a valid Authorization header
    const apiKey = req.headers.authorization.replace("ApiKey ", "").trim();
    if (apiKey === "") {
      return res.status(403).json({
        status: 403,
        message: "No api key was provided",
      });
    }

    try {
      const apiUser = await ApiUser.findOne({ where: { apiKey } });

      if (apiUser === null) {
        return res
          .status(403)
          .json({ status: 403, message: "Invalid api key" });
      }

      res.locals.apiUser = apiUser;
      next();
    } catch (e) {
      return res.status(400).send({ status: 400, e });
    }
  }
};
