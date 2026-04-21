"use strict";

const Alexa = require("ask-sdk-core");
const https = require("https");
const querystring = require("querystring");

const BACKEND_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
const BACKEND_SHARED_SECRET = "PASTE_YOUR_SHARED_SECRET_HERE";

const ACTIONS = {
  LogDiaperIntent: "logDiaper",
  LogBottleFeedingIntent: "logBottleFeeding",
  LogBreastFeedingIntent: "logBreastFeeding",
  StartBreastFeedingTimerIntent: "startBreastFeedingTimer",
  StopBreastFeedingTimerIntent: "stopBreastFeedingTimer",
  LogTummyTimeIntent: "logTummyTime",
  StartTummyTimeTimerIntent: "startTummyTimeTimer",
  StopTummyTimeTimerIntent: "stopTummyTimeTimer"
};

const HELP_TEXT = "You can log a diaper, a bottle feeding, breastfeeding, or tummy time.";
const EXIT_TEXT = "Okay.";

function getSlotValue(handlerInput, slotName) {
  return Alexa.getSlotValue(handlerInput.requestEnvelope, slotName);
}

function normalizeDiaperType(value) {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();

  if (normalized === "wet") {
    return "pee";
  }

  if (normalized === "mixed") {
    return "both";
  }

  return normalized;
}

function normalizeUnit(value) {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();

  if (["ounce", "ounces", "oz"].includes(normalized)) {
    return "oz";
  }

  if (["milliliter", "milliliters", "ml"].includes(normalized)) {
    return "ml";
  }

  return normalized;
}

function toNumber(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function currentTimestamp() {
  return new Date().toISOString();
}

function amountToMilliliters(amount, unit) {
  if (unit !== "oz") {
    return null;
  }

  return Math.round(amount * 29.5735 * 100) / 100;
}

function buildPayload(intentName, handlerInput) {
  switch (intentName) {
    case "LogDiaperIntent": {
      const diaperType = normalizeDiaperType(getSlotValue(handlerInput, "diaperType"));

      if (!diaperType) {
        throw new Error("I need to know whether the diaper was wet, poop, or mixed.");
      }

      return {
        loggedAt: currentTimestamp(),
        diaperType
      };
    }
    case "LogBottleFeedingIntent": {
      const amount = toNumber(getSlotValue(handlerInput, "amount"));
      const unit = normalizeUnit(getSlotValue(handlerInput, "volumeUnit"));

      if (!amount || !unit) {
        throw new Error("I need the amount and unit for a bottle feeding.");
      }

      return {
        loggedAt: currentTimestamp(),
        amount,
        unit,
        amountMl: amountToMilliliters(amount, unit)
      };
    }
    case "LogBreastFeedingIntent":
    case "LogTummyTimeIntent": {
      const durationMinutes = toNumber(getSlotValue(handlerInput, "durationMinutes"));

      if (!durationMinutes || durationMinutes <= 0) {
        throw new Error("I need the number of minutes to log that directly.");
      }

      return {
        loggedAt: currentTimestamp(),
        durationMinutes
      };
    }
    case "StartBreastFeedingTimerIntent":
    case "StartTummyTimeTimerIntent":
      return {
        startedAt: currentTimestamp()
      };
    case "StopBreastFeedingTimerIntent":
    case "StopTummyTimeTimerIntent":
      return {
        stoppedAt: currentTimestamp()
      };
    default:
      return {};
  }
}

function buildSpeech(intentName, response) {
  if (response && response.message) {
    return response.message;
  }

  switch (intentName) {
    case "LogDiaperIntent":
      return `Logged a ${response.diaperType} diaper.`;
    case "LogBottleFeedingIntent":
      return `Logged a bottle feeding of ${response.amount} ${response.unit}.`;
    case "LogBreastFeedingIntent":
      return `Logged breastfeeding for ${response.durationMinutes} minutes.`;
    case "StartBreastFeedingTimerIntent":
      return "Started breastfeeding timer.";
    case "StopBreastFeedingTimerIntent":
      return `Logged breastfeeding for ${response.durationMinutes} minutes.`;
    case "LogTummyTimeIntent":
      return `Logged tummy time for ${response.durationMinutes} minutes.`;
    case "StartTummyTimeTimerIntent":
      return "Started tummy time timer.";
    case "StopTummyTimeTimerIntent":
      return `Logged tummy time for ${response.durationMinutes} minutes.`;
    default:
      return "Done.";
  }
}

function requestBackend(url, method, body, redirectCount) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      headers: {}
    };

    if (body) {
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";
      options.headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let raw = "";

      res.on("data", (chunk) => {
        raw += chunk;
      });

      res.on("end", () => {
        const isRedirect = [301, 302, 303, 307, 308].includes(res.statusCode);

        if (isRedirect && res.headers.location) {
          if (redirectCount >= 3) {
            reject(new Error("The Baby Logger backend redirected too many times."));
            return;
          }

          const redirectUrl = new URL(res.headers.location, url);
          const preservePost = [307, 308].includes(res.statusCode);
          requestBackend(
            redirectUrl,
            preservePost ? method : "GET",
            preservePost ? body : null,
            redirectCount + 1
          ).then(resolve, reject);
          return;
        }

        try {
          const parsed = JSON.parse(raw || "{}");

          if (res.statusCode >= 400 || !parsed.ok) {
            reject(new Error(parsed.message || "The backend rejected the request."));
            return;
          }

          resolve(parsed);
        } catch (error) {
          reject(new Error("The backend returned an invalid response."));
        }
      });
    });

    req.on("error", () => {
      reject(new Error("I couldn't reach the Baby Logger backend."));
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

function callBackend(action, payload) {
  return new Promise((resolve, reject) => {
    const backendUrl = process.env.BACKEND_URL || BACKEND_URL;
    const sharedSecret = process.env.BACKEND_SHARED_SECRET || BACKEND_SHARED_SECRET;

    if (!backendUrl || backendUrl.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
      reject(new Error("The Baby Logger backend URL is not configured."));
      return;
    }

    const url = new URL(backendUrl);
    const formBody = {
      action,
      payload: JSON.stringify(payload)
    };

    if (sharedSecret && !sharedSecret.includes("PASTE_YOUR_SHARED_SECRET_HERE")) {
      formBody.token = sharedSecret;
    }

    const body = querystring.stringify(formBody);
    requestBackend(url, "POST", body, 0).then(resolve, reject);
  });
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("Welcome to Baby Logger. You can log a diaper, feeding, or tummy time event.")
      .reprompt(HELP_TEXT)
      .getResponse();
  }
};

const IntentRouterHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Boolean(ACTIONS[Alexa.getIntentName(handlerInput.requestEnvelope)]);
  },
  async handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);

    try {
      const payload = buildPayload(intentName, handlerInput);
      const response = await callBackend(ACTIONS[intentName], payload);
      const speech = buildSpeech(intentName, response);

      return handlerInput.responseBuilder
        .speak(speech)
        .getResponse();
    } catch (error) {
      return handlerInput.responseBuilder
        .speak(error.message)
        .reprompt(HELP_TEXT)
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_TEXT)
      .reprompt(HELP_TEXT)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      ["AMAZON.CancelIntent", "AMAZON.StopIntent"].includes(
        Alexa.getIntentName(handlerInput.requestEnvelope)
      );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(EXIT_TEXT)
      .getResponse();
  }
};

const FallbackErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(JSON.stringify(error));
    return handlerInput.responseBuilder
      .speak("Sorry, I had trouble handling that request.")
      .reprompt(HELP_TEXT)
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    IntentRouterHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler
  )
  .addErrorHandlers(FallbackErrorHandler)
  .lambda();
