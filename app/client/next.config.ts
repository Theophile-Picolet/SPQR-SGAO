import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Static export: `next build` writes plain HTML, CSS and JS in the `out` folder
	output: "export",
	// The default image optimizer needs a server: images are imported in the code and hashed at build time
	images: { unoptimized: true },
	// Without the NEXT_PUBLIC_ prefix, a variable stays out of the browser code: this copies API_URL into it at build time
	env: { API_URL: process.env.API_URL },
};

export default nextConfig;
