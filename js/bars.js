function drawBars(data) {

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

//  d3.csv("data/Race_Education_Count.csv", function(error, data) {

    /*if (error) {
      console.log(error);
    }*/

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

  //});

}
