var fullwidth = d3.select(".container").node().getBoundingClientRect().width;

function drawSectionOne() {

  var currentMode = "bycount";

  //console.log(d3.select(".container").node().getBoundingClientRect().width);

  var margin = {top: 20, right: 170, bottom: 80, left: 50},
      width = fullwidth - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var xScale = d3.scale.ordinal()
      .rangeRoundBands([0, width], .3);

  var yScale = d3.scale.linear()
      .rangeRound([height, 0]);

  var color = d3.scale.category20();

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .innerTickSize([0]);

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .tickFormat(d3.format(".2s")); // for the stacked totals version

  var stack = d3.layout
      .stack(); // default view is "zero" for the count display.

  var svg = d3.select(".interactive1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = d3.select("body").append("div").attr("class", "tooltip");

  d3.csv("data/Race_Education_Count.csv", function(error, data) {

    if (error) {
      console.log(error);
    }

    console.log(data);

    var races = data.map(function(d) {
      return d["Race"];
    });

    var years = d3.keys(data[0]).filter(function(d) {
      if (+d) {
        return d;
      }
    });

    var stacked = stack(makeData(years, races, data));

    xScale.domain(years);

    //console.log(years);
    console.log(stacked);

    //console.log(races);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
          .attr("dy", ".5em")
          .attr("transform", "rotate(-30)")
          .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of People");

        var yearGroup = svg.selectAll("g.race")
            .data(stacked)
          .enter().append("g")
            .attr("class", "race")
            .style("fill", function(d, i) { return color(i); });

            yearGroup.selectAll("rect")
                .data(function(d) {
                //  console.log("array for a rectangle", d);
                  return d; })  // this just gets the array for bar segment.
              .enter().append("rect")
                .attr("width", xScale.rangeBand())
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseout", mouseout);

    //data.sort(function(a, b) {return d3.ascending(a.Country,b.Country);});
    // how would we sort by largest total bar?  what would we have to calculate?



      // this just draws them in the default way, now they're appended.
    transitionCount();

    drawLegend();

    d3.selectAll("input").on("change", handleFormClick);

    // All the functions for stuff above!

    function handleFormClick() {
      if (this.value === "bypercent") {
        currentMode = "bypercent";
        transitionPercent();
      } else {
        currentMode = "bycount";
        transitionCount();
      }
    }

  /*
  Array[13] Years
  ...Array[4] races
  ......Object {x: year, y: d[year], race: race}

  Array[4]races
  ...Array[13] Years
  ......Object {same as above}
  */


    function makeData(years, data) {
      return data.map(function(d) {

            return years.map(function(year) {
              return {x: year, y: +d[year], race: d["Race"] };
            });

        });
    }


    function transitionPercent() {

      yAxis.tickFormat(d3.format("%"));
      stack.offset("expand");  // use this to get it to be relative/normalized!
      var stacked = stack(makeData(years, data));
      // call function to do the bars, which is same across both formats.
      transitionRects(stacked);
    }

    function transitionCount() {

      yAxis.tickFormat(d3.format(".2s")); // for the stacked totals version
      stack.offset("zero");
      var stacked = stack(makeData(years, data));
      transitionRects(stacked);

    }

    function transitionRects(stacked) {

      // this domain is using the last of the stacked arrays, which is the last illness, and getting the max height.
      yScale.domain([0, d3.max(stacked[stacked.length-1], function(d) { return d.y0 + d.y; })]);

      // attach new fixed data
      var country = svg.selectAll("g.race")
        .data(stacked);  // just a bunch of arrays. we don't need a key function because it's not different countries or illnesses.

      // same on the rects
      country.selectAll("rect")
        .data(function(d) {
          //console.log("array for rectangles", d);
          return d;
        })  // this just gets the array for bar segment.

      // the thing that needs to transition is the rectangles themselves, not the g parent.
      svg.selectAll("g.race rect")
        .transition()
        .duration(250)
        .attr("x", function(d) {
          return xScale(d.x); })
        .attr("y", function(d) {
          return yScale(d.y0 + d.y); }) //
        .attr("height", function(d) {
          return yScale(d.y0) - yScale(d.y0 + d.y); });  // height is base - tallness

      svg.selectAll(".y.axis").transition().call(yAxis);
    }

    // Building a legend by hand, based on http://bl.ocks.org/mbostock/3886208
    function drawLegend() {

      // reverse to get the same order as the bar color layers
      var races_reversed = races.slice().reverse();

      var legend = svg.selectAll(".legend")
          .data(color.domain().slice().reverse()) // make sure your labels are in the right order -- if not, use .reverse() here.
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", width)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width + 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .text(function(d, i) { return races_reversed[i].replace(/_/g, " "); });
    }

    function mouseover(d) {
    // this will highlight both a dot and its line.

      var number;

      d3.select(this)
        .transition()
        .style("stroke", "black");

      if (currentMode == "bypercent") {
        number = d3.format(".1%")(d.y);
      } else {
        number = d.y;
      }

      tooltip
        .style("display", null) // this removes the display none setting from it
        .html("<p>Race: " + d.race +
              "<br>Number of People: " + number +
              "<br>Year: " + d.x + " </p>");
    }

    function mousemove(d) {
      tooltip
        .style("top", (d3.event.pageY - 10) + "px" )
        .style("left", (d3.event.pageX + 10) + "px");
    }

    function mouseout(d) {
      d3.select(this)
        .transition()
        .style("stroke", "none");

      tooltip.style("display", "none");  // this sets it to invisible!
    }

  });

}

function drawSectionTwo() {

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


  queue()
      //.defer(d3.json, "data/geojson/us-states.json")
      //.defer(d3.csv, "data/states-visited.csv")
      .defer(d3.csv, "data/state_costs.csv")
      .defer(d3.json, "data/us-states.json")
      .await(ready);

  function ready(error, costs, json) {

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

  } // end ready function

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

drawSectionOne();
drawSectionTwo();
