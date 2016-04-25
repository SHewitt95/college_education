function drawNewMap(costs_2year, costs_4year, json) {

  //Width and height of map
  var width = fullwidth;
  var height = 500;

  // D3 Projection
  var projection = d3.geo.albersUsa()
                     .translate([width/2, height/2])    // translate to center of screen
                     .scale([1000]);          // scale things down so see entire US

  // Define path generator
  var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
               .projection(projection);  // tell path generator to use albersUsa projection


  // Define linear scale for output
  var stateColor = d3.scale.linear();
                //.domain([1419, 3565, 6790])
                //.range(["green", "white", "red"]);


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

              //console.log("College costs", costs);


/*  queue()
      //.defer(d3.json, "data/geojson/us-states.json")
      //.defer(d3.csv, "data/states-visited.csv")
      .defer(d3.csv, "data/state_costs.csv")
      .defer(d3.json, "data/us-states.json")
      .await(ready);*/

  //function ready(error, costs, json) {

      //console.log("json", json);
      //console.log("costs", costs);
      //stateColor.domain(d3.extent(costs, function(s) { return s["percent_change_4year"];})); // setting the range of the input data
      //stateColor.domain([0, 100]); // Represents 0 to 100 percent.

      var years = ["2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012"];

      // Loop through each state data value in the .csv file
    /*  costs.forEach(function(d) {
        //console.log("Cost data",d);
        //console.log(stateName, stateValue);
        // Find the corresponding state inside the GeoJSON
        json.features.forEach(function(f) {
          var jsonState = f.properties.name;
          //console.log(jsonState);
          //if (stateName === jsonState) {  }
        });
      }); // ends data merge*/

      /*console.log(costs);
      costs.forEach(function(d) {
        years.forEach(function(y) {
          console.log(d["State"])
          console.log("data", d[y]);
        });
      });*/

      var nested_data_2year = d3.nest()
        .key(function(d) { return d["State"]; })
        .entries(costs_2year);

      /*json.features.forEach(function(d) {
        var jsonState = f.properties.name;

      });*/

      nested_data_2year.forEach(function(d) {
        var stateName = d.key;
        json.features.forEach(function(f) {
          var jsonState = f.properties.name;
          //console.log("json", f);
          if (stateName === jsonState) {
            d.properties = f.geometry;
          }
        });
      });

      var nested_data_4year = d3.nest()
        .key(function(d) { return d["State"]; })
        .entries(costs_4year);

      /*json.features.forEach(function(d) {
        var jsonState = f.properties.name;

      });*/

      nested_data_4year.forEach(function(d) {
        var stateName = d.key;
        json.features.forEach(function(f) {
          var jsonState = f.properties.name;
          //console.log("json", f);
          if (stateName === jsonState) {
            d.properties = f.geometry;
          }
        });
      });

        console.log("Nest, 2year", nested_data_2year);

        var allValues = [];

        nested_data_2year.forEach(function(d) {
        //  years.forEach(function(y) {
        //    if (d.key !== "District of Columbia" && d.key !== "Puerto Rico") {
              allValues.push(+d.values[0]["2012"]);
        //    }
        //  });
        });
        console.log(allValues);

        stateColor
          .range(["green", "white", "red"])
          .domain([
            d3.min(allValues),
            d3.mean(allValues),
            d3.max(allValues)
          ]);



      //console.log(json);

      // Bind the data to the SVG and create one path per GeoJSON feature
      svg.selectAll("path")
          .data(nested_data_2year)
          .enter()
          .append("path")
          .attr("d", function(d) {
            return path(d.properties);
          })
          .attr("id", function(d) {
            return d.key;
          })
          .style("fill", function(d) {
              // Get data value for visited
              return stateColor(+d.values[0]["2012"]);
          });

        // Adds legend
        svg.append("g")
        .attr("class", "legendColors")
            .attr("transform", "translate(800, 300)"); // where we put it on the page!

        var legendColors = d3.legend.color()
        .shapeWidth(20)
        .title("In-State Tuition")
        .labelFormat(d3.format("$1f"))
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

    //console.log(thisPath.data()[0]["values"][0]);

    tooltip
      .style("display", null)
      .html("<p><b>State:</b> " + thisPath.attr("id") + "</p>" +
            //"<p><b>Percent Change:</b> " + thisPath.attr("data-percentValue4Year") + "%</p>" +
            //"<p><b>Cost of 4-year college, 04-05:</b> $" + thisPath.attr("data-cost4year0405") + "</p>" +
            "<p><b>In-State Tuition, 11-12:</b> $" + thisPath.data()[0]["values"][0]["2012"] + "</p>" );

    drawTooltipSVG(tooltip, thisPath.data()[0]["values"][0]);
  }

  function drawTooltipSVG(tooltip, data){

    //Dimensions and padding
    console.log("tooltip data", data);
    var years = d3.keys(data).slice(0,9);
    console.log("tooltip years", years);

    var dataset = [];

    years.forEach(function(y) {
      var yearCostData = {};

      yearCostData.x = y;
      yearCostData.y = data[y];

      console.log("yearCost", yearCostData);
    });

		var fullwidth = 300; // Allows SVG wo be size of current window upon load.
		var fullheight = 120;
		var margin = { top: 20, right: 50, bottom: 40, left: 20};

		var width = fullwidth - margin.left - margin.right;
		var height = fullheight - margin.top - margin.bottom;

    var mySVG = tooltip
                  .append("svg")
                  .attr("width", fullwidth)
      						.attr("height", fullheight)
      						.append("g")
      						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //Set up scales - I already know the start and end years, not using data for it.
      var xScale = d3.time.scale()
                .range([ 0, 300 ]);

      // don't know the yScale domain yet. Will set it with the data.
      var yScale = d3.scale.linear()
                .range([ 0, 75 ]);

      //Set up date formatting and years
      var dateFormat = d3.time.format("%Y");
      var outputFormat = d3.time.format("%Y");

      //Configure axis generators
      var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(10)
              .tickFormat(function(d) {
                return outputFormat(d);
              })
              .innerTickSize([10])
              .outerTickSize([0]);

      var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .innerTickSize([10])
              .outerTickSize([0]);

      //Configure line generator
      // each line dataset must have an x and y for this to work.
      var line = d3.svg.line()
        .x(function(d) {
          return xScale(dateFormat.parse(d.year));
        })
        .y(function(d) {
          return yScale(+d.cost);
        });

        //Axes
        mySVG.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height  + ")")
          .call(xAxis);

        mySVG.append("g")
          .attr("class", "y axis")
          .call(yAxis);
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
