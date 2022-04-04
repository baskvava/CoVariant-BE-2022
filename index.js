const express = require('express')
const axios = require('axios');
const cors = require('cors')
const app = express()
const port = 3001
const URL = "https://raw.githubusercontent.com/hodcroftlab/covariants/master/cluster_tables/USAClusters_data.json";

function processStateData(ALL_JSON) {
  const rename_columns = {
      "20I (Alpha, V1)": "Alpha", "20H (Beta, V2)": "Beta", "20J (Gamma, V3)": "Gamma",
      "21K (Omicron)": "Omicron", "21B (Kappa)": "Kappa", "21D (Eta)": "Eta", "21G (Lambda)": "Lambda",
      "21F (Iota)": "Iota"
  }
  const build_obj = []
  for (const county in ALL_JSON) {
    const length = ALL_JSON[county].week.length
    const covkeys = Object.keys(ALL_JSON[county])
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
  }

  return [build_obj]
}

function processUsaData(input_data) {
  const all_data = input_data[0]
  const results = []
  const all_cols = ["Alpha","Beta","Gamma","Omicron","Kappa","Eta","Iota","Lambda","others","Delta","non_variants"];
  const all_weeks = new Set()

  for (let data of all_data) {
    const [week] = Object.values(data)
    all_weeks.add(week)
  }

  for (let week_date of all_weeks) {
    const week_total_result = {}
    const weeks_data = all_data.filter(data => {
      return data.week === week_date
    })
    for (let col of all_cols) {
      if (!week_total_result[col]) {
        week_total_result[col] = 0
      }
      for (let w_data of weeks_data) {
        if (w_data[col]) {
          week_total_result[col] += w_data[col]
        }
      }
    }
    week_total_result['week'] = week_date
    results.push(week_total_result)
  }
  return results
}

app.use(cors())
app.get('/getStates', (req, res) => {
  // res.send('Hello World!')
  axios.get(`${URL}`)
  .then(function (response) {
    //console.log(processData(response.data.countries));
    const result = processStateData(response.data.countries)
    //const result = processData(states_data)
    //res.send(processData(response.data.countries))
    res.send(result)
  })
  .catch(function (error) {
    console.log(error);
  });
})

app.get('/getAllUsa', (req, res) => {
  axios.get(`${URL}`)
  .then(function (response) {
    const states_data = processStateData(response.data.countries)
    const result = processUsaData(states_data)
    res.send(result)
  })
  .catch(function (error) {
    console.log(error);
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})