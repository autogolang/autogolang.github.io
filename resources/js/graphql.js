emptyMsg['encoded'] = 'Paste full URL here'
emptyMsg['url'] = 'Paste Post Request URL here'
emptyMsg['schema'] = 'Paste GraphQL Schema here'
emptyMsg['input'] = 'JSON will appear here'
var TAGS = ' `graphql:"'
$(function () {
  const $encoded = $('#encoded')
  const $url = $('#url')
  const $schema = $('#schema')
  const $json = $('#input')
  const $go = $('#output')
  $url.text(getUrlQuery('url'))
  $schema.text(getUrlQuery('schema'))
  req()
  // Hides placeholder text
  $encoded.on('focus', onfocus)
  $url.on('focus', onfocus)
  $schema.on('focus', onfocus)
  $json.on('focus', onfocus)
  function onfocus() {
    var val = $(this).text()
    var id = $(this).attr('id')
    if (!val) {
      $(this).html(formattedEmptyMsg(emptyMsg[id]))
    } else if (val == emptyMsg[id]) {
      $(this).html('')
    }
  }
  // Shows placeholder text
  $encoded.on('blur', onblur).blur()
  $url.on('blur', onblur).blur()
  $schema.on('blur', onblur).blur()
  $json.on('blur', onblur).blur()
  $json.keyup(jsonConvert)
  $encoded.on('change', decoding)
  $encoded.keyup(decoding)
  $url.keyup(req)
  $schema.keyup(req)
  function onblur() {
    var val = $(this).text()
    var id = $(this).attr('id')
    // console.warn({ id, val });
    if (!val) {
      $(this).html(formattedEmptyMsg(emptyMsg[id]))
      return false
      // $go.html(formattedEmptyMsg(emptyMsg["output"]));
    } else if (val == emptyMsg[id]) {
      return false
    }
    return true
  }
  $schema.keydown(preventTab)
  $json.keydown(preventTab)
  $go.click(selectGo)
  // Also do conversion when decimal preference changes
  $('#decimal').change(jsonConvert)
  // Also do conversion when omitempty preference changes
  $('#omitempty').change(jsonConvert)
  function jsonConversion() {
    // Automatically do the conversion on paste or change
    var input = $json.text().trim()
    if (!input || input == emptyMsg['input']) {
      $('#output').html(formattedEmptyMsg(emptyMsg['output']))
      return
    }
    let output = JsonToGo(input, '', true, false, $('#omitempty').is(':checked'), $('#decimal').is(':checked'), true)
    if (output.error) {
      $('#output').html('<span class="clr-red">' + output.error + '</span>')
      console.log('ERROR:', output, output.error)
      var parsedError = output.error.match(/Unexpected token .+ in JSON at position (\d+)/)
      if (parsedError) {
        try {
          var faultyIndex = parsedError.length == 2 && parsedError[1] && parseInt(parsedError[1])
          faultyIndex && $('#output').html(constructJSONErrorHTML(output.error, faultyIndex, input))
        } catch (err) {
          console.log(err)
        }
      }
      return
    }
    var strOutput = prefix + suffix(output, $url.text())
    if (typeof gofmt === "function") finalOutput = gofmt(strOutput);
    var coloredOutput = hljs.highlight('go', finalOutput)
    console.error({strOutput, finalOutput, coloredOutput });
    if(finalOutput.length<strOutput.length/2)coloredOutput.value=strOutput
    $('#output').html(coloredOutput.value)
    emptyMsg['output'] = 'Waiting input to generate...'
    console.log('output', changeURLArg('url', $url.text()))
    window.history.replaceState({}, '', changeURLArg('schema', $schema.text().replace(/\n/g, '%0A')))
    window.history.replaceState({}, '', changeURLArg('url', $url.text()))
  }
  function jsonConvert() {
    jsonConversion()
  }
  function decoding() {
    var val = $encoded.text()
    if (val) {
      const splitted = decoder($encoded.text())
      const query = '{"query": "' + splitted[1] + '"}'
      $url.text(splitted[0])
      $schema.text(query)
      req()
    }
  }
  function req() {
    let diff = new Date().getTime() - lastReq
    if (diff < 1000) return
    lastReq = new Date().getTime()
    PostRequest($url.text(), $schema.text().replace(/[\u0000-\u001F]/g, ' '))
      .then(function (data) {
        console.log(data)
        $json.text(stringify(data))
      })
      .then(jsonConvert)
  }
})
