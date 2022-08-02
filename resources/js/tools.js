function addTag(str) {
  let tag =
    TAGS +
    ancestors +
    '(first:1000,orderBy:timestamp,skip:$skip,where:{timestamp_gte:$start,timestamp_lt:$end,amm_in:$pools})"`';
  return str + tag;
}
function suffix(go, url) {
  const ancestors = toProperCase(go.keys?.[0]||"resp");
  const ancestor = singularize(ancestors);
  return (
    go.go +
    `
func List` +
    ancestors +
    `(ctx context.Context, reqs ...*Get` +
    ancestors +
    `Filter) ([]` +
    ancestor +
    `, error) {
      ` +
    structuredClone +
    `
      var result Data
      const reqUpperLimit = 1000
      url` +
    ancestors +
    ` := "` +
    url +
    `"
      client := graphql.NewClient(url` +
    ancestors +
    `, nil)
      if len(reqs) == 0 {
        reqs = append(reqs, &Get` +
    ancestors +
    `Filter{})
      }
      req := reqs[0]
      if req.First == 0 {
        req.First = reqUpperLimit
      }
      if req.TimeEnd.IsZero() {
        req.TimeEnd = time.Now()
      }
      vars := map[string]interface{}{
        "first": graphql.Int(req.First),
        "skip":  graphql.Int(req.Skip),
        "start": graphql.Int(req.TimeStart.Unix()),
        "end":   graphql.Int(req.TimeEnd.Unix()),
      }
      if err := client.Query(ctx, &result, vars); err != nil {
        return nil, err
      }
      // if there are result.` +
    ancestors +
    ` over reqUpperLimit, query again
      if len(result.` +
    ancestors +
    `) == reqUpperLimit {
        req.Skip += reqUpperLimit
        queue, err := List` +
    ancestors +
    `(ctx, req)
        if err != nil {
          return nil, err
        }
        result.` +
    ancestors +
    ` = append(result.` +
    ancestors +
    `, queue...)
      }
      return result.` +
    ancestors +
    `, nil
    }
    
`
  );
}
const prefix = `
import (
	"context"
	"time"

	"github.com/conbanwa/graphql"
	"github.com/shopspring/decimal"
)
`;

function decoder(encoded) {
  const splitter = "/graphql";
  var splitted = encoded.split(splitter);
  var query = decodeURIComponent(splitted[1]).replace("?query=", " ");
  return [splitted[0], query];
}
function GetRequest(url, data) {
  return $.ajax({
    type: "GET",
    url: url,
    data: data,
    contentType: "application/json",
    dataType: "json",
    origin: "*",
  });
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
function changeURLArg(arg, arg_val) {
  const url = location.href;
  var pattern = arg + "=([^&]*)";
  var replaceText = arg + "=" + arg_val;
  if (url.match(pattern)) {
    var tmp = "/(" + arg + "=)([^&]*)/gi";
    tmp = url.replace(eval(tmp), replaceText);
    return tmp;
  } else {
    if (url.match("[?]")) {
      return url + "&" + replaceText;
    } else {
      return url + "?" + replaceText;
    }
  }
}
function getUrlQuery(arg) {
  var url = location.search; //获取url中"?"符后的字串
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      if (arg == strs[i].split("=")[0]) {
        return unescape(strs[i].split("=")[1]);
      }
    }
  }
}
function lintName(name) {
  if (name === "id") return "ID";
  name = name.replace(/Id[A_Z]/g, "ID");
  name = name.replace(/Id$/g, "ID");
  //implement lint
  return name[0].toUpperCase() + name.slice(1);
}
function singularize(name) {
  if (name.endsWith("ies")) {
    return name.slice(0, -3) + "y";
  } else if (name.endsWith("s")) {
    return name.slice(0, -1);
  }
  return name;
}
