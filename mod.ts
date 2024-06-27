import type { FreshContext, Plugin } from "$fresh/server.ts";
import { exists } from "$std/fs/exists.ts";
import { join } from "$std/path/join.ts";

const runGleamCompile = () => {
	const gleamBuild = new Deno.Command("gleam", {
		args: ["build", "--target=javascript"],
		cwd: Deno.cwd(),
	});

	gleamBuild.spawn();
}

const getGleamFilePath = (basePath: string, gleamProjectName: string, gleamFile: string) => {
	return join(basePath, `build/dev/javascript/${gleamProjectName}/routes/${gleamFile}.mjs`);
}

interface Params {
	/**
	 * The name of the Gleam project to use.
	 * @default "main"
	 */
	gleamProjectName?: string;
}

/**
 * A Fresh plugin to handle Gleam files.
 * @param basePath The base path of the project. Pass `import.meta.dirname`.
 * @param props The plugin properties.
 * @returns Plugin
 */
export function gleamPlugin(basePath: string, props?: Params) {
	const gleamProjectName = props?.gleamProjectName || "main";

	return {
		name: "gleam_plugin",
		configResolved: () => {
			runGleamCompile()
		},
		routes: [
			{
				path: "/[...gleamFile]",
				handler: async (req: Request, ctx: FreshContext) => {
					const gleamFile = ctx.params.gleamFile;

					const gleamFilePath = getGleamFilePath(basePath, gleamProjectName, gleamFile);

					const fileExists = await exists(gleamFilePath, { isFile: true });

					if (!fileExists) {
						return ctx.renderNotFound();
					}

					const { handler } = await import(gleamFilePath);

					if (typeof handler !== "function") {
						return ctx.renderNotFound();
					}

					return handler(req);
				},
			},
		],
	} as Plugin
}