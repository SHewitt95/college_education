/*

index.js: The file loads all the data needed for the single-page application. Once loaded, the data
    is distributed to functions that draw the different charts of the application.

*/

var fullwidth = d3.select(".container").node().getBoundingClientRect().width;

queue()
      .defer(d3.csv, "data/Race_Education_Data_Male_Female.csv")
      .defer(d3.csv, "data/Race_Education_Data_Total.csv")
      .defer(d3.csv, "data/Bachelor_Degree_Per_State_2014.csv")
      .defer(d3.csv, "data/population_distribution_per_state.csv")
      .defer(d3.csv, "data/Race_Education_Count.csv")
      .defer(d3.csv, "data/Race_Gender_Education_Data.csv")
      .defer(d3.csv, "data/state_costs.csv")
      .defer(d3.csv, "data/US_Median_Income_2000_2014.csv")
      .defer(d3.json, "data/us-states.json")
      .await(loadData);

function loadData(error, maleFemale, total, bachelor, pop_dist, count, genderEdu, stateCosts, medianIncome, states) {

  if (error) {
    console.log(error);
  } else {
    drawBars(count);
    drawMap(stateCosts, states);
    drawLineTransition(maleFemale, total);
  }

}
