const FromGraphQL = false;
const TAGS = ' `json:"';
emptyMsg["input"] = "Paste JSON here";
$(function () {
  const $json = $("#input");
  const $go = $("#output");
  function jsonConvert() {
    jsonConversion();
  }
  function jsonConversion() {
    var input = $json.text().trim();
    if (!input || input == emptyMsg["input"]) {
      $go.html(formattedEmptyMsg(emptyMsg["output"]));
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
      $go.html('<span class="clr-red">' + output.error + "</span>");
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
            $go.html(constructJSONErrorHTML(output.error, faultyIndex, input));
        } catch (e) {}
      }
    } else {
      var finalOutput = output.go;
      if (typeof gofmt === "function") finalOutput = gofmt(output.go);
      var coloredOutput = hljs.highlight("go", finalOutput);
      $go.html(coloredOutput.value);
    }
    emptyMsg["output"] = "Waiting input to generate...";
  }
  // Hides placeholder text
  $json.on("focus", function () {
    var val = $(this).text();
    if (!val) {
      $(this).html(formattedEmptyMsg(emptyMsg["input"]));
      $go.html(formattedEmptyMsg(emptyMsg["output"]));
    } else if (val == emptyMsg["input"]) $(this).html("");
  });
  // Shows placeholder text
  $json
    .on("blur", function () {
      var val = $(this).text();
      if (!val) {
        $(this).html(formattedEmptyMsg(emptyMsg["input"]));
        $go.html(formattedEmptyMsg(emptyMsg["output"]));
      }
    })
    .blur();
  // If tab is pressed, insert a tab instead of focusing on next element
  $json.keydown(function (e) {
    if (e.keyCode == 9) {
      document.execCommand("insertHTML", false, "&#009"); // insert tab
      e.preventDefault(); // don't go to next element
    }
  });
  // Automatically do the conversion on paste or change
  $json.keyup(jsonConvert);
  // Also do conversion when inlining preference changes
  $("#inline").change(jsonConvert);
  // Also do conversion when omitempty preference changes
  $("#omitempty").change(jsonConvert);
  $go.click(selectGo);
});
