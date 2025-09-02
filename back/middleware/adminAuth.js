export const requireAdmin = (req, res, next) => {
	if (req.session?.admin?.loggedIn) return next();
	return res.redirect("/admin/login");
};

export const ensureLoggedOut = (req, res, next) => {
	if (req.session?.admin?.loggedIn) return res.redirect("/admin");
	next();
};
