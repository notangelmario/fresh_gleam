# fresh_gleam

A plugin to use [Gleam](https://gleam.run) inside of [Fresh](https://fresh.deno.dev).

> [!WARNING]
> This plugin is experimental and the only Fresh version tested is 1.6.8.

### Features

-   Use Gleam files inside of Fresh
-   Create routes using Gleam
-   You can even create a full Gleam app using Fresh

### Roadmap

-   [ ] Allow usage of pure Gleam Request and Response objects
-   [ ] Add support for `FreshContext` in Gleam files

## Instructions

Gleam only supports files inside of a `src/` folder, so you will have to move your app into a `src/` folder. [See instructions](https://fresh.deno.dev/docs/examples/changing-the-src-dir#using-a-src-directory)

1. Add `gleam.toml` to your Fresh project

```toml
name = "main"
# Can be any name but remember to change
# the alias in the deno.json file as explained below
# and pass the name to the plugin
version = "0.1.0"
target = "javascript"

[javascript]
typescript_declarations = true # Needed if you want to use TypeScript
runtime = "deno"
```

2. Add `fresh_gleam` to plugins.

```json
// deno.json
{
	"imports": {
		"fresh_gleam": "https://deno.land/x/fresh_gleam@v0.1.1/mod.ts"
		// Other imports
	}
}
```

```typescript
// fresh.config.ts
import { defineConfig } from "$fresh/server.ts";
import { gleamPlugin } from "@notangelmario/fresh_gleam";
// Or add it directly from the URL
// import { gleamPlugin } from "jsr:@notangelmario/fresh_gleam@v0.1.1";

export default defineConfig({
	plugins: [
		// We use await because we want to wait for the gleam build to finish
		await gleamPlugin(Deno.cwd(), {
			// Optional, add Gleam project name. Default to "main"
			gleamProjectName: "main",
		}),
	],
});
```

3. Add an alias to the compiled Gleam files and exclude the build folder

```json
// deno.json
{
	"imports": {
		"$gleam/": "./build/dev/javascript/main/",
		"fresh_gleam": "https://deno.land/x/fresh_gleam@v0.1.1/mod.ts"
		// Other imports
	},
	"exclude": ["./build/*"]
}
```

4. Run Fresh

```bash
$ deno task start
```

And that's it! Your Gleam files will be compiled an can be imported using the alias `$gleam/`.

## How to use

You can import your Gleam files using the alias `$gleam/`:

```typescript
import { hello_from_gleam } from "$gleam/main.mjs";
```

> [!TIP]
> Gleam files are compiled to `.mjs` files, so you will need to import them using the `.mjs` extension instead of `.gleam`. Files are also relative to the `src/` folder.
>
> So if you have a file `src/lib/utils.gleam`, you will import it like this:
>
> ```typescript
> import { greet } from "$gleam/lib/utils.mjs";
> ```

You can also use Gleam files as routes:

```rust
// src/routes/api/hello.gleam
import gleam/http/request
import conversation.{type JsRequest, type JsResponse, translate_response}


pub fn handler(req: JsRequest) -> JsResponse {
	response.new(200)
	|> response.set_body(Text("Hello from Gleam!"))
	|> translate_response
}
```

> [!TIP]
> You will need to translate the request and response to JavaScript objects. You can use [conversation](https://hex.pm/packages/conversation) to do that.
