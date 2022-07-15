$(function () {
  const emptyInputMsg = "Paste JSON here";
  const emptyOutputMsg = "Go will appear here";
  const formattedEmptyInputMsg =
    '<span style="color: #777;">' + emptyInputMsg + "</span>";
  const formattedEmptyOutputMsg =
    '<span style="color: #777;">' + emptyOutputMsg + "</span>";
  function jsonConversion() {
    var input = $("#input").text().trim();
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
  // Hides placeholder text
  $("#input").on("focus", function () {
    var val = $(this).text();
    if (!val) {
      $(this).html(formattedEmptyInputMsg);
      $("#output").html(formattedEmptyOutputMsg);
    } else if (val == emptyInputMsg) $(this).html("");
  });
  // Shows placeholder text
  $("#input")
    .on("blur", function () {
      var val = $(this).text();
      if (!val) {
        $(this).html(formattedEmptyInputMsg);
        $("#output").html(formattedEmptyOutputMsg);
      }
    })
    .blur();
  // If tab is pressed, insert a tab instead of focusing on next element
  $("#input").keydown(function (e) {
    if (e.keyCode == 9) {
      document.execCommand("insertHTML", false, "&#009"); // insert tab
      e.preventDefault(); // don't go to next element
    }
  });
  // Automatically do the conversion on paste or change
  $("#input").keyup(function () {
    jsonConversion();
  });
  // Also do conversion when inlining preference changes
  $("#inline").change(function () {
    jsonConversion();
  });
  // Also do conversion when omitempty preference changes
  $("#omitempty").change(function () {
    jsonConversion();
  });
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
