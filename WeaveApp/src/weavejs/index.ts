$(function ()
{
	var weave_elements = $(".weave");
	var map_session_url_instance = new Map<string, Weave>();
	weave_elements.map((index, weave_element) => {
		var weave_instance:Weave;
		var appMode = $(weave_element).data("appmode");
		var sessionUrl = $(weave_element).data("sessionurl");
		var path = $(weave_element).data("path");
		weave_instance = map_session_url_instance.get(sessionUrl);
		if(!weave_instance)
		{
			weave_instance = new Weave();
			map_session_url_instance.set(sessionUrl);
		}
		weavejs.util.EmbedUtils.embed({element: weave_element, weaveInstance: weave_instance, sessionUrl, path, mode: appMode});
	});
});
