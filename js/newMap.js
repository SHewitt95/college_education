function drawNewMap(costs_2year, costs_4year, json) {

  //Width and height of map
  var width, height,
  projection, path,
  stateColor, svg,
  years, nested_data_2year, nested_data_4year, allValues;

  function my() {

    //Width and height of map
    width = fullwidth;
    height = 500;

    // D3 Projection
    projection = d3.geo.albersUsa()
                       .translate([width/2, height/2])    // translate to center of screen
                       .scale([1000]);          // scale things down so see entire US

    // Define path generator
    path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
                 .projection(projection);  // tell path generator to use albersUsa projection


    // Define linear scale for output
    stateColor = d3.scale.linear();
                  //.domain([1419, 3565, 6790])
                  //.range(["green", "white", "red"]);


    //Create SVG element and append map to the SVG
    svg = d3.select(".interactive2")
                .append("svg")
                .attr("width", width)
                .attr("height", height);



    years = ["2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012"];

    nested_data_2year = d3.nest()
      .key(function(d) { return d["State"]; })
      .entries(costs_2year);

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

    nested_data_4year = d3.nest()
      .key(function(d) { return d["State"]; })
      .entries(costs_4year);

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

      //console.log("Nest, 2year", nested_data_2year);

      allValues = [];

    return my;

  }

  my.twoYear = function() {
    allValues = [];

    nested_data_2year.forEach(function(d) {
    //  years.forEach(function(y) {
      if (d.key !== "District of Columbia" && d.key !== "Puerto Rico") {
        allValues.push(+d.values[0]["2012"]);
      }
    //  });
    });
    //console.log(allValues);

    stateColor
      .range(["blue", "white", "orange"])
      .domain([
        d3.min(allValues),
        d3.mean(allValues),
        d3.max(allValues)
      ]);

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
          .attr("transform", "translate(875, 300)"); // where we put it on the page!

      var legendColors = d3.legend.color()
      .shapeWidth(20)
      .title("In-State Tuition, 2-Year")
      .labelFormat(d3.format("$1f"))
      .scale(stateColor); // our existing color scale

      svg.select(".legendColors")
      .call(legendColors);

      // Adds tooltip to each state.
      svg.selectAll("path")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout);

          return my;

  }

  my.fourYear = function() {
    allValues = [];

    nested_data_4year.forEach(function(d) {
    //  years.forEach(function(y) {
      if (d.key !== "District of Columbia" && d.key !== "Puerto Rico") {
        allValues.push(+d.values[0]["2014"]);
      }
    //  });
    });
    //console.log(allValues);

    stateColor
      .range(["rgb(31, 119, 180)", "white", "orange"])
      .domain([
        d3.min(allValues),
        d3.mean(allValues),
        d3.max(allValues)
      ]);

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(nested_data_4year)
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
            return stateColor(+d.values[0]["2014"]);
        });

      // Adds legend
      svg.append("g")
      .attr("class", "legendColors")
          .attr("transform", "translate(875, 300)"); // where we put it on the page!

      var legendColors = d3.legend.color()
      .shapeWidth(20)
      .title("In-State Tuition, 4-Year")
      .labelFormat(d3.format("$1f"))
      .scale(stateColor); // our existing color scale

      svg.select(".legendColors")
      .call(legendColors);

      // Adds tooltip to each state.
      svg.selectAll("path")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout);

          return my;

  }

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
            "<p><b>In-State Tuition, 14-15:</b> $" + thisPath.data()[0]["values"][0]["2012"] + "</p>" );

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

  return my;

}
