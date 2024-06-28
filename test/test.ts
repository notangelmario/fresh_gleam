import { getGleamFilePathFromPath, runGleamCompile } from "../mod.ts";
import { exists } from "$std/fs/exists.ts";
import { join } from "$std/path/join.ts";
import { assert, assertEquals, assertStringIncludes } from "$std/assert/mod.ts";

Deno.test("Gleam Plugin", async (t) => {
	const process = runGleamCompile(join(Deno.cwd(), "test"));
	await process.status;

	await t.step("Gleam files compile to JavaScript", async () => {
		const fileExists = await exists(
			new URL("./build/dev/javascript/main/simple.mjs", import.meta.url)
				.pathname,
			{
				isFile: true,
			},
		);

		assert(fileExists);
	});

	await t.step("Route file paths are created correctly", () => {
		const path = getGleamFilePathFromPath(Deno.cwd(), "main", "simple");

		assertEquals(
			path,
			join(
				Deno.cwd(),
				"./build/dev/javascript/main/routes/simple.mjs",
			),
		);
	});

	await t.step(
		"Gleam file can execute",
		async () => {
			const { simple } = await import(
				new URL(
					"./build/dev/javascript/main/simple.mjs",
					import.meta.url,
				).pathname
			);

			assertEquals(simple(), "simple");
		},
	);

	await t.step(
		"Route file can handle requests and responses properly",
		async () => {
			const { handler } = await import(
				new URL(
					"./build/dev/javascript/main/routes/route.mjs",
					import.meta.url,
				).pathname
			);

			const req = new Request("http://localhost:8080/simple");

			const res: Response = handler(req);

			assertStringIncludes(await res.text(), "simple");
		},
	);
});
