emptyMsg['input'] = 'Paste JSON here'
$(function () {
  const $json = $('#input')
  const $go = $('#output')
  // Hides placeholder text
  $json.on('focus', function () {
    var val = $(this).text()
    if (!val) {
      $(this).html(formattedEmptyMsg(emptyMsg['input']))
      $go.html(formattedEmptyMsg(emptyMsg['output']))
    } else if (val == emptyMsg['input']) $(this).html('')
  })
  // Shows placeholder text
  $json
    .on('blur', function () {
      var val = $(this).text()
      if (!val) {
        $(this).html(formattedEmptyMsg(emptyMsg['input']))
        $go.html(formattedEmptyMsg(emptyMsg['output']))
      }
    })
    .blur()
  $json.keyup(jsonConvert)
  // If tab is pressed, insert a tab instead of focusing on next element
  $json.keydown(preventTab)
  $go.click(selectGo)
  // Also do conversion when inlining preference changes
  $('#inline').change(jsonConvert)
  // Also do conversion when omitempty preference changes
  $('#omitempty').change(jsonConvert)
  // Also do conversion when decimal preference changes
  $('#decimal').change(jsonConvert)
  function jsonConversion() {
    // Automatically do the conversion on paste or change
    var input = $json.text().trim()
    if (!input || input == emptyMsg['input']) {
      $go.html(formattedEmptyMsg(emptyMsg['output']))
      return
    }
    let output = JsonToGo(
      input,
      $('#struct').val(),
      !$('#inline').is(':checked'),
      false,
      $('#omitempty').is(':checked'),
      $('#decimal').is(':checked')
    )
    if (output.error) {
      $go.html('<span class="clr-red">' + output.error + '</span>')
      x({output})
      var parsedError = output.error.match(/Unexpected token .+ in JSON at position (\d+)/)
      if (parsedError) {
        try {
          var faultyIndex = parsedError.length == 2 && parsedError[1] && parseInt(parsedError[1])
          faultyIndex && $go.html(constructJSONErrorHTML(output.error, faultyIndex, input))
        } catch (e) {}
      }
    } else {
      var finalOutput = output.go
      finalOutput = gofmt?.(output.go)
      var coloredOutput = hljs.highlight('go', finalOutput)
      $go.html(coloredOutput.value)
    }
    emptyMsg['output'] = 'Waiting input to generate...'
  }
  function jsonConvert() {
    jsonConversion()
  }
})
