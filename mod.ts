import type { FreshContext, Plugin } from "$fresh/server.ts";
import { exists } from "$std/fs/exists.ts";
import { join } from "$std/path/join.ts";

export const runGleamCompile = (cwd?: string) => {
	const gleamBuild = new Deno.Command("gleam", {
		args: ["build", "--target=javascript", "--no-print-progress"],
		cwd: cwd ?? Deno.cwd(),
	});

	return gleamBuild.spawn();
};

export const getGleamFilePathFromPath = (
	basePath: string,
	gleamProjectName: string,
	route: string,
) => {
	return join(
		basePath,
		`build/dev/javascript/${gleamProjectName}/routes/${route}.mjs`,
	);
};

interface Params {
	/**
	 * The name of the Gleam project to use.
	 * @default "main"
	 */
	gleamProjectName?: string;
}

/**
 * A Fresh plugin to handle Gleam files.
 * @param basePath The base path of the project (where the `deno.json` file is)
 * @param props The plugin properties.
 * @returns Plugin
 */
export async function gleamPlugin(basePath: string, props?: Params) {
	const gleamProjectName = props?.gleamProjectName || "main";

	const process = runGleamCompile(basePath);
	await process.status;

	return {
		name: "gleam_plugin",
		routes: [
			{
				path: "/[...gleamFile]",
				handler: async (req: Request, ctx: FreshContext) => {
					const gleamFile = ctx.params.gleamFile;

					const gleamFilePath = getGleamFilePathFromPath(
						basePath,
						gleamProjectName,
						gleamFile,
					);

					const fileExists = await exists(gleamFilePath, {
						isFile: true,
					});

					if (!fileExists) {
						return ctx.renderNotFound();
					}

					const { handler } = await import("file://" + gleamFilePath);

					if (typeof handler !== "function") {
						return ctx.renderNotFound();
					}

					return handler(req);
				},
			},
		],
	} as Plugin;
}
