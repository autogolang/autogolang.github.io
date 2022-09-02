function camelCaseToUnderscore(params) {
  return params.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}
function lowerInitial(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}
const packageName = 'gql'
function suffix(go, url) {
  const ancestors = toProperCase(go.keys?.[0] || 'resp'),
    ancestor = singularize(ancestors),
    ancestorsFilter = ancestors + 'Filter',
    ancestor_under_score = camelCaseToUnderscore(ancestors),
    ancestorSpace = ancestor_under_score.replace(/_/g, ' ')
  const goStruct =
    ancestors +
    ' []' +
    ancestor +
    TAGS +
    ancestors +
    '(first:$first,orderBy:$orderBy,skip:$skip,where:{timestamp_gte:$start,timestamp_lt:$end})"`'
  const filter =
    `type ` +
    ancestorsFilter +
    ` struct {
      graphql.Filter
    }`
  const swaggo =
    `// r.GET("graph/` +
    ancestor_under_score +
    `", ctx.Handler(` +
    packageName +
    `.` +
    ancestors +
    `))
    // @tags    graphql
    // @Summary get ` +
    ancestorSpace +
    `
    // @Produce json
    // @Param   first      query    string false "first"
    // @Param   skip       query    string false "skip"
    // @Param   time_start query    string false "time_start"
    // @Param   time_end   query    string false "time_end"
    // @Param   order_by   query    string false "order_by"
    // @Success 200        {object} ctx.R
    // @Success 302        {object} []` +
    ancestor +
    ` "the structure in data of code 200 above, <br> click "Model" to view field details."
    // @Router  /graph/` +
    ancestor_under_score +
    ` [get]
    func ` +
    ancestors +
    `(c *ctx.Context) {
      filter := graphql.Filter{
        First:     c.QueryInt("first"),
        Skip:      c.QueryInt("skip"),
        TimeStart: c.QueryInt("time_start"),
        TimeEnd:   c.QueryInt("time_end"),
        OrderBy:   c.Query("order_by"),
      }
      c.JsonRows(List` +
    ancestors +
    `(c.Request.Context(), &` +
    ancestorsFilter +
    `{Filter: filter}))
    }
    `
  return (
    go.go.replace(ancestors, ancestor).replace(/type Data struct \{\n.*\n.*/, '') +
    filter +
    `
func List` +
    ancestors +
    `(ctx context.Context, reqs ...*` +
    ancestorsFilter +
    `) ([]` +
    ancestor +
    `, error) {
      var result struct {
        ` +
    goStruct +
    `
      }
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
        reqs = append(reqs, &` +
    ancestorsFilter +
    `{})
      }
      req := reqs[0]
      if req.First == 0 {
        req.First = reqUpperLimit
      }
      if req.TimeEnd==0 {
        req.TimeEnd = int(time.Now().Unix())
      }
      vars := map[string]interface{}{
        "first": graphql.Int(req.First),
        "skip":  graphql.Int(req.Skip),
        "start": graphql.Int(req.TimeStart),
        "end":   graphql.Int(req.TimeEnd),
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
    
` +
    swaggo
  )
}
const prefix =
  `package ` +
  packageName +
  `

import (
	"context"
	"time"

	"github.com/conbanwa/graphql"
	"github.com/shopspring/decimal"
)
`

function decoder(encoded) {
  const splitter = '/graphql'
  var splitted = encoded.split(splitter)
  var query = decodeURIComponent(splitted[1]).replace('?query=', ' ')
  return [splitted[0], query]
}
function GetRequest(url, data) {
  return $.ajax({
    type: 'GET',
    url: url,
    data: data,
    contentType: 'application/json',
    dataType: 'json',
    origin: '*',
  })
}
function PostRequest(url, data) {
  return $.ajax({
    type: 'POST',
    url: url,
    data: data,
    contentType: 'application/json',
    dataType: 'json',
  })
}
function changeURLArg(arg, arg_val) {
  const url = location.href
  var pattern = arg + '=([^&]*)'
  var replaceText = arg + '=' + arg_val
  if (url.match(pattern)) {
    var tmp = '/(' + arg + '=)([^&]*)/gi'
    tmp = url.replace(eval(tmp), replaceText)
    return tmp
  } else {
    if (url.match('[?]')) {
      return url + '&' + replaceText
    } else {
      return url + '?' + replaceText
    }
  }
}
function getUrlQuery(arg) {
  var url = location.search //获取url中"?"符后的字串
  if (url.indexOf('?') != -1) {
    var str = url.substr(1)
    strs = str.split('&')
    for (var i = 0; i < strs.length; i++) {
      if (arg == strs[i].split('=')[0]) {
        return unescape(strs[i].split('=')[1])
      }
    }
  }
}
function lintName(name) {
  if (name === 'id') return 'ID'
  name = name.replace(/Id[A_Z]/g, 'ID')
  name = name.replace(/Id$/g, 'ID')
  //implement lint
  return name[0].toUpperCase() + name.slice(1)
}
function singularize(name) {
  if (name.endsWith('ies')) {
    return name.slice(0, -3) + 'y'
  } else if (name.endsWith('s')) {
    return name.slice(0, -1)
  }
  return name
}
