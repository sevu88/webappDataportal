import "./styles.css";

import L from "leaflet";
import { Chart } from "frappe-charts";

let chart;
let geoJSOn;
let layerGroup;
const suodatetutKunnat = [];
const dataa = [];
const form = document.getElementById("search");
const city = document.getElementById("searchcity");
const getImg = document.getElementById("img");
const dropdown = document.getElementById("dropdown");
const reloadButton = document.getElementById("reloadButton");
const chartTitle = document.getElementById("chart-title");

getImg.addEventListener("click", () => {
  chart.export();
});

reloadButton.addEventListener("click", function () {
  chartTitle.innerHTML = "Season 2023 point chart";
  buildChart();
});

const teams = [
  {
    id: 0,
    name: "hifk",
    city: "Helsinki",
    colour: "#FF0000"
  },
  {
    id: 1,
    name: "tappara",
    city: "Tampere",
    colour: "#ff8000"
  },
  {
    id: 2,
    name: "lukko",
    city: "Rauma",
    colour: "#ffff00"
  },
  {
    id: 3,
    name: "hpk",
    city: "Hämeenlinna",
    colour: "#ff8000"
  },
  {
    id: 4,
    name: "jyp",
    city: "Jyväskylä",
    colour: "#000000"
  },
  {
    id: 5,
    name: "tps",
    city: "Turku",
    colour: "#000000"
  },
  {
    id: 6,
    name: "jukurit",
    city: "Mikkeli",
    colour: "#FFDD93"
  },
  {
    id: 7,
    name: "kookoo",
    city: "Kouvola",
    colour: "#ff8000"
  },
  {
    id: 8,
    name: "assat",
    city: "Pori",
    colour: "#ff0000"
  },
  {
    id: 9,
    name: "ilves",
    city: "Tampere",
    colour: "#ffbf00"
  },
  {
    id: 10,
    name: "pelicans",
    city: "Lahti",
    colour: "#0080ff"
  },
  {
    id: 11,
    name: "karpat",
    city: "Oulu",
    colour: "#000000"
  },
  {
    id: 12,
    name: "sport",
    city: "Vaasa",
    colour: "#ff0000"
  },
  {
    id: 13,
    name: "kalpa",
    city: "Kuopio",
    colour: "#ffbf00"
  },
  {
    id: 14,
    name: "saipa",
    city: "Lappeenranta",
    colour: "#ffff00"
  }
];

const fetchData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const res = await fetch(url);
  const data = await res.json();
  const smLiigaJoukkueidenKunnat = [
    "Helsinki",
    "Tampere",
    "Turku",
    "Hämeenlinna",
    "Lappeenranta",
    "Oulu",
    "Kuopio",
    "Pori",
    "Rauma",
    "Vaasa",
    "Jyväskylä",
    "Lahti",
    "Mikkeli",
    "Kouvola"
  ];
  const kaupunki = data.features;
  kaupunki.forEach((kunta) => {
    const kuntaNimi = kunta.properties.nimi;
    if (smLiigaJoukkueidenKunnat.includes(kuntaNimi)) {
      suodatetutKunnat.push(kunta);
    }
  });
  const urlsarja = "https://liiga.fi/api/v1/teams/stats/2024/runkosarja";
  const resq = await fetch(urlsarja);
  const dataliiga = await resq.json();
  dataliiga.forEach((x) => {
    dataa.push(x);
  });
  createmap(suodatetutKunnat);
};

const createmap = (suodatetutKunnat) => {
  let map = L.map("map", { minZoom: -3 });

  layerGroup = new L.LayerGroup();
  layerGroup.addTo(map);

  geoJSOn = L.geoJSON(suodatetutKunnat, {
    onEachFeature: getallnames,
    style: getstyles
  }); //.addTo(map);

  layerGroup.addLayer(geoJSOn);

  let openstreetmap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }
  ).addTo(map);

  map.fitBounds(geoJSOn.getBounds());
};

const getallnames = async (feature, layer) => {
  if (!feature.id) return;
  layer.on("click", function () {
    mapClick(feature.properties.name);
  });
  const name = feature.properties.nimi;
  const cname = feature.properties.name;
  let cityTeam;
  teams.forEach((x) => {
    if (x.city === name) {
      cityTeam = x.name;
    }
  });

  layer.bindPopup(
    `<ul>
          <li>Name: ${cname} </li>
          <li>Team: ${cityTeam}</li>
      </ul>
    `
  );
  layer.bindTooltip(cname);
};

const mapClick = async (name) => {
  let chartTeam;
  let chartxdata = [];
  teams.forEach((x) => {
    if (x.city === name) {
      chartTeam = x.name;
    }
  });
  dataa.forEach((x) => {
    if (x.slug === chartTeam) {
      chartxdata.push(x.games, x.games_won, x.games_lost, x.games_tied);
    }
  });

  chartTitle.innerHTML = chartTeam + " games stats";
  updateChart(chartxdata, chartTeam);
};

const updateChart = async (chartxdata, name) => {
  let info = ["games played", "games won", "games lost", "games tied"];
  const chartData = {
    labels: info,
    datasets: [{ name: "points", values: chartxdata }]
  };

  chart = new frappe.Chart("#chart", {
    title: name + " games stats",
    data: chartData,
    type: "bar",
    height: 450,
    colors: ["#eb5146"]
  });
};

const getstyles = (feature) => {
  if (!feature.id) return;
  const name = feature.properties.nimi;
  let cityColour;
  teams.forEach((x) => {
    if (x.city === name) {
      cityColour = x.colour;
    }
  });

  return {
    color: cityColour
  };
};

const getStyleattend = (feature) => {
  if (!feature.id) return;
  const name = feature.properties.nimi;
  let team;
  let attend;

  teams.forEach((x) => {
    if (x.city === name) {
      team = x.name;
    }
  });

  dataa.forEach((x) => {
    if (x.slug === team) {
      attend = x.attendants_home_avg;
    }
  });

  if (attend > 7000) {
    return {
      color: "#00cc00"
    };
  } else if (attend > 3500 && attend < 7000) {
    return {
      color: "#ffff00"
    };
  } else if (attend < 3500) {
    return {
      color: "#ff6600"
    };
  }
};

const getFeatureattend = async (feature, layer) => {
  if (!feature.id) return;
  layer.on("click", function () {
    mapClick(feature.properties.name);
  });
  const name = feature.properties.nimi;
  const cname = feature.properties.name;
  let cityTeam;
  let attend;
  teams.forEach((x) => {
    if (x.city === name) {
      cityTeam = x.name;
    }
  });
  dataa.forEach((x) => {
    if (x.slug === cityTeam) {
      attend = x.attendants_home_avg;
    }
  });

  layer.bindPopup(
    `<ul>
          <li>Name: ${cname} </li>
          <li>Team: ${cityTeam}</li>
          <li>Average attendants home games: ${attend}</li>
      </ul>
    `
  );
  layer.bindTooltip(cname);
};

const buildChart = async () => {
  chartTitle.innerHTML = "Season 2023 point chart";
  await dataa.sort((b, a) => b.standings_ranking - a.standings_ranking);

  const partyNames = dataa.map((x) => x.slug);
  const partyrecord = dataa.map((y) => y.points);
  //const averagePoints = dataa.map((z) => z.points_per_game);

  const chartData = {
    labels: partyNames,
    datasets: [{ name: "points", values: partyrecord }]
  };

  chart = new frappe.Chart("#chart", {
    title: "points chart",
    data: chartData,
    type: "bar",
    height: 450,
    colors: ["#eb5146"]
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let area =
    city.value.charAt(0).toUpperCase() + city.value.slice(1).toLowerCase();
  mapClick(area);
});

dropdown.addEventListener("input", (event) => {
  if (event.target.value === "TeamsOnMap") {
  }
  updateMap();
});

const updateMap = async () => {
  layerGroup.removeLayer(geoJSOn);
  if (dropdown.value === "TeamsOnMap") {
    geoJSOn = L.geoJSON(suodatetutKunnat, {
      style: getstyles,
      onEachFeature: getallnames
    });
    layerGroup.addLayer(geoJSOn);
  } else if (dropdown.value === "AverageAttentands") {
    geoJSOn = L.geoJSON(suodatetutKunnat, {
      style: getStyleattend,
      onEachFeature: getFeatureattend
    });
    layerGroup.addLayer(geoJSOn);
  }
};

fetchData();
setTimeout(buildChart, 700);
