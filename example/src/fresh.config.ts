import { defineConfig } from "$fresh/server.ts";
import { gleamPlugin } from "fresh_gleam";

export default defineConfig({
	plugins: [
		await gleamPlugin(Deno.cwd()),
	],
});
