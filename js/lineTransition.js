function drawLineTransition(maleFemale, total) {

  //Dimensions and padding
  var fullwidth = 950;
  var fullheight = 400;
  var margin = {top: 20, right: 30, bottom: 40, left: 50};

  var width = fullwidth - margin.left - margin.right;
  var height = fullheight - margin.top - margin.bottom;

  //Set up scales - I already know the start and end years, not using data for it.
  var xScale = d3.time.scale()
            .range([ 0, width ]);


  // don't know the yScale domain yet. Will set it with the data.
  var yScale = d3.scale.linear()
            .range([ 0, height ]);

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

  //Set up date formatting and years
  var dateFormat = d3.time.format("%Y");
  var outputFormat = d3.time.format("%Y");

  // add a tooltip to the page - not to the svg itself!
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  //Create the empty SVG image
  var svg = d3.select(".interactive3")
        .append("svg")
        .attr("width", fullwidth)
        .attr("height", fullheight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Configure line generator
  // each line dataset must have an x and y for this to work.
  var line = d3.svg.line()
    .x(function(d) {
      return xScale(dateFormat.parse(d.year));
    })
    .y(function(d) {
      return yScale(+d.percent);
    });

  /*queue()
        .defer(d3.csv, "Race_Education_Data_Male_Female.csv")  // maleFemale
        .defer(d3.csv, "Race_Education_Data_Total.csv") // total
        .await(doStuff);*/

  //function doStuff(error, maleFemale, total) {

    var years = d3.keys(total[0]).slice(0, 13);

    /*total.forEach(function(d) {
      delete d.Years;
    });

    var arr = Object.keys(total[0]).map(function (key) {return +total[0][key]});*/

    //console.log(arr);



    // set up the domain here, from the data i read in. I'm starting at 0, not min.
    //widthScale.domain(d3.extent(arr));
    //console.log(d3.extent(arr));

    // js map: will make a new array out of all the d["Race or Ethnicity"] fields:
    //heightScale.domain(total[0].map(function(d) { return d["Years"]; } ));
    //console.log(Object.keys(total[0]).map(function(d) {return d["Years"]}));

    //console.log(maleFemale);
    //console.log(total);

    var dataGender = [],
        dataTotal = [],
        dataFake = [];

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

    //console.log(dataGender);
    //console.log(dataTotal);
    //console.log(dataFake);

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

      var groupGender = svg.selectAll("g.gender")
        .data(dataGender)
        .enter()
        .append("g")
        //.attr("class", "lines")
        .attr("class", "gender");

      var textGroup = svg.selectAll("g.myText")
        .data(dataTotal)
        .enter()
        .append("g")
        .attr("class", "myText");

      var textNoteTotal = textGroup.selectAll("text.totalText")
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
      var lines = d3.selectAll("path.line");
      var firstLine = d3.select(lines[0][0]);
      var secondLine = d3.select(lines[0][1]);
      firstLine.style("stroke", "blue"); // Male
      secondLine.style("stroke", "red"); // Female

      //Axes
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height  + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      // Adds text to each point on the lines.
      var textNote = groupGender.selectAll("text.genderText")
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

      var allButtons = d3.selectAll("button");

      drawSingleLine(lines);

      //drawTwoLines(lines);

      function drawTwoLines(lines) {

        //lines.transition().attr("d", line(dataGender[0].data));
        //console.log(d3.select(lines[0][1]));
        var firstLine = d3.select(lines[0][0]);
        var secondLine = d3.select(lines[0][1]);

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

      } // End drawTwoLines

      function drawSingleLine(lines) {

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

      } // End drawSingleLine

      allButtons.on("click", function() {
        allButtons.classed("selected", false);
        // Handle the button click to change the data set.
        //var selectedline = d3.select("path.line");
      //	console.log(selectedline);
        var lines = d3.selectAll("path.line");
        //console.log(lines);



        var thisButton = d3.select(this);
        thisButton.classed("selected", true);

        if (thisButton.attr("id") === "Gender") {
          //console.log("Gender!");
          drawTwoLines(lines);
        } else {
          //console.log("Total!");
          drawSingleLine(lines);
        }



      });
}
