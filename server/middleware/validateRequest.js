export const validateRequest = (schema) => (req, res, next) => {
  try {
    // Parse request body/query/params matching the schema structure
    // Typically schemas validate the body.
    // If schema is ZodObject, we can use .parse()

    // We assume the schema validates the BODY by default.
    // If you need to validate query/params, strict schema definition is needed.
    // For simplicity here, we validate req.body.

    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      // Zod Error
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({ success: false, message: `Validation Error: ${messages}` });
    }
    return res.status(400).json({ success: false, message: 'Invalid request data' });
  }
};
