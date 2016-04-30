function drawMiniMultiple(costs_2year, costs_4year) {

  var fullwidth, fullheight, margin, width, height, x, y, area, line, svg, nested_data_2year, nested_data_4year, xAxis, yAxis;
  var years = [2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015];
  var blank_values = [{
    2004:0,
    2005:0,
    2006:0,
    2007:0,
    2008:0,
    2009:0,
    2010:0,
    2011:0,
    2012:0,
    2013:0,
    2014:0,
    2015:0
  }];

/*

    // Compute the minimum and maximum date across symbols.
    // We assume values are sorted by date.
    x.domain([
      d3.min(countries, function(s) { return s.values[0].date; }),
      d3.max(countries, function(s) { return s.values[s.values.length - 1].date; })
    ]);

    // Add an SVG element for each symbol, with the desired dimensions and margin.
    var svg = d3.select("body").selectAll("svg")
        .data(countries)
      .enter().append("svg")
        .attr("width", fullwidth)
        .attr("height", fullheight)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add the area path elements. Note: the y-domain is set per element.
    svg.append("path")
        .attr("class", "area")
        .attr("d", function(d) {
          y.domain([0, d.maxValue]); return area(d.values);
        });

    // Add the line path elements. Note: the y-domain is set per element.
    svg.append("path")
        .attr("class", "line")
        .attr("d", function(d) {
          y.domain([0, d.maxValue]); return line(d.values);
        });

    // Add a small label for the symbol name.

    var outputDate = d3.time.format("%Y");

    svg.append("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", -8)
      .style("text-anchor", "start")
      .text(function(d) {
        return outputDate(d.values[0].date);
      });

    svg.append("text")
      .attr("class", "label")
      .attr("x", width/2)
      .attr("y", -8)
      .style("text-anchor", "middle")
      .text(function(d) {
        return d.key;
      });

    svg.append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -8)
      .style("text-anchor", "end")
      .text(function(d) {
        return outputDate(d.values[d.values.length - 1].date);
      });

      // put a dot on last point
      svg.append("circle")
      .attr("class", "label")
      .attr("cx", function(d) {
        return x(d.values[d.values.length - 1].date);
      })
      .attr("cy", function(d) {
        y.domain([0, d.maxValue]);
        return y(d.values[d.values.length - 1].Measles);
      })
      .attr("r", 2);

      // label the value on the last point
    svg.append("text")
     .attr("class", "label")
      .attr("x", width)
      .attr("y", function(d) {
        y.domain([0, d.maxValue]);
        return y(d.values[d.values.length - 1].Measles);
      })
      .attr("dy", -5)
      .style("text-anchor", "end")
      .text(function(d) {
        return d.values[d.values.length - 1].Measles;
      });*/
  //});

  function my() {

    fullwidth = 200;
    fullheight = 150;

    margin = {top: 25, right: 50, bottom: 20, left: 30};
    width = fullwidth - margin.left - margin.right;
    height = fullheight - margin.top - margin.bottom;

    x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .2);

    y = d3.scale.linear()
        .range([height, 0]);

    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .innerTickSize([0]);

    yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(2)
          .outerTickSize(0)
          .innerTickSize(0)
          .tickFormat(d3.format("s"));

    nested_data_2year = nestData(costs_2year);
    nested_data_4year = nestData(costs_4year);

    x.domain(years);

    return my;

  }

  my.twoYearBars = function() {

    svg = d3.select(".interactive4").selectAll("svg")
          .data(nested_data_2year)
          .enter().append("svg")
            .attr("width", fullwidth)
            .attr("height", fullheight)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .each(multiple);
  }

  my.fourYearBars = function() {

    console.log(nested_data_4year);

    svg = d3.select(".interactive4").selectAll("svg")
          .data(nested_data_4year)
          .enter().append("svg")
            .attr("width", fullwidth)
            .attr("height", fullheight)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .each(multiple);

  }

  function multiple(state) {
    //console.log(state);
    var stateValues = d3.values(state["values"][0]);
    //console.log(stateValues);
    var actualValues = stateValues.slice(0,12);
    //console.log(actualValues);
    var thisSVG = d3.select(this);

    drawGraph(actualValues, thisSVG);

    thisSVG.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -33)
        .style("text-anchor", "end");
        //.text("Average Tuition");

    // Adds graph title to each SVG.
    thisSVG.append("text")
          .attr("class", "label")
          .attr("x", width/2)
          .attr("y", -8)
          .style("text-anchor", "middle")
          .text(function(d) { return d["key"]; })

  }

  function drawGraph(yearValues, thisSVG) {

    y.domain([0, d3.max(yearValues)]);

    thisSVG.select("y.axis").call(yAxis);

    var yearGroup = thisSVG
                .append("g")
                .attr("class", "years");

    var barGroups = yearGroup.selectAll("g.barGroup")
              .data(years, function(d) {
                return d;
              })
              .enter().append("g")
              .attr("class", "barGroup")
              .attr("id", function(d) {
                return "y" + d;
              });

    var bars = barGroups
             .append("rect")
             .attr("class", function(d) {
               return "y" + d;
             })
             .style("fill", "orange")
             .attr("x", function(d, i) {
               return x(years[i]);
             })
             .attr("y", function(d, i) {
               return y(yearValues[i]);
             })
             .attr("width", x.rangeBand())
             .attr("height", function(d, i) {
               return height - y(yearValues[i]);
             });

      var barLabels = barGroups
              .append("text")
              .attr("class", "barLabel")
              .attr("x", function(d, i) {
                //return x(years[i]);
                return 140;
              })
              .attr("y", function(d, i) {
                //return y(yearValues[i]);
                return 50;
              })
              //.attr("dx", 110)
              //.attr("dy", 12)
              .style("text-anchor", "middle")
              .style("display", "none")
              .style("font-size", "0.8em")
              .text(function(d, i) {
                if (yearValues[i] != 0) {
                  return yearValues[i];
                }
              });

        barGroups
              .on("mouseover", mouseover)
              .on("mouseout", mouseout);

  }

  my.fourYear = function() {

  }

  function mouseover(d) {
    var groups = d3.selectAll("#" + "y" + d);
    groups
    .transition()
    .style("stroke", "black");

    groups.select("text")
      .style("display", null)
      .style("stroke", "none");

  }

  function mouseout(d) {
    var groups = d3.selectAll("#" + "y" + d);
    groups
    .transition()
    .style("stroke", "none");

    groups.select("text")
      .style("display", "none");

	}

  function nestData(data) {

    var nestedData;

    nestedData = d3.nest()
      .key(function(d) { return d["State"]; })
      .entries(data);

    nestedData.forEach(function(d) {
      d.maxValue = d3.max(d.values, function(d) { return +d["2015"]; });
      if (!d.maxValue) {
        d.maxValue = 0;
        d.values = blank_values;
      }
    });

    return nestedData;

  }

  return my;

}
