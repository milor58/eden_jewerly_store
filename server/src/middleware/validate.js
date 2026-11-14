import mongoose from 'mongoose';

// validate(schema)          -> checks req.body, replaces it with the clean data
// validate(schema, 'query') -> checks req.query, puts the clean data in req.validQuery
//   (Express 5 does not allow overwriting req.query)
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.length ? issue.path.join('.') : undefined;
      return res.status(400).json({ error: issue.message, field });
    }
    if (source === 'query') req.validQuery = result.data;
    else req[source] = result.data; // only the declared fields survive
    next();
  };

// 400 before the database ever sees a bad id.
export const validId =
  (param = 'id') =>
  (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[param]) || !/^[a-f\d]{24}$/i.test(req.params[param])) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    next();
  };
