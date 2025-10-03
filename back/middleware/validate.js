import { ZodError } from "zod";

export const validate =
	(schema, pick = "body") =>
	(req, res, next) => {
		try {
			const parsed = schema.parse(req[pick]);
			req[pick] = parsed;
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				return res
					.status(400)
					.json({ message: "Payload invalide", issues: err.issues });
			}
			next(err);
		}
	};
