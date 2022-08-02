emptyMsg["encoded"] = "Paste full URL here";
emptyMsg["url"] = "Paste Post Request URL here";
emptyMsg["schema"] = "Paste GraphQL Schema here";
emptyMsg["input"] = "JSON will appear here";
$(function () {
  const $encoded = $("#encoded");
  const $url = $("#url");
  const $schema = $("#schema");
  const $json = $("#input");
  const $go = $("#output");
  const $method = $("#method");
  $url.text(getUrlQuery("url"));
  $schema.text(getUrlQuery("schema"));
  req();
  // Hides placeholder text
  $encoded.on("focus", onfocus);
  $url.on("focus", onfocus);
  $schema.on("focus", onfocus);
  $json.on("focus", onfocus);
  function onfocus() {
    var val = $(this).text();
    var id = $(this).attr("id");
    if (!val) {
      $(this).html(formattedEmptyMsg(emptyMsg[id]));
    } else if (val == emptyMsg[id]) {
      $(this).html("");
    }
  }
  // Shows placeholder text
  $encoded.on("blur", onblur).blur();
  $url.on("blur", onblur).blur();
  $schema.on("blur", onblur).blur();
  $json.on("blur", onblur).blur();
  $json.keyup(jsonConvert);
  $encoded.on("change", decoding);
  $encoded.keyup(decoding);
  $url.keyup(req);
  $schema.keyup(req);
  function onblur() {
    var val = $(this).text();
    var id = $(this).attr("id");
    // console.warn({ id, val });
    if (!val) {
      $(this).html(formattedEmptyMsg(emptyMsg[id]));
      return false;
      // $go.html(formattedEmptyMsg(emptyMsg["output"]));
    } else if (val == emptyMsg[id]) {
      return false;
    }
    return true;
  }
  $schema.keydown(preventTab);
  $json.keydown(preventTab);
  $go.click(selectGo);
  // Also do conversion when decimal preference changes
  $("#decimal").change(jsonConvert);
  // Also do conversion when inlining preference changes
  $("#inline").change(jsonConvert);
  // Also do conversion when omitempty preference changes
  $("#omitempty").change(jsonConvert);
  function jsonConversion() {
    // Automatically do the conversion on paste or change
    var input = $json.text().trim();
    if (!input || input == emptyMsg["input"]) {
      $("#output").html(formattedEmptyMsg(emptyMsg["output"]));
      return;
    }
    let output = JsonToGo(
      input,
      "RespBody",
      !$("#inline").is(":checked"),
      false,
      $("#omitempty").is(":checked"),
      $("#decimal").is(":checked")
    );
    if (output.error) {
      $("#output").html('<span class="clr-red">' + output.error + "</span>");
      console.log("ERROR:", output, output.error);
      var parsedError = output.error.match(
        /Unexpected token .+ in JSON at position (\d+)/
      );
      if (parsedError) {
        try {
          var faultyIndex =
            parsedError.length == 2 &&
            parsedError[1] &&
            parseInt(parsedError[1]);
          faultyIndex &&
            $("#output").html(
              constructJSONErrorHTML(output.error, faultyIndex, input)
            );
        } catch (err) {
          console.log(err);
        }
      }
      return;
    }
    var finalOutput = prefix + suffix(output, $url.text());
    // if (typeof gofmt === "function") finalOutput = gofmt(finalOutput);
    var coloredOutput = hljs.highlight("go", finalOutput);
    $("#output").html(coloredOutput.value);
    // console.error({ finalOutput, coloredOutput });
    emptyMsg["output"] = "Waiting input to generate...";
    changeURLArg("url", $url.text());
    window.history.replaceState(
      {},
      "",
      changeURLArg(
        "schema",
        encodeURIComponent($schema.text().replace(/\n/g, "%0A"))
      )
    );
    window.history.replaceState(
      {},
      "",
      changeURLArg("url", encodeURIComponent($url.text()))
    );
  }
  function jsonConvert() {
    jsonConversion();
  }
  function decoding() {
    var val = $encoded.text();
    if (val) {
      const splitted = decoder($encoded.text());
      const query = '{"query": "' + splitted[1] + '"}';
      $url.text(splitted[0]);
      $schema.text(query);
      req();
    }
  }
  function req() {
    let diff = new Date().getTime() - lastReq;
    if (diff < 1000) return;
    lastReq = new Date().getTime();
    opt = {
      method: $method.val(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Headers":
        //   "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, Origin, Cache-Control, X-Requested-With",
        // "Access-Control-Allow-Methods": "*",
        // "Access-Control-Allow-Credentials": "true",
      },
      body: $method.val() == "GET" ? undefined : $schema.text(),
      url: $url.text(),
    };
    if (cache[stringify(opt)]) {
      // console.log(cache, cache[stringify(opt)]);
      $json.text(cache[opt]);
      return;
    }
    fetch($url.text(), opt)
      .then((response) => response.json())
      .then((data) => {
        $json.text(stringify(data));
        cache[stringify(opt)] = stringify(data);
        jsonConversion();
      })
      .catch(() => forward(opt));
  }
  function forward(opt) {
    // const forwardUrl = "http://127.0.0.1:8080/data/req";
    const forwardUrl = "https://api.apex.exchange/v1/data/req";
    if ($url.text().startsWith(forwardUrl)) return;
    fetch(forwardUrl, {
      method: "POST",
      headers: opt.headers,
      body:
        "method=" +
        opt.method +
        "&url=" +
        encodeURIComponent($url.text()) +
        "&body=" +
        opt.body,
    })
      .then((response) => response.json())
      .then((data) => {
        $json.text(stringify(data));
        jsonConversion();
        cache[stringify(opt)] = stringify(data);
      })
      .catch((error) => console.error(error));
  }
});
