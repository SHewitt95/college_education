function drawStackedArea(aid) {

  console.log("Aid", aid);

  var width, height, margin, xScale, yScale, xAxis, yAxis, area, svg, dateFormat, groups, colorScale, layers, originalColor;

  var years = ["1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"];

  var index = 0;

  var dataset = [],
      nestedDataset = [],
      allAidValues = [],
      layersArray = [];

  function my() {

    margin = {top: 20, right: 30, bottom: 30, left: 100},
    width = fullwidth - margin.left - margin.right,
    height = fullheight - margin.top - margin.bottom;

    xScale = d3.time.scale()
        .range([0, width]);

    yScale = d3.scale.linear()
        .range([height, 0]);

    //Set up date formatting and years
    dateFormat = d3.time.format("%Y");
    outputFormat = d3.time.format("%Y");

    colorScale = d3.scale.category20b();

    xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10);

    yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    stack = d3.layout.stack()
        .offset("zero") // try "silhouette" next, that's a streamgraph!
        //.order("inside-out")  // try this and see what you think
        .values(function(d) { return d.values; })
        .x(function(d) { return d["year"];})
        .y(function(d) { return +d["aid"]; });

    // use the result of the stack to draw the shapes using area
    area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return xScale(d["year"]); })
        .y0(function(d) { return yScale(d.y0); })
        .y1(function(d) { return yScale(d.y0 + d.y); });

    svg = d3.select(".interactive5").append("svg")
        .attr("width", fullwidth )
        .attr("height", fullheight)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    makeDataSet();

    nestedDataset = d3.nest()
      .key(function(d) {
        return d["source"];
      })
      .entries(dataset);

      console.log("nestedDataset",nestedDataset);

    return my;

  }

  my.drawMyArea = function() {

    layers = stack(nestedDataset);
    console.log("layers", layers);  // it adds a y and y0 to the data values.

    makeLayersArray();

    // reset these after doing the layer stacking.
    xScale.domain([1990, 2014]);

    yScale.domain([0, d3.max(layersArray, function(d) {
      //console.log("yScale", d);
      return d.y0 + d.y; })]); // highest combo

    var myLayers = svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) { return colorScale(i); }); // just count off
      /*.append("title")
      .text(function(d) {
        return d.key; // country is the key in the nest
      })*/

      myLayers
      .on("mouseout", mouseout)
      .on("mousemove", mousemove)
      .on("mouseover", mouseover);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    return my;

    } // End drawMyArea

  function makeDataSet() {

    console.log("raw aid", aid);

    aid.forEach(function(d) {

      var source = d["Source"];

      years.forEach(function(y) {

        dataset.push({
          source: source,
          year: +y,
          aid: +d[y]
        });

        allAidValues.push(+d[y]);

      });

    });

    console.log("dataset", dataset);

  } // End makeDataSet

  function makeLayersArray() {

    layers.forEach(function(d) {

      //console.log("make array", d);
      d["values"].forEach(function(v) {
        //console.log("values", v);
        layersArray.push(v);
      });

    });

    console.log("layersArray", layersArray);

  } // End makeLayersArray

  function mouseover(e) {

    var thisLayer = d3.select(this);
    //console.log("thisLayer", thisLayer.data());
    originalColor = thisLayer.style("fill");

    thisLayer.style("fill", "orange");

    tooltip
      .style("display", null)
      .html("<p><b>Source:</b> " + thisLayer.data()[0].key + "</p>");

  }

  function mousemove(e) {
    tooltip
      .style("top", (d3.event.pageY - 10) + "px" )
      .style("left", (d3.event.pageX + 10) + "px");
  }

  function mouseout(e) {

    var thisLayer = d3.select(this);

    thisLayer.style("fill", originalColor);

    tooltip
      .style("display", "none");

  }

  return my;

}
