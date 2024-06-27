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

const getGleamFilePath = (gleamProjectName: string, gleamFile: string) => {
	return join(Deno.cwd(), `build/dev/javascript/${gleamProjectName}/routes/${gleamFile}.mjs`);
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
 * @param props The plugin properties.
 * @returns Plugin
 */
export function gleamPlugin(props?: Params) {
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

					const gleamFilePath = getGleamFilePath(gleamProjectName, gleamFile);

					const fileExists = await exists(gleamFilePath, { isFile: true });

					if (!fileExists) {
						return ctx.renderNotFound();
					}

					const { handler } = await import(gleamFilePath.replace(/\.mjs$/, ""));

					if (typeof handler !== "function") {
						return ctx.renderNotFound();
					}

					return handler(req);
				},
			},
		],
	} as Plugin
}