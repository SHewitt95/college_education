function chart(maleFemale, total, position) {

  var margin = {top: 20, right: 30, bottom: 50, left: 50};
  var width = fullwidth - margin.left - margin.right;
  var height = fullheight - margin.top - margin.bottom;

  var dataGender = [],
      dataTotal = [],
      dataFake = [];

  var textNote,
      textNoteTotal,
      svg, line, xAxis, yAxis, xScale, yScale, dateFormat, outputFormat, lines;

  var years, groupGender, textGroup, firstLine, secondLine;

  function my() {

      xScale = d3.time.scale()
                .range([ 0, width ]);

      // don't know the yScale domain yet. Will set it with the data.
      yScale = d3.scale.linear()
                .range([ 0, height ]);

      //Set up date formatting and years
      dateFormat = d3.time.format("%Y");
      outputFormat = d3.time.format("%Y");

      //Configure axis generators
      xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(10)
              .tickFormat(function(d) {
                return outputFormat(d);
              })
              .innerTickSize([10])
              .outerTickSize([0]);

      yAxis = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .innerTickSize([10])
              .outerTickSize([0]);

      //Configure line generator
      // each line dataset must have an x and y for this to work.
      line = d3.svg.line()
        .x(function(d) {
          return xScale(dateFormat.parse(d.year));
        })
        .y(function(d) {
          return yScale(+d.percent);
        });


    //Create the empty SVG image
    svg = d3.select("." + position)
          .append("svg")
          .attr("width", fullwidth)
          .attr("height", fullheight)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      years = d3.keys(total[0]).slice(0, 13);

      // Creates data array for maleFemale csv.
      maleFemale.forEach(function(d) {

        var genderPerYear = [];

        years.forEach(function(y) {
          if (d[y]) {
            genderPerYear.push({
              year: y,
              gender: d["Sex"],
              percent: d[y]
            });
          }
        });

        dataGender.push({
          gender: d["Sex"],
          data: genderPerYear
        });

      }); // End forEach for maleFemale

      // Creates data array for total csv.
      total.forEach(function(d) {

        var totalPerYear = [];
        var fakeData = [];

        years.forEach(function(y) {
          if (d[y]) {
            totalPerYear.push({
              year: y,
              percent: d[y]
            });

            fakeData.push({
              year: y,
              percent: 0
            });
          }
        });

        dataTotal.push({
          data: totalPerYear
        });

        dataFake.push({
          data: fakeData
        });

      }); // End forEach for total

      xScale.domain(
        d3.extent(years, function(d) {
        return dateFormat.parse(d);
      }));

    /*  var dataGenderYScale = yScale.domain([
        d3.max(dataGender, function(d) {
          return d3.max(d.data, function(d) {
            return +d.percent;
          });
        }),
        0
      ]);*/

        groupGender = svg.selectAll("g.gender")
          .data(dataGender)
          .enter()
          .append("g")
          //.attr("class", "lines")
          .attr("class", "gender");

        textGroup = svg.selectAll("g.myText")
          .data(dataTotal)
          .enter()
          .append("g")
          .attr("class", "myText");

        textNoteTotal = textGroup.selectAll("text.totalText")
          .data(function(d) {
            return d.data;
          })
          .enter()
          .append("text")
          .attr("class", "totalText");

        textNoteTotal.attr("x", function(d, i) {
                  //console.log(d);
                  return xScale(dateFormat.parse(d.year));
                })
                .attr("y", function(d, i) {
                  return 9999;
                })
                .attr("dy", "-7")
                .style("font-size", "0.75em")
                .text(function(d) {
                  return d.percent;
                });


          console.log(dataTotal);


        groupGender.selectAll("path")
          .data(function(d) { // because there's a group with data per race already...
            return [ d.data ]; // Returns the dataTotal object's data.
          })
          .enter()
          .append("path")
          .attr("class", "line")
          .attr("d", line); // calls the line function you defined above, using that array*/

        // Grabs individual lines and colors them.
        lines = svg.selectAll("path.line");
        firstLine = d3.select(lines[0][0]);
        secondLine = d3.select(lines[0][1]);
        firstLine.style("stroke", "blue").style("fill", "none"); // Male
        secondLine.style("stroke", "red").style("fill", "none"); // Female

        //Axes
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height  + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

        // Adds text to each point on the lines.
        textNote = groupGender.selectAll("text.genderText")
                        .data(function(d) {
                          //console.log(d);
                          return d.data;
                        })
                        .enter()
                        .append("text")
                        .attr("class", "genderText");

        textNote.attr("x", function(d, i) {
                  //console.log(d);
                  return xScale(dateFormat.parse(d.year));
                })
                .attr("y", function(d, i) {
                  return yScale(d.percent);
                })
                .attr("dy", "-7")
                .style("font-size", "0.75em")
                .text(function(d) {
                  return d.percent;
                });
        //my.drawSingle();
        return my;
  }

  my.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return my;
  };

  my.drawSingle = function() {

    var dataTotalYScale = yScale.domain([
      d3.max(dataTotal, function(d) {
        return d3.max(d.data, function(d) {
          return +d.percent;
        });
      }),
      0
    ]);

    lines.transition().attr("d", line(dataTotal[0].data)).style("stroke", "black");

    textNote.transition()
      .attr("y", function(d) {
        return 9999;
      });

    textNoteTotal.transition()
      .attr("y", function(d) {
        return yScale(d.percent);
      })
      .attr("x", function(d) {
        return xScale(dateFormat.parse(d.year));
      });

    svg.transition().select("g.y.axis") // select it with whatever class you assigned,
                            // and re-"call" the axis
                      .call(yAxis);

    return my;

  } // End drawSingle

  my.drawDouble = function() {
    //lines.transition().attr("d", line(dataGender[0].data));
    //console.log(d3.select(lines[0][1]));
    firstLine = d3.select(lines[0][0]);
    secondLine = d3.select(lines[0][1]);

    var dataGenderYScale = yScale.domain([
      d3.max(dataGender, function(d) {
        return d3.max(d.data, function(d) {
          return +d.percent;
        });
      }),
      0
    ]);

    firstLine.transition().attr("d", line(dataGender[0].data)).style("stroke", "blue");
    secondLine.transition().attr("d", line(dataGender[1].data)).style("stroke", "red");

    textNoteTotal.transition()
      .attr("y", function(d) {
        return 9999;
      });

    textNote.transition()
      .attr("y", function(d) {
        return yScale(d.percent);
      })
      .attr("x", function(d) {
        return xScale(dateFormat.parse(d.year));
      });

    svg.transition().select("g.y.axis") // select it with whatever class you assigned,
                            // and re-"call" the axis
                      .call(yAxis);

    return my;
  }

  return my;
}
