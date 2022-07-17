function addTag(str) {
  let tag =
    TAGS +
    ancestor +
    '(first:1000,orderBy:timestamp,skip:$skip,where:{timestamp_gte:$start,timestamp_lt:$end,amm_in:$pools})"`';
  return str + tag;
}
function suffix(go, url) {
  const ancestor = toProperCase(go.keys[0]);
  return (
    go.go +
    `
func List` +
    ancestor +
    `(ctx context.Context, req *Get` +
    ancestor +
    `Req) ([]*` +
    ancestor +
    `, error) {
	client := graphql.NewClient("` +
    url +
    `, nil)

	var result Data

	vars := map[string]interface{}{
		"start": graphql.Int(req.TimeStart.Unix()),
		"end":   graphql.Int(req.TimeEnd.Unix()),
		"skip":  graphql.Int(req.Skip),
		"pools": req.Pools,
	}

	if err := client.Query(ctx, &result, vars); err != nil {
		return nil, err
	}

	// put query res into logs
	var logs []*` +
    ancestor +
    `
	logs = append(logs, result.` +
    ancestor +
    `...)
	// if there are more logs, query again
	if len(result.` +
    ancestor +
    `) == 1000 {
		req.Skip = req.Skip + 1000
		moreLogs, err := List` +
    ancestor +
    `(ctx, req)
		if err != nil {
			return nil, err
		}
		logs = append(logs, moreLogs...)
	}

	return logs, nil
}
`
  );
}
const prefix = `
import (
	"context"

	"github.com/shopspring/decimal"
	"github.com/shurcooL/graphql"
)
`;

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
