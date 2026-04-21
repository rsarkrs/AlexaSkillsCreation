var CONFIG = {
  tabs: {
    diapers: "Diapers",
    feedings: "Feedings",
    tummyTime: "TummyTime",
    sessionState: "SessionState"
  }
};

function doPost(e) {
  try {
    ensureSheets_();

    var action = getRequiredParam_(e, "action");
    var payload = parsePayload_(e.parameter.payload);
    validateToken_(e.parameter.token);

    var result = dispatchAction_(action, payload);
    return jsonResponse_(200, result);
  } catch (error) {
    return jsonResponse_(400, {
      ok: false,
      message: error.message || "Unhandled backend error."
    });
  }
}

function dispatchAction_(action, payload) {
  switch (action) {
    case "logDiaper":
      return logDiaper_(payload);
    case "logBottleFeeding":
      return logBottleFeeding_(payload);
    case "logBreastFeeding":
      return logBreastFeeding_(payload);
    case "startBreastFeedingTimer":
      return startTimer_("breastfeeding", payload);
    case "stopBreastFeedingTimer":
      return stopBreastFeedingTimer_(payload);
    case "logTummyTime":
      return logTummyTime_(payload);
    case "startTummyTimeTimer":
      return startTimer_("tummyTime", payload);
    case "stopTummyTimeTimer":
      return stopTummyTimeTimer_(payload);
    default:
      throw new Error("Unsupported action: " + action);
  }
}

function logDiaper_(payload) {
  var diaperType = normalizeDiaperType_(payload.diaperType);
  var loggedAt = resolveTimestamp_(payload.loggedAt);

  appendRow_(CONFIG.tabs.diapers, [loggedAt, diaperType]);

  return {
    ok: true,
    diaperType: diaperType,
    loggedAt: loggedAt,
    message: "Logged a " + spokenDiaperType_(diaperType) + " diaper."
  };
}

function logBottleFeeding_(payload) {
  var amount = toPositiveNumber_(payload.amount, "Bottle amount must be greater than zero.");
  var unit = normalizeUnit_(payload.unit);
  var amountMl = payload.amountMl;
  var loggedAt = resolveTimestamp_(payload.loggedAt);

  if (amountMl === null || amountMl === undefined || amountMl === "") {
    amountMl = unit === "oz" ? round_(amount * 29.5735, 2) : amount;
  }

  appendRow_(CONFIG.tabs.feedings, [loggedAt, "bottle", amount, unit, amountMl, ""]);

  return {
    ok: true,
    amount: amount,
    unit: spokenUnit_(unit, amount),
    amountMl: amountMl,
    loggedAt: loggedAt,
    message: "Logged a bottle feeding of " + amount + " " + spokenUnit_(unit, amount) + "."
  };
}

function logBreastFeeding_(payload) {
  var durationMinutes = toPositiveNumber_(payload.durationMinutes, "Duration must be greater than zero.");
  var loggedAt = resolveTimestamp_(payload.loggedAt);

  appendRow_(CONFIG.tabs.feedings, [loggedAt, "breastfeeding", "", "", "", durationMinutes]);

  return {
    ok: true,
    durationMinutes: durationMinutes,
    loggedAt: loggedAt,
    message: "Logged breastfeeding for " + durationMinutes + " minutes."
  };
}

function logTummyTime_(payload) {
  var durationMinutes = toPositiveNumber_(payload.durationMinutes, "Duration must be greater than zero.");
  var loggedAt = resolveTimestamp_(payload.loggedAt);

  appendRow_(CONFIG.tabs.tummyTime, [loggedAt, durationMinutes]);

  return {
    ok: true,
    durationMinutes: durationMinutes,
    loggedAt: loggedAt,
    message: "Logged tummy time for " + durationMinutes + " minutes."
  };
}

function startTimer_(timerType, payload) {
  var startedAt = resolveTimestamp_(payload.startedAt);
  upsertTimerState_(timerType, startedAt, "active");

  return {
    ok: true,
    timerType: timerType,
    startedAt: startedAt,
    message: timerType === "breastfeeding" ? "Started breastfeeding timer." : "Started tummy time timer."
  };
}

function stopBreastFeedingTimer_(payload) {
  var result = stopTimer_("breastfeeding", payload);
  appendRow_(CONFIG.tabs.feedings, [result.stoppedAt, "breastfeeding", "", "", "", result.durationMinutes]);

  return {
    ok: true,
    durationMinutes: result.durationMinutes,
    startedAt: result.startedAt,
    stoppedAt: result.stoppedAt,
    message: "Logged breastfeeding for " + result.durationMinutes + " minutes."
  };
}

function stopTummyTimeTimer_(payload) {
  var result = stopTimer_("tummyTime", payload);
  appendRow_(CONFIG.tabs.tummyTime, [result.stoppedAt, result.durationMinutes]);

  return {
    ok: true,
    durationMinutes: result.durationMinutes,
    startedAt: result.startedAt,
    stoppedAt: result.stoppedAt,
    message: "Logged tummy time for " + result.durationMinutes + " minutes."
  };
}

function stopTimer_(timerType, payload) {
  var state = getActiveTimerState_(timerType);

  if (!state) {
    throw new Error(
      timerType === "breastfeeding" ?
        "There is no active breastfeeding timer." :
        "There is no active tummy time timer."
    );
  }

  var stoppedAt = resolveTimestamp_(payload.stoppedAt);
  var durationMinutes = minutesBetween_(state.startedAt, stoppedAt);

  if (durationMinutes <= 0) {
    throw new Error("The stop time must be after the start time.");
  }

  upsertTimerState_(timerType, state.startedAt, "stopped");

  return {
    timerType: timerType,
    durationMinutes: durationMinutes,
    startedAt: state.startedAt,
    stoppedAt: stoppedAt
  };
}

function ensureSheets_() {
  ensureSheet_(CONFIG.tabs.diapers, ["loggedAt", "diaperType"]);
  ensureSheet_(CONFIG.tabs.feedings, ["loggedAt", "feedingType", "amount", "unit", "amountMl", "durationMinutes"]);
  ensureSheet_(CONFIG.tabs.tummyTime, ["loggedAt", "durationMinutes"]);
  ensureSheet_(CONFIG.tabs.sessionState, ["timerType", "startedAt", "status", "updatedAt"]);
}

function ensureSheet_(sheetName, headers) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
}

function appendRow_(sheetName, values) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName).appendRow(values);
}

function upsertTimerState_(timerType, startedAt, status) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.tabs.sessionState);
  var lastRow = sheet.getLastRow();
  var now = isoNow_();

  if (lastRow > 1) {
    var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

    for (var index = 0; index < values.length; index += 1) {
      if (values[index][0] === timerType) {
        sheet.getRange(index + 2, 1, 1, 4).setValues([[timerType, startedAt, status, now]]);
        return;
      }
    }
  }

  sheet.appendRow([timerType, startedAt, status, now]);
}

function getActiveTimerState_(timerType) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.tabs.sessionState);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return null;
  }

  var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

  for (var index = 0; index < values.length; index += 1) {
    if (values[index][0] === timerType && values[index][2] === "active") {
      return {
        timerType: values[index][0],
        startedAt: values[index][1],
        status: values[index][2]
      };
    }
  }

  return null;
}

function normalizeDiaperType_(value) {
  if (!value) {
    throw new Error("Invalid diaper type.");
  }

  var normalized = String(value).toLowerCase();

  if (normalized === "wet") {
    normalized = "pee";
  }

  if (normalized === "mixed") {
    normalized = "both";
  }

  if (["pee", "poop", "both"].indexOf(normalized) === -1) {
    throw new Error("Invalid diaper type.");
  }

  return normalized;
}

function normalizeUnit_(value) {
  if (!value) {
    throw new Error("Bottle feeding requires a unit.");
  }

  var normalized = String(value).toLowerCase();

  if (["ounce", "ounces", "oz"].indexOf(normalized) !== -1) {
    return "oz";
  }

  if (["milliliter", "milliliters", "ml"].indexOf(normalized) !== -1) {
    return "ml";
  }

  throw new Error("Bottle feeding unit must be ounces or milliliters.");
}

function spokenUnit_(unit, amount) {
  if (unit === "oz") {
    return amount === 1 ? "ounce" : "ounces";
  }

  return amount === 1 ? "milliliter" : "milliliters";
}

function spokenDiaperType_(value) {
  return value === "both" ? "mixed" : value;
}

function toPositiveNumber_(value, message) {
  var parsed = Number(value);

  if (!parsed || parsed <= 0) {
    throw new Error(message);
  }

  return parsed;
}

function resolveTimestamp_(value) {
  if (!value) {
    return isoNow_();
  }

  var date = new Date(value);

  if (isNaN(date.getTime())) {
    return isoNow_();
  }

  return date.toISOString();
}

function minutesBetween_(startValue, stopValue) {
  var start = new Date(startValue);
  var stop = new Date(stopValue);

  if (isNaN(start.getTime()) || isNaN(stop.getTime())) {
    throw new Error("Timer state is invalid.");
  }

  return Math.round((stop.getTime() - start.getTime()) / 60000);
}

function parsePayload_(rawPayload) {
  if (!rawPayload) {
    return {};
  }

  try {
    return JSON.parse(rawPayload);
  } catch (error) {
    throw new Error("Payload must be valid JSON.");
  }
}

function getRequiredParam_(e, key) {
  if (!e || !e.parameter || !e.parameter[key]) {
    throw new Error("Missing required parameter: " + key);
  }

  return e.parameter[key];
}

function validateToken_(token) {
  var expected = PropertiesService.getScriptProperties().getProperty("BABY_LOGGER_SHARED_SECRET");

  if (!expected) {
    return;
  }

  if (token !== expected) {
    throw new Error("Unauthorized request.");
  }
}

function jsonResponse_(status, body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function isoNow_() {
  return new Date().toISOString();
}

function round_(value, decimals) {
  var multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
