import conversation.{type JsRequest, type JsResponse, translate_request, translate_response, Text}
import gleam/http/response
import gleam/http/request.{path_segments}

pub fn handler(js_req: JsRequest) -> JsResponse {
	let req = translate_request(js_req)

	let path = case path_segments(req) {
		[value] -> value
		_ -> "/"
	}

	response.new(200)
	|> response.set_body(Text(path))
	|> translate_response
}