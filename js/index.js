/*

index.js: The file loads all the data needed for the single-page application. Once loaded, the data
    is distributed to functions that draw the different charts of the application.

*/

// Gets screensize of container on initial page load.
var fullwidth = d3.select(".container").node().getBoundingClientRect().width;
var fullheight = 450;

var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("display", "none");

queue()
      .defer(d3.csv, "data/Race_Education_Data_Male_Female.csv")
      .defer(d3.csv, "data/Race_Education_Data_Total.csv")
      .defer(d3.csv, "data/Bachelor_Degree_Per_State_2014.csv")
      .defer(d3.csv, "data/population_distribution_per_state.csv")
      .defer(d3.csv, "data/Race_Education_Count.csv")
      .defer(d3.csv, "data/Race_Gender_Education_Data.csv")
      .defer(d3.csv, "data/College_Tuition_Fees_Data_2_Year.csv")
      .defer(d3.csv, "data/College_Tuition_Fees_Data_4_Year.csv")
      .defer(d3.csv, "data/US_Median_Income_2000_2014.csv")
      .defer(d3.json, "data/us-states.json")
      .defer(d3.csv, "data/Federal_State_Aid_Given.csv")
      .await(loadData);

function loadData(error, maleFemale, total, bachelor, pop_dist, count, genderEdu, stateCost2Year, stateCost4Year, medianIncome, states, aid) {

  if (error) {
    console.log(error);
  } else {
    drawBars(count);
    var myMap = drawNewMap(stateCost2Year, stateCost4Year, states);
    var line = chart(maleFemale, total, "interactive3");
    var line2 = chart(maleFemale, total, "interactive_doubleline");
    var miniMultiple = drawMiniMultiple(stateCost2Year, stateCost4Year);
    var stackedArea = drawStackedArea(aid);
    var scatter = drawScatterPlot(stateCost4Year, bachelor);

    //console.log(bachelor);
    myMap().fourYear();
    line().drawSingle();
    line2().drawDouble();
    miniMultiple().fourYearBars();
    stackedArea().drawMyArea();
    scatter().drawScatter();

  }

}
