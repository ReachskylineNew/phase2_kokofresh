/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: "https://www.kokofresh.in",
	generateRobotsTxt: true,
	exclude: ["/product", "/product/slug-redirect"],
	transform: async (config, path) => {
		if (path.startsWith("/product?id=")) return null
		return {
			loc: path,
			changefreq: "weekly",
			priority: path === "/" ? 1.0 : 0.7,
			lastmod: new Date().toISOString(),
		}
	},
}
