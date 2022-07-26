$(function()
{
	const emptyInputMsg = "Paste YAML here";
	const emptyOutputMsg = "Go will appear here";
	const formattedEmptyInputMsg = '<span style="color: #777;">'+emptyInputMsg+'</span>';
	const formattedEmptyOutputMsg = '<span style="color: #777;">'+emptyOutputMsg+'</span>';

	function doConversion()
	{
		var input = $('#input').val().trim();
		if (!input || input == emptyInputMsg)
		{
			$('#output').html(formattedEmptyOutputMsg);
			return;
		}

		let output = yamlToGo(input, $('#struct').val().trim(), !$('#inline').is(':checked'), false);

		if (output.error)
		{
			$('#output').html('<span class="clr-red">'+output.error+'</span>');
			console.log("ERROR:", output, output.error);
			var parsedError = output.error.match(/Unexpected token .+ in YAML at position (\d+)/);
			if (parsedError) {
				try {
					var faultyIndex = parsedError.length == 2 && parsedError[1] && parseInt(parsedError[1]);
					faultyIndex && $('#output').html(constructJSONErrorHTML(output.error, faultyIndex, input));
				} catch(e) {}
			}
		}
		else
		{
			var finalOutput = output.go;
			if (typeof gofmt === 'function')
				finalOutput = gofmt(output.go);
			var coloredOutput = hljs.highlight("go", finalOutput);
			$('#output').html(coloredOutput.value);
		}
	}

	// Hides placeholder text
	$('#input').on('focus', function()
	{
		var val = $(this).val();
		if (!val)
		{
			$(this).val(emptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
		else if (val == emptyInputMsg)
			$(this).val("");
	});

	// Shows placeholder text
	$('#input').on('blur', function()
	{
		var val = $(this).val();
		if (!val)
		{
			$(this).val(emptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
	}).blur();

	// If tab is pressed, insert a tab instead of focusing on next element
	$('#input').keydown(function(e)
	{
		if (e.keyCode == 9)
		{
			document.execCommand('insertHTML', false, '&#009'); // insert tab
			e.preventDefault(); // don't go to next element
		}
	});

	// Automatically do the conversion on paste or change
	$('#input').keyup(function()
	{
		doConversion();
	});

	// Also do conversion when inlining preference changes
	$('#inline').change(function()
	{
		doConversion();
	})

	// Highlights the output for the user
	$('#output').click(function()
	{
		if (document.selection)
		{
			var range = document.body.createTextRange();
			range.moveToElementText(this);
			range.select();
		}
		else if (window.getSelection)
		{
			var range = document.createRange();
			range.selectNode(this);
			var sel = window.getSelection();
			sel.removeAllRanges(); // required as of Chrome 60: https://www.chromestatus.com/features/6680566019653632
			sel.addRange(range);
		}
	});

	// Fill in sample JSON if the user wants to see an example
	$('#sample1').click(function()
	{
		$('#input').val(sampleYaml1).keyup();
	});
	$('#sample2').click(function()
	{
		$('#input').val(sampleYaml2).keyup();
	});

	var dark = false;
	$("#dark").click(function()
	{
		if(!dark)
		{
			$("head").append("<link rel='stylesheet' href='resources/css/dark.css' id='dark-css'>");
			$("#dark").html("light mode");
		} else
		{
			$("#dark-css").remove();
			$("#dark").html("dark mode");
		}
		dark = !dark;
	});

	// Copy contents of the output to clipboard
	$("#copy-btn").click(function() {
		var elm = document.getElementById("output");

		if(document.body.createTextRange) {
			// for ie
			var range = document.body.createTextRange();

			range.moveToElementText(elm);
			range.select();

			document.execCommand("Copy");
		} else if(window.getSelection) {
			// other browsers
			var selection = window.getSelection();
			var range = document.createRange();

			range.selectNodeContents(elm);
			selection.removeAllRanges();
			selection.addRange(range);

			document.execCommand("Copy");
		}
	})
});

function constructJSONErrorHTML(rawErrorMessage, errorIndex, json) {
	var errorHeading = '<p><span class="clr-red">'+ rawErrorMessage +'</span><p>';
	var markedPart = '<span class="json-go-faulty-char">' + json[errorIndex] + '</span>';
	var markedJsonString = [json.slice(0, errorIndex), markedPart, json.slice(errorIndex+1)].join('');
	var jsonStringLines = markedJsonString.split(/\n/);
	for(var i = 0; i < jsonStringLines.length; i++) {

		if(jsonStringLines[i].indexOf('<span class="json-go-faulty-char">') > -1)  // faulty line
			var wrappedLine = '<div class="faulty-line">' + jsonStringLines[i] + '</div>';
		else 
			var wrappedLine = '<div>' + jsonStringLines[i] + '</div>';

		jsonStringLines[i] = wrappedLine;
	}
	return (errorHeading + jsonStringLines.join(''));
}

// From the Gitlab CI sample
// https://gitlab.com/gitlab-org/gitlab-foss/blob/master/lib/gitlab/ci/templates/Go.gitlab-ci.yml
var sampleYaml1 = "image: golang:latest\n" +
                  "\n" +
                  "variables:\n" +
                  "  # Please edit to your GitLab project\n" +
                  "  REPO_NAME: gitlab.com/namespace/project\n" +
                  "\n" +
                  "# The problem is that to be able to use go get, one needs to put\n" +
                  "# the repository in the $GOPATH. So for example if your gitlab domain\n" +
                  "# is gitlab.com, and that your repository is namespace/project, and\n" +
                  "# the default GOPATH being /go, then you'd need to have your\n" +
                  "# repository in /go/src/gitlab.com/namespace/project\n" +
                  "# Thus, making a symbolic link corrects this.\n" +
                  "before_script:\n" +
                  "  - mkdir -p $GOPATH/src/$(dirname $REPO_NAME)\n" +
                  "  - ln -svf $CI_PROJECT_DIR $GOPATH/src/$REPO_NAME\n" +
                  "  - cd $GOPATH/src/$REPO_NAME\n" +
                  "\n" +
                  "stages:\n" +
                  "  - test\n" +
                  "  - build\n" +
                  "  - deploy\n" +
                  "\n" +
                  "format:\n" +
                  "  stage: test\n" +
                  "  script:\n" +
                  "    - go fmt $(go list ./... | grep -v /vendor/)\n" +
                  "    - go vet $(go list ./... | grep -v /vendor/)\n" +
                  "    - go test -race $(go list ./... | grep -v /vendor/)\n" +
                  "\n" +
                  "compile:\n" +
                  "  stage: build\n" +
                  "  script:\n" +
                  "    - go build -race -ldflags \"-extldflags '-static'\" -o $CI_PROJECT_DIR/mybinary\n" +
                  "  artifacts:\n" +
                  "    paths:\n" +
                  "      - mybinary\n";
              
// From the GCP Node.js startup script sample
var sampleYaml2 = "runtime: nodejs10\n" +
                  "\n" +
                  "instance_class: F2\n" +
                  "\n" +
                  "env_variables:\n" +
                  "  BUCKET_NAME: \"example-gcs-bucket\"\n" +
                  "\n" +
                  "handlers:\n" +
                  "- url: /stylesheets\n" +
                  "  static_dir: stylesheets\n" +
                  "\n" +
                  "- url: /.*\n" +
                  "  secure: always\n" +
                  "  redirect_http_response_code: 301\n" +
                  "  script: auto";
