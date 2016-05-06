function drawScatterPlot(stateCost4Year, bachelor) {

  var margin, width, height, x, y, xAxis, yAxis, svg, circles;
  var finalData = [];

  function my() {

    margin = {top:20, right:10, bottom:50, left:50};  //Top, right, bottom, left

		width = fullwidth - margin.left - margin.right;
		height = fullheight - margin.top - margin.bottom;

		x = d3.scale.linear()
							.range([ 0, width]);

		// top to bottom:
		y = d3.scale.linear()
							.range([ height, 0 ]);

		//  Custom tick count -- 15. // still needs a transform on it
		xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(15);

	// Custom format on ticks - just a string return, not a function here
		yAxis = d3.svg.axis()
						.scale(y)
						.orient("left")
						.tickFormat(function(d) {
							return d + "%"
						});

		svg = d3.select(".interactive6")
					.append("svg")
					.attr("width", fullwidth)
					.attr("height", fullheight)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    makeScatterData();

    return my;

  }

  my.drawScatter = function() {

    x.domain(
					d3.extent(finalData, function(d) {
						return d.cost;
					}));

		y.domain(
			d3.extent(finalData, function(d) {
				return d.percent;
			}));

		circles = svg.selectAll("circle")
						.data(finalData)
						.enter()
						.append("circle");

		circles.attr("cx", function(d) {
				return x(d.cost);
			})
			.attr("cy", function(d) {
				return y(d.percent);
			})
			.attr("r", 5)
			.attr("fill", function(d) {
        if (d["state"] == "United States") {
          return "orange";
        } else {
          return "rgb(31, 119, 180)";
        }
      })
			.append("title");
			/*.text(function(d) {
				return d.state + "'s average four-year tuition in 2014 was $" + d.cost + ", and " + d.percent + "% of its population has a bachelor's degree.";
			});*/

      circles
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

  }

  function makeScatterData() {

    //console.log("State cost 4 year", stateCost4Year);
    //console.log("Bachelor", bachelor);
    var total = 0;
    var average = 0;
    var nestedData_costs,
        nestedData_bachelor;

    nestedData_costs = d3.nest()
      .key(function(d) { return d["State"]; })
      .entries(stateCost4Year);

    nestedData_bachelor = d3.nest()
      .key(function(d) { return d["GRT_STUB.display-label"]; })
      .entries(bachelor);

    //console.log("Costs", nestedData_costs);
    //console.log("Bachelor", nestedData_bachelor);

    nestedData_costs.forEach(function(c) {

      var state = {};
      //console.log(c);

      nestedData_bachelor.forEach(function(b) {

        if (c.key === b.key) {

          state["state"] = c.key;
          state["percent"] = +b["values"][0]["EST"];
          state["cost"] = +c["values"][0]["2014"];
          finalData.push(state);

          total += +state["cost"];
        //  console.log("total", total);

        }

      });

    });

    average = (total/52).toPrecision(6);

    finalData.push({state: "United States", percent: 30.1, cost: average});

    //console.log("final",finalData);

  }

  function mouseover(e) {

    var thisCircle = d3.select(this);
    //console.log(thisCircle.data()[0]);

    thisCircle.style("fill", "red");

    tooltip
      .style("display", null)
      .html("<p>" + thisCircle.data()[0].state +
      "'s average four-year tuition in 2014 was $" +
      thisCircle.data()[0].cost + ", and " +
      thisCircle.data()[0].percent + "% of its population had a bachelor's degree.</p>");

  }

  function mousemove(e) {
    tooltip
      .style("top", (d3.event.pageY - 10) + "px" )
      .style("left", (d3.event.pageX + 10) + "px");
  }

  function mouseout(e) {

    var thisCircle = d3.select(this);

    thisCircle.style("fill", function() {
      if (thisCircle.data()[0].state == "United States") {
        return "orange";
      } else {
        return "rgb(31, 119, 180)";
      }
    });

    tooltip
      .style("display", "none");

  }

  return my;

}
