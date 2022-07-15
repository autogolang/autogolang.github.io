function decoder(encoded) {
  const splitter = "/graphql";
  var splitted = encoded.split(splitter);
  var query = decodeURIComponent(splitted[1]).replace("?query=", " ");
  return [splitted[0], query];
}
function PostRequest(url, data) {
  return $.ajax({
    type: "POST",
    url: url,
    data: data,
    contentType: "application/json",
    dataType: "json",
  });
}
