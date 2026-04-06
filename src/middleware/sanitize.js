const hasUnsafeKeys = (value) => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.keys(value).some((key) => {
    if (key.startsWith("$") || key.includes(".")) {
      return true;
    }

    return hasUnsafeKeys(value[key]);
  });
};

const sanitizePayload = (req, res, next) => {
  const sources = [req.body, req.query, req.params];

  const unsafeSource = sources.find(hasUnsafeKeys);
  if (unsafeSource) {
    return res.status(400).json({ message: "Payload contains forbidden keys" });
  }

  next();
};

export {
  sanitizePayload
};
