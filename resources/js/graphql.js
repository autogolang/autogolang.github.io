$(function () {
  const emptyInputMsg = "Paste JSON here";
  const emptyOutputMsg = "Go will appear here";
  const formattedEmptyInputMsg =
    '<span style="color: #777;">' + emptyInputMsg + "</span>";
  const formattedEmptyOutputMsg =
    '<span style="color: #777;">' + emptyOutputMsg + "</span>";
  const $encoded = $("#encoded");
  const $url = $("#url");
  const $schema = $("#schema");
  const $json = $("#input");
  function jsonConversion() {
    var input = $json.text().trim();
    if (!input || input == emptyInputMsg) {
      $("#output").html(formattedEmptyOutputMsg);
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
        } catch (e) {}
      }
    } else {
      var finalOutput = output.go;
      if (typeof gofmt === "function") finalOutput = gofmt(output.go);
      var coloredOutput = hljs.highlight("go", finalOutput);
      $("#output").html(coloredOutput.value);
    }
  }
  function jsonConvert() {
    jsonConversion();
  }
  function goPackage() {}
  // Hides placeholder text
  $json.on("focus", function () {
    var val = $(this).text();
    if (!val) {
      $(this).html(formattedEmptyInputMsg);
      $("#output").html(formattedEmptyOutputMsg);
    } else if (val == emptyInputMsg) $(this).html("");
  });
  // Shows placeholder text
  $json
    .on("blur", function () {
      var val = $(this).text();
      if (!val) {
        $(this).html(formattedEmptyInputMsg);
        $("#output").html(formattedEmptyOutputMsg);
      }
    })
    .blur();
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
    $schema.text(splitted[1]);
    PostRequest(splitted[0], splitted[1]).then(function (data) {
      console.log(data);
      $json.text(stringify(data));
    });
    jsonConversion();
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
