function camelCaseToUnderscore(params) {
  return params.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}
function lowerInitial(string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}
const packageName = 'gql'
function suffix(go, url) {
  const Ancestors = toProperCase(go.keys?.[0] || 'resp'),
    Ancestor = singularize(Ancestors),
    ancestors = lowerInitial(Ancestors),
    AncestorsFilter = Ancestors + 'Filter',
    ancestors_under_score = camelCaseToUnderscore(Ancestors),
    AncestorsTitleCase = ancestors_under_score.replace(/_/g, ' '),
    ancestorLispCase = ancestors_under_score.replace(/_/g, '-')
  const goStruct =
    Ancestors +
    ' []' +
    Ancestor +
    TAGS +
    ancestors +
    '(first:$first,skip:$skip,orderBy:$orderBy,orderDirection:$orderDirection,where:{})"`'
  const filter =
    `type ` +
    AncestorsFilter +
    ` struct {
      graphql.Filter
    }`
  const swaggo =
    `// r.GET("graph/` +
    ancestors +
    `", middleware.Handler(` +
    packageName +
    `.` +
    Ancestors +
    `))
    // @tags    graphql
    // @Summary get ` +
    AncestorsTitleCase +
    `
    // @Produce json
    // @Param   first      query    string false "first"
    // @Param   skip       query    string false "skip"
    // @Param   time_start query    string false "time_start"
    // @Param   time_end   query    string false "time_end"
    // @Param   order_by   query    string false "order_by"
    // @Success 200        {object} middleware.R
    // @Success 302        {object} []` +
    Ancestor +
    ` "the structure in data of code 200 above, <br> click "Model" to view field details."
    // @Router  /graph/` +
    ancestorLispCase +
    ` [get]
    func ` +
    Ancestors +
    `(c *middleware.Context) string {
    if c == nil {
      return "` +
    ancestorLispCase +
    `"
    }
    filter := graphql.Filter{
      First:        c.QueryInt("first"),
      Skip:         c.QueryInt("skip"),
      OrderBy:      c.Query("order_by"),
      OrderDescend: c.Query("order_descend") == "true",
    }
    c.JsonList(List` +
    Ancestors +
    `(c.Request.Context(), &` +
    AncestorsFilter +
    `{Filter: filter}))
    return ""
    }
    `
  return (
    go.go.replace(Ancestors, Ancestor).replace(/type Data struct \{\n.*\n.*/, '') +
    filter +
    `
func List` +
    Ancestors +
    `(ctx context.Context, reqs ...*` +
    AncestorsFilter +
    `) ([]` +
    Ancestor +
    `, error) {
      var result struct {
        ` +
    goStruct +
    `
      }
      const reqUpperLimit = 1000
      url` +
    Ancestors +
    ` := "` +
    url +
    `"
      client := graphql.NewClient(url` +
    Ancestors +
    `, nil)
      if len(reqs) == 0 {
        reqs = append(reqs, &` +
    AncestorsFilter +
    `{})
      }
      req := reqs[0]
      if req.First == 0 {
        req.First = reqUpperLimit
      }
      if req.OrderBy == "" {
        req.OrderBy = "id"
      }
      orderDirection := "asc"
      if req.OrderDescend{
        orderDirection = "desc"
      }
      vars := map[string]interface{}{
        "first": graphql.Int(req.First),
        "skip":  graphql.Int(req.Skip),
        "orderBy": graphql.String(req.OrderBy),
        "orderDirection": graphql.String(orderDirection),
      }
      if err := client.Query(ctx, &result, vars); err != nil {
        return nil, err
      }
      // if there are result.` +
    Ancestors +
    ` over reqUpperLimit, query again
      if len(result.` +
    Ancestors +
    `) == reqUpperLimit {
        req.Skip += reqUpperLimit
        queue, err := List` +
    Ancestors +
    `(ctx, req)
        if err != nil {
          return nil, err
        }
        result.` +
    Ancestors +
    ` = append(result.` +
    Ancestors +
    `, queue...)
      }
      return result.` +
    Ancestors +
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
