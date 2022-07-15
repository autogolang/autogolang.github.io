const tags = ' `graphql:"';
emptyMsg["encoded"] = "Paste full URL here";
emptyMsg["url"] = "Paste Post Request URL here";
emptyMsg["schema"] = "Paste GraphQL Schema here";

$(function () {
  const $encoded = $("#encoded");
  const $url = $("#url");
  const $schema = $("#schema");
  const $json = $("#input");
  function jsonConversion() {
    var input = $json.text().trim();
    if (!input || input == emptyMsg["input"]) {
      $("#output").html(formattedEmptyMsg(emptyMsg["output"]));
      return;
    }
    let output = JsonToGo(
      input,
      "",
      !$("#inline").is(":checked"),
      false,
      $("#omitempty").is(":checked")
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
    var finalOutput = output.go;
    if (typeof gofmt === "function") finalOutput = gofmt(finalOutput);
    var coloredOutput = hljs.highlight("go", finalOutput);
    $("#output").html(coloredOutput.value);
    console.log({ finalOutput, coloredOutput });
  }
  function jsonConvert() {
    jsonConversion();
  }
  function goPackage() {}
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
  function onblur(func) {
    var val = $(this).text();
    var id = $(this).attr("id");
    console.warn({ id, val });
    if (!val) {
      $(this).html(formattedEmptyMsg(emptyMsg[id]));
      $("#output").html(formattedEmptyMsg(emptyMsg["output"]));
    }
    if (typeof func == "function") func();
  }
  // If tab is pressed, insert a tab instead of focusing on next element
  function preventTab(e) {
    if (e.keyCode == 9) {
      document.execCommand("insertHTML", false, "&#009"); // insert tab
      e.preventDefault(); // don't go to next element
    }
  }
  $json.keydown(preventTab);
  $schema.keydown(preventTab);
  // Automatically do the conversion on paste or change
  $json.keyup(jsonConvert);
  $encoded.keyup(function () {
    const splitted = decoder($encoded.text());
    $url.text(splitted[0]);
    const query = '{"query": "' + splitted[1] + '"}';
    $schema.text(query);
    PostRequest(splitted[0], query.replace(/[\u0000-\u001F]/g, " "))
      .then(function (data) {
        console.log(data);
        $json.text(stringify(data));
      })
      .then(jsonConvert);
  });
  // Also do conversion when inlining preference changes
  $("#inline").change(jsonConvert);
  // Also do conversion when omitempty preference changes
  $("#omitempty").change(jsonConvert);
  // Highlights the output for the user
  $("#output").click(function () {
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(this);
      range.select();
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(this);
      var sel = window.getSelection();
      sel.removeAllRanges(); // required as of Chrome 60: https://www.chromestatus.com/features/6680566019653632
      sel.addRange(range);
    }
  });
});
