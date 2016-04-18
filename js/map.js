function drawMap(costs, json) {

  //Width and height of map
  var width = 960;
  var height = 500;

  // D3 Projection
  var projection = d3.geo.albersUsa()
                     .translate([width/2, height/2])    // translate to center of screen
                     .scale([1000]);          // scale things down so see entire US

  // Define path generator
  var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
               .projection(projection);  // tell path generator to use albersUsa projection


  // Define linear scale for output
  var stateColor = d3.scale.linear()
                .range(["yellow", "red"]);


  //Create SVG element and append map to the SVG
  var svg = d3.select(".interactive2")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

  // Append Div for tooltip to SVG
  var tooltip = d3.select("body")
              .append("div")
              .attr("class", "tooltip")
              .style("display", "none");


/*  queue()
      //.defer(d3.json, "data/geojson/us-states.json")
      //.defer(d3.csv, "data/states-visited.csv")
      .defer(d3.csv, "data/state_costs.csv")
      .defer(d3.json, "data/us-states.json")
      .await(ready);*/

  //function ready(error, costs, json) {

      //console.log("json", json);
      //console.log("costs", costs);
      stateColor.domain(d3.extent(costs, function(s) { return s["percent_change_4year"];})); // setting the range of the input data
      //stateColor.domain([0, 100]); // Represents 0 to 100 percent.

      // Loop through each state data value in the .csv file
      costs.forEach(function(d) {
        var stateName = d["State"];
        var statePercentValue4Year = d["percent_change_4year"];
        var statePercentValue2Year = d["percent_change_2year"];
        var state2yearCost0405 = d["cost_2year_0405"];
        var state4yearCost0405 = d["cost_4year_0405"];
        var state2yearCost1112 = d["cost_2year_1112"];
        var state4yearCost1112 = d["cost_4year_1112"];

        //console.log(stateName, stateValue);
        // Find the corresponding state inside the GeoJSON
        json.features.forEach(function(f) {
          var jsonState = f.properties.name;
          //console.log(jsonState);
          if (stateName === jsonState) {
            f.properties.percentValue4Year = statePercentValue4Year;
            f.properties.percentValue2Year = statePercentValue2Year;
            f.properties.state2yearCost0405 = state2yearCost0405;
            f.properties.state4yearCost0405 = state4yearCost0405;
            f.properties.state2yearCost1112 = state2yearCost1112;
            f.properties.state4yearCost1112 = state4yearCost1112;
          }
        });
      }); // ends data merge

      console.log(json);

      // Bind the data to the SVG and create one path per GeoJSON feature
      svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("id", function(d) {
            return d.properties.name;
          })
          .attr("data-cost2year0405", function(d) {
            return d.properties.state2yearCost0405;
          })
          .attr("data-cost2year1112", function(d) {
            return d.properties.state2yearCost1112;
          })
          .attr("data-cost4year0405", function(d) {
            return d.properties.state4yearCost0405;
          })
          .attr("data-cost4year1112", function(d) {
            return d.properties.state4yearCost1112;
          })
          .attr("data-percentValue2Year", function(d) {
            return d.properties.percentValue2Year;
          })
          .attr("data-percentValue4Year", function(d) {
            return d.properties.percentValue4Year;
          })
          .style("fill", function(d) {
              // Get data value for visited
              var value = d.properties.percentValue4Year;
              return stateColor(value);
          });

        // Adds legend
        svg.append("g")
        .attr("class", "legendColors")
            .attr("transform", "translate(800, 300)"); // where we put it on the page!

        var legendColors = d3.legend.color()
        .shapeWidth(20)
        .title("Percent Change in Tuition")
        .labelFormat(d3.format("1f"))
        .scale(stateColor); // our existing color scale

        svg.select(".legendColors")
        .call(legendColors);

        // Adds tooltip to each state.
        svg.selectAll("path")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseout", mouseout);

  //} // end ready function

  function mouseover(e) {
    var thisPath = d3.select(this);
    //console.log(thisPath);

    thisPath.moveToFront();
    thisPath.style("stroke", "black");

    tooltip
      .style("display", null)
      .html("<p><b>State:</b> " + thisPath.attr("id") + "</p>" +
            "<p><b>Percent Change:</b> " + thisPath.attr("data-percentValue4Year") + "%</p>" +
            "<p><b>Cost of 4-year college, 04-05:</b> $" + thisPath.attr("data-cost4year0405") + "</p>" +
            "<p><b>Cost of 4-year college, 11-12:</b> $" + thisPath.attr("data-cost4year1112") + "</p>" );
  }

  function mousemove(e) {
    tooltip
      .style("top", (d3.event.pageY - 10) + "px" )
      .style("left", (d3.event.pageX + 10) + "px");
  }

  function mouseout(d) {
    var thisPath = d3.select(this);

    tooltip
      .style("display", "none");

    thisPath.style("stroke", "gray");
  }

  d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };

}
