const express = require('express')
const axios = require('axios');
const cors = require('cors')
const app = express()
const port = 3001
const URL = "https://raw.githubusercontent.com/hodcroftlab/covariants/master/cluster_tables/USAClusters_data.json";
//const DataFrame = require('pandas-js')

function processData(ALL_JSON) {
  //console.log(ALL_JSON)
  const rename_columns = {
      "20I (Alpha, V1)": "Alpha", "20H (Beta, V2)": "Beta", "20J (Gamma, V3)": "Gamma",
      "21K (Omicron)": "Omicron", "21B (Kappa)": "Kappa", "21D (Eta)": "Eta", "21G (Lambda)": "Lambda",
      "21F (Iota)": "Iota"
  }
  // // let ALL_DF = new DataFrame()
  const build_obj = []
  for (const county in ALL_JSON) {
      // console.log( ALL_JSON[county] )
      const length = ALL_JSON[county].week.length
      const covkeys = Object.keys(ALL_JSON[county])
      // const build_obj = []
      for (var i in [...Array(length).keys()]) {
          const obj = {};
          let others = 0
          let delta = 0
          let total = 0
          let total_sequences = 0
          for (var K of covkeys) {
              if (['20A/S:98F', '21H (Mu)', '20B/S:732A', '20A/S:126A', '20E (EU1)',
                  '21C (Epsilon)', '20A/S:439K', 'S:677H.Robin1', 'S:677P.Pelican',
                  '20A.EU2', '20G/S:677H.Robin2', '20G/S:677H.Yellowhammer',
                  '20G/S:677R.Roadrunner', '20G/S:677H.Heron', '20G/S:677H.Bluebird',
                  '20G/S:677H.Quail', '20G/S:677H.Mockingbird'].indexOf(K) >= 0) {
                  others = others + ALL_JSON[county][K][i]
              } else if (['21A (Delta)', '21I (Delta)', '21J (Delta)'].indexOf(K) >= 0) {
                  delta = delta + ALL_JSON[county][K][i]
              } else if (K === "total_sequences") {
                  total_sequences = ALL_JSON[county][K][i]
                  continue
              } else if (K === "week") {
                  obj["week"] = ALL_JSON[county][K][i]
                  continue
              } else {
                  obj[rename_columns[K]] = ALL_JSON[county][K][i]
              }
              total = total + ALL_JSON[county][K][i]
          }
          obj["Delta"] = delta
          obj["others"] = others
          obj["non_variants"] = total_sequences - total
          obj["county"] = county
          build_obj.push(obj)
      }
      //console.log(build_obj)
  //     // const city_DF = new DataFrame(build_obj)
  //     // console.log( city_DF.toString() )
  //     // ALL_DF = ALL_DF.append(city_DF, true)
  }

  //let ALL_USA_JSON = [];

  //let ALL_col = ["Alpha","Beta","Gamma","Omicron","Kappa","Eta","Iota","Lambda","others","Delta","non_variants"];
  // let Need_DF = ALL_DF.get(ALL_col)

  // let week_set = new Set(ALL_DF.get('week').values)
  // const week_list = [...week_set]

  // for (var week_date of week_list) {
  //     const WEEK_JSON = {}
  //     const WEEK_JSON_T = Need_DF.filter(ALL_DF.get("week").eq(week_date));

  //     for (var col of ALL_col){
  //         let now_list = WEEK_JSON_T.get(col).values
  //         let total = 0
  //         for (var t of now_list){
  //             if(!isNaN(t)){
  //                 total = total + t
  //             }
  //         }
  //         // console.log(now_list)
  //         WEEK_JSON[col] = total;
  //     }
  //     WEEK_JSON["week"] = week_date
  //     ALL_USA_JSON.push( WEEK_JSON )
  // }
  // console.log( ALL_USA_JSON )

  // return [ ALL_DF, ALL_USA_JSON]
  return [build_obj]
}


app.use(cors())
app.get('/', (req, res) => {
  // res.send('Hello World!')
  axios.get(`${URL}`)
  .then(function (response) {
    //console.log(processData(response.data.countries));
    const result = processData(response.data.countries)
    //res.send(processData(response.data.countries))
    res.send(result)
  })
  .catch(function (error) {
    console.log(error);
  });
 
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})